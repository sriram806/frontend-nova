'use client';

import Image from 'next/image';
import { Menu, Bell, Search, Command } from 'lucide-react';
import { ThemeToggle } from '@/components/common/theme-toggle';
import { useAuthStore } from '@/store/authStore';
import { UserNav } from './user-nav';

export default function DashboardHeader({
    onToggleSidebar,
}: {
    onToggleSidebar?: () => void;
}) {
    const user = useAuthStore((state) => state.user);
    const initials = user?.displayName
        ? user.displayName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
        : user?.email?.charAt(0).toUpperCase() || 'AD';

    return (
        <header className="flex items-center justify-between px-4 h-16">

            {/* LEFT */}
            <div className="flex items-center gap-3">
                {onToggleSidebar && (
                    <button
                        className="p-2 rounded-lg hover:bg-white/10 transition"
                        onClick={onToggleSidebar}
                    >
                        <Menu className="h-5 w-5" />
                    </button>
                )}

                <span className="relative h-8 w-[120px]">
                    <Image
                        src="/logo_nova.png"
                        alt="Brand Logo"
                        fill
                        className="object-contain object-left"
                    />
                </span>
            </div>

            {/* CENTER - SEARCH */}
            <div className="hidden md:flex flex-1 max-w-md mx-6">
                <div className="relative w-full">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <input
                        placeholder="Search... (Ctrl + K)"
                        className="w-full pl-9 pr-12 py-2 rounded-lg bg-muted/50 border border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <div className="absolute right-2 top-1.5 flex items-center gap-1 text-xs text-muted-foreground">
                        <Command className="h-3 w-3" /> K
                    </div>
                </div>
            </div>

            {/* RIGHT */}
            <div className="flex items-center gap-3">
                <ThemeToggle />

                {/* 🔔 Notifications */}
                <button className="relative p-2 rounded-lg hover:bg-white/10 transition">
                    <Bell className="h-5 w-5" />
                    <span className="absolute top-1 right-1 h-2 w-2 bg-blue-500 rounded-full" />
                </button>

                {/* 👤 Profile Dropdown */}
                <UserNav />
            </div>
        </header>
    );
}