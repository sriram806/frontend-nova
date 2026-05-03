'use client';

import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import {
  ShieldBan, Unlock, Trash2, Search, AlertTriangle,
  ChevronLeft, ChevronRight, Loader2, Eye, UserX,
  RefreshCw,
} from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { toast } from '@/utils/toast';
import * as adminApi from '@/services/adminService';
import type { AdminUser } from '@/types/admin';
import { Button } from '@/components/ui/button';

type FilterMode = 'suspended' | 'deleted' | 'all';

function TimeAgo({ date }: { date: string | null }) {
  if (!date) return <span className="text-muted-foreground">—</span>;
  const d = new Date(date);
  const now = new Date();
  const diff = Math.floor((now.getTime() - d.getTime()) / 1000);
  if (diff < 60) return <span>{diff}s ago</span>;
  if (diff < 3600) return <span>{Math.floor(diff / 60)}m ago</span>;
  if (diff < 86400) return <span>{Math.floor(diff / 3600)}h ago</span>;
  return <span>{d.toLocaleDateString()}</span>;
}

function BannedUserRow({
  user,
  onRefresh,
}: {
  user: AdminUser;
  onRefresh: () => void;
}) {
  const unlockMut = useMutation({
    mutationFn: () => adminApi.unlockUser(user.id),
    onSuccess: () => { toast.success('User reactivated'); onRefresh(); },
    onError: () => toast.error('Failed to reactivate user'),
  });
  const deleteMut = useMutation({
    mutationFn: () => adminApi.deleteUser(user.id),
    onSuccess: () => { toast.success('User permanently deleted'); onRefresh(); },
    onError: () => toast.error('Failed to delete user'),
  });

  const isDeleted = user.status === 'deleted';
  const isLocked = user.lockUntil && new Date(user.lockUntil) > new Date();

  return (
    <motion.tr
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className="hover:bg-white/[0.02] transition-colors group"
    >
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className={`h-10 w-10 rounded-full border flex items-center justify-center font-bold text-sm flex-shrink-0
            ${isDeleted
              ? 'bg-red-500/10 border-red-500/20 text-red-400'
              : 'bg-orange-500/10 border-orange-500/20 text-orange-400'}`}
          >
            {user.fullName ? user.fullName[0].toUpperCase() : user.email[0].toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-white text-sm">{user.fullName || 'Unnamed User'}</p>
            <p className="text-xs text-muted-foreground">{user.email}</p>
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wider
          ${isDeleted
            ? 'bg-red-500/10 text-red-400 border-red-500/20'
            : isLocked
              ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
              : 'bg-orange-500/10 text-orange-400 border-orange-500/20'}`}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-current" />
          {isDeleted ? 'Deleted' : isLocked ? 'Locked' : 'Suspended'}
        </span>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          {user.failedLoginAttempts > 0 ? (
            <span className="flex items-center gap-1 text-red-400 font-bold">
              <AlertTriangle className="h-3 w-3" />
              {user.failedLoginAttempts} attempts
            </span>
          ) : '—'}
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="text-xs text-muted-foreground">
          {isLocked && user.lockUntil ? (
            <div>
              <p className="text-rose-400 font-bold">Until</p>
              <p>{new Date(user.lockUntil).toLocaleString()}</p>
            </div>
          ) : (
            <TimeAgo date={user.lastLogin} />
          )}
        </div>
      </td>
      <td className="px-6 py-4 text-xs text-muted-foreground">
        <TimeAgo date={user.createdAt} />
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Link
            href={`/users/manage?userid=${user.id}`}
            className="h-8 px-3 flex items-center gap-1.5 rounded-lg text-xs font-bold text-primary hover:bg-primary/10 transition-colors"
          >
            <Eye className="h-3.5 w-3.5" /> Profile
          </Link>
          {!isDeleted && (
            <button
              onClick={() => unlockMut.mutate()}
              disabled={unlockMut.isPending}
              className="h-8 px-3 flex items-center gap-1.5 rounded-lg text-xs font-bold text-emerald-400 hover:bg-emerald-400/10 transition-colors disabled:opacity-50"
            >
              {unlockMut.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Unlock className="h-3.5 w-3.5" />}
              Reactivate
            </button>
          )}
          <button
            onClick={() => {
              if (confirm(`Permanently delete ${user.email}? This cannot be undone.`)) deleteMut.mutate();
            }}
            disabled={deleteMut.isPending}
            className="h-8 px-3 flex items-center gap-1.5 rounded-lg text-xs font-bold text-red-400 hover:bg-red-400/10 transition-colors disabled:opacity-50"
          >
            {deleteMut.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
            Delete
          </button>
        </div>
      </td>
    </motion.tr>
  );
}

export function BannedView() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FilterMode>('suspended');
  const [page, setPage] = useState(1);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['admin-users-banned', { filter, search, page }],
    queryFn: () => adminApi.listUsers({
      search,
      status: filter === 'all' ? '' : filter,
      page,
      limit: 25,
      sortBy: 'createdAt',
      sortOrder: 'desc',
    }),
    placeholderData: (prev) => prev,
  });

  const stats = [
    { label: 'Suspended', value: filter === 'suspended' ? data?.pagination.total ?? '—' : '—', icon: ShieldBan, color: 'text-orange-400', bg: 'bg-orange-400/10', border: 'border-orange-400/20' },
    { label: 'Deleted', value: filter === 'deleted' ? data?.pagination.total ?? '—' : '—', icon: Trash2, color: 'text-red-400', bg: 'bg-red-400/10', border: 'border-red-400/20' },
    { label: 'High Risk (Failed Logins)', value: (data?.users ?? []).filter((u) => u.failedLoginAttempts >= 3).length, icon: AlertTriangle, color: 'text-rose-400', bg: 'bg-rose-400/10', border: 'border-rose-400/20' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map((stat) => (
          <div key={stat.label} className={`premium-card p-6 rounded-[2rem] flex items-center gap-4 border ${stat.border}`}>
            <div className={`p-3 rounded-2xl ${stat.bg} flex-shrink-0`}>
              <stat.icon className={`h-6 w-6 ${stat.color}`} />
            </div>
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{stat.label}</p>
              <h3 className={`text-2xl font-bold mt-0.5 ${stat.color}`}>{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="premium-card p-4 rounded-[2rem] flex flex-wrap items-center gap-4">
        <div className="relative flex-1 min-w-[280px]">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search banned users by name or email..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full h-11 pl-11 pr-4 rounded-[1.25rem] bg-white/[0.03] border border-white/5 text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all"
          />
        </div>
        <div className="flex items-center gap-1 p-1 rounded-2xl bg-white/[0.02] border border-white/5">
          {(['suspended', 'deleted', 'all'] as FilterMode[]).map((f) => (
            <button
              key={f}
              onClick={() => { setFilter(f); setPage(1); }}
              className={`px-4 py-2 rounded-xl text-sm font-bold capitalize transition-all
                ${filter === f ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-muted-foreground hover:bg-white/5'}`}
            >
              {f === 'all' ? 'All' : f}
            </button>
          ))}
        </div>
        <button
          onClick={() => refetch()}
          className="h-11 w-11 flex items-center justify-center rounded-[1.25rem] bg-white/[0.03] border border-white/5 text-muted-foreground hover:text-white hover:bg-white/10 transition-all"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      {/* Table */}
      <div className="premium-card rounded-[2rem] overflow-hidden">
        {isLoading ? (
          <div className="py-32 flex flex-col items-center gap-4">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="text-sm font-medium text-muted-foreground animate-pulse">Loading restricted accounts...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5 bg-white/[0.01]">
                  <th className="px-6 py-5 text-left text-xs font-bold uppercase tracking-wider text-muted-foreground">User</th>
                  <th className="px-6 py-5 text-left text-xs font-bold uppercase tracking-wider text-muted-foreground">Restriction</th>
                  <th className="px-6 py-5 text-left text-xs font-bold uppercase tracking-wider text-muted-foreground">Security</th>
                  <th className="px-6 py-5 text-left text-xs font-bold uppercase tracking-wider text-muted-foreground">Lock / Last Active</th>
                  <th className="px-6 py-5 text-left text-xs font-bold uppercase tracking-wider text-muted-foreground">Joined</th>
                  <th className="px-6 py-5 text-left text-xs font-bold uppercase tracking-wider text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {data?.users.map((user) => (
                  <BannedUserRow key={user.id} user={user} onRefresh={refetch} />
                ))}
                {data?.users.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-32 text-center">
                      <div className="flex flex-col items-center gap-4 opacity-30">
                        <UserX className="h-12 w-12" />
                        <div>
                          <p className="text-lg font-bold text-white">No {filter} accounts</p>
                          <p className="text-sm text-muted-foreground">No users match these restrictions.</p>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {!isLoading && data && (data.pagination.totalPages ?? 0) > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline" size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="rounded-xl border-white/10 hover:bg-white/5 h-9 w-9 p-0"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-muted-foreground px-2">
            Page <span className="text-white font-bold">{page}</span> of{' '}
            <span className="text-white font-bold">{data.pagination.totalPages}</span>
          </span>
          <Button
            variant="outline" size="sm"
            onClick={() => setPage((p) => Math.min(data.pagination.totalPages ?? p, p + 1))}
            disabled={page === (data.pagination.totalPages ?? page)}
            className="rounded-xl border-white/10 hover:bg-white/5 h-9 w-9 p-0"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
