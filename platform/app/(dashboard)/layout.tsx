import { ReactNode } from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { SubscriptionGuard } from '@/components/auth/SubscriptionGuard';
import { DashboardShell } from '@/components/layout/dashboard-shell';

const AUTH_COOKIE_NAME = 'think_ai_session';

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const cookieStore = await cookies();
  const isAuthenticated = Boolean(cookieStore.get(AUTH_COOKIE_NAME)?.value);

  if (!isAuthenticated) {
    redirect('/login');
  }

  return (
    <SubscriptionGuard>
      <DashboardShell>{children}</DashboardShell>
    </SubscriptionGuard>
  );
}
