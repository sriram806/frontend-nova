'use client';

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
  Activity
} from 'lucide-react';
import { ExamTemplateSummary } from '@/types/exam';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';

interface ExamSkillCardProps {
  template: ExamTemplateSummary;
  onEdit?: (template: ExamTemplateSummary) => void;
  onTogglePublish?: (template: ExamTemplateSummary) => void;
}

export function ExamSkillCard({ template, onEdit, onTogglePublish }: ExamSkillCardProps) {
  const { 
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
              <h3 className="text-xl font-bold text-white group-hover:text-primary transition-colors">
                {title || skillName}
              </h3>
              <Badge 
                variant={isPublished ? "default" : "secondary"}
                className={isPublished ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-white/5 text-muted-foreground"}
              >
                {isPublished ? 'Published' : 'Draft'}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground uppercase tracking-widest font-mono">
              {skillName}
            </p>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-xl hover:bg-white/5">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-2xl bg-[#0f1117] border-white/10">
              <DropdownMenuItem onClick={() => onEdit?.(template)} className="flex items-center gap-2 px-3 py-2 text-sm cursor-pointer">
                <Settings className="h-4 w-4" /> Settings
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onTogglePublish?.(template)} className="flex items-center gap-2 px-3 py-2 text-sm cursor-pointer">
                <Activity className="h-4 w-4" /> {isPublished ? 'Unpublish' : 'Publish'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Quota Progress */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'MCQ', current: availableQuestions.mcq, target: mcqCount },
            { label: 'Fill', current: availableQuestions.fill, target: fillBlankCount },
            { label: 'Code', current: availableQuestions.code, target: codingCount },
          ].map((item) => (
            <div key={item.label} className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 text-center">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter mb-1">{item.label}</p>
              <p className={`text-lg font-bold ${item.current < item.target ? 'text-orange-400' : 'text-white'}`}>
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
            <span className={`text-[11px] font-bold uppercase tracking-wider ${healthColor}`}>
              {isUnderQuota ? 'Under Quota' : 'Bank Healthy'}
            </span>
          </div>
          <div className="text-[11px] font-bold text-muted-foreground">
            Target: {passPercentage}%
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
        </div>
      </div>
    </motion.div>
  );
}
