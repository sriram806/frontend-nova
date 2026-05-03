'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  CreditCard, 
  LayoutDashboard, 
  LogOut, 
  Settings, 
  User 
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAuthStore } from '@/store/authStore';

export function UserNav() {
  const router = useRouter();
  const { user, clearSession } = useAuthStore();

  const onLogout = () => {
    clearSession();
    router.replace('/login');
  };

  if (!user) return null;

  const initials = user.displayName
    ? user.displayName.split(' ').filter(Boolean).map(n => n[0]).filter((_, i, arr) => i === 0 || i === arr.length - 1).join('').toUpperCase()
    : user.email[0].toUpperCase();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="relative h-10 w-10 rounded-full border border-white/10 p-0.5 transition-all hover:ring-4 hover:ring-indigo-500/10 focus:outline-none">
          <Avatar className="h-full w-full">
            <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-violet-600 text-xs font-bold text-white">
              {initials}
            </AvatarFallback>
          </Avatar>

        </button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent className="w-56 rounded-2xl border-white/10 bg-background/80 backdrop-blur-xl" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-bold leading-none text-white">{user.displayName || 'ThinkAI User'}</p>
            <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-white/5" />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href="/dashboard" className="cursor-pointer gap-2 rounded-xl focus:bg-white/5">
              <LayoutDashboard className="h-4 w-4" />
              <span>Dashboard</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/settings" className="cursor-pointer gap-2 rounded-xl focus:bg-white/5">
              <User className="h-4 w-4" />
              <span>Profile</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/settings/edit" className="cursor-pointer gap-2 rounded-xl focus:bg-white/5">
              <Settings className="h-4 w-4" />
              <span>Settings</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/pricing" className="cursor-pointer gap-2 rounded-xl focus:bg-white/5">
              <CreditCard className="h-4 w-4" />
              <span>Billing</span>
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator className="bg-white/5" />
        <DropdownMenuItem 
          onClick={onLogout}
          className="cursor-pointer gap-2 rounded-xl text-red-400 focus:bg-red-500/10 focus:text-red-400"
        >
          <LogOut className="h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
