import { ReactNode } from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { SubscriptionGuard } from '@/components/auth/SubscriptionGuard';
import { PlatformHeader } from '@/components/layout/platform-header';
import { PlatformFooter } from '@/components/layout/platform-footer';

const AUTH_COOKIE_NAME = 'think_ai_session';

export default async function OnboardingLayout({ children }: { children: ReactNode }) {
  const cookieStore = await cookies();
  const isAuthenticated = Boolean(cookieStore.get(AUTH_COOKIE_NAME)?.value);

  if (!isAuthenticated) {
    redirect('/login');
  }

  return (
    <div className="flex flex-col min-h-screen relative">
      {/* Global Progress Pulse */}
      <div className="fixed top-0 left-0 w-full h-1 z-50 overflow-hidden">
        <div className="absolute inset-0 bg-white/5" />
        <div className="h-full bg-gradient-to-r from-primary via-violet-500 to-cyan-500 w-1/2 animate-[progress-pulse_3s_ease-in-out_infinite]" />
      </div>

      <PlatformHeader />
      <main className="flex-grow">
        <SubscriptionGuard>{children}</SubscriptionGuard>
      </main>
      <PlatformFooter />
    </div>
  );
}
