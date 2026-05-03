'use client';

import { useQuery, useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import {
  UserCog, ShieldCheck, Crown, Zap, Users, UserIcon,
  CheckCircle2, Loader2, Search, ChevronRight,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from '@/utils/toast';
import * as adminApi from '@/services/adminService';
import type { AdminUser, UserRole } from '@/types/admin';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { RoleChangeModal } from './modals/RoleChangeModal';

// ─── Role definitions ─────────────────────────────────────────────────────────

const ROLES: Array<{
  role: UserRole;
  label: string;
  description: string;
  icon: any;
  color: string;
  bg: string;
  border: string;
  permissions: string[];
}> = [
  {
    role: 'admin',
    label: 'Administrator',
    description: 'Full platform access. Can manage all users, settings, and system configurations.',
    icon: Crown,
    color: 'text-rose-400',
    bg: 'bg-rose-400/10',
    border: 'border-rose-400/20',
    permissions: ['Manage Users', 'View Audit Logs', 'Manage API Keys', 'Platform Config', 'GDPR Tools', 'Webhooks'],
  },
  {
    role: 'moderator',
    label: 'Moderator',
    description: 'Can review and resolve content reports, mute users, and manage moderation queue.',
    icon: ShieldCheck,
    color: 'text-amber-400',
    bg: 'bg-amber-400/10',
    border: 'border-amber-400/20',
    permissions: ['View Users', 'Moderate Content', 'Resolve Reports', 'Mute Users', 'View Reports'],
  },
  {
    role: 'support',
    label: 'Support Agent',
    description: 'Can manage user profiles, reset passwords, and assist with billing inquiries.',
    icon: Users,
    color: 'text-cyan-400',
    bg: 'bg-cyan-400/10',
    border: 'border-cyan-400/20',
    permissions: ['View Users', 'Reset Passwords', 'Manage Billing', 'Ticket Support'],
  },
  {
    role: 'user',
    label: 'Standard User',
    description: 'Basic verified user with access to core platform features.',
    icon: UserIcon,
    color: 'text-blue-400',
    bg: 'bg-blue-400/10',
    border: 'border-blue-400/20',
    permissions: ['Core Features', 'Profile Access', 'Basic Tools'],
  },
  {
    role: 'guest',
    label: 'Guest',
    description: 'Unverified or limited-access user with read-only permissions.',
    icon: UserIcon,
    color: 'text-slate-400',
    bg: 'bg-slate-400/10',
    border: 'border-slate-400/20',
    permissions: ['Read-only Access', 'Limited AI Queries'],
  },
];



// ─── Main Component ────────────────────────────────────────────────────────────────

export function RolesView() {
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState<string>('');
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['admin-users-roles', { search, filterRole }],
    queryFn: () => adminApi.listUsers({ search, role: filterRole, limit: 50, sortBy: 'role', sortOrder: 'asc' }),
    placeholderData: (prev) => prev,
  });

  // Group users by role
  const usersByRole = ROLES.map((roleDef) => ({
    ...roleDef,
    users: (data?.users ?? []).filter((u) => u.role === roleDef.role),
  }));

  const totalByRole = ROLES.reduce((acc, r) => {
    acc[r.role] = (data?.users ?? []).filter((u) => u.role === r.role).length;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {editingUser && (
        <RoleChangeModal
          user={editingUser}
          isOpen={!!editingUser}
          onClose={() => setEditingUser(null)}
          onSuccess={() => refetch()}
        />
      )}

      {/* Role Stats Overview */}
      <div className="grid gap-4 sm:grid-cols-5">
        {ROLES.map((r) => (
          <button
            key={r.role}
            onClick={() => setFilterRole(filterRole === r.role ? '' : r.role)}
            className={`premium-card p-4 rounded-[1.5rem] text-left transition-all border group
              ${filterRole === r.role ? `${r.bg} ${r.border}` : 'border-white/5 hover:border-white/10'}`}
          >
            <div className={`p-2 rounded-xl ${r.bg} w-fit mb-3 group-hover:scale-110 transition-transform`}>
              <r.icon className={`h-4 w-4 ${r.color}`} />
            </div>
            <p className={`text-xl font-bold ${r.color}`}>{totalByRole[r.role] ?? 0}</p>
            <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider mt-0.5">{r.label}</p>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="premium-card p-4 rounded-[2rem] flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search users by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-11 pl-11 pr-4 rounded-[1.25rem] bg-white/[0.03] border border-white/5 text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all"
          />
        </div>
        {filterRole && (
          <button
            onClick={() => setFilterRole('')}
            className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-muted-foreground hover:text-white transition-colors"
          >
            Clear filter
          </button>
        )}
      </div>

      {/* Role Groups */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="space-y-6">
          {(filterRole ? usersByRole.filter((r) => r.role === filterRole) : usersByRole).map((roleDef) => (
            <div key={roleDef.role} className="premium-card rounded-[2rem] overflow-hidden">
              {/* Role Header */}
              <div className={`px-6 py-4 border-b border-white/5 flex items-center justify-between ${roleDef.bg}`}>
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl bg-white/10`}>
                    <roleDef.icon className={`h-5 w-5 ${roleDef.color}`} />
                  </div>
                  <div>
                    <h3 className={`font-bold text-sm ${roleDef.color}`}>{roleDef.label}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5 max-w-md">{roleDef.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="hidden sm:flex items-center gap-1 flex-wrap max-w-xs">
                    {roleDef.permissions.map((p) => (
                      <span key={p} className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${roleDef.bg} ${roleDef.border} ${roleDef.color}`}>
                        {p}
                      </span>
                    ))}
                  </div>
                  <span className={`px-3 py-1 rounded-full font-bold text-sm ${roleDef.bg} ${roleDef.color}`}>
                    {roleDef.users.length}
                  </span>
                </div>
              </div>

              {/* Users in this role */}
              {roleDef.users.length === 0 ? (
                <div className="px-6 py-8 text-center opacity-30">
                  <p className="text-sm font-bold">No users with this role</p>
                </div>
              ) : (
                <div className="divide-y divide-white/5">
                  {roleDef.users.slice(0, 5).map((user) => (
                    <div key={user.id} className="flex items-center justify-between px-6 py-3 hover:bg-white/[0.02] transition-colors group">
                      <div className="flex items-center gap-3">
                        <div className={`h-9 w-9 rounded-full ${roleDef.bg} border ${roleDef.border} flex items-center justify-center ${roleDef.color} font-bold text-sm flex-shrink-0`}>
                          {user.fullName ? user.fullName[0].toUpperCase() : user.email[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-sm text-white group-hover:text-primary transition-colors">
                            {user.fullName || 'Unnamed User'}
                          </p>
                          <p className="text-xs text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full border font-bold uppercase
                          ${user.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                          {user.status}
                        </span>
                        <button
                          onClick={() => setEditingUser(user)}
                          className="h-8 px-3 flex items-center gap-1.5 rounded-lg text-xs font-bold text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <UserCog className="h-3.5 w-3.5" /> Change Role
                        </button>
                        <Link
                          href={`/users/manage?userid=${user.id}`}
                          className="h-8 w-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-white hover:bg-white/5 transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Link>
                      </div>
                    </div>
                  ))}
                  {roleDef.users.length > 5 && (
                    <div className="px-6 py-3">
                      <button
                        onClick={() => setFilterRole(roleDef.role)}
                        className={`text-xs font-bold ${roleDef.color} hover:underline`}
                      >
                        +{roleDef.users.length - 5} more users with this role →
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
