'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ArrowRight, User, LogOut, Settings, LayoutDashboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BrandLogo } from '@/components/brand-logo';
import { useAuthStore } from '@/store/authStore';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useRouter } from 'next/navigation';

const navLinks = [
  { name: 'Features', href: '/#features' },
  { name: 'Workflow', href: '/#workflow' },
  { name: 'Testimonials', href: '/#testimonials' },
  { name: 'Pricing', href: '/pricing' },
  { name: 'FAQ', href: '/#faq' },
];

export function LandingHeader() {
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, isAuthenticated, clearSession } = useAuthStore();

  const handleLogout = () => {
    clearSession();
    router.push('/');
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const initials = user?.displayName
    ?.split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase() || 'U';

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-in-out',
        isScrolled ? 'py-4' : 'py-6'
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className={cn(
            'flex items-center justify-between transition-all duration-500 rounded-[2rem]',
            isScrolled
              ? 'bg-background/40 backdrop-blur-2xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.4)] px-6 py-2'
              : 'bg-transparent px-2 py-2'
          )}
        >
          <div className="flex items-center gap-12">
            <Link href="/" className="flex items-center gap-2 group shrink-0">
              <BrandLogo size="sm" />
            </Link>

            <nav className="hidden lg:flex items-center gap-10">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="text-[13px] font-bold uppercase tracking-widest text-foreground/50 hover:text-foreground transition-all relative group"
                >
                  {link.name}
                  <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-primary transition-all duration-300 group-hover:w-full opacity-0 group-hover:opacity-100" />
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <div className="flex items-center gap-6">
                <div className="hidden xl:flex flex-col items-end">
                  <span className="text-[10px] font-black uppercase tracking-widest text-primary/80">Account Active</span>
                  <span className="text-[13px] font-bold text-foreground/80">{user?.displayName}</span>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="relative outline-none group">
                      <div className="absolute -inset-1 bg-gradient-to-r from-primary to-violet-600 rounded-full blur opacity-25 group-hover:opacity-60 transition duration-300" />
                      <Avatar className="h-10 w-10 border border-white/10 relative bg-background">
                        <AvatarFallback className="bg-gradient-to-br from-primary/20 to-violet-600/20 text-xs font-black text-primary">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-64 p-3 bg-black/90 backdrop-blur-2xl border-white/10 rounded-2xl shadow-2xl mt-2 overflow-hidden ring-1 ring-white/5">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-violet-500 to-primary" />
                    <DropdownMenuLabel className="px-3 py-2">
                      <p className="text-[9px] font-black uppercase tracking-[0.2em] text-primary mb-1">Authenticated</p>
                      <p className="text-sm font-bold text-white truncate">{user?.displayName}</p>
                      <p className="text-[11px] text-white/40 truncate">{user?.email}</p>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-white/5" />
                    <DropdownMenuItem onClick={() => router.push('/dashboard')} className="rounded-xl cursor-pointer py-3 focus:bg-white/5 text-[13px] group">
                      <LayoutDashboard className="mr-3 h-4 w-4 text-white/40 group-hover:text-primary transition-colors" />
                      <span className="font-semibold">Nova Dashboard</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push('/accounts/profile')} className="rounded-xl cursor-pointer py-3 focus:bg-white/5 text-[13px] group">
                      <User className="mr-3 h-4 w-4 text-white/40 group-hover:text-primary transition-colors" />
                      <span className="font-semibold">Your Profile</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push('/dashboard/settings')} className="rounded-xl cursor-pointer py-3 focus:bg-white/5 text-[13px] group">
                      <Settings className="mr-3 h-4 w-4 text-white/40 group-hover:text-primary transition-colors" />
                      <span className="font-semibold">Settings</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-white/5" />
                    <DropdownMenuItem onClick={handleLogout} className="rounded-xl cursor-pointer py-3 focus:bg-red-500/10 text-[13px] text-red-400 group">
                      <LogOut className="mr-3 h-4 w-4 text-red-500/40 group-hover:text-red-400 transition-colors" />
                      <span className="font-bold">End Session</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-3">
                <Link href="/login">
                  <Button variant="ghost" className="text-[13px] font-bold uppercase tracking-widest text-foreground/60 hover:text-foreground h-11 px-6 rounded-2xl hover:bg-white/5">
                    Sign In
                  </Button>
                </Link>
                <Link href="/register">
                  <Button className="h-11 px-8 rounded-2xl bg-primary text-primary-foreground font-black text-xs uppercase tracking-widest hover:opacity-90 shadow-[0_8px_20px_rgba(var(--primary),0.25)] transition-all active:scale-95">
                    Start Learning
                  </Button>
                </Link>
              </div>
            )}

            <button
              className="lg:hidden p-2.5 rounded-xl bg-white/5 text-foreground hover:bg-white/10 transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-full left-0 right-0 bg-background/95 backdrop-blur-2xl border-b border-white/5 p-4 md:hidden"
          >
            <div className="flex flex-col gap-4">
              {isAuthenticated && (
                <div className="flex items-center gap-3 p-4 bg-white/5 rounded-2xl mb-2">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-primary text-white font-bold">{initials}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="text-sm font-bold truncate">{user?.displayName}</p>
                    <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                  </div>
                </div>
              )}
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="text-lg font-medium p-2 hover:bg-white/5 rounded-lg"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.name}
                </Link>
              ))}
              <div className="h-px bg-white/5 my-2" />
              {isAuthenticated ? (
                <>
                  <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="outline" className="w-full justify-start text-lg h-12 rounded-xl">
                      <LayoutDashboard className="mr-3 h-5 w-5" />
                      Dashboard
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    onClick={handleLogout}
                    className="w-full justify-start text-lg h-12 rounded-xl text-red-500"
                  >
                    <LogOut className="mr-3 h-5 w-5" />
                    Log out
                  </Button>
                </>
              ) : (
                <>
                  <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="outline" className="w-full justify-start text-lg h-12 rounded-xl">
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
                    <Button className="w-full justify-start text-lg h-12 rounded-xl">
                      Get Started
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
