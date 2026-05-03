'use client';

import { Search, RefreshCw } from 'lucide-react';

interface UserFiltersProps {
  search: string;
  role: string;
  status: string;
  onSearchChange: (v: string) => void;
  onRoleChange: (v: string) => void;
  onStatusChange: (v: string) => void;
  onRefresh: () => void;
}

const SELECT_CLS =
  'h-11 px-4 rounded-[1.25rem] bg-muted/50 border border-border text-sm text-foreground ' +
  'focus:outline-none focus:border-primary/50 transition-all appearance-none cursor-pointer';

export function UserFilters({
  search, role, status,
  onSearchChange, onRoleChange, onStatusChange, onRefresh,
}: UserFiltersProps) {
  return (
    <div className="premium-card p-4 rounded-[2rem] flex flex-wrap items-center gap-4">
      {/* Search */}
      <div className="relative flex-1 min-w-[260px]">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search by name, email or ID..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full h-11 pl-11 pr-4 rounded-[1.25rem] bg-muted/50 border border-border text-sm text-foreground
            placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all"
        />
      </div>

      <div className="flex items-center gap-2">
        {/* Role filter */}
        <select value={role} onChange={(e) => onRoleChange(e.target.value)} className={SELECT_CLS}>
          <option value="">All Roles</option>
          <option value="admin">Admin</option>
          <option value="moderator">Moderator</option>
          <option value="pro">Pro</option>
          <option value="lite">Lite</option>
          <option value="free">Free</option>
          <option value="guest">Guest</option>
        </select>

        {/* Status filter */}
        <select value={status} onChange={(e) => onStatusChange(e.target.value)} className={SELECT_CLS}>
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
          <option value="deleted">Deleted</option>
        </select>

        {/* Refresh */}
        <button
          onClick={onRefresh}
          className="h-11 w-11 flex items-center justify-center rounded-[1.25rem] bg-muted/50 border border-border
            text-muted-foreground hover:text-foreground hover:bg-accent transition-all"
          title="Refresh"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
