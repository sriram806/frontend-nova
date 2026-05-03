'use client';

import { motion } from 'framer-motion';
import { 
  Trophy, 
  Clock, 
  FileText, 
  ShieldCheck, 
  ChevronRight,
  Lock,
  Zap,
  Star
} from 'lucide-react';
import { ExamCatalogItem } from '@/types/platform';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/authStore';
import Link from 'next/link';

interface ExamCatalogCardProps {
  item: ExamCatalogItem;
}

export function ExamCatalogCard({ item }: ExamCatalogCardProps) {
  const { user } = useAuthStore();
  const { 
    skillName, 
    title, 
    description, 
    status, 
    progress,
    questionBank,
    passPercentage
  } = item;

  const isLocked = user?.role === 'guest';
  const isPassed = progress?.status === 'PASSED';
  const canTake = user?.role === 'lite' || user?.role === 'pro' || user?.role === 'admin';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      className="relative group h-full"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-[2.5rem]" />
      
      <div className="relative h-full flex flex-col p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/10 backdrop-blur-sm group-hover:border-primary/20 transition-all duration-300">
        
        {/* Top Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="h-14 w-14 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
            {skillName.includes('python') ? '🐍' : 
             skillName.includes('react') ? '⚛️' : 
             skillName.includes('node') ? '🟢' : 
             skillName.includes('typescript') ? '🟦' : 
             skillName.includes('docker') ? '🐳' : 
             skillName.includes('aws') ? '☁️' : '🚀'}
          </div>
          <div className="flex flex-col items-end gap-2">
            {isPassed && (
              <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                <ShieldCheck className="w-3 h-3 mr-1" /> Certified
              </Badge>
            )}
            {!canTake && (
              <Badge className="bg-orange-500/10 text-orange-400 border-orange-500/20 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                <Lock className="w-3 h-3 mr-1" /> Pro Only
              </Badge>
            )}
          </div>
        </div>

        {/* Title & Desc */}
        <div className="space-y-3 flex-1">
          <h3 className="text-xl font-bold text-white group-hover:text-primary transition-colors">
            {title}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
            {description}
          </p>
        </div>

        {/* Meta Grid */}
        <div className="grid grid-cols-2 gap-4 py-6 border-y border-white/5 my-6">
          <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
            <Clock className="w-3.5 h-3.5" />
            <span>60 Min Test</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
            <FileText className="w-3.5 h-3.5" />
            <span>{questionBank.total} Qs</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
            <Zap className="w-3.5 h-3.5" />
            <span>Intermediate</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
            <Star className="w-3.5 h-3.5" />
            <span>Target: {passPercentage}%</span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between">
          {progress ? (
            <div className="flex flex-col">
              <span className="text-[10px] font-bold uppercase tracking-tighter text-muted-foreground">Best Score</span>
              <span className="text-lg font-black text-white">{progress.score}%</span>
            </div>
          ) : (
            <div className="flex flex-col">
              <span className="text-[10px] font-bold uppercase tracking-tighter text-muted-foreground">Attempts</span>
              <span className="text-lg font-black text-white">0</span>
            </div>
          )}

          {isLocked ? (
            <Button asChild variant="outline" className="rounded-2xl border-white/10 bg-white/5 group-hover:bg-primary group-hover:text-black group-hover:border-none transition-all">
              <Link href="/pricing">Unlock Exam</Link>
            </Button>
          ) : (
            <Button asChild className="rounded-2xl bg-white/5 border border-white/10 hover:bg-primary hover:text-black hover:border-none transition-all group-hover:shadow-[0_0_20px_-5px_rgba(var(--primary),0.4)]">
              <Link href={`/exam/${skillName}`}>
                View Details
                <ChevronRight className="w-4 h-4 ml-1" />
              </Link>
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
