'use client';

import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Download, UserPlus, FileUp } from 'lucide-react';
import { toast } from '@/utils/toast';
import * as adminApi from '@/services/adminService';
import { Button } from '@/components/ui/button';
import UserCreateModal  from '@/components/admin/UserCreateModal';
import BulkImportModal  from '@/components/admin/BulkImportModal';

import { UserFilters }     from '@/components/users/user-filters';
import { UsersTable }      from '@/components/users/users-table';
import { UsersPagination } from '@/components/users/users-pagination';
import { BulkActionsBar }  from '@/components/users/bulk-actions-bar';

export function AllUsersView() {
  const router      = useRouter();
  const pathname    = usePathname();
  const searchParams = useSearchParams();

  // ── URL-synced filters ────────────────────────────────────────────────────
  const search    = searchParams.get('search')    ?? '';
  const role      = searchParams.get('role')      ?? '';
  const status    = searchParams.get('status')    ?? '';
  const page      = parseInt(searchParams.get('page') ?? '1', 10);
  const sortBy    = searchParams.get('sortBy')    ?? 'createdAt';
  const sortOrder = (searchParams.get('sortOrder') ?? 'desc') as 'asc' | 'desc';

  // ── Local UI state ────────────────────────────────────────────────────────
  const [selectedIds,       setSelectedIds]       = useState<string[]>([]);
  const [exporting,         setExporting]         = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  // ── URL helper ────────────────────────────────────────────────────────────
  const updateParams = useCallback(
    (updates: Record<string, string | number | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (value === null || value === '' || (key === 'page' && value === 1)) {
          params.delete(key);
        } else {
          params.set(key, String(value));
        }
      }
      router.push(`${pathname}?${params.toString()}`);
    },
    [searchParams, pathname, router],
  );

  // ── Data ──────────────────────────────────────────────────────────────────
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin-users', { search, role, status, page, sortBy, sortOrder }],
    queryFn:  () => adminApi.listUsers({ search, role, status, page, limit: 25, sortBy, sortOrder }),
    placeholderData: (prev) => prev,
  });

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleExport = async () => {
    setExporting(true);
    try {
      await adminApi.exportUsers({ search, role, status });
      toast.success('User export generated');
    } catch {
      toast.error('Failed to export users');
    } finally {
      setExporting(false);
    }
  };

  const handleBulkAction = async (action: 'suspend' | 'delete') => {
    if (!selectedIds.length) return;
    const msg = action === 'delete'
      ? `Delete ${selectedIds.length} users? This is irreversible.`
      : `Suspend ${selectedIds.length} users?`;
    if (!confirm(msg)) return;
    try {
      if (action === 'delete') {
        await Promise.all(selectedIds.map((id) => adminApi.deleteUser(id)));
        toast.success(`${selectedIds.length} users deleted`);
      } else {
        await Promise.all(selectedIds.map((id) => adminApi.lockUser(id)));
        toast.success(`${selectedIds.length} users suspended`);
      }
      setSelectedIds([]);
      refetch();
    } catch {
      toast.error('Bulk action partially failed');
    }
  };

  const handleSort = (key: string) => {
    if (sortBy === key) updateParams({ sortOrder: sortOrder === 'asc' ? 'desc' : 'asc' });
    else updateParams({ sortBy: key, sortOrder: 'desc' });
  };

  const toggleAll = () =>
    setSelectedIds(selectedIds.length === data?.users.length ? [] : (data?.users.map((u) => u.id) ?? []));

  const toggleRow = (id: string) =>
    setSelectedIds((prev) => prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]);

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">

      {/* ── Top bar ── */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">
          <span className="text-xl font-bold text-foreground">{data?.pagination.total ?? 0}</span>
          {' '}total users
        </p>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => setIsImportModalOpen(true)} className="rounded-xl border-white/10">
            <FileUp className="h-4 w-4 mr-2" /> Bulk Import
          </Button>
          <Button variant="outline" onClick={handleExport} disabled={exporting} className="rounded-xl border-white/10">
            <Download className="h-4 w-4 mr-2" />
            {exporting ? 'Generating…' : 'Export CSV'}
          </Button>
          <Button onClick={() => setIsCreateModalOpen(true)} className="rounded-xl gradient-primary border-none shadow-lg">
            <UserPlus className="h-4 w-4 mr-2" /> Add User
          </Button>
        </div>
      </div>

      {/* ── Modals ── */}
      <UserCreateModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} />
      <BulkImportModal isOpen={isImportModalOpen} onClose={() => setIsImportModalOpen(false)} />

      {/* ── Bulk actions float bar ── */}
      <BulkActionsBar
        selectedCount={selectedIds.length}
        onSuspend={() => handleBulkAction('suspend')}
        onDelete={() => handleBulkAction('delete')}
        onDeselect={() => setSelectedIds([])}
      />

      {/* ── Filters ── */}
      <UserFilters
        search={search}
        role={role}
        status={status}
        onSearchChange={(v) => updateParams({ search: v, page: 1 })}
        onRoleChange={(v)   => updateParams({ role: v,   page: 1 })}
        onStatusChange={(v) => updateParams({ status: v, page: 1 })}
        onRefresh={() => refetch()}
      />

      {/* ── Table ── */}
      <UsersTable
        users={data?.users ?? []}
        isLoading={isLoading}
        isError={isError}
        selectedIds={selectedIds}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onToggleAll={toggleAll}
        onToggleRow={toggleRow}
        onSort={handleSort}
        onRefresh={() => refetch()}
        onRetry={() => refetch()}
        onView={(user) => router.push(`/users/manage?userid=${user.id}`)}
      />

      {/* ── Pagination ── */}
      {!isLoading && data && (
        <UsersPagination
          page={page}
          pagination={data.pagination}
          onPageChange={(p) => updateParams({ page: p })}
        />
      )}
    </div>
  );
}
