'use client';

import { useRouter } from 'next/navigation';
import { PanelRight, Search, Sidebar, Sparkles, UserRound, Settings2, LogOut, ShieldCheck, Database, BrainCircuit } from 'lucide-react';
import { Button } from '@/components/core/button';
import { Input } from '@/components/core/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuthStore } from '@/store/authStore';

type PlatformCommandBarProps = {
  title: string;
  subtitle: string;
  commandLabel: string;
  onOpenPalette: () => void;
  onToggleSidebar: () => void;
  onToggleRightPanel: () => void;
};

export function PlatformCommandBar({
  title,
  subtitle,
  commandLabel,
  onOpenPalette,
  onToggleSidebar,
  onToggleRightPanel,
}: PlatformCommandBarProps) {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const profileName = user?.displayName || 'Think User';
  const profileRole = user?.role || 'Platform member';
  const profileEmail = user?.email || 'profile@think.ai';
  const initials = profileName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((chunk) => chunk[0]?.toUpperCase())
    .join('') || 'T';
  const servicePills = [
    { label: 'Auth', icon: ShieldCheck },
    { label: 'User', icon: Database },
    { label: 'AI', icon: BrainCircuit },
  ];

  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-[#050912]/85 px-4 py-3 backdrop-blur-xl sm:px-6">
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="rounded-xl border border-white/10 bg-white/[0.03] p-2 text-white/75 transition hover:bg-white/[0.08] hover:text-white"
          aria-label="Toggle sidebar"
        >
          <Sidebar className="h-4 w-4" />
        </button>

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-white">{title}</p>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <p className="truncate text-xs text-white/55">{subtitle}</p>
            <div className="hidden items-center gap-2 xl:flex">
              {servicePills.map((pill) => {
                const Icon = pill.icon;
                return (
                  <span
                    key={pill.label}
                    className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.03] px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/55"
                  >
                    <Icon className="h-3 w-3 text-cyan-200" />
                    {pill.label}
                  </span>
                );
              })}
            </div>
          </div>
        </div>

        <div className="relative hidden min-w-[280px] flex-1 md:block">
          <Input
            readOnly
            onClick={onOpenPalette}
            value=""
            placeholder="Search services, prompts, actions, or workspaces..."
            className="cursor-pointer pl-9"
          />
          <Search className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-white/45" />
          <button
            type="button"
            onClick={onOpenPalette}
            className="absolute right-3 top-2.5 rounded-md border border-white/10 bg-white/[0.03] px-2 py-1 text-[10px] uppercase tracking-[0.14em] text-white/60"
          >
            {commandLabel}
          </button>
        </div>

        <Button variant="secondary" size="sm" onClick={onOpenPalette} className="md:hidden">
          <Search className="h-4 w-4" />
          Command
        </Button>

        <Button variant="outline" size="sm" onClick={onToggleRightPanel}>
          <PanelRight className="h-4 w-4" />
          Panel
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="rounded-full border border-white/10 bg-white/[0.04] p-1.5 transition hover:bg-white/[0.08]"
              aria-label="Open profile menu"
            >
              <Avatar className="h-10 w-10 border border-white/10">
                <AvatarFallback className="bg-gradient-to-br from-cyan-300 to-indigo-500 text-xs font-semibold text-black">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-72 border-white/10 bg-[#0b1120] text-white shadow-2xl">
            <DropdownMenuLabel className="space-y-1 p-3">
              <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-3">
                <Avatar className="h-11 w-11 border border-white/10">
                  <AvatarFallback className="bg-gradient-to-br from-cyan-300 to-indigo-500 text-sm font-semibold text-black">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-white">{profileName}</p>
                  <p className="truncate text-xs text-white/45">{profileEmail}</p>
                  <p className="truncate text-xs text-cyan-200">{profileRole}</p>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-white/10" />
            <DropdownMenuItem
            className="cursor-pointer gap-2 px-2 py-2 focus:bg-white/[0.08] focus:text-white"
            onSelect={() => router.push('/settings')}
          >
              <UserRound className="h-4 w-4 text-cyan-200" />
              View Profile
            </DropdownMenuItem>
            <DropdownMenuItem
              className="cursor-pointer gap-2 px-2 py-2 focus:bg-white/[0.08] focus:text-white"
              onSelect={() => router.push('/settings/edit')}
            >
              <Settings2 className="h-4 w-4 text-cyan-200" />
              Edit Profile
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-white/10" />
            <DropdownMenuItem
              className="cursor-pointer gap-2 px-2 py-2 text-red-200 focus:bg-white/[0.08] focus:text-red-100"
              onSelect={() => router.push('/auth/login')}
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
