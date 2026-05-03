'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Search, ChevronLeft, ChevronRight, RefreshCw, AlertCircle, Filter,
  Globe, Loader2, User, Terminal, ArrowRight, Eye, MoreHorizontal,
  History, Fingerprint, Activity, Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import * as adminApi from '@/services/adminService';
import type { AuditLogEntry } from '@/types/admin';
import { Button } from '@/components/ui/button';

// ─── Action color map ─────────────────────────────────────────────────────────

const ACTION_COLORS: Record<string, { color: string, bg: string, border: string }> = {
  suspend_user: { color: 'text-amber-400', bg: 'bg-amber-400/10', border: 'border-amber-400/20' },
  unlock_user: { color: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-400/20' },
  delete_user: { color: 'text-rose-400', bg: 'bg-rose-400/10', border: 'border-rose-400/20' },
  impersonate_user: { color: 'text-violet-400', bg: 'bg-violet-400/10', border: 'border-violet-400/20' },
  update_role: { color: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-400/20' },
  revoke_session: { color: 'text-orange-400', bg: 'bg-orange-400/10', border: 'border-orange-400/20' },
  revoke_all_sessions: { color: 'text-orange-400', bg: 'bg-orange-400/10', border: 'border-orange-400/20' },
  create_gdpr_request: { color: 'text-rose-400', bg: 'bg-rose-400/10', border: 'border-rose-400/20' },
  bulk_export: { color: 'text-sky-400', bg: 'bg-sky-400/10', border: 'border-sky-400/20' },
  update_user: { color: 'text-slate-400', bg: 'bg-slate-400/10', border: 'border-slate-400/20' }
};

function ActionBadge({ action }: { action: string }) {
  const style = ACTION_COLORS[action] ?? { color: 'text-slate-400', bg: 'bg-slate-400/10', border: 'border-slate-400/20' };
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${style.bg} ${style.color} ${style.border}`}>
      {action.replace(/_/g, ' ')}
    </span>
  );
}

// ─── Metadata preview ─────────────────────────────────────────────────────────

function MetaPreview({ metadata }: { metadata: Record<string, unknown> }) {
  const [expanded, setExpanded] = useState(false);
  if (!metadata || Object.keys(metadata).length === 0) return null;
  return (
    <div className="mt-3">
      <button
        onClick={() => setExpanded((e) => !e)}
        className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-primary hover:text-primary/80 transition-colors"
      >
        <Terminal className="h-3 w-3" />
        {expanded ? 'Collapse Payload' : 'Inspect Payload'}
      </button>
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <pre className="mt-3 text-[11px] bg-[#0c0e14] border border-white/5 rounded-xl p-4 overflow-x-auto text-blue-300/70 font-mono leading-relaxed">
              {JSON.stringify(metadata, null, 2)}
            </pre>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AuditLogPage() {
  const [page, setPage] = useState(1);
  const [action, setAction] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [actorId, setActorId] = useState('');

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin-audit-log', { page, action, fromDate, toDate, actorId }],
    queryFn: () => adminApi.getAuditLogs({ page, limit: 25, action, fromDate, toDate, actorId }),
    placeholderData: (prev) => prev
  });

  return (
    <div className="space-y-10 pb-20">
      {/* Header */}
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            System Registry
            <span className="text-sm font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
              Audit Logs
            </span>
          </h1>
          <p className="text-muted-foreground text-[15px]">
            Comprehensive immutable ledger of all administrative activities and security events.
          </p>
        </div>

        <Button variant="outline" onClick={() => refetch()} className="rounded-xl border-white/10 hover:bg-white/5">
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} /> Sync Logs
        </Button>
      </div>

      {/* Advanced Filters */}
      <div className="premium-card p-6 rounded-[2rem] grid gap-4 md:grid-cols-4">
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Event Action</label>
          <select
            value={action}
            onChange={(e) => { setAction(e.target.value); setPage(1); }}
            className="input-premium h-11"
          >
            <option value="">All Events</option>
            {[
              'create_user', 'update_user', 'suspend_user', 'unlock_user', 'delete_user',
              'impersonate_user', 'export_data', 'delete_data', 'revoke_session',
              'revoke_all_sessions', 'update_role', 'update_subscription',
              'create_gdpr_request', 'manage_api_key', 'bulk_import', 'bulk_export'
            ].map((a) => <option key={a} value={a}>{a.replace(/_/g, ' ').toUpperCase()}</option>)}
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">From Date</label>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => { setFromDate(e.target.value); setPage(1); }}
            className="input-premium h-11 [color-scheme:dark]"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">To Date</label>
          <input
            type="date"
            value={toDate}
            onChange={(e) => { setToDate(e.target.value); setPage(1); }}
            className="input-premium h-11 [color-scheme:dark]"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Search Actor</label>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={actorId}
              onChange={(e) => { setActorId(e.target.value); setPage(1); }}
              placeholder="Admin ID or Email..."
              className="input-premium pl-11 h-11"
            />
          </div>
        </div>
      </div>

      {/* Timeline Feed */}
      <div className="premium-card rounded-[2.5rem] overflow-hidden">
        {isLoading ? (
          <div className="py-40 flex flex-col items-center gap-4">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="text-sm font-medium text-muted-foreground animate-pulse">Reconstructing timeline...</p>
          </div>
        ) : isError ? (
          <div className="py-40 text-center space-y-4">
            <AlertCircle className="h-12 w-12 text-rose-400 mx-auto" />
            <p className="text-lg font-bold text-white">Log Retrieval Failed</p>
            <Button variant="outline" onClick={() => refetch()} className="rounded-xl border-white/10">Try Connection Again</Button>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {data?.logs.map((log: AuditLogEntry, i: number) => (
              <motion.div
                key={log.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.02 }}
                className="p-6 hover:bg-white/[0.02] transition-colors group relative"
              >
                {/* Timeline vertical line */}
                <div className="absolute left-10 top-0 bottom-0 w-px bg-white/5 group-first:top-10 group-last:bottom-10" />

                <div className="flex flex-col md:flex-row gap-6 relative z-10">
                  {/* Timestamp & Icon */}
                  <div className="flex items-start gap-4 md:w-48 shrink-0">
                    <div className="h-8 w-8 rounded-full bg-[#0f1117] border border-white/10 flex items-center justify-center text-muted-foreground group-hover:border-primary/50 group-hover:text-primary transition-all shadow-xl">
                      <Clock className="h-4 w-4" />
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-xs font-bold text-white">{new Date(log.createdAt).toLocaleDateString()}</p>
                      <p className="text-[10px] font-medium text-muted-foreground">{new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 space-y-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex flex-wrap items-center gap-3">
                        <ActionBadge action={log.action} />
                        {log.targetEmail && (
                          <div className="flex items-center gap-2 text-xs text-muted-foreground bg-white/5 px-2 py-1 rounded-lg border border-white/5">
                            <ArrowRight className="h-3 w-3" />
                            <span className="font-bold text-white/70">{log.targetEmail}</span>
                          </div>
                        )}
                        {log.resourceType && (
                          <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest border-l border-white/10 pl-3">
                            {log.resourceType}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground bg-white/5 px-3 py-1.5 rounded-xl border border-white/5 group-hover:border-white/10 transition-colors">
                        <Fingerprint className="h-3 w-3 text-primary" />
                        ID: {log.id.slice(0, 12)}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs">
                      <div className="flex items-center gap-2">
                        <User className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-muted-foreground">Actor:</span>
                        <span className="font-bold text-white/80">{log.actorEmail ?? log.actorId ?? 'System Architecture'}</span>
                        {log.actorRole && <span className="text-[10px] text-primary/60 font-black uppercase">({log.actorRole})</span>}
                      </div>
                      {log.ipAddress && (
                        <div className="flex items-center gap-2 border-l border-white/10 pl-4">
                          <Globe className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="text-muted-foreground">IP:</span>
                          <span className="font-bold text-white/80">{log.ipAddress}</span>
                        </div>
                      )}
                    </div>

                    <MetaPreview metadata={log.metadata} />
                  </div>
                </div>
              </motion.div>
            ))}

            {data?.logs.length === 0 && (
              <div className="py-40 text-center space-y-4 opacity-30">
                <History className="h-12 w-12 mx-auto" />
                <p className="text-lg font-bold uppercase tracking-[0.2em]">Registry Empty</p>
                <p className="text-sm">No security events found matching the specified criteria.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Pagination Footer */}
      {!isLoading && data && (data.pagination.totalPages ?? 0) > 1 && (
        <div className="flex flex-col md:flex-row items-center justify-between px-8 py-6 premium-card rounded-[2rem] gap-4">
          <p className="text-sm font-medium text-muted-foreground">
            Displaying <span className="text-white">{(page - 1) * 25 + 1}–{Math.min(page * 25, data.pagination.total)}</span> of <span className="text-white">{data.pagination.total}</span> immutable records
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="rounded-xl border-white/10 hover:bg-white/5 h-10 w-10 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-1.5 px-4 h-10 rounded-xl bg-white/5 border border-white/10 text-sm font-bold text-white">
              Page {page} <span className="opacity-30">/</span> {data.pagination.totalPages}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(Math.min(data.pagination.totalPages ?? page, page + 1))}
              disabled={page === (data.pagination.totalPages ?? page)}
              className="rounded-xl border-white/10 hover:bg-white/5 h-10 w-10 p-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
