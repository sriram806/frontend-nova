'use client';

import { ReactNode } from 'react';

export default function UsersLayout({ children }: { children: ReactNode }) {
  return (
    <div className="space-y-8 pb-10">
      {/* Page Content */}
      {children}
    </div>
  );
}
