'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  CheckCircle2, 
  RotateCcw, 
  Trophy, 
  XCircle,
  ShieldCheck,
  Zap,
  ArrowRight,
  Share2,
  Medal,
  Activity,
  History,
  TrendingUp,
  BrainCircuit,
  Star,
  FileDown,
  ExternalLink
} from 'lucide-react';
import { motion } from 'framer-motion';
import { PageTransition } from '@/components/common/page-transition';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useExamStore } from '@/store/examStore';
import { ExamDeviceWarning } from './exam-device-warning';

function formatDateTime(value: string) {
  return new Date(value).toLocaleString();
}

export function ExamResult() {
  const router = useRouter();
  const session = useExamStore((state) => state.session);
  const result = useExamStore((state) => state.result);
  const reset = useExamStore((state) => state.reset);
  const [isCertificateOpen, setIsCertificateOpen] = useState(false);

  useEffect(() => {
    if (!session || !result) {
      router.replace('/exam');
    }
  }, [result, router, session]);

  const performanceLabel = useMemo(() => {
    if (!result) return 'Awaiting score';
    if (result.score >= 90) return 'Expert';
    if (result.score >= 80) return 'Advanced';
    if (result.score >= result.threshold) return 'Proficient';
    return 'Learning';
  }, [result]);

  const categoryBreakdown = useMemo(() => {
    if (!result?.questions) return null;
    
    // Group by question type as proxy for categories
    const categories: Record<string, { total: number; correct: number; marks: number; scored: number }> = {};
    
    result.questions.forEach(q => {
      const type = q.type.toUpperCase();
      if (!categories[type]) {
        categories[type] = { total: 0, correct: 0, marks: 0, scored: 0 };
      }
      categories[type].total += 1;
      if (q.correct) categories[type].correct += 1;
      categories[type].marks += q.marks;
      categories[type].scored += q.marksAwarded;
    });

    return categories;
  }, [result]);

  if (!session || !result) return null;

  const { passed, score, threshold, totalMarks, scoredMarks, submittedAt, timedOut } = result;

  return (
    <PageTransition>
      <div className="lg:hidden">
        <ExamDeviceWarning show actionLabel="Go to Exam Center" onAction={() => router.push('/exam')} />
      </div>
      
      <div className="hidden lg:block max-w-5xl mx-auto px-4 py-12 space-y-8">
        
        {/* 🏆 HERO HEADER */}
        <div className="relative overflow-hidden rounded-[3rem] bg-[#0c0d12] border border-white/10 p-12 text-center space-y-8 shadow-2xl">
           <div className={`absolute inset-0 bg-gradient-to-b opacity-20 ${passed ? 'from-emerald-500/20 to-transparent' : 'from-red-500/20 to-transparent'}`} />
           
           <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', damping: 15 }}
            className="relative z-10 flex flex-col items-center space-y-4"
           >
              <div className={`h-24 w-24 rounded-[2rem] flex items-center justify-center text-4xl shadow-2xl ${passed ? 'bg-emerald-500 shadow-emerald-500/40 text-black' : 'bg-red-500 shadow-red-500/40 text-white'}`}>
                 {passed ? <Trophy className="w-12 h-12" /> : <ShieldCheck className="w-12 h-12" />}
              </div>
              <div className="space-y-1">
                 <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight uppercase italic">
                    {passed ? 'Certification Earned' : 'Session Completed'}
                 </h1>
                 <p className="text-muted-foreground font-medium tracking-widest text-xs uppercase">
                    {session.title} • {formatDateTime(submittedAt)}
                 </p>
              </div>
           </motion.div>

           <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
              {[
                { label: 'Final Score', value: `${score}%`, icon: Activity, color: 'text-primary' },
                { label: 'Performance', value: performanceLabel, icon: Star, color: 'text-orange-400' },
                { label: 'Marks', value: `${scoredMarks}/${totalMarks}`, icon: Medal, color: 'text-cyan-400' },
                { label: 'Result', value: passed ? 'PASSED' : 'RETRY', icon: ShieldCheck, color: passed ? 'text-emerald-400' : 'text-red-400' },
              ].map((item, i) => (
                <div key={i} className="p-6 rounded-3xl bg-white/5 border border-white/5 backdrop-blur-sm space-y-2">
                   <item.icon className={`w-5 h-5 ${item.color}`} />
                   <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{item.label}</p>
                   <p className="text-2xl font-black text-white tracking-tight">{item.value}</p>
                </div>
              ))}
           </div>
        </div>

        <div className="grid lg:grid-cols-[1fr_350px] gap-8">
           
           {/* LEFT: Breakdown & Insights */}
           <div className="space-y-8">
              
              {/* Category Breakdown */}
              <section className="p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/10 space-y-8">
                 <h3 className="text-xl font-bold text-white flex items-center gap-3">
                    <TrendingUp className="w-5 h-5 text-primary" /> Skill Analysis Breakdown
                 </h3>
                 
                 <div className="grid gap-6">
                    {categoryBreakdown ? Object.entries(categoryBreakdown).map(([cat, stats]) => (
                      <div key={cat} className="space-y-3">
                         <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                               <span className="text-xs font-black text-white tracking-widest uppercase">{cat}</span>
                               <Badge variant="outline" className="text-[10px] bg-white/5 border-none h-5">{stats.correct}/{stats.total} Correct</Badge>
                            </div>
                            <span className="text-xs font-bold text-muted-foreground">{Math.round((stats.scored / stats.marks) * 100)}%</span>
                         </div>
                         <Progress value={(stats.scored / stats.marks) * 100} className="h-2 bg-white/5" />
                      </div>
                    )) : (
                      <div className="py-10 text-center space-y-4">
                        <BrainCircuit className="w-12 h-12 text-white/10 mx-auto" />
                        <p className="text-sm text-muted-foreground">Detailed category analysis will be available in your dashboard roadmap.</p>
                      </div>
                    )}
                 </div>
              </section>

              {/* Next Steps / Recommendations */}
              <section className="p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/10 space-y-6">
                 <h3 className="text-xl font-bold text-white">Next Milestones</h3>
                 <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-5 rounded-3xl bg-white/5 border border-white/5 flex items-start gap-4 group cursor-pointer hover:bg-white/10 transition-colors">
                       <div className="h-10 w-10 rounded-xl bg-cyan-500/10 flex items-center justify-center shrink-0">
                          <Zap className="w-5 h-5 text-cyan-400" />
                       </div>
                       <div className="space-y-1">
                          <h4 className="text-sm font-bold text-white group-hover:text-cyan-400 transition-colors">Advanced Projects</h4>
                          <p className="text-xs text-muted-foreground leading-relaxed">Apply your {session.skillName} skills to industry-level codebases.</p>
                       </div>
                    </div>
                    <div className="p-5 rounded-3xl bg-white/5 border border-white/5 flex items-start gap-4 group cursor-pointer hover:bg-white/10 transition-colors">
                       <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                          <BrainCircuit className="w-5 h-5 text-primary" />
                       </div>
                       <div className="space-y-1">
                          <h4 className="text-sm font-bold text-white group-hover:text-primary transition-colors">Interview Prep</h4>
                          <p className="text-xs text-muted-foreground leading-relaxed">Simulate tech interviews based on your test performance.</p>
                       </div>
                    </div>
                 </div>
              </section>
           </div>

           {/* RIGHT: Badge & Community */}
           <div className="space-y-8">
              
              {/* The Badge */}
              <Card className="rounded-[2.5rem] bg-gradient-to-br from-primary/20 to-transparent border border-primary/20 p-8 flex flex-col items-center text-center space-y-6 shadow-xl">
                 <div className="relative">
                    <motion.div 
                      animate={{ rotate: 360 }}
                      transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                      className="absolute inset-0 bg-primary/20 blur-2xl rounded-full"
                    />
                    <div className="relative h-32 w-32 rounded-full bg-[#0c0d12] border-4 border-primary flex items-center justify-center shadow-2xl overflow-hidden group">
                       <div className="absolute inset-0 bg-primary/10 group-hover:bg-primary/20 transition-colors" />
                       <ShieldCheck className="w-16 h-16 text-primary" />
                       <div className="absolute bottom-2 inset-x-0 text-[10px] font-black text-primary uppercase tracking-[0.2em] bg-black/80 py-1">
                         CERTIFIED
                       </div>
                    </div>
                 </div>
                 
                 <div className="space-y-2">
                    <h4 className="text-lg font-black text-white italic">PLATFORM BADGE</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {passed ? 'This credential has been added to your public profile.' : 'Pass the exam with 60%+ to unlock this badge on your profile.'}
                    </p>
                 </div>

                 {passed && (
                   <div className="w-full space-y-3">
                     <Button 
                       onClick={() => setIsCertificateOpen(true)}
                       className="w-full rounded-2xl bg-white text-black font-black italic shadow-lg hover:bg-white/90"
                     >
                        VIEW CERTIFICATE <FileDown className="w-4 h-4 ml-2" />
                     </Button>
                     <Button className="w-full rounded-2xl bg-primary/10 border border-primary/20 text-primary font-black italic">
                        SHARE ON LINKEDIN <Share2 className="w-4 h-4 ml-2" />
                     </Button>
                   </div>
                 )}
              </Card>

              {/* Quick Actions */}
              <div className="space-y-3">
                 <Button 
                  onClick={() => router.push('/exam')}
                  className="w-full h-12 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold"
                 >
                    Back to Catalog
                 </Button>
                 <Button 
                  variant="ghost" 
                  onClick={() => {
                    reset();
                    router.push(`/exam/${session.skillName}`);
                  }}
                  className="w-full h-12 rounded-2xl text-primary font-bold hover:bg-primary/5"
                 >
                    <RotateCcw className="w-4 h-4 mr-2" /> Retake Assessment
                 </Button>
              </div>

              {/* Leaderboard Teaser */}
              <div className="p-6 rounded-[2rem] bg-white/[0.01] border border-white/5 flex items-center justify-between group cursor-pointer hover:border-primary/20 transition-all">
                 <div className="flex items-center gap-4">
                    <Trophy className="w-6 h-6 text-orange-400" />
                    <div className="flex flex-col">
                       <span className="text-xs font-bold text-white">Public Leaderboard</span>
                       <span className="text-[10px] text-muted-foreground">View top performers</span>
                    </div>
                 </div>
                 <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>

           </div>

        </div>

      </div>
      
      <CertificateViewer 
        isOpen={isCertificateOpen}
        onClose={() => setIsCertificateOpen(false)}
        attemptId={result.sessionId}
        skillName={session.skillName}
      />
    </PageTransition>
  );
}

import { CertificateViewer } from './certificate-viewer';
