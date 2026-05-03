'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Blocks,
  Bot,
  Briefcase,
  Cpu,
  FileText,
  FolderKanban,
  GraduationCap,
  History,
  LayoutDashboard,
  Map,
  Settings,
  Sparkles,
  TrendingUp,
  UserRound,
  Wrench,
  Zap,
} from 'lucide-react';
import { useWorkspaceStore } from '@/store/workspaceStore';
import { cn } from '@/lib/utils';

type SidebarProps = {
  pathname: string;
  collapsed: boolean;
  onNavigate?: () => void;
};

const coreNav = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/studio', label: 'AI Studio', icon: Bot },
];

const careerNav = [
  { href: '/career', label: 'Career Analyzer', icon: TrendingUp },
  { href: '/dashboard/resume', label: 'Resume Optimizer', icon: FileText },
  { href: '/dashboard/roadmap', label: '90-Day Roadmap', icon: Map },
  { href: '/dashboard/jobs', label: 'Job Matcher', icon: Briefcase },
  { href: '/dashboard/skills', label: 'Skill Tracker', icon: GraduationCap },
];

const workspaceNav = [
  { href: '/tools', label: 'Tools & Agents', icon: Wrench },
  { href: '/history', label: 'History', icon: History },
  { href: '/workspaces', label: 'Workspaces', icon: FolderKanban },
  { href: '/accounts/profile', label: 'Your Profile', icon: UserRound },
  { href: '/settings', label: 'Settings', icon: Settings },
];

function NavGroup({
  label,
  items,
  pathname,
  collapsed,
  onNavigate,
  startDelay = 0,
}: {
  label: string;
  items: typeof coreNav;
  pathname: string;
  collapsed: boolean;
  onNavigate?: () => void;
  startDelay?: number;
}) {
  return (
    <div className="space-y-1">
      {!collapsed && (
        <p className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/30">{label}</p>
      )}
      {items.map((item, index) => {
        const active =
          pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
        const Icon = item.icon;

        return (
          <motion.div
            key={item.href}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: (startDelay + index) * 0.03, duration: 0.2 }}
          >
            <Link
              href={item.href}
              onClick={onNavigate}
              className={cn(
                'group flex items-center rounded-xl px-3 py-2.5 text-sm transition-all duration-200',
                collapsed ? 'justify-center' : 'gap-3',
                active
                  ? 'border border-cyan-300/30 bg-gradient-to-r from-cyan-300/15 to-indigo-400/15 text-white shadow-[0_0_12px_rgba(34,211,238,0.08)]'
                  : 'text-white/55 hover:bg-white/[0.05] hover:text-white/90'
              )}
            >
              <Icon
                className={cn(
                  'h-[15px] w-[15px] flex-shrink-0 transition-colors',
                  active ? 'text-cyan-300' : 'text-white/45 group-hover:text-white/75'
                )}
              />
              {!collapsed && (
                <span className="truncate text-[13px] font-medium leading-none">{item.label}</span>
              )}
              {active && !collapsed && (
                <span className="ml-auto h-1.5 w-1.5 flex-shrink-0 rounded-full bg-cyan-400" />
              )}
            </Link>
          </motion.div>
        );
      })}
    </div>
  );
}

export function PlatformSidebar({ pathname, collapsed, onNavigate }: SidebarProps) {
  const currentWorkspaceId = useWorkspaceStore((state) => state.currentWorkspaceId);
  const items = useWorkspaceStore((state) => state.items);
  const currentWorkspace =
    items.find((item) => item.id === currentWorkspaceId) || items[0];
  const workspacePlan = currentWorkspace?.plan ? currentWorkspace.plan.toUpperCase() : 'PRO';

  return (
    <aside
      className={cn(
        'flex h-screen flex-col border-r border-white/[0.07] bg-[#060a13]/95 backdrop-blur-2xl transition-all duration-300',
        collapsed ? 'w-[72px]' : 'w-[260px]'
      )}
    >
      {/* Brand */}
      <div className="border-b border-white/[0.07] p-3">
        <div
          onClick={onNavigate}
          className="group flex cursor-pointer items-center gap-3 rounded-2xl border border-white/[0.07] bg-white/[0.025] p-2.5 transition hover:bg-white/[0.05]"
        >
          <div className="flex-shrink-0 rounded-xl bg-gradient-to-br from-cyan-400 to-indigo-500 p-2 shadow-[0_4px_16px_rgba(56,189,248,0.3)]">
            <Sparkles className="h-4 w-4 text-black" />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="text-[13px] font-bold leading-tight text-white tracking-wide">THINK STUDIO</p>
              <p className="mt-0.5 text-[10px] leading-none text-white/40">AI Career Platform</p>
            </div>
          )}
        </div>

        {!collapsed && currentWorkspace ? (
          <div className="mt-3 rounded-2xl border border-cyan-300/10 bg-[linear-gradient(180deg,rgba(10,18,35,0.95),rgba(6,10,19,0.95))] p-3">
            <div className="flex items-center justify-between gap-2">
              <p className="truncate text-xs font-semibold text-white">{currentWorkspace.name}</p>
              <span className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-cyan-100">
                {workspacePlan}
              </span>
            </div>
            <div className="mt-2 flex items-center gap-2 text-[11px] text-white/40">
              <Cpu className="h-3.5 w-3.5 text-cyan-300" />
              <span>{currentWorkspace.region}</span>
            </div>
            <p className="mt-2 text-[11px] leading-5 text-white/45">
              Auth, user context, and AI workflows are active for this workspace.
            </p>
          </div>
        ) : null}
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-5 overflow-y-auto px-2 py-4">
        <NavGroup
          label="Core"
          items={coreNav}
          pathname={pathname}
          collapsed={collapsed}
          onNavigate={onNavigate}
          startDelay={0}
        />

        {!collapsed && (
          <div className="mx-3 border-t border-white/[0.06]" />
        )}

        <NavGroup
          label="Career Suite"
          items={careerNav}
          pathname={pathname}
          collapsed={collapsed}
          onNavigate={onNavigate}
          startDelay={2}
        />

        {!collapsed && (
          <div className="mx-3 border-t border-white/[0.06]" />
        )}

        <NavGroup
          label="Workspace"
          items={workspaceNav}
          pathname={pathname}
          collapsed={collapsed}
          onNavigate={onNavigate}
          startDelay={7}
        />
      </nav>

      {/* Footer tip */}
      <div className="border-t border-white/[0.07] p-3">
        <div
          className={cn(
            'rounded-xl border border-white/[0.07] bg-gradient-to-br from-white/[0.03] to-cyan-900/10 p-3',
            collapsed ? 'flex justify-center' : ''
          )}
        >
          {collapsed ? (
            <Zap className="h-4 w-4 text-cyan-400" />
          ) : (
            <>
              <div className="flex items-center gap-2">
                <Blocks className="h-3.5 w-3.5 text-cyan-400" />
                <p className="text-[11px] font-semibold text-white/80">Studio Tip</p>
              </div>
              <p className="mt-1.5 text-[11px] leading-5 text-white/40">
                Press{' '}
                <kbd className="rounded border border-white/10 bg-white/[0.05] px-1 py-0.5 text-[10px] text-white/60">
                  Ctrl+K
                </kbd>{' '}
                to jump across services and tools.
              </p>
            </>
          )}
        </div>
      </div>
    </aside>
  );
}
