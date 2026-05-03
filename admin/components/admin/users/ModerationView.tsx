'use client';

import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import {
  Flag, Shield, AlertTriangle, CheckCircle2, Clock,
  Search, Eye, Loader2, XCircle, ChevronLeft, ChevronRight,
} from 'lucide-react';
import { toast } from '@/utils/toast';
import * as adminApi from '@/services/adminService';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const STATUS_OPTIONS = ['pending', 'resolved', 'dismissed'] as const;

function PriorityBadge({ reason }: { reason: string }) {
  const isHighPriority = ['harassment', 'hate_speech', 'violence'].includes(reason?.toLowerCase());
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider border
      ${isHighPriority
        ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
        : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
      }`}
    >
      {isHighPriority && <AlertTriangle className="h-2.5 w-2.5" />}
      {isHighPriority ? 'High Priority' : 'Standard'}
    </span>
  );
}

function ReportStatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    pending: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    resolved: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    dismissed: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${styles[status] ?? styles.pending}`}>
      {status}
    </span>
  );
}

export function ModerationView() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<string>('pending');
  const [search, setSearch] = useState('');

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['moderation-reports', { page, status }],
    queryFn: async () => {
      const result = await adminApi.listModerationReports(page, 25, status);
      return result ?? { reports: [], pagination: { page, limit: 25, total: 0, totalPages: 0 } };
    },
  });

  const resolveMut = useMutation({
    mutationFn: ({ id, resolution, action }: { id: string; resolution: string; action?: string }) =>
      adminApi.resolveModerationReport(id, resolution, action),
    onSuccess: () => { toast.success('Report resolved'); refetch(); },
    onError: () => toast.error('Failed to resolve report'),
  });

  const filteredReports = (data?.reports ?? []).filter((r: any) =>
    !search || r.targetUserEmail?.toLowerCase().includes(search.toLowerCase()) || r.reason?.toLowerCase().includes(search.toLowerCase())
  );

  const stats = [
    { label: 'Pending Review', value: data?.pagination.total ?? 0, icon: Clock, color: 'text-amber-400', bg: 'bg-amber-400/10', border: 'border-amber-400/20' },
    { label: 'High Priority', value: filteredReports.filter((r: any) => ['harassment', 'hate_speech', 'violence'].includes(r.reason?.toLowerCase())).length, icon: AlertTriangle, color: 'text-rose-400', bg: 'bg-rose-400/10', border: 'border-rose-400/20' },
    { label: 'Resolved Today', value: '—', icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-400/20' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map((stat) => (
          <div key={stat.label} className={`premium-card p-6 rounded-[2rem] flex items-center gap-4 border ${stat.border}`}>
            <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color} flex-shrink-0`}>
              <stat.icon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{stat.label}</p>
              <h3 className="text-2xl font-bold text-white mt-0.5">{stat.value}</h3>
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
            placeholder="Search by user email or report reason..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-11 pl-11 pr-4 rounded-[1.25rem] bg-white/[0.03] border border-white/5 text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all"
          />
        </div>
        <div className="flex items-center gap-1 p-1 rounded-2xl bg-white/[0.02] border border-white/5">
          {STATUS_OPTIONS.map((s) => (
            <button
              key={s}
              onClick={() => { setStatus(s); setPage(1); }}
              className={`px-4 py-2 rounded-xl text-sm font-bold capitalize transition-all
                ${status === s ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-muted-foreground hover:bg-white/5'}`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Reports Table */}
      <div className="premium-card rounded-[2rem] overflow-hidden">
        {isLoading ? (
          <div className="py-40 flex flex-col items-center gap-4">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="text-sm font-medium text-muted-foreground animate-pulse">Loading moderation queue...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5 bg-white/[0.01]">
                  <th className="px-6 py-5 text-left text-xs font-bold uppercase tracking-wider text-muted-foreground">Reported User</th>
                  <th className="px-6 py-5 text-left text-xs font-bold uppercase tracking-wider text-muted-foreground">Reason</th>
                  <th className="px-6 py-5 text-left text-xs font-bold uppercase tracking-wider text-muted-foreground">Priority</th>
                  <th className="px-6 py-5 text-left text-xs font-bold uppercase tracking-wider text-muted-foreground">Status</th>
                  <th className="px-6 py-5 text-left text-xs font-bold uppercase tracking-wider text-muted-foreground">Reported At</th>
                  <th className="px-6 py-5 text-left text-xs font-bold uppercase tracking-wider text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredReports.map((report: any) => (
                  <tr key={report.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 flex-shrink-0">
                          <Flag className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-bold text-white text-sm">{report.targetUserEmail || 'Unknown User'}</p>
                          <p className="text-[10px] text-muted-foreground uppercase tracking-tighter font-mono">
                            ID: {report.targetUserId?.slice(0, 12)}...
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 max-w-[220px]">
                      <div className="space-y-1">
                        <span className="text-sm font-bold text-white capitalize">{report.reason?.replace(/_/g, ' ')}</span>
                        {report.evidence && (
                          <p className="text-xs text-muted-foreground line-clamp-2 italic">"{report.evidence}"</p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <PriorityBadge reason={report.reason} />
                    </td>
                    <td className="px-6 py-4">
                      <ReportStatusBadge status={report.status} />
                    </td>
                    <td className="px-6 py-4 text-xs font-medium text-muted-foreground whitespace-nowrap">
                      {new Date(report.createdAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/users/manage?userid=${report.targetUserId}`}
                          className="h-8 px-3 flex items-center gap-1.5 rounded-lg text-xs font-bold text-primary hover:bg-primary/10 transition-colors"
                        >
                          <Eye className="h-3.5 w-3.5" /> View
                        </Link>
                        {report.status === 'pending' && (
                          <>
                            <button
                              onClick={() => resolveMut.mutate({ id: report.id, resolution: 'Resolved after review', action: 'none' })}
                              disabled={resolveMut.isPending}
                              className="h-8 px-3 flex items-center gap-1.5 rounded-lg text-xs font-bold text-emerald-400 hover:bg-emerald-400/10 transition-colors disabled:opacity-50"
                            >
                              <CheckCircle2 className="h-3.5 w-3.5" /> Resolve
                            </button>
                            <button
                              onClick={() => resolveMut.mutate({ id: report.id, resolution: 'Dismissed', action: 'dismiss' })}
                              disabled={resolveMut.isPending}
                              className="h-8 px-3 flex items-center gap-1.5 rounded-lg text-xs font-bold text-slate-400 hover:bg-white/5 transition-colors disabled:opacity-50"
                            >
                              <XCircle className="h-3.5 w-3.5" /> Dismiss
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredReports.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-40 text-center">
                      <div className="flex flex-col items-center gap-3 opacity-30">
                        <Shield className="h-12 w-12" />
                        <p className="text-lg font-bold uppercase tracking-[0.2em]">Queue Empty</p>
                        <p className="text-sm">No {status} moderation reports.</p>
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
