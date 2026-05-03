'use client';

import { useState } from 'react';
import { useExamCatalogQuery } from '@/hooks/queries/useExamQueries';
import { ExamCatalogCard } from '@/features/exam/components/exam-catalog-card';
import { PageTransition } from '@/components/common/page-transition';
import { 
  Sparkles, 
  Search, 
  Filter, 
  BrainCircuit,
  Trophy,
  History,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuthStore } from '@/store/authStore';
import Link from 'next/link';

export default function ExamCatalogPage() {
  const { user } = useAuthStore();
  const [search, setSearch] = useState('');
  const { data: catalog, isLoading } = useExamCatalogQuery();

  const filteredCatalog = catalog?.filter(item => 
    item.title.toLowerCase().includes(search.toLowerCase()) || 
    item.skillName.toLowerCase().includes(search.toLowerCase())
  );

  const passedCount = catalog?.filter(item => item.progress?.status === 'PASSED').length || 0;

  return (
    <PageTransition>
      <div className="max-w-7xl mx-auto px-4 py-12 space-y-12">
        
        {/* Welcome Section */}
        <div className="relative overflow-hidden rounded-[3rem] bg-white/[0.02] border border-white/5 p-10 md:p-16">
          {/* Animated Background Orbs */}
          <div className="absolute -top-20 -right-20 h-64 w-64 bg-primary/20 blur-[100px] rounded-full animate-pulse" />
          <div className="absolute -bottom-20 -left-20 h-64 w-64 bg-cyan-500/10 blur-[100px] rounded-full" />

          <div className="relative grid md:grid-cols-2 gap-10 items-center">
            <div className="space-y-6 text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-widest">
                <Sparkles className="w-4 h-4" /> Professional Certifications
              </div>
              <h1 className="text-4xl md:text-6xl font-black text-white leading-tight">
                Validate Your <span className="text-primary italic">Expertise.</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-md mx-auto md:mx-0">
                Take industry-standard skill assessments designed to certify your technical proficiency and unlock new career opportunities.
              </p>
              
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/5 border border-white/10">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  <div className="flex flex-col">
                    <span className="text-xl font-bold text-white">{passedCount}</span>
                    <span className="text-[10px] uppercase text-muted-foreground">Certified Skills</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/5 border border-white/10">
                  <Zap className="w-5 h-5 text-orange-400" />
                  <div className="flex flex-col">
                    <span className="text-xl font-bold text-white">{catalog?.length || 0}</span>
                    <span className="text-[10px] uppercase text-muted-foreground">Tests Available</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="hidden md:flex flex-col gap-4">
               {/* Quick Stats Panel */}
               <div className="p-6 rounded-[2rem] bg-black/40 border border-white/5 backdrop-blur-xl">
                 <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                   <Trophy className="w-4 h-4 text-primary" /> Recent Achievements
                 </h3>
                 <div className="space-y-3">
                   {passedCount > 0 ? (
                      <p className="text-xs text-muted-foreground">You have successfully cleared {passedCount} certifications. Keep it up! 🚀</p>
                   ) : (
                      <p className="text-xs text-muted-foreground">You haven't earned any badges yet. Start your first test today!</p>
                   )}
                   <Button asChild variant="outline" className="w-full rounded-2xl border-white/10 bg-white/5 hover:bg-white/10 text-xs py-5">
                      <Link href="/dashboard/profile">
                        <History className="w-3.5 h-3.5 mr-2" /> View Exam History
                      </Link>
                   </Button>
                 </div>
               </div>
            </div>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col md:flex-row items-center gap-4 bg-white/[0.02] border border-white/10 p-5 rounded-[2.5rem] backdrop-blur-sm">
          <div className="relative flex-1 w-full group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-white/20 group-focus-within:text-primary transition-colors" />
            <Input 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search tests, frameworks, languages..."
              className="w-full bg-white/5 border-none h-14 pl-14 rounded-[1.5rem] text-base placeholder:text-white/20"
            />
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <Button variant="ghost" className="h-14 px-6 gap-2 rounded-[1.5rem] bg-white/5 border border-white/10 hover:bg-white/10 font-bold">
              <Filter className="h-5 w-5" /> All Categories
            </Button>
            <div className="hidden lg:flex items-center gap-2 px-4 text-xs font-bold text-muted-foreground uppercase tracking-widest">
              <BrainCircuit className="h-5 w-5 text-primary" /> Smart Matching
            </div>
          </div>
        </div>

        {/* Grid Catalog */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-[400px] rounded-[2.5rem] bg-white/[0.02] border border-white/10 overflow-hidden animate-pulse">
                <div className="p-8 space-y-6">
                  <Skeleton className="h-14 w-14 rounded-2xl" />
                  <div className="space-y-3">
                    <Skeleton className="h-8 w-3/4 rounded-xl" />
                    <Skeleton className="h-20 w-full rounded-2xl" />
                  </div>
                  <Skeleton className="h-12 w-full rounded-2xl" />
                </div>
              </div>
            ))
          ) : filteredCatalog?.length === 0 ? (
            <div className="col-span-full py-32 flex flex-col items-center text-center space-y-6">
              <div className="h-32 w-32 rounded-[3rem] bg-white/[0.02] border border-white/10 flex items-center justify-center">
                <BrainCircuit className="h-16 w-16 text-white/10" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-white">No Matching Assessments</h3>
                <p className="text-muted-foreground max-w-md">
                  We couldn't find any exams matching your current search. Try different keywords or clear your filters.
                </p>
              </div>
              <Button onClick={() => setSearch('')} variant="outline" className="rounded-2xl border-white/10 px-8 h-12">
                Clear Search
              </Button>
            </div>
          ) : (
            filteredCatalog?.map((item) => (
              <ExamCatalogCard key={item.skillName} item={item} />
            ))
          )}
        </div>

        {/* Pro Tip Section */}
        <div className="rounded-[3rem] p-10 bg-gradient-to-br from-primary/20 via-transparent to-transparent border border-primary/20 flex flex-col md:flex-row items-center gap-8">
          <div className="h-20 w-20 rounded-[2rem] bg-primary flex items-center justify-center shadow-[0_0_40px_-5px_rgba(var(--primary),0.5)]">
            <Trophy className="h-10 w-10 text-black" />
          </div>
          <div className="flex-1 text-center md:text-left space-y-2">
            <h4 className="text-xl font-bold text-white">Unlock Premium Certifications</h4>
            <p className="text-muted-foreground max-w-2xl">
              Pro members get unlimited attempts, access to high-tier architecture exams, and detailed AI feedback on their coding solutions.
            </p>
          </div>
          <Button asChild className="rounded-[1.5rem] h-14 px-10 gradient-primary border-none shadow-xl shadow-primary/20 font-black italic">
            <Link href="/pricing">UPGRADE NOW</Link>
          </Button>
        </div>
      </div>
    </PageTransition>
  );
}
