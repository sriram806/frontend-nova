'use client';

import DashboardSidebar from './dashboard-sidebar';
import DashboardHeader from './dashboard-header';
import { useEffect, useState } from 'react';

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // 🔥 Keyboard shortcut (Ctrl + B)
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        setSidebarOpen((v) => !v);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-50 backdrop-blur-xl bg-background/70 border-b border-white/10">
        <DashboardHeader onToggleSidebar={() => setSidebarOpen((v) => !v)} />
      </div>

      <div className="flex flex-1 min-h-0">
        {/* Sidebar */}
        <aside
          className={`transition-all duration-300 ease-in-out border-r border-white/10 
          ${sidebarOpen ? 'w-64' : 'w-16'} hidden md:block`}
        >
          <DashboardSidebar collapsed={!sidebarOpen} />
        </aside>

        {/* Main */}
        <main className="flex-1 min-w-0 p-4 md:p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}