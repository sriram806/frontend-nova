'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { 
  ClipboardCheck, 
  Gauge, 
  Map, 
  MessageSquareText, 
  Sparkles,
  Settings,
  LayoutDashboard
} from 'lucide-react';
import { motion } from 'framer-motion';
import { ThemeToggle } from '@/components/common/theme-toggle';
import { UserNav } from '@/components/layout/user-nav';
import { Breadcrumbs } from '@/components/layout/breadcrumbs';
import { cn } from '@/lib/utils';

const navSections = [
  {
    label: 'Overview',
    items: [
      { href: '/dashboard', label: 'Home', icon: Gauge },
    ]
  },
  {
    label: 'Career Track',
    items: [
      { href: '/exams', label: 'Skill Validation', icon: ClipboardCheck },
      { href: '/skills', label: 'Skill Matrix', icon: Sparkles },
      { href: '/roadmap', label: 'Growth Roadmap', icon: Map },
    ]
  },
  {
    label: 'Simulations',
    items: [
      { href: '/interview', label: 'Interview AI', icon: MessageSquareText },
    ]
  },
  {
    label: 'Account',
    items: [
      { href: '/settings', label: 'Profile Settings', icon: Settings },
    ]
  }
];

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-[#02040a] text-slate-200 selection:bg-indigo-500/30">
      {/* Dynamic Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-indigo-600/10 blur-[140px] animate-pulse opacity-50" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-violet-600/10 blur-[140px] animate-pulse opacity-50" style={{ animationDelay: '3s' }} />
      </div>

      <div className="relative mx-auto flex min-h-screen w-full max-w-[1700px] z-10">
        {/* SIDEBAR */}
        <aside className="hidden w-80 p-6 lg:block">
          <div className="flex h-full flex-col rounded-[2.5rem] border border-white/[0.05] bg-[#0A0C14]/40 p-6 backdrop-blur-2xl shadow-2xl relative overflow-hidden">
            {/* Sidebar Gradient Glow */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent" />
            
            <Link href="/dashboard" className="mb-12 flex items-center px-4">
              <div className="relative h-10 w-[150px] transition-transform hover:scale-105">
                <Image
                  src="/logo_nova.png"
                  alt="Nova"
                  fill
                  className="object-contain object-left"
                  sizes="150px"
                  priority
                />
              </div>
            </Link>

            <nav className="flex-1 space-y-8 px-2 overflow-y-auto custom-scrollbar">
              {navSections.map((section) => (
                <div key={section.label} className="space-y-3">
                  <h3 className="px-4 text-[10px] font-black uppercase tracking-[0.25em] text-slate-500">
                    {section.label}
                  </h3>
                  <div className="space-y-1">
                    {section.items.map((item) => {
                      const Icon = item.icon;
                      const active = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));

                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={cn(
                            'group relative flex items-center gap-3 rounded-2xl px-4 py-3.5 text-[13px] font-bold transition-all duration-300',
                            active
                              ? 'text-white'
                              : 'text-slate-400 hover:bg-white/[0.03] hover:text-white'
                          )}
                        >
                          {active && (
                            <motion.div
                              layoutId="active-nav-bg"
                              className="absolute inset-0 rounded-2xl bg-gradient-to-r from-indigo-500/[0.08] to-violet-500/[0.08] border border-indigo-500/20 shadow-[0_0_25px_rgba(99,102,241,0.05)]"
                              transition={{ type: 'spring', bounce: 0.15, duration: 0.5 }}
                            />
                          )}
                          <Icon className={cn(
                            "relative z-10 h-[18px] w-[18px] transition-all duration-300",
                            active ? "text-indigo-400 scale-110" : "text-slate-500 group-hover:text-slate-300"
                          )} />
                          <span className="relative z-10">{item.label}</span>
                          
                          {active && (
                            <div className="absolute right-4 h-1.5 w-1.5 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.8)]" />
                          )}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </nav>

            {/* Premium Status Footer */}
            <div className="mt-8 px-2">
              <div className="group relative rounded-[2rem] border border-indigo-500/10 bg-indigo-500/5 p-6 backdrop-blur-md transition-all hover:border-indigo-500/20 hover:bg-indigo-500/10 overflow-hidden">
                <div className="absolute -right-4 -top-4 w-16 h-16 bg-indigo-500/10 rounded-full blur-2xl" />
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400/80">System Health</p>
                    <div className="flex items-center gap-1.5">
                       <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
                       <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest">Active</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-black tracking-tight text-white italic">NOVA-CORE</span>
                    <Sparkles className="h-4 w-4 text-indigo-400 animate-pulse" />
                  </div>
                  <p className="mt-1 text-[11px] text-slate-500 font-medium">Orchestration Active</p>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* MAIN CONTENT AREA */}
        <div className="flex min-h-screen min-w-0 flex-1 flex-col p-6">
          <header className="mb-6 flex h-24 items-center justify-between rounded-[2.5rem] border border-white/[0.05] bg-[#0A0C14]/40 px-8 backdrop-blur-2xl shadow-xl relative overflow-hidden">
            <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/[0.05] to-transparent" />
            
            <div className="flex items-center gap-6">
               <div className="lg:hidden">
                  <Image src="/logo_nova.png" alt="Nova" width={110} height={32} className="object-contain" />
               </div>
               
               <div className="hidden lg:flex flex-col">
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Unified Workspace</p>
                </div>
                <div className="flex items-center gap-3 mt-1.5">
                  <div className="p-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
                    <LayoutDashboard className="h-4 w-4 text-indigo-400" />
                  </div>
                  <h1 className="text-lg font-black uppercase tracking-widest text-white">
                    {navSections.flatMap(s => s.items).find(i => i.href === pathname)?.label || 'System'}
                  </h1>
                </div>
               </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.03] border border-white/[0.05]">
                <div className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Network Latency: 24ms</span>
              </div>
              
              <div className="h-8 w-px bg-white/[0.08]" />
              
              <div className="flex items-center gap-4">
                <ThemeToggle />
                <UserNav />
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto rounded-[3rem] border border-white/[0.03] bg-white/[0.01] p-8 backdrop-blur-sm relative shadow-inner md:p-12 custom-scrollbar">
            <div className="relative z-10">
              <Breadcrumbs />
              <div className="mt-8">
                {children}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

