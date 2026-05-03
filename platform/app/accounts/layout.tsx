import { ReactNode } from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { SubscriptionGuard } from '@/components/auth/SubscriptionGuard';
import { PlatformHeader } from '@/components/layout/platform-header';
import { PlatformFooter } from '@/components/layout/platform-footer';

const AUTH_COOKIE_NAME = 'think_ai_session';

export default async function AccountsLayout({ children }: { children: ReactNode }) {
  const cookieStore = await cookies();
  const isAuthenticated = Boolean(cookieStore.get(AUTH_COOKIE_NAME)?.value);

  if (!isAuthenticated) {
    redirect('/login');
  }

  return (
    <div className="flex min-h-screen flex-col">
      <PlatformHeader />
      <main className="flex-grow">
        <SubscriptionGuard>{children}</SubscriptionGuard>
      </main>
      <PlatformFooter />
    </div>
  );
}
