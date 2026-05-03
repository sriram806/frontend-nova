'use client';

import Link from 'next/link';
import { ArrowRight, ClipboardCheck, Code2, Lock, ShieldCheck, Sparkles } from 'lucide-react';
import { PageTransition } from '@/components/common/page-transition';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useExamCatalogQuery } from '@/hooks/queries/useExamQueries';
import { useAuthStore } from '@/store/authStore';
import { cn } from '@/lib/utils';

export default function DashboardExamPage() {
  const { data, isLoading, isError, refetch } = useExamCatalogQuery();
  const user = useAuthStore((state) => state.user);
  const isAdmin = user?.role === 'admin';

  const readyCount = data?.filter((item) => item.isReady).length ?? 0;
  const passedCount = data?.filter((item) => item.status === 'passed').length ?? 0;
  const progressCount = data?.filter((item) => item.status === 'in_progress').length ?? 0;

  return (
    <PageTransition>
      <div className="space-y-8 pb-12">
        {/* Stats Overview */}
        <div className="rounded-[2.5rem] border border-white/[0.05] bg-[#0A0C14]/40 p-10 backdrop-blur-xl shadow-xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent" />

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
            <div>
              <h2 className="text-3xl font-black tracking-tighter text-white flex items-center gap-3">
                <ClipboardCheck className="h-7 w-7 text-indigo-400" />
                Validation Catalog
              </h2>
              <p className="text-slate-400 mt-1 font-medium">Verify your skills through randomized AI-proctored assessments.</p>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/5 border border-white/10">
              <div className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">Live Exam Service</span>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="group rounded-[1.5rem] border border-white/5 bg-white/[0.02] p-6 transition-all hover:bg-white/[0.05] hover:border-indigo-500/20">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2">Available</p>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-black text-white">{readyCount}</span>
                <span className="text-xs font-bold text-slate-600 uppercase">Pools</span>
              </div>
            </div>
            <div className="group rounded-[1.5rem] border border-white/5 bg-white/[0.02] p-6 transition-all hover:bg-white/[0.05] hover:border-emerald-500/20">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2">Validated</p>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-black text-emerald-400">{passedCount}</span>
                <span className="text-xs font-bold text-slate-600 uppercase">Skills</span>
              </div>
            </div>
            <div className="group rounded-[1.5rem] border border-white/5 bg-white/[0.02] p-6 transition-all hover:bg-white/[0.05] hover:border-sky-500/20">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2">In Progress</p>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-black text-sky-400">{progressCount}</span>
                <span className="text-xs font-bold text-slate-600 uppercase">Sessions</span>
              </div>
            </div>
          </div>
        </div>

        {isAdmin && (
          <div className="rounded-[2.5rem] border border-amber-500/10 bg-amber-500/[0.03] p-8 backdrop-blur-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                <ShieldCheck className="h-6 w-6 text-amber-500" />
              </div>
              <div>
                <h3 className="text-xl font-black text-white tracking-tight">Admin Control Room</h3>
                <p className="text-sm text-slate-400">Manage 250+ question banks and skill templates.</p>
              </div>
            </div>
            <Button asChild className="h-12 px-6 rounded-xl bg-amber-500 text-black font-black uppercase tracking-widest hover:bg-amber-400">
              <Link href="/exams/admin">
                Question Registry
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        )}

        {isLoading ? (
          <div className="grid gap-6">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-48 rounded-[2.5rem] bg-white/5" />
            ))}
          </div>
        ) : null}

        {isError ? (
          <div className="rounded-[2.5rem] border border-white/5 bg-white/[0.02] p-12 text-center backdrop-blur-xl">
            <h3 className="text-xl font-black text-white mb-4">Catalog Sync Failed</h3>
            <Button className="h-12 px-8 rounded-xl bg-white text-black font-black" onClick={() => refetch()}>
              Retry Connection
            </Button>
          </div>
        ) : null}

        {!isLoading && !isError && data ? (
          <div className="grid gap-6">
            {data.map((exam) => (
              <div key={exam.skillName} className="group relative rounded-[2.5rem] border border-white/[0.05] bg-[#0A0C14]/40 p-8 backdrop-blur-xl transition-all hover:bg-white/[0.04] hover:border-white/10 shadow-xl overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

                <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-8 relative z-10">
                  <div className="flex-1 space-y-6">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-[10px] font-black uppercase tracking-widest text-indigo-400">
                        {exam.skillName}
                      </span>
                      <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-500">
                        {exam.skillType === 'PROGRAMMING_LANGUAGE' ? 'Language Prof.' : 'Technical Skill'}
                      </span>
                      <Badge variant={exam.isReady ? 'secondary' : 'outline'} className="rounded-full px-3 text-[9px] uppercase font-black">
                        {exam.status.replace('_', ' ')}
                      </Badge>
                    </div>

                    <div>
                      <h4 className="text-2xl font-black text-white tracking-tighter">{exam.title}</h4>
                      <p className="mt-2 text-[15px] text-slate-400 font-medium leading-relaxed max-w-2xl">{exam.description}</p>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                      {[
                        { label: 'Bank Size', value: `${exam.questionBank.total} Items` },
                        { label: 'Pass Mark', value: `${exam.passPercentage}%` },
                        { label: 'Attempts', value: exam.progress?.attempts ?? 0 },
                        { label: 'Latest', value: `${exam.progress?.score ?? 0}%` },
                      ].map((stat) => (
                        <div key={stat.label} className="rounded-2xl border border-white/5 bg-white/[0.02] p-3 text-center transition-colors group-hover:bg-white/[0.05]">
                          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-600 mb-1">{stat.label}</p>
                          <p className="text-sm font-black text-slate-200 uppercase tracking-widest">{stat.value}</p>
                        </div>
                      ))}
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <span className="px-3 py-1.5 rounded-xl border border-white/5 bg-white/[0.02] text-[10px] font-black uppercase tracking-widest text-slate-500">
                        MCQ: {exam.questionBank.mcq}
                      </span>
                      <span className="px-3 py-1.5 rounded-xl border border-white/5 bg-white/[0.02] text-[10px] font-black uppercase tracking-widest text-slate-500">
                        Fill: {exam.questionBank.fill}
                      </span>
                      <span className="px-3 py-1.5 rounded-xl border border-white/5 bg-white/[0.02] text-[10px] font-black uppercase tracking-widest text-slate-500">
                        Code: {exam.questionBank.code}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 min-w-[280px]">
                    <Button asChild className="h-14 rounded-2xl bg-white text-black font-black uppercase tracking-[0.2em] text-xs hover:scale-[1.02] transition-transform shadow-2xl" disabled={!exam.isReady}>
                      <Link href={`/exam?skill=${encodeURIComponent(exam.skillName)}`}>
                        {exam.status === 'in_progress' ? 'Resume Session' : 'Initiate Assessment'}
                      </Link>
                    </Button>

                    <Button asChild variant="outline" className="h-12 rounded-2xl border-white/10 bg-white/5 font-black uppercase tracking-widest text-[10px] hover:bg-white/10">
                      <Link href="/dashboard/skills">Detailed Metrics</Link>
                    </Button>

                    {!exam.isReady && (
                      <div className="flex items-center gap-3 p-4 rounded-2xl border border-amber-500/20 bg-amber-500/10">
                        <Lock className="h-4 w-4 text-amber-500" />
                        <span className="text-[10px] font-black text-amber-200 uppercase tracking-widest leading-tight">Syncing with Registry...</span>
                      </div>
                    )}

                    <div className={cn(
                      "flex items-center gap-3 p-4 rounded-2xl border transition-colors",
                      exam.skillType === 'PROGRAMMING_LANGUAGE' ? "bg-sky-500/10 border-sky-500/20 text-sky-400" : "bg-violet-500/10 border-violet-500/20 text-violet-400"
                    )}>
                      {exam.skillType === 'PROGRAMMING_LANGUAGE' ? <Code2 className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
                      <span className="text-[10px] font-black uppercase tracking-widest leading-tight">
                        {exam.skillType === 'PROGRAMMING_LANGUAGE' ? 'IDE Simulation Active' : 'Concept Mapping Active'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </PageTransition>
  );
}
