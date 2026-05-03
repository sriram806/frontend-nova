'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  ShieldAlert,
  Clock,
  Monitor,
  MousePointer2,
  AlertCircle,
  Activity,
  History,
  ShieldCheck,
  Layout,
  Zap,
  ArrowDown
} from 'lucide-react';
import { apiGet } from '@/lib/api/client';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface AttemptAuditModalProps {
  isOpen: boolean;
  onClose: () => void;
  attemptId: string;
}

export const AttemptAuditModal = ({ isOpen, onClose, attemptId }: AttemptAuditModalProps) => {
  const [audit, setAudit] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && attemptId) {
      const fetchAudit = async () => {
        try {
          setLoading(true);
          const data = await apiGet(`/api/exam/admin/attempts/${attemptId}/audit`);
          setAudit(data);
        } catch (err) {
          console.error('Failed to fetch audit trail', err);
        } finally {
          setLoading(false);
        }
      };
      fetchAudit();
    }
  }, [isOpen, attemptId]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/80 backdrop-blur-md"
        onClick={onClose}
      />

      <motion.div
        initial={{ scale: 0.9, y: 20, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        className="relative w-full max-w-4xl bg-[#0c0d12] border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col max-h-[85vh]"
      >
        {/* Header */}
        <div className="p-8 border-b border-white/5 flex items-center justify-between bg-gradient-to-r from-primary/10 to-transparent">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-white/5 flex items-center justify-center text-primary">
              <History className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white tracking-tight uppercase italic">Session Audit Trail</h3>
              <p className="text-white/40 text-xs font-medium">Detailed proctoring logs for Attempt #{attemptId.substring(0, 8)}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/5 text-white/20 transition-colors">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="flex-1 overflow-auto p-8 grid grid-cols-1 md:grid-cols-[1fr_300px] gap-8">
          {/* Main Timeline */}
          <div className="space-y-8">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 space-y-4">
                <div className="h-10 w-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                <p className="text-[10px] font-black uppercase tracking-widest text-white/20">Reconstructing Session...</p>
              </div>
            ) : audit?.logs?.length ? (
              <div className="relative space-y-6">
                <div className="absolute left-[19px] top-2 bottom-2 w-px bg-white/5" />

                {audit.logs.map((log: any, idx: number) => (
                  <TimelineItem key={idx} log={log} />
                ))}
              </div>
            ) : (
              <div className="py-20 text-center space-y-4">
                <ShieldCheck className="h-12 w-12 text-emerald-500/20 mx-auto" />
                <p className="text-white/40 text-sm font-medium">No proctoring violations or events recorded for this session.</p>
              </div>
            )}
          </div>

          {/* Sidebar Stats */}
          <div className="space-y-6">
            <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 space-y-6">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-white/40">Violation Summary</h4>

              <div className="space-y-4">
                <SummaryStat
                  label="Tab Switches"
                  value={audit?.summary?.tabSwitches ?? 0}
                  icon={<Layout className="h-4 w-4" />}
                  severity={audit?.summary?.tabSwitches > 2 ? 'high' : 'low'}
                />
                <SummaryStat
                  label="Fullscreen Exits"
                  value={audit?.summary?.fullscreenViolations ?? 0}
                  icon={<Monitor className="h-4 w-4" />}
                  severity={audit?.summary?.fullscreenViolations > 0 ? 'high' : 'low'}
                />
                <SummaryStat
                  label="Window Blurs"
                  value={audit?.logs?.filter((l: any) => l.event === 'WINDOW_BLUR').length ?? 0}
                  icon={<ShieldAlert className="h-4 w-4" />}
                  severity="low"
                />
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-primary/5 border border-primary/10 space-y-4">
              <div className="flex items-center gap-2 text-primary">
                <ShieldCheck className="h-4 w-4" />
                <span className="text-[10px] font-black uppercase tracking-widest">Integrity Score</span>
              </div>
              <div className="space-y-1">
                <p className="text-3xl font-black text-white">{calculateIntegrityScore(audit?.summary)}%</p>
                <p className="text-[10px] text-white/40 font-medium leading-relaxed">Calculated based on violation frequency vs session duration.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-white/5 bg-white/[0.01] flex justify-end gap-3">
          <button onClick={onClose} className="px-6 py-3 rounded-xl bg-white/5 text-white/60 font-bold text-xs uppercase tracking-widest hover:bg-white/10 transition-all">
            Close Audit
          </button>
          <button className="px-6 py-3 rounded-xl bg-primary text-black font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all">
            Flag for Review
          </button>
        </div>
      </motion.div>
    </div>
  );
};

const TimelineItem = ({ log }: any) => {
  const isViolation = ['TAB_SWITCH', 'FULLSCREEN_EXIT', 'WINDOW_BLUR'].includes(log.event);

  const iconMap: any = {
    TAB_SWITCH: <Layout className="h-4 w-4" />,
    FULLSCREEN_EXIT: <Monitor className="h-4 w-4" />,
    WINDOW_BLUR: <ShieldAlert className="h-4 w-4" />,
    SUBMIT: <Activity className="h-4 w-4" />,
    START: <Zap className="h-4 w-4" />
  };

  return (
    <div className="relative pl-12 group">
      <div className={cn(
        "absolute left-0 top-0 h-10 w-10 rounded-full flex items-center justify-center border-2 z-10 transition-all",
        isViolation ? "bg-rose-500/10 border-rose-500 text-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.3)]" : "bg-white/5 border-white/10 text-white/40 group-hover:border-primary/40 group-hover:text-primary"
      )}>
        {iconMap[log.event] || <Activity className="h-4 w-4" />}
      </div>

      <div className="space-y-1">
        <div className="flex items-center gap-3">
          <span className={cn(
            "text-xs font-black uppercase tracking-widest",
            isViolation ? "text-rose-400" : "text-white"
          )}>
            {log.event.replace('_', ' ')}
          </span>
          <span className="text-[10px] text-white/20 font-medium">
            {format(new Date(log.timestamp), 'HH:mm:ss.SSS')}
          </span>
        </div>
        <p className="text-xs text-white/40 font-medium leading-relaxed">
          {getEventDescription(log)}
        </p>
      </div>
    </div>
  );
};

const SummaryStat = ({ label, value, icon, severity }: any) => (
  <div className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.02] border border-white/5">
    <div className="flex items-center gap-3 text-white/60">
      {icon}
      <span className="text-[10px] font-bold uppercase tracking-widest">{label}</span>
    </div>
    <span className={cn(
      "text-sm font-black",
      severity === 'high' ? "text-rose-400" : "text-emerald-400"
    )}>
      {value}
    </span>
  </div>
);

function getEventDescription(log: any) {
  switch (log.event) {
    case 'TAB_SWITCH': return `User switched focus away from the exam tab. Violation #${log.metadata?.count || '?'}`;
    case 'FULLSCREEN_EXIT': return 'User exited full-screen mode manually or by system interrupt.';
    case 'WINDOW_BLUR': return 'Browser window lost focus. Possible use of system-level shortcuts or secondary monitors.';
    default: return 'Automated session activity log entry.';
  }
}

function calculateIntegrityScore(summary: any) {
  if (!summary) return 100;
  let deductions = (summary.tabSwitches * 10) + (summary.fullscreenViolations * 25);
  return Math.max(0, 100 - deductions);
}
