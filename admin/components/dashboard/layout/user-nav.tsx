'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  User, 
  Settings, 
  LogOut, 
  ShieldCheck,
  ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { cn } from '@/lib/utils';

export function UserNav() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const clearSession = useAuthStore((state) => state.clearSession);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const initials = user?.displayName
    ? user.displayName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : user?.email?.charAt(0).toUpperCase() || 'AD';

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    clearSession();
    router.push('/login');
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-1 rounded-full hover:bg-white/5 transition-all group"
      >
        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-indigo-600 flex items-center justify-center text-[10px] font-bold text-white shadow-lg shadow-primary/20 ring-2 ring-white/10 group-hover:ring-primary/50 transition-all">
          {initials}
        </div>
        <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform duration-200", isOpen && "rotate-180")} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute right-0 mt-2 w-56 overflow-hidden rounded-2xl border border-white/10 bg-[#0f1117] shadow-2xl shadow-black/50 z-50"
          >
            <div className="p-4 border-b border-white/5 bg-white/[0.02]">
              <p className="text-sm font-bold text-white truncate">{user?.displayName || 'Administrator'}</p>
              <p className="text-xs text-muted-foreground truncate mt-0.5">{user?.email}</p>
              <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20">
                <ShieldCheck className="h-3 w-3 text-primary" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-primary">{user?.role || 'Admin'}</span>
              </div>
            </div>

            <div className="p-2">
              <Link href="/accounts/profile" onClick={() => setIsOpen(false)}>
                <button className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-muted-foreground hover:text-white hover:bg-white/5 transition-all">
                  <User className="h-4 w-4" />
                  Profile Details
                </button>
              </Link>
              <Link href="/accounts/profile/edit" onClick={() => setIsOpen(false)}>
                <button className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-muted-foreground hover:text-white hover:bg-white/5 transition-all">
                  <Settings className="h-4 w-4" />
                  Account Settings
                </button>
              </Link>
            </div>

            <div className="p-2 border-t border-white/5 bg-white/[0.01]">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all"
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
