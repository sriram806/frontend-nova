'use client';

import { ReactNode, useEffect, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Loader } from '@/components/Loader';
import { userService } from '@/services/userService';
import { getOnboardingStatus } from '@/services/onboardingService';
import { useAuthStore } from '@/store/authStore';
import { useBillingStore } from '@/store/billingStore';
import { hasActiveSubscription } from '@/services/billingService';

type SubscriptionGuardProps = {
  children: ReactNode;
};

function buildPricingRedirectPath(pathname: string, search: string) {
  const nextPath = search ? `${pathname}?${search}` : pathname;
  const params = new URLSearchParams({ next: nextPath });
  return `/pricing?${params.toString()}`;
}

/**
 * SubscriptionGuard ensures that the user has an active subscription and has completed onboarding.
 * - If not subscribed, redirects to the pricing page.
 * - If subscribed but not onboarded, redirects to the onboarding flow.
 * - Syncs the latest user data to the store.
 */
export function SubscriptionGuard({ children }: SubscriptionGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isCheckingAccess, setIsCheckingAccess] = useState(true);
  const search = searchParams.toString();

  useEffect(() => {
    let cancelled = false;

    const verifyAccess = async () => {
      const pricingRedirect = buildPricingRedirectPath(pathname, search);

      try {
        const user = await userService.getCurrentUser();

        if (cancelled) {
          return;
        }

        // Update the global auth store with latest user data
        useAuthStore.getState().setUser(user);

        // 1. Check Subscription from Billing Service
        // Users are allowed to visit their Profile/Settings/Account without a subscription
        const isPublicPath = pathname.startsWith('/settings') || pathname.startsWith('/accounts');
        
        await useBillingStore.getState().fetchSubscription();
        const currentSub = useBillingStore.getState().subscription;

        if (!hasActiveSubscription(currentSub) && !isPublicPath) {
          router.replace(pricingRedirect);
          return;
        }

        // 2. Check Onboarding Status
        // Skip onboarding redirect if user is on a public/account page
        if (!user.isOnboarded && !isPublicPath) {
          const onboarding = await getOnboardingStatus();
          if (cancelled) return;

          const targetPath = onboarding.nextPath || '/onboarding/target-role';
          
          // If we are not on the intended onboarding step, and not on pricing, redirect
          if (pathname !== targetPath && !pathname.startsWith('/pricing')) {
            console.log(`[SubscriptionGuard] Redirecting from ${pathname} to required step: ${targetPath}`);
            router.replace(targetPath);
            return;
          }
        }

        // 3. If onboarded and trying to go back to onboarding, redirect to dashboard
        // (Optional: let users return to onboarding if they want to edit? 
        //  Usually, onboarding is a one-time sequence. Dashboard is better once done.)
        if (user.isOnboarded && pathname.startsWith('/onboarding')) {
          router.replace('/dashboard');
          return;
        }

        setIsCheckingAccess(false);
      } catch (error) {
        console.error('Failed to verify access status:', error);
        if (!cancelled) {
          // Failure to check usually results in pricing redirect as safe fallback
          router.replace(pricingRedirect);
        }
      }
    };

    void verifyAccess();

    return () => {
      cancelled = true;
    };
  }, [pathname, router, search]);

  if (isCheckingAccess) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader label="Verifying access..." />
      </div>
    );
  }

  return <>{children}</>;
}
