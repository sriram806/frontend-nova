'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
    Users,
    FileText,
    GraduationCap,
    Gauge,
    LogOut,
    ChevronDown,
    BarChart3,
    DollarSign,
    ClipboardList,
    Shield,
    Flag,
    Webhook,
    Bell,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { useAuthStore } from '@/store/authStore';

const navItems = [
    {
        label: 'Dashboard',
        icon: Gauge,
        href: '/dashboard',
    },
    {
        label: 'Users',
        icon: Users,
        href: '/users',
    },
    {
        label: 'Security & Compliance',
        icon: Shield,
        children: [
            { label: 'Audit Log', href: '/audit-log' },
            { label: 'GDPR Requests', href: '/gdpr' },
        ],
    },
    {
        label: 'Exams',
        icon: FileText,
        href: '/exams',
    },
    {
        label: 'Notifications',
        icon: Bell,
        href: '/notifications',
    },
    {
        label: 'Developers',
        icon: Webhook,
        children: [
            { label: 'API Keys', href: '/api-keys' },
            { label: 'Webhooks', href: '/webhooks' },
        ],
    },
];

export default function DashboardSidebar({ collapsed }: { collapsed?: boolean }) {
    const pathname = usePathname();
    const router = useRouter();
    const clearSession = useAuthStore((state) => state.clearSession);

    const [openMenus, setOpenMenus] = useState<string[]>([]);

    const toggleMenu = (label: string) => {
        setOpenMenus((prev) =>
            prev.includes(label)
                ? prev.filter((i) => i !== label)
                : [...prev, label]
        );
    };

    const isActive = (href: string) => {
        if (href === '/dashboard') return pathname === '/dashboard';
        return pathname.startsWith(href);
    };

    const onLogout = () => {
        clearSession();
        router.replace('/login');
    };

    return (
        <nav
            className={cn(
                'flex flex-col h-full py-4 px-2 bg-muted/40 backdrop-blur-xl',
                collapsed && 'items-center'
            )}
        >
            <div className="flex flex-col gap-1 flex-1 w-full">
                {navItems.map((item) => {
                    const Icon = item.icon;

                    // 🔥 SIMPLE LINK
                    if (!item.children) {
                        const active = isActive(item.href!);

                        return (
                            <Link
                                key={item.label}
                                href={item.href!}
                                className={cn(
                                    'relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
                                    collapsed && 'justify-center',
                                    active
                                        ? 'bg-primary/20 text-primary'
                                        : 'hover:bg-white/10 text-muted-foreground hover:text-foreground'
                                )}
                                title={item.label}
                            >
                                {active && (
                                    <span className="absolute left-0 top-0 h-full w-1 bg-primary rounded-r-md" />
                                )}

                                <Icon className="h-5 w-5" />
                                {!collapsed && <span>{item.label}</span>}
                            </Link>
                        );
                    }

                    // 🔥 PARENT WITH CHILDREN
                    const isOpen = openMenus.includes(item.label);

                    return (
                        <div key={item.label} className="w-full">
                            <button
                                onClick={() => toggleMenu(item.label)}
                                className={cn(
                                    'flex items-center w-full gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
                                    collapsed && 'justify-center',
                                    'hover:bg-white/10 text-muted-foreground hover:text-foreground'
                                )}
                            >
                                <Icon className="h-5 w-5" />

                                {!collapsed && (
                                    <>
                                        <span className="flex-1 text-left">{item.label}</span>
                                        <ChevronDown
                                            className={cn(
                                                'h-4 w-4 transition-transform',
                                                isOpen && 'rotate-180'
                                            )}
                                        />
                                    </>
                                )}
                            </button>

                            {/* 🔽 CHILDREN */}
                            {!collapsed && isOpen && (
                                <div className="ml-6 mt-1 flex flex-col gap-1">
                                    {item.children.map((child) => {
                                        const active = isActive(child.href);

                                        return (
                                            <Link
                                                key={child.href}
                                                href={child.href}
                                                className={cn(
                                                    'flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-all',
                                                    active
                                                        ? 'bg-primary/20 text-primary'
                                                        : 'text-muted-foreground hover:text-foreground hover:bg-white/10'
                                                )}
                                            >
                                                {/* small dot indicator */}
                                                <span
                                                    className={cn(
                                                        'h-1.5 w-1.5 rounded-full',
                                                        active ? 'bg-primary' : 'bg-muted-foreground'
                                                    )}
                                                />
                                                {child.label}
                                            </Link>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            <div className={cn('mt-auto w-full', collapsed && 'flex justify-center')}>
                <button
                    onClick={onLogout}
                    className={cn(
                        'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all w-full',
                        'hover:bg-red-500/10 text-red-400 hover:text-red-300',
                        collapsed && 'justify-center'
                    )}
                >
                    <LogOut className="h-5 w-5" />
                    {!collapsed && <span>Logout</span>}
                </button>
            </div>
        </nav>
    );
}