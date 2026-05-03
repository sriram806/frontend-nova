'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  ArrowRight,
  Bell,
  LayoutDashboard,
  Menu,
  Search,
  Sparkles,
  LogOut,
  X,
  Command,
  Zap,
  BriefcaseBusiness,
  Settings
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/dashboard/theme-toggle';
import { BrandLogo } from '@/components/brand-logo';
import { useAuthStore } from '@/store/authStore';

const NAV_LINKS = [
  { label: 'Home', href: '/', icon: LayoutDashboard },
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Careers', href: '/dashboard/roadmap', icon: BriefcaseBusiness },
];

export function PlatformHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, clearSession } = useAuthStore();

  const [openMenu, setOpenMenu] = useState(false);
  const [openSearch, setOpenSearch] = useState(false);
  const [openNotif, setOpenNotif] = useState(false);
  const [openQuick, setOpenQuick] = useState(false);

  const name = user?.displayName || 'Guest';
  const role = user?.role || 'User';
  const targetRole = user?.targetRole || 'Career Growth';
  const status = user?.status || 'active';

  const handleLogout = () => {
    clearSession();
    router.push('/');
  };

  // "/" opens search
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === '/') {
        e.preventDefault();
        setOpenSearch(true);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-background/70 backdrop-blur-2xl border-b border-white/10">

      {/* 🌌 Gradient Glow */}
      <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

      {/* 🔝 MAIN BAR */}
      <div className="mx-auto max-w-full flex items-center gap-4 px-4 py-3">

        {/* Logo */}
        <Link href="/">
          <BrandLogo size="sm" />
        </Link>

        {/* 🔍 SEARCH */}
        <div
          onClick={() => setOpenSearch(true)}
          className="hidden md:flex flex-1 items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-2 cursor-pointer hover:bg-white/10 transition"
        >
          <Search className="w-4 h-4 text-white/40" />
          <span className="text-sm text-white/40">
            Search anything...
          </span>
          <div className="ml-auto flex items-center gap-1 text-xs text-white/30">
            <Command className="w-3 h-3" /> /
          </div>
        </div>

        {/* NAV */}
        <nav className="hidden lg:flex items-center gap-2">
          {NAV_LINKS.map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className="relative px-3 py-2 text-sm flex items-center gap-2 rounded-xl group"
              >
                <Icon className="w-4 h-4" />
                {item.label}

                <span
                  className={`absolute bottom-0 left-0 h-[2px] w-full bg-primary transition ${
                    active ? 'opacity-100' : 'opacity-0 group-hover:opacity-40'
                  }`}
                />
              </Link>
            );
          })}
        </nav>

        {/* RIGHT */}
        <div className="ml-auto flex items-center gap-2">

          <ThemeToggle />

          {/* 🔔 Notifications */}
          <div className="relative">
            <button
              onClick={() => setOpenNotif(!openNotif)}
              className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10"
            >
              <Bell className="w-4 h-4 text-white/70" />
            </button>

            {openNotif && (
              <div className="absolute right-0 mt-2 w-80 bg-background border border-white/10 rounded-xl p-4 shadow-xl">
                <p className="text-sm font-semibold mb-2">Notifications</p>
                <div className="space-y-2 text-sm text-white/60">
                  <p>🚀 New roadmap available</p>
                  <p>📊 Your skill progress updated</p>
                </div>
              </div>
            )}
          </div>

          {/* ⚡ Quick Actions */}
          <Button
            variant="outline"
            onClick={() => setOpenQuick(true)}
            className="hidden md:flex"
          >
            <Zap className="mr-2 h-4 w-4" />
            Quick
          </Button>

          {/* 🚀 Dashboard */}
          <Button
            onClick={() => router.push('/dashboard')}
            className="hidden sm:flex bg-cyan-400 text-black hover:bg-cyan-300"
          >
            Dashboard
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>

          {/* 🔓 Logout */}
          <Button
            onClick={handleLogout}
            variant="outline"
            className="hidden sm:flex border-red-500/30 text-red-400 hover:bg-red-500/10"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>

          {/* 📱 Mobile */}
          <button
            onClick={() => setOpenMenu(true)}
            className="lg:hidden p-2 rounded-xl bg-white/5 border border-white/10"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* ⚡ USER STRIP */}
      <div className="border-t border-white/10 px-4 py-2 text-xs text-white/60 flex items-center gap-3">
        <Badge className="bg-green-500/10 text-green-300">{status}</Badge>
        <span>{name}</span>
        <span>•</span>
        <span>{role}</span>
        <span>•</span>
        <span>{targetRole}</span>

        <span className="ml-auto flex items-center gap-1 text-white/40">
          <Sparkles className="w-3 h-3" />
          Building your future 🚀
        </span>
      </div>

      {/* 🔍 COMMAND PALETTE */}
      {openSearch && (
        <div className="fixed inset-0 bg-black/70 z-50 flex justify-center pt-32">
          <div className="w-full max-w-xl bg-background border border-white/10 rounded-xl p-4">
            <div className="flex items-center gap-2 border-b border-white/10 pb-2">
              <Search className="w-4 h-4" />
              <input autoFocus className="w-full bg-transparent outline-none" />
              <button onClick={() => setOpenSearch(false)}>
                <X />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ⚡ QUICK PANEL */}
      {openQuick && (
        <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center">
          <div className="bg-background p-6 rounded-xl w-96 border border-white/10">
            <h2 className="font-semibold mb-4">Quick Actions</h2>

            <div className="space-y-2">
              <button onClick={() => router.push('/dashboard')} className="w-full text-left hover:bg-white/5 p-2 rounded">
                Go to Dashboard
              </button>
              <button onClick={() => router.push('/dashboard/settings')} className="w-full text-left hover:bg-white/5 p-2 rounded">
                Settings
              </button>
            </div>

            <Button onClick={() => setOpenQuick(false)} className="mt-4 w-full">
              Close
            </Button>
          </div>
        </div>
      )}

      {/* 📱 MOBILE MENU */}
      {openMenu && (
        <div className="fixed inset-0 bg-black/60 z-50 flex">
          <div className="w-72 bg-background p-5 space-y-5 border-r border-white/10">
            <button onClick={() => setOpenMenu(false)}>
              <X />
            </button>

            {NAV_LINKS.map((item) => (
              <Link key={item.href} href={item.href}>
                <div className="py-2">{item.label}</div>
              </Link>
            ))}

            <Button onClick={handleLogout} variant="outline">
              Logout
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}

export default PlatformHeader;