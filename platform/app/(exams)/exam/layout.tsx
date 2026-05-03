'use client';

import { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { PlatformFooter } from '@/components/layout/platform-footer';
import { PlatformHeader } from '@/components/layout/platform-header';

export default function ExamLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isLiveRoute = pathname === '/exam/live';

  if (isLiveRoute) {
    return <main className="min-h-screen px-4 py-10 sm:px-6 lg:px-8 lg:py-12">{children}</main>;
  }

  return (
    <div className="flex min-h-screen flex-col">
      <PlatformHeader />
      <main className="flex-1 px-4 py-8 sm:px-6 lg:px-8 lg:py-10">{children}</main>
      <PlatformFooter />
    </div>
  );
}
