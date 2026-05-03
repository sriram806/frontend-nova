'use client';

import { ReactNode, useEffect, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { PlatformCommandBar } from '@/components/platform/platform-command-bar';
import { PlatformSidebar } from '@/components/platform/platform-sidebar';
import { useUiStore } from '@/store/uiStore';

type AppShellProps = {
  children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  
  const sidebarCollapsed = useUiStore((state) => state.sidebarCollapsed);
  const mobileSidebarOpen = useUiStore((state) => state.mobileSidebarOpen);
  const setCommandPaletteOpen = useUiStore((state) => state.setCommandPaletteOpen);
  const setMobileSidebarOpen = useUiStore((state) => state.setMobileSidebarOpen);
  const toggleRightPanel = useUiStore((state) => state.toggleRightPanel);
  const toggleSidebar = useUiStore((state) => state.toggleSidebar);

  const isAuthRoute = pathname.startsWith('/auth') || pathname.startsWith('/login') || pathname.startsWith('/register') || pathname.startsWith('/forgot-password');

  const sectionMeta = useMemo(() => {
    if (pathname.startsWith('/studio')) {
      return { title: 'AI Studio', subtitle: 'Build prompts, run tools, inspect outputs.' };
    }
    if (pathname.startsWith('/tools')) {
      return { title: 'Tools & Agents', subtitle: 'Discover and launch specialized AI workflows.' };
    }
    if (pathname.startsWith('/history')) {
      return { title: 'History', subtitle: 'Track sessions, outputs, and execution history.' };
    }
    if (pathname.startsWith('/workspaces')) {
      return { title: 'Workspaces', subtitle: 'Switch contexts across teams and projects.' };
    }
    if (pathname.startsWith('/settings')) {
      return { title: 'Settings', subtitle: 'Manage profile, auth, and platform preferences.' };
    }
    if (pathname === '/career') {
      return { title: 'Career Analyzer', subtitle: 'Evaluate role readiness using AI analysis.' };
    }
    if (pathname.startsWith('/onboarding/resume')) {
      return { title: 'Resume Builder', subtitle: 'Create the structured resume used across dashboard workflows.' };
    }
    if (pathname.startsWith('/onboarding/target-role')) {
      return { title: 'Target Role', subtitle: 'Set the role that powers scoring and recommendations.' };
    }
    if (pathname.startsWith('/dashboard/resume')) {
      return { title: 'Resume Optimizer', subtitle: 'AI-powered ATS scoring and suggestions.' };
    }
    if (pathname.startsWith('/dashboard/roadmap')) {
      return { title: '90-Day Roadmap', subtitle: 'AI-generated learning timeline for your target role.' };
    }
    if (pathname.startsWith('/dashboard/jobs')) {
      return { title: 'Job Matcher', subtitle: 'Roles matched to your current skill profile.' };
    }
    if (pathname.startsWith('/dashboard/skills')) {
      return { title: 'Skill Tracker', subtitle: 'Monitor your skill growth and learning velocity.' };
    }
    if (pathname.startsWith('/dashboard')) {
      return { title: 'Dashboard', subtitle: 'Real-time KPIs from all AI services.' };
    }
    return { title: 'Nova Platform', subtitle: 'A premium AI studio environment for your career growth.' };
  }, [pathname]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      if ((event.metaKey || event.ctrlKey) && key === 'k') {
        event.preventDefault();
        setCommandPaletteOpen(true);
      }
      if ((event.metaKey || event.ctrlKey) && key === 'b') {
        event.preventDefault();
        toggleSidebar();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [setCommandPaletteOpen, toggleSidebar]);

  if (isAuthRoute) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen bg-[#04060d] text-white">
      <div className="hidden border-r border-white/10 lg:block">
        <PlatformSidebar pathname={pathname} collapsed={sidebarCollapsed} />
      </div>

      <AnimatePresence>
        {mobileSidebarOpen ? (
          <motion.div
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileSidebarOpen(false)}
          >
            <motion.div
              className="h-full w-[86%] max-w-[320px] border-r border-white/10 bg-[#070b14]"
              initial={{ x: -40, opacity: 0.8 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -40, opacity: 0.8 }}
              onClick={(event) => event.stopPropagation()}
            >
              <PlatformSidebar pathname={pathname} collapsed={false} onNavigate={() => setMobileSidebarOpen(false)} />
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <div className="flex min-h-screen min-w-0 flex-1">
        <div className="flex min-h-screen min-w-0 flex-1 flex-col">
          <PlatformCommandBar
            title={sectionMeta.title}
            subtitle={sectionMeta.subtitle}
            commandLabel="Cmd+K"
            onOpenPalette={() => setCommandPaletteOpen(true)}
            onToggleSidebar={() => {
              if (window.innerWidth < 1024) {
                setMobileSidebarOpen(true);
              } else {
                toggleSidebar();
              }
            }}
            onToggleRightPanel={() => toggleRightPanel()}
          />
          <main className="min-w-0 flex-1 overflow-x-hidden overflow-y-auto p-4 sm:p-6">{children}</main>
        </div>
      </div>
    </div>
  );
}
