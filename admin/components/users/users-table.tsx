'use client';

import Link from 'next/link';

import { useMutation } from '@tanstack/react-query';
import {
  AlertCircle,
  UserX,
  Eye,
  Pencil,
  ShieldCheck,
  Lock,
  Unlock,
  Trash2,
} from 'lucide-react';

import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { RoleBadge, PlanBadge } from '@/components/users/user-badges';
import * as adminApi from '@/services/adminService';
import { toast } from '@/utils/toast';
import type { AdminUser } from '@/types/admin';

interface UsersTableProps {
  users: AdminUser[];
  isLoading: boolean;
  isError: boolean;
  selectedIds: string[];
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  onToggleAll: () => void;
  onToggleRow: (id: string) => void;
  onSort: (key: string) => void;
  onRefresh: () => void;
  onRetry: () => void;
  onView?: (user: AdminUser) => void;
}

const COL_CLS =
  'px-6 py-5 text-left text-xs font-bold uppercase tracking-wider text-muted-foreground';

export function UsersTable({
  users,
  isLoading,
  isError,
  selectedIds,
  sortBy,
  sortOrder,
  onToggleAll,
  onToggleRow,
  onSort,
  onRefresh,
  onRetry,
  onView,
}: UsersTableProps) {
  const allSelected =
    selectedIds.length === users.length && users.length > 0;

  /* ---------------- ACTIONS COMPONENT ---------------- */
  const UserActions = ({ user }: { user: AdminUser }) => {
    const lockMut = useMutation({
      mutationFn: () => adminApi.lockUser(user.id),
      onSuccess: () => { toast.success('User suspended'); onRefresh(); },
      onError: () => toast.error('Failed to suspend user'),
    });
    const unlockMut = useMutation({
      mutationFn: () => adminApi.unlockUser(user.id),
      onSuccess: () => { toast.success('User reactivated'); onRefresh(); },
      onError: () => toast.error('Failed to unlock user'),
    });
    const deleteMut = useMutation({
      mutationFn: () => adminApi.deleteUser(user.id),
      onSuccess: () => { toast.success('User deleted'); onRefresh(); },
      onError: () => toast.error('Failed to delete user'),
    });

    const btnClass = "flex items-center justify-center p-2 rounded-xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.08] hover:border-white/10 text-muted-foreground hover:text-white transition-all hover:scale-105 active:scale-95 group/btn shadow-sm disabled:opacity-50";

    return (
      <div className="flex items-center justify-end gap-2 px-2">
        {/* Details */}
        <Link
          href={`/users/manage?userid=${user.id}&view=overview`}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 border border-primary/20 hover:bg-primary/20 text-primary text-xs font-bold transition-all hover:scale-105 active:scale-95 group/btn shadow-sm"
        >
          <Eye className="h-4 w-4 group-hover/btn:scale-110 transition-transform" />
          Details
        </Link>

        {/* Edit */}
        <Link
          href={`/users/manage?userid=${user.id}&view=overview`}
          className={btnClass}
          title="Edit details"
        >
          <Pencil className="h-4 w-4 group-hover/btn:scale-110 transition-transform" />
        </Link>

        {/* Sessions */}
        <Link
          href={`/users/manage?userid=${user.id}&view=sessions`}
          className={btnClass}
          title="Security sessions"
        >
          <ShieldCheck className="h-4 w-4 group-hover/btn:scale-110 transition-transform" />
        </Link>

        {/* Suspend/Reactivate */}
        {user.status === 'active' ? (
          <button
            onClick={(e) => { e.stopPropagation(); lockMut.mutate(); }}
            disabled={lockMut.isPending}
            className={`${btnClass} text-orange-500 hover:text-orange-400 hover:bg-orange-500/10`}
            title="Suspend account"
          >
            <Lock className="h-4 w-4 group-hover/btn:scale-110 transition-transform" />
          </button>
        ) : user.status === 'suspended' ? (
          <button
            onClick={(e) => { e.stopPropagation(); unlockMut.mutate(); }}
            disabled={unlockMut.isPending}
            className={`${btnClass} text-emerald-500 hover:text-emerald-400 hover:bg-emerald-500/10`}
            title="Reactivate account"
          >
            <Unlock className="h-4 w-4 group-hover/btn:scale-110 transition-transform" />
          </button>
        ) : null}

        {/* Delete */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (confirm(`Delete ${user.email}? This is irreversible.`)) deleteMut.mutate();
          }}
          disabled={deleteMut.isPending}
          className={`${btnClass} text-destructive hover:text-red-400 hover:bg-destructive/10`}
          title="Delete user"
        >
          <Trash2 className="h-4 w-4 group-hover/btn:scale-110 transition-transform" />
        </button>
      </div>
    );
  };

  /* ---------------- LOADING ---------------- */
  if (isLoading) {
    return (
      <div className="premium-card rounded-[2rem] flex flex-col items-center justify-center py-32 gap-4">
        <div className="h-12 w-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        <p className="text-sm text-muted-foreground animate-pulse">
          Loading users...
        </p>
      </div>
    );
  }

  /* ---------------- ERROR ---------------- */
  if (isError) {
    return (
      <div className="premium-card rounded-[2rem] flex flex-col items-center justify-center py-32 gap-4">
        <AlertCircle className="h-10 w-10 text-destructive" />
        <p className="text-lg font-semibold">Something went wrong</p>
        <Button onClick={onRetry}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* 🔝 HEADER */}


      {/* 📊 TABLE */}
      <div className="premium-card rounded-[2rem] overflow-hidden border border-border/50 shadow-sm">

        <div className="overflow-x-auto">
          <table className="w-full">

            {/* HEADER */}
            <thead>
              <tr className="bg-muted/30 border-b border-border">

                <th className="px-6 py-4 w-10">
                  <Checkbox
                    checked={allSelected}
                    onCheckedChange={onToggleAll}
                  />
                </th>

                {[
                  'User',
                  'Role',
                  'Plan',
                  'Actions',
                ].map((label) => (
                  <th key={label} className={COL_CLS}>
                    {label}
                  </th>
                ))}
              </tr>
            </thead>

            {/* BODY */}
            <tbody className="divide-y divide-border">

              {users.map((user) => (
                <tr
                  key={user.id}
                  className={`group transition-all duration-200 hover:bg-muted/40 hover:shadow-sm cursor-pointer
                  ${selectedIds.includes(user.id)
                      ? 'bg-primary/5 ring-1 ring-primary/20'
                      : ''
                    }`}
                >

                  {/* CHECKBOX */}
                  <td className="px-6 py-4">
                    <Checkbox
                      checked={selectedIds.includes(user.id)}
                      onCheckedChange={() => onToggleRow(user.id)}
                    />
                  </td>

                  {/* USER */}
                  <td
                    className="px-6 py-4"
                    onClick={() => onView?.(user)}
                  >
                    <div className="flex items-center gap-3">

                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 border flex items-center justify-center font-bold flex-shrink-0">
                        {(user.fullName ?? user.email)[0].toUpperCase()}
                      </div>

                      <div className="min-w-0">
                        <p className="font-semibold group-hover:text-primary transition truncate">
                          {user.fullName || 'Unnamed User'}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {user.email}
                        </p>
                      </div>

                    </div>
                  </td>

                  {/* ROLE */}
                  <td className="px-6 py-4">
                    <RoleBadge role={user.role} />
                  </td>

                  {/* PLAN */}
                  <td className="px-6 py-4">
                    <PlanBadge plan={user.plan} />
                  </td>

                  {/* 🔥 ACTIONS */}
                  <td className="px-3 py-4 sticky right-0 bg-background/95 backdrop-blur-md border-l border-white/5 group-hover:bg-muted/60 transition-colors z-10">
                    <UserActions user={user} />
                  </td>
                </tr>
              ))}

              {/* EMPTY */}
              {users.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-24 text-center">
                    <UserX className="h-12 w-12 mx-auto opacity-40" />
                    <p className="mt-4 text-lg font-semibold">
                      No users found
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}