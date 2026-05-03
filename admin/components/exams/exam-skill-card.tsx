'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  BookOpen,
  Settings,
  BarChart3,
  Trophy,
  CircleCheck,
  CircleAlert,
  ChevronRight,
  MoreVertical,
  Activity,
  Upload,
  Sparkles,
  Zap,
  UserPlus
} from 'lucide-react';
import { AssignExamModal } from './assign-exam-modal';
import { ExamTemplateSummary } from '@/types/exam';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { BulkImportModal } from './bulk-import-modal';
import { useMutation } from '@tanstack/react-query';
import { apiPost } from '@/lib/api/client';
import { toast } from 'sonner';

interface ExamSkillCardProps {
  template: ExamTemplateSummary;
  onEdit?: (template: ExamTemplateSummary) => void;
  onTogglePublish?: (template: ExamTemplateSummary) => void;
  onRefresh?: () => void;
}

export function ExamSkillCard({ template, onEdit, onTogglePublish, onRefresh }: ExamSkillCardProps) {
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isAiGenerateOpen, setIsAiGenerateOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const {
    id,
    skillName,
    title,
    isPublished,
    availableQuestions,
    mcqCount,
    fillBlankCount,
    codingCount,
    passPercentage
  } = template;

  const isUnderQuota =
    availableQuestions.mcq < mcqCount ||
    availableQuestions.fill < fillBlankCount ||
    availableQuestions.code < codingCount;

  const healthColor = isUnderQuota ? 'text-rose-400' : 'text-emerald-400';
  const healthBg = isUnderQuota ? 'bg-rose-400/10' : 'bg-emerald-400/10';
  const healthBorder = isUnderQuota ? 'border-rose-400/20' : 'border-emerald-400/20';

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="premium-card group relative p-6 rounded-[2rem] overflow-hidden border border-white/5"
      >
        {/* Background Glow */}
        <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-primary/5 blur-3xl group-hover:bg-primary/10 transition-all duration-500" />

        <div className="relative space-y-5">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-white group-hover:text-primary transition-colors truncate max-w-[180px]">
                  {title || skillName}
                </h3>
                <Badge
                  variant={isPublished ? "default" : "secondary"}
                  className={isPublished ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-white/5 text-muted-foreground"}
                >
                  {isPublished ? 'Published' : 'Draft'}
                </Badge>
              </div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-black">
                {skillName}
              </p>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-xl hover:bg-white/5">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="rounded-2xl bg-[#0f1117] border-white/10 backdrop-blur-2xl p-2 min-w-[160px]">
                <DropdownMenuItem onClick={() => onEdit?.(template)} className="flex items-center gap-2 px-4 py-3 text-xs font-bold rounded-xl cursor-pointer hover:bg-white/5">
                  <Settings className="h-4 w-4 text-white/40" /> Settings
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setIsImportModalOpen(true)} className="flex items-center gap-2 px-4 py-3 text-xs font-bold rounded-xl cursor-pointer hover:bg-white/5">
                  <Upload className="h-4 w-4 text-white/40" /> Bulk Import
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setIsAiGenerateOpen(true)}
                  className="flex items-center gap-2 px-4 py-3 text-xs font-bold rounded-xl cursor-pointer hover:bg-primary/10 text-primary"
                >
                  <Sparkles className="h-4 w-4" /> Generate with AI
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onTogglePublish?.(template)} className="flex items-center gap-2 px-4 py-3 text-xs font-bold rounded-xl cursor-pointer hover:bg-white/5">
                  <Activity className="h-4 w-4 text-white/40" /> {isPublished ? 'Unpublish' : 'Publish'}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Difficulty Distribution */}
          <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black text-white/40 uppercase tracking-widest flex items-center gap-1.5">
                <Zap className="h-3 w-3 text-yellow-400" /> Complexity Mix
              </span>
              <span className="text-[10px] font-bold text-white/20">50/40/10 Ratio</span>
            </div>
            <div className="h-1.5 w-full flex rounded-full overflow-hidden bg-white/5">
              <div
                className="h-full bg-emerald-400 transition-all"
                style={{ width: `${(availableQuestions.easy / availableQuestions.total) * 100 || 0}%` }}
                title={`Easy: ${availableQuestions.easy}`}
              />
              <div
                className="h-full bg-yellow-400 transition-all"
                style={{ width: `${(availableQuestions.medium / availableQuestions.total) * 100 || 0}%` }}
                title={`Medium: ${availableQuestions.medium}`}
              />
              <div
                className="h-full bg-rose-400 transition-all"
                style={{ width: `${(availableQuestions.hard / availableQuestions.total) * 100 || 0}%` }}
                title={`Hard: ${availableQuestions.hard}`}
              />
            </div>
            <div className="flex justify-between text-[8px] font-bold uppercase tracking-tighter text-white/20">
              <span className={availableQuestions.easy > 0 ? 'text-emerald-400/60' : ''}>Easy ({availableQuestions.easy})</span>
              <span className={availableQuestions.medium > 0 ? 'text-yellow-400/60' : ''}>Medium ({availableQuestions.medium})</span>
              <span className={availableQuestions.hard > 0 ? 'text-rose-400/60' : ''}>Hard ({availableQuestions.hard})</span>
            </div>
          </div>

          {/* Quota Progress */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'MCQ', current: availableQuestions.mcq, target: mcqCount },
              { label: 'Fill', current: availableQuestions.fill, target: fillBlankCount },
              { label: 'Code', current: availableQuestions.code, target: codingCount },
            ].map((item) => (
              <div key={item.label} className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 text-center">
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">{item.label}</p>
                <p className={`text-lg font-black ${item.current < item.target ? 'text-orange-400' : 'text-white'}`}>
                  {item.current}<span className="text-[10px] text-muted-foreground ml-0.5">/ {item.target}</span>
                </p>
              </div>
            ))}
          </div>

          {/* Health / Stats Bar */}
          <div className={`flex items-center justify-between p-3 rounded-2xl border ${healthBorder} ${healthBg}`}>
            <div className="flex items-center gap-2">
              {isUnderQuota ? (
                <CircleAlert className={`h-4 w-4 ${healthColor}`} />
              ) : (
                <CircleCheck className={`h-4 w-4 ${healthColor}`} />
              )}
              <span className={`text-[11px] font-black uppercase tracking-wider ${healthColor}`}>
                {isUnderQuota ? 'Under Quota' : 'Bank Healthy'}
              </span>
            </div>
            <div className="text-[11px] font-bold text-muted-foreground/40">
              Pass: {passPercentage}%
            </div>
          </div>

          {/* Actions */}
          <div className="grid grid-cols-2 gap-2 pt-2">
            <Link
              href={`/exams/manage?examname=${skillName}&view=questions`}
              className="flex items-center justify-center gap-2 h-10 rounded-xl bg-white/5 border border-white/5 text-xs font-bold text-white hover:bg-white/10 transition-all"
            >
              <BookOpen className="h-3.5 w-3.5" /> Questions
            </Link>
            <Link
              href={`/exams/manage?examname=${skillName}&view=analytics`}
              className="flex items-center justify-center gap-2 h-10 rounded-xl bg-primary/10 border border-primary/20 text-xs font-bold text-primary hover:bg-primary/20 transition-all"
            >
              <BarChart3 className="h-3.5 w-3.5" /> Analytics
            </Link>
            <Link
              href={`/exams/manage?examname=${skillName}&view=leaderboard`}
              className="flex items-center justify-center gap-2 h-10 rounded-xl bg-white/5 border border-white/5 text-xs font-bold text-white hover:bg-white/10 transition-all col-span-2"
            >
              <Trophy className="h-3.5 w-3.5" /> Leaderboard
              <ChevronRight className="h-3.5 w-3.5 ml-auto opacity-50" />
            </Link>
            <button
              onClick={() => setIsAssignModalOpen(true)}
              className="flex items-center justify-center gap-2 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 text-xs font-bold text-orange-400 hover:bg-orange-500/20 transition-all col-span-2"
            >
              <UserPlus className="h-3.5 w-3.5" /> Assign to Team/User
            </button>
          </div>
        </div>
      </motion.div>

      <BulkImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        skillName={skillName}
        onSuccess={onRefresh}
      />

      <AiGenerateModal
        isOpen={isAiGenerateOpen}
        onClose={() => setIsAiGenerateOpen(false)}
        skillName={skillName}
        onSuccess={onRefresh}
      />

      <AssignExamModal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        examId={id}
        skillName={skillName}
      />
    </>
  );
}

// Quick Inline AI Generate Modal
function AiGenerateModal({ isOpen, onClose, skillName, onSuccess }: any) {
  const [count, setCount] = useState(5);
  const [type, setType] = useState('MCQ');

  const mutation = useMutation({
    mutationFn: (payload: any) => apiPost(`/api/exam/admin/templates/${skillName}/generate-questions`, payload),
    onSuccess: () => {
      toast.success('AI Questions generated and added to bank.');
      onSuccess?.();
      onClose();
    },
    onError: () => toast.error('AI Generation failed. Check API logs.')
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative w-full max-w-md bg-[#0f1117] border border-white/10 rounded-[2.5rem] p-8 space-y-6 shadow-2xl"
      >
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Sparkles className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">AI Content Engine</h3>
            <p className="text-xs text-white/40">Generate smart questions for {skillName}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-white/40 tracking-widest ml-1">Quantity</label>
            <input
              type="number"
              value={count}
              onChange={(e) => setCount(parseInt(e.target.value))}
              className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-white focus:outline-none focus:border-primary/50"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-white/40 tracking-widest ml-1">Question Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-white focus:outline-none focus:border-primary/50"
            >
              <option value="MCQ">Multiple Choice</option>
              <option value="FILL">Fill in the Blanks</option>
              <option value="CODE">Coding Challenge</option>
            </select>
          </div>
        </div>

        <Button
          onClick={() => mutation.mutate({ count, type })}
          disabled={mutation.isPending}
          className="w-full h-14 rounded-2xl bg-primary text-black font-black uppercase tracking-widest shadow-xl shadow-primary/20"
        >
          {mutation.isPending ? 'THINKING...' : 'GENERATE QUESTIONS'}
        </Button>
      </motion.div>
    </div>
  );
}
