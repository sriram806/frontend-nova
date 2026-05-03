'use client';

import { useExamCatalogQuery, useExamSessionQuery } from '@/hooks/queries/useExamQueries';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Play, 
  ShieldAlert, 
  Clock, 
  FileText, 
  Trophy,
  BrainCircuit,
  Info,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { PageTransition } from '@/components/common/page-transition';
import Link from 'next/link';

export default function ExamDetailPage() {
  const params = useParams();
  const router = useRouter();
  const skillName = params.skill as string;

  const { data: catalog } = useExamCatalogQuery();
  const exam = catalog?.find(e => e.skillName === skillName);

  const startExamMutation = useExamSessionQuery(skillName);

  const handleStart = async () => {
    // Session query is enabled: false, so we manually refetch to start
    const result = await startExamMutation.refetch();
    if (result.data) {
      router.push('/exam/live');
    }
  };

  if (!exam) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Skeleton className="h-12 w-48 rounded-2xl" />
        <Skeleton className="h-4 w-64 rounded-xl" />
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="max-w-4xl mx-auto px-4 py-12 space-y-8">
        
        {/* Back Link */}
        <Link 
          href="/exam" 
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors group"
        >
          <div className="h-8 w-8 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-primary group-hover:text-black transition-all">
            <ArrowLeft className="w-4 h-4" />
          </div>
          Back to Catalog
        </Link>

        {/* Hero Card */}
        <div className="relative overflow-hidden rounded-[3rem] bg-white/[0.02] border border-white/10 p-10 md:p-12">
          <div className="absolute top-0 right-0 h-64 w-64 bg-primary/10 blur-[100px] rounded-full" />
          
          <div className="relative flex flex-col md:flex-row gap-10 items-start">
             <div className="h-24 w-24 md:h-32 md:w-32 rounded-[2.5rem] bg-white/5 border border-white/5 flex items-center justify-center text-5xl shrink-0">
                {skillName.includes('python') ? '🐍' : 
                 skillName.includes('react') ? '⚛️' : 
                 skillName.includes('node') ? '🟢' : 
                 skillName.includes('typescript') ? '🟦' : '🚀'}
             </div>

             <div className="space-y-4 flex-1">
               <div className="flex flex-wrap items-center gap-3">
                 <h1 className="text-3xl md:text-5xl font-black text-white">{exam.title}</h1>
                 <Badge className="bg-primary/10 text-primary border-primary/20">Intermediate</Badge>
               </div>
               <p className="text-lg text-muted-foreground leading-relaxed">
                 {exam.description}
               </p>
               <div className="flex flex-wrap items-center gap-6 pt-2">
                 <div className="flex items-center gap-2 text-sm text-white/60">
                   <Clock className="w-4 h-4 text-primary" /> 60 Minutes
                 </div>
                 <div className="flex items-center gap-2 text-sm text-white/60">
                   <FileText className="w-4 h-4 text-primary" /> {exam.questionBank.total} Questions
                 </div>
                 <div className="flex items-center gap-2 text-sm text-white/60">
                   <Trophy className="w-4 h-4 text-primary" /> {exam.passPercentage}% to Pass
                 </div>
               </div>
             </div>
          </div>
        </div>

        {/* Content Sections */}
        <div className="grid md:grid-cols-3 gap-8">
          
          {/* Rules & Info */}
          <div className="md:col-span-2 space-y-6">
            <section className="space-y-4 p-8 rounded-[2.5rem] bg-white/[0.01] border border-white/5">
              <h3 className="text-xl font-bold text-white flex items-center gap-3">
                <ShieldAlert className="w-5 h-5 text-orange-400" />
                Exam Security & Rules
              </h3>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex items-start gap-3">
                  <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                  <span><strong>Full-Screen Mode:</strong> The exam will force full-screen mode. Exiting will invalidate your session.</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                  <span><strong>Anti-Cheat:</strong> Tab switching or opening dev tools will trigger immediate auto-submission.</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                  <span><strong>No Pause:</strong> Once started, the timer cannot be paused. Ensure you have a stable connection.</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                  <span><strong>AI Monitoring:</strong> Solutions are analyzed for plagiarism and AI-generated code patterns.</span>
                </li>
              </ul>
            </section>

            <section className="space-y-4 p-8 rounded-[2.5rem] bg-white/[0.01] border border-white/5">
              <h3 className="text-xl font-bold text-white flex items-center gap-3">
                <BrainCircuit className="w-5 h-5 text-cyan-400" />
                What's Covered
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {[
                  'Core Syntax & Logic',
                  'Advanced Architecture',
                  'Performance Optimization',
                  'Error Handling & Testing',
                  'Standard Libraries',
                  'Ecosystem Best Practices'
                ].map(topic => (
                  <div key={topic} className="flex items-center gap-2 text-sm text-white/60 bg-white/5 p-3 rounded-xl border border-white/5">
                    <ChevronRight className="w-3.5 h-3.5 text-primary" />
                    {topic}
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Start Actions */}
          <div className="space-y-6">
            <div className="p-8 rounded-[2.5rem] bg-primary/10 border border-primary/20 space-y-6 flex flex-col items-center text-center">
               <div className="h-16 w-16 rounded-2xl bg-primary flex items-center justify-center shadow-[0_0_30px_-5px_rgba(var(--primary),0.5)]">
                  <Sparkles className="h-8 w-8 text-black" />
               </div>
               <div className="space-y-2">
                 <h4 className="text-lg font-bold text-white">Ready to start?</h4>
                 <p className="text-xs text-muted-foreground">Make sure you are in a quiet environment without distractions.</p>
               </div>
               
               <Button 
                onClick={handleStart}
                disabled={startExamMutation.isFetching}
                className="w-full h-14 rounded-2xl bg-primary text-black font-black italic shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all"
               >
                 {startExamMutation.isFetching ? 'INITIALIZING...' : (
                   <>
                     START EXAM <Play className="w-4 h-4 ml-2" />
                   </>
                 )}
               </Button>

               <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">
                 By starting, you agree to the rules.
               </p>
            </div>

            <div className="p-6 rounded-[2.5rem] bg-white/[0.02] border border-white/10 flex items-center gap-4">
              <div className="h-10 w-10 rounded-xl bg-cyan-500/10 flex items-center justify-center">
                <Info className="w-5 h-5 text-cyan-400" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-white">Need Help?</span>
                <span className="text-[10px] text-muted-foreground">Check the documentation</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </PageTransition>
  );
}
