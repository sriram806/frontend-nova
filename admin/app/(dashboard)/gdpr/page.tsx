'use client';

import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { 
  FileDown, FileX, Shield, Clock, CheckCircle2, AlertCircle, 
  Search, Filter, ChevronLeft, ChevronRight, Loader2, Mail,
  Calendar, ArrowUpRight, Lock, Fingerprint
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from '@/utils/toast';
import * as adminApi from '@/services/adminService';
import { Button } from '@/components/ui/button';
import type { GdprRequest } from '@/types/admin';

export default function GdprPage() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<string>('');

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['admin-gdpr-requests', { page, status }],
    queryFn: () => adminApi.listGdprRequests(page, 25, status),
  });

  return (
    <div className="space-y-10 pb-20">
      {/* Header */}
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            Privacy Compliance
            <span className="text-sm font-medium px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20">
              GDPR Center
            </span>
          </h1>
          <p className="text-muted-foreground text-[15px]">
            Manage data portability requests and right-to-erasure processes for platform users.
          </p>
        </div>
        
        <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/5 border border-white/10">
          <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Encryption Active</span>
        </div>
      </div>

      {/* Compliance Overview */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="premium-card p-8 rounded-[2.5rem] space-y-4 border-blue-500/20 bg-blue-500/5">
           <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-blue-500/20 flex items-center justify-center text-blue-400">
                <FileDown className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Data Portability</h3>
                <p className="text-sm text-muted-foreground">Automated archive generation</p>
              </div>
           </div>
           <p className="text-xs text-muted-foreground leading-relaxed">
             Users can request a full machine-readable export of their data. Nova handles encryption and delivery via secure time-limited links.
           </p>
        </div>

        <div className="premium-card p-8 rounded-[2.5rem] space-y-4 border-rose-500/20 bg-rose-500/5">
           <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-rose-500/20 flex items-center justify-center text-rose-400">
                <FileX className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Right to Erasure</h3>
                <p className="text-sm text-muted-foreground">Permanent identity purging</p>
              </div>
           </div>
           <p className="text-xs text-muted-foreground leading-relaxed">
             Requesting deletion initiates a 30-day graceful purge window followed by permanent removal of all PII across all platform clusters.
           </p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="premium-card p-4 rounded-[2rem] flex flex-wrap items-center gap-4">
        <div className="relative flex-1 min-w-[250px]">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Filter requests by User ID..."
            className="input-premium pl-11 h-11"
          />
        </div>
        <div className="flex items-center gap-2">
          {['', 'pending', 'processing', 'completed'].map((s) => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={`px-4 py-2 rounded-xl text-sm font-bold capitalize transition-all
              ${status === s ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-muted-foreground hover:bg-white/5'}`}
            >
              {s || 'All Statuses'}
            </button>
          ))}
        </div>
      </div>

      {/* Request Queue */}
      <div className="premium-card rounded-[2.5rem] overflow-hidden">
        {isLoading ? (
          <div className="py-40 flex flex-col items-center gap-4">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="text-sm font-medium text-muted-foreground animate-pulse">Scanning compliance ledger...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5 bg-white/[0.01]">
                  <th className="px-6 py-5 text-left text-xs font-bold uppercase tracking-wider text-muted-foreground">Request Identity</th>
                  <th className="px-6 py-5 text-left text-xs font-bold uppercase tracking-wider text-muted-foreground">Type</th>
                  <th className="px-6 py-5 text-left text-xs font-bold uppercase tracking-wider text-muted-foreground">Status</th>
                  <th className="px-6 py-5 text-left text-xs font-bold uppercase tracking-wider text-muted-foreground">Created</th>
                  <th className="px-6 py-5 text-left text-xs font-bold uppercase tracking-wider text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {data?.requests.map((req: GdprRequest, i: number) => (
                  <motion.tr 
                    key={req.id} 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className="hover:bg-white/[0.02] transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-muted-foreground">
                          <Fingerprint className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-bold text-white text-sm">User {req.userId.slice(0, 8)}</p>
                          <p className="text-[10px] text-muted-foreground uppercase tracking-widest">ID: {req.id.slice(0, 12)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className={`flex items-center gap-2 text-xs font-bold uppercase tracking-widest
                        ${req.type === 'export' ? 'text-blue-400' : 'text-rose-400'}`}>
                        {req.type === 'export' ? <FileDown className="h-4 w-4" /> : <FileX className="h-4 w-4" />}
                        {req.type}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                       <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border
                        ${req.status === 'pending' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 
                          req.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                          'bg-blue-500/10 text-blue-400 border-blue-500/20'}`}>
                        {req.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs font-medium text-muted-foreground">
                      {new Date(req.createdAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                       <Button variant="ghost" size="sm" className="h-8 rounded-lg text-muted-foreground hover:bg-white/5 hover:text-white group-hover:bg-white/10 opacity-0 group-hover:opacity-100 transition-all">
                          View Log <ArrowUpRight className="h-3 w-3 ml-1" />
                       </Button>
                    </td>
                  </motion.tr>
                ))}
                {data?.requests.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-40 text-center opacity-30">
                      <Shield className="h-12 w-12 mx-auto mb-4" />
                      <p className="text-lg font-bold uppercase tracking-[0.2em]">Compliance Clean</p>
                      <p className="text-sm">No pending data requests found.</p>
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
        <div className="flex items-center justify-center gap-4 py-4">
           <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="rounded-xl border-white/10"
            >
              <ChevronLeft className="h-4 w-4 mr-2" /> Previous
            </Button>
            <span className="text-sm font-bold text-muted-foreground">Page {page} of {data.pagination.totalPages}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.min(data.pagination.totalPages ?? page, p + 1))}
              disabled={page === (data.pagination.totalPages ?? page)}
              className="rounded-xl border-white/10"
            >
              Next <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
        </div>
      )}
    </div>
  );
}
