import { ReactNode } from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { DashboardShell } from '@/components/dashboard/layout/dashboard-shell';

const AUTH_COOKIE_NAME = 'think_ai_session';

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const cookieStore = await cookies();
  const isAuthenticated = Boolean(cookieStore.get(AUTH_COOKIE_NAME)?.value);

  if (!isAuthenticated) {
    redirect('/login');
  }

  return (
    <DashboardShell>
      {children}
    </DashboardShell>
  );
}
