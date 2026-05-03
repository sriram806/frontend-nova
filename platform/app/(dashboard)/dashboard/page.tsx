'use client';

import Link from 'next/link';
import { Activity, Sparkles, Target, Crown } from 'lucide-react';
import { motion } from 'framer-motion';
import { PageTransition } from '@/components/common/page-transition';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { useDashboardOverviewQuery } from '@/hooks/queries/useDashboardQueries';
import { useAuthStore } from '@/store/authStore';
import { useUserStore } from '@/store/userStore';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useState, useEffect } from 'react';
import { useBillingStore } from '@/store/billingStore';
import { hasActiveSubscription } from '@/services/billingService';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

import { SkillRadarChart } from '@/components/dashboard/SkillRadarChart';

export default function DashboardPage() {
  const { data, isLoading, isError, refetch } = useDashboardOverviewQuery();
  const user = useAuthStore((state) => state.user);
  const { targetRole, resumeDraft } = useUserStore();
  const subscription = useBillingStore((state) => state.subscription);
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    const hasSeenWelcome = localStorage.getItem('nova_welcome_seen');
    if (targetRole && !hasSeenWelcome) {
      setShowWelcome(true);
    }
  }, [targetRole]);

  const handleCloseWelcome = () => {
    setShowWelcome(false);
    localStorage.setItem('nova_welcome_seen', 'true');
  };

  if (isLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <Skeleton key={index} className="h-40 rounded-[2rem] bg-white/5" />
        ))}
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] rounded-[2.5rem] border border-white/5 bg-white/[0.02] p-12 backdrop-blur-xl">
        <div className="p-4 rounded-full bg-red-500/10 border border-red-500/20 mb-6">
          <Activity className="w-8 h-8 text-red-400" />
        </div>
        <h3 className="text-2xl font-black tracking-tight text-white mb-2">Sync Interrupted</h3>
        <p className="text-slate-400 mb-8 text-center max-w-xs">We encountered an issue while fetching your personalized insights.</p>
        <Button className="h-12 px-8 rounded-xl bg-white text-black font-black hover:bg-white/90" onClick={() => refetch()}>
          Retry Synchronisation
        </Button>
      </div>
    );
  }

  return (
    <PageTransition>
      <Dialog open={showWelcome} onOpenChange={handleCloseWelcome}>
        <DialogContent className="sm:max-w-md bg-[#0A0C14]/90 border border-white/10 rounded-[2.5rem] p-8 backdrop-blur-3xl shadow-[0_0_50px_rgba(0,0,0,0.5)]">
          <DialogHeader className="space-y-4">
            <div className="mx-auto w-20 h-20 bg-indigo-500/20 rounded-full flex items-center justify-center mb-2 border border-indigo-500/30">
              <Sparkles className="w-10 h-10 text-indigo-400 animate-pulse" />
            </div>
            <DialogTitle className="text-4xl font-black text-center tracking-tighter text-white">System Init.</DialogTitle>
            <DialogDescription className="text-center text-base font-medium text-slate-400">
              Your career orchestration is active. Targeting <strong className="text-white">{targetRole?.title}</strong>.
            </DialogDescription>
          </DialogHeader>

          <div className="py-8 space-y-4">
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400/60 text-center">Priority Validation Track</h4>
            <div className="flex flex-wrap gap-2 justify-center">
              {resumeDraft?.skills?.slice(0, 5).map((skill: any) => (
                <span key={skill.name} className="px-4 py-2 bg-white/5 border border-white/10 rounded-2xl text-[13px] font-black text-slate-200 shadow-xl transition-transform hover:scale-105">
                  {skill.name}
                </span>
              ))}
            </div>
          </div>

          <Button onClick={handleCloseWelcome} className="w-full h-14 rounded-2xl text-base font-black bg-white text-black hover:bg-white/90 shadow-2xl">
            Acknowledge & Enter
          </Button>
        </DialogContent>
      </Dialog>

      <div className="space-y-8 pb-12">
        {/* Welcome Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-[3rem] border border-white/[0.05] bg-gradient-to-br from-indigo-500/[0.05] via-transparent to-violet-500/[0.05] p-10 flex flex-col md:flex-row md:items-center justify-between gap-8 backdrop-blur-xl"
        >
          <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none" />

          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-1 w-8 bg-indigo-500 rounded-full" />
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400">Status: Active</p>
            </div>
            <h2 className="text-4xl font-black tracking-tighter text-white flex flex-wrap items-center gap-4">
              {user?.displayName ? `Hi ${user.displayName.split(' ')[0]},` : 'Hi there,'} {data?.greeting}
              {subscription && hasActiveSubscription(subscription) && subscription.plan && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-[10px] font-black uppercase tracking-widest border border-indigo-500/20">
                  <Crown className="w-3 h-3" />
                  {subscription.plan} Member
                </span>
              )}
            </h2>
            <p className="mt-4 text-lg text-slate-400 font-medium max-w-xl">
              You are on a <span className="text-white font-bold">{data.streak}-day streak</span>. We've identified <span className="text-indigo-400 font-bold">{data.tasksDueToday} tasks</span> for your growth today.
            </p>
          </div>

          {(!subscription || !hasActiveSubscription(subscription) || !subscription.plan) && (
            <Button asChild className="relative z-10 h-14 px-8 rounded-2xl bg-indigo-500 text-white font-black uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-[0_10px_40px_rgba(99,102,241,0.2)]">
              <Link href="/pricing">Elevate to PRO</Link>
            </Button>
          )}
        </motion.div>

        <div className="grid gap-8 lg:grid-cols-[1fr_0.8fr]">
          <SkillRadarChart />

          {/* Recommendations Card */}
          <div className="rounded-[2.5rem] border border-white/[0.05] bg-[#0A0C14]/40 p-8 backdrop-blur-xl shadow-xl">
            <div className="flex items-center gap-3 mb-8">
              <Sparkles className="h-5 w-5 text-violet-400" />
              <div>
                <h3 className="text-xl font-black text-white tracking-tight">AI Insights</h3>
                <p className="text-sm text-slate-500 mt-1">Personalized next actions</p>
              </div>
            </div>

            <div className="space-y-4">
              {data.recommendations.map((item) => (
                <div key={item.id} className="group relative rounded-2xl border border-white/5 bg-white/[0.02] p-5 transition-all hover:bg-white/[0.05] hover:border-white/10">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-black text-white tracking-tight">{item.title}</p>
                      <p className="mt-1.5 text-[13px] text-slate-400 leading-relaxed">{item.description}</p>
                    </div>
                    <div className="mt-1 h-2 w-2 rounded-full bg-violet-500 animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Activity Section */}
        <div className="rounded-[2.5rem] border border-white/[0.05] bg-[#0A0C14]/40 p-8 backdrop-blur-xl shadow-xl">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <Activity className="h-5 w-5 text-slate-400" />
              <h3 className="text-xl font-black text-white tracking-tight">Activity Log</h3>
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">System Logs</p>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            {data.activity.map((activity) => (
              <div
                key={activity.id}
                className="group flex items-center justify-between rounded-[1.5rem] border border-white/5 bg-white/[0.02] px-6 py-4 transition-all hover:bg-white/[0.04] hover:border-white/10"
              >
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center border",
                    activity.type.toLowerCase().includes('exam') ? "bg-indigo-500/10 border-indigo-500/20 text-indigo-400" : "bg-white/5 border-white/10 text-slate-400"
                  )}>
                    <Target className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-bold text-white tracking-tight">{activity.title}</p>
                    <p className="text-[10px] uppercase font-black tracking-[0.2em] text-slate-500 mt-0.5">{activity.type}</p>
                  </div>
                </div>
                <span className="text-[11px] font-black text-slate-600 uppercase tracking-widest">
                  {new Date(activity.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions Footer */}
        <div className="rounded-[2.5rem] border border-indigo-500/10 bg-indigo-500/[0.03] p-10 backdrop-blur-xl text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent" />
          <h3 className="text-2xl font-black text-white tracking-tighter mb-4">Ready for Validation?</h3>
          <p className="text-slate-400 max-w-xl mx-auto mb-8 font-medium">
            Jump into the Exam Center to assess your current skills and unlock higher-tier roadmap recommendations.
          </p>
          <Button asChild className="h-14 px-10 rounded-2xl bg-white text-black font-black uppercase tracking-widest hover:scale-105 transition-transform shadow-2xl">
            <Link href="/exams">Enter Exam Center</Link>
          </Button>
        </div>
      </div>
    </PageTransition>
  );
}
