'use client';

import dynamic from 'next/dynamic';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  AlertTriangle, 
  Bookmark, 
  ChevronLeft, 
  ChevronRight, 
  Clock3, 
  Flag, 
  Send, 
  ShieldAlert, 
  Sparkles,
  Zap,
  Info,
  Maximize2,
  Lock,
  Eye,
  Settings,
  HelpCircle
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { motion, AnimatePresence } from 'framer-motion';
import { PageTransition } from '@/components/common/page-transition';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  ResizableHandle, 
  ResizablePanel, 
  ResizablePanelGroup 
} from '@/components/ui/resizable';
import { useSubmitExamMutation } from '@/hooks/queries/useExamQueries';
import { useExamStore } from '@/store/examStore';
import { ExamQuestion } from '@/types/platform';
import { ExamDeviceWarning } from './exam-device-warning';
import { toast } from 'sonner';

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), {
  ssr: false,
  loading: () => <Skeleton className="h-full w-full rounded-2xl" />
});

function formatSeconds(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function isQuestionAnswered(question: ExamQuestion, answers: Record<string, string>) {
  const value = answers[question.id] ?? '';
  return value.trim().length > 0;
}

export function ExamLive() {
  const router = useRouter();
  const { resolvedTheme } = useTheme();
  const session = useExamStore((state) => state.session);
  const currentQuestionId = useExamStore((state) => state.currentQuestionId);
  const answers = useExamStore((state) => state.answers);
  const timeRemainingInSeconds = useExamStore((state) => state.timeRemainingInSeconds);
  const setCurrentQuestionId = useExamStore((state) => state.setCurrentQuestionId);
  const setAnswer = useExamStore((state) => state.setAnswer);
  const tick = useExamStore((state) => state.tick);
  const setResult = useExamStore((state) => state.setResult);
  const submitMutation = useSubmitExamMutation();
  
  const [visitedQuestionIds, setVisitedQuestionIds] = useState<string[]>([]);
  const [reviewQuestionIds, setReviewQuestionIds] = useState<string[]>([]);
  const [showSecurityAlert, setShowSecurityAlert] = useState(true);
  const [hintUsedCount, setHintUsedCount] = useState(0);
  
  const submittingRef = useRef(false);

  useEffect(() => {
    if (!session) {
      router.replace('/exam');
      return;
    }

    if (!currentQuestionId) {
      setCurrentQuestionId(session.questions[0]?.id ?? '');
    }
  }, [currentQuestionId, router, session, setCurrentQuestionId]);

  const submitNow = async (timedOut: boolean, violationReason?: string) => {
    if (!session || submittingRef.current) {
      return;
    }

    submittingRef.current = true;
    
    if (violationReason) {
      toast.error(`Security Violation: ${violationReason}. Submitting exam...`);
    }

    try {
      const result = await submitMutation.mutateAsync({
        sessionId: session.id,
        answers
      });
      setResult({
        ...result,
        timedOut
      });
      
      // Attempt to exit fullscreen
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }
      
      router.replace('/exam/result');
    } catch (err) {
      console.error('Submission failed', err);
      submittingRef.current = false;
    }
  };

  useEffect(() => {
    if (!session) {
      return;
    }

    const timer = window.setInterval(() => {
      tick();
      const remaining = useExamStore.getState().timeRemainingInSeconds;
      if (remaining <= 0) {
        window.clearInterval(timer);
        void submitNow(true);
      }
    }, 1000);

    return () => window.clearInterval(timer);
  }, [session, tick]);

  useEffect(() => {
    if (!session) {
      return;
    }

    const enforceFullscreen = async () => {
      if (!document.fullscreenElement) {
        try {
          await document.documentElement.requestFullscreen();
        } catch {
          // If user rejects or browser blocks, we might need a manual trigger
          // For "strict" mode, we'll alert them
        }
      }
    };

    void enforceFullscreen();

    const onVisibilityChange = () => {
      if (document.hidden) {
        void submitNow(false, 'Tab Switch Detected');
      }
    };

    const onBlur = () => {
      void submitNow(false, 'Focus Lost (possible multi-window use)');
    };

    const onFullscreenChange = () => {
      if (!document.fullscreenElement && !submittingRef.current) {
        void submitNow(false, 'Fullscreen Exited');
      }
    };

    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!submittingRef.current) {
        event.preventDefault();
        event.returnValue = 'Exam in progress. Leaving will submit your current answers.';
      }
    };

    const onContextMenu = (event: MouseEvent) => event.preventDefault();

    const onKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      // Block common shortcuts
      if ((event.ctrlKey || event.metaKey) && ['c', 'v', 'x', 'u', 's', 'p', 'a', 'l', 'r'].includes(key)) {
        event.preventDefault();
        toast.warning('Shortcuts are disabled for security.');
      }
      if (event.key === 'F12') {
        event.preventDefault();
      }
    };

    document.addEventListener('visibilitychange', onVisibilityChange);
    document.addEventListener('fullscreenchange', onFullscreenChange);
    window.addEventListener('blur', onBlur);
    window.addEventListener('beforeunload', onBeforeUnload);
    window.addEventListener('contextmenu', onContextMenu);
    window.addEventListener('keydown', onKeyDown);

    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange);
      document.removeEventListener('fullscreenchange', onFullscreenChange);
      window.removeEventListener('blur', onBlur);
      window.removeEventListener('beforeunload', onBeforeUnload);
      window.removeEventListener('contextmenu', onContextMenu);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [session]);

  useEffect(() => {
    if (!currentQuestionId) {
      return;
    }

    setVisitedQuestionIds((prev) => (prev.includes(currentQuestionId) ? prev : [...prev, currentQuestionId]));
  }, [currentQuestionId]);

  const currentQuestion = useMemo(
    () => session?.questions.find((question) => question.id === currentQuestionId) ?? null,
    [currentQuestionId, session]
  );

  const currentQuestionIndex = useMemo(
    () => session?.questions.findIndex((question) => question.id === currentQuestionId) ?? -1,
    [currentQuestionId, session]
  );

  const answeredCount = useMemo(
    () => session?.questions.filter((question) => isQuestionAnswered(question, answers)).length ?? 0,
    [answers, session]
  );

  const completionPercentage = session ? Math.round((answeredCount / session.questions.length) * 100) : 0;
  const isLowTime = timeRemainingInSeconds <= 300;
  const isLastQuestion = session ? currentQuestionIndex === session.questions.length - 1 : false;
  
  if (!session || !currentQuestion) {
    return <Skeleton className="h-screen w-full" />;
  }

  return (
    <PageTransition>
      <div className="h-screen flex flex-col bg-[#05060a] overflow-hidden">
        
        {/* 🔒 SECURITY OVERLAY / HEADER */}
        <header className="h-14 border-b border-white/5 flex items-center px-6 justify-between bg-black/40 backdrop-blur-xl z-50">
          <div className="flex items-center gap-4">
             <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60">Strict Mode Active</span>
             </div>
             <div className="h-4 w-[1px] bg-white/10" />
             <span className="text-sm font-bold text-white/90">{session.title}</span>
          </div>

          <div className="flex items-center gap-6">
            <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full border transition-all ${isLowTime ? 'bg-red-500/10 border-red-500/20 text-red-400 animate-pulse' : 'bg-white/5 border-white/10 text-white/80'}`}>
               <Clock3 className="w-4 h-4" />
               <span className="text-sm font-mono font-bold">{formatSeconds(timeRemainingInSeconds)}</span>
            </div>
            
            <Button 
              size="sm" 
              onClick={() => void submitNow(false)}
              className="bg-primary hover:bg-primary/90 text-black font-bold rounded-xl h-8 px-4"
            >
              Finish Exam
            </Button>
          </div>
        </header>

        <main className="flex-1 overflow-hidden relative">
          
          <ResizablePanelGroup direction="horizontal" className="h-full">
            
            {/* LEFT: PROGRESS & NAV */}
            <ResizablePanel defaultSize={20} minSize={15} maxSize={25} className="border-r border-white/5 bg-[#08090d]">
               <div className="h-full flex flex-col p-6 space-y-8">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                       <span className="text-xs font-bold text-white/40 uppercase tracking-widest">Progress</span>
                       <span className="text-sm font-black text-primary">{completionPercentage}%</span>
                    </div>
                    <Progress value={completionPercentage} className="h-1.5 bg-white/5" />
                  </div>

                  <div className="flex-1 overflow-y-auto space-y-6 pr-2 custom-scrollbar">
                    <div className="space-y-4">
                       <span className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em]">Question Palette</span>
                       <div className="grid grid-cols-4 gap-2">
                          {session.questions.map((q, idx) => {
                             const answered = isQuestionAnswered(q, answers);
                             const current = currentQuestionId === q.id;
                             const marked = reviewQuestionIds.includes(q.id);
                             
                             return (
                               <button
                                key={q.id}
                                onClick={() => setCurrentQuestionId(q.id)}
                                className={`h-10 rounded-xl text-xs font-bold border transition-all relative flex items-center justify-center
                                  ${current ? 'bg-primary text-black border-none scale-105' : 
                                    answered ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 
                                    'bg-white/5 border-white/5 text-white/40 hover:bg-white/10'}`}
                               >
                                 {marked && <div className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-orange-500" />}
                                 {idx + 1}
                               </button>
                             )
                          })}
                       </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3">
                       <div className="flex items-center gap-2 text-xs font-bold text-white/60">
                          <Info className="w-3.5 h-3.5 text-primary" /> Legend
                       </div>
                       <div className="grid gap-2">
                          <div className="flex items-center gap-2 text-[10px] text-white/40">
                             <div className="h-2 w-2 rounded-full bg-primary" /> Active
                          </div>
                          <div className="flex items-center gap-2 text-[10px] text-white/40">
                             <div className="h-2 w-2 rounded-full bg-emerald-500" /> Answered
                          </div>
                          <div className="flex items-center gap-2 text-[10px] text-white/40">
                             <div className="h-2 w-2 rounded-full bg-orange-500" /> Marked
                          </div>
                       </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                     <Alert className="bg-orange-500/5 border-orange-500/20 py-3">
                        <ShieldAlert className="w-3.5 h-3.5 text-orange-400" />
                        <AlertDescription className="text-[10px] leading-tight text-orange-400/80">
                          AI Proctoring is watching for pattern shifts.
                        </AlertDescription>
                     </Alert>
                  </div>
               </div>
            </ResizablePanel>

            <ResizableHandle className="w-[1px] bg-white/5 hover:bg-primary/20 transition-colors" />

            {/* MIDDLE: CONTENT */}
            <ResizablePanel defaultSize={80} className="bg-[#05060a]">
              
              <div className="h-full flex flex-col">
                
                <div className="flex-1 overflow-hidden">
                   {currentQuestion.type === 'coding' ? (
                     <ResizablePanelGroup direction="horizontal" className="h-full">
                        {/* Prompt Panel */}
                        <ResizablePanel defaultSize={35} minSize={25} className="border-r border-white/5">
                           <div className="h-full flex flex-col p-10 overflow-y-auto space-y-8 custom-scrollbar">
                              <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                   <Badge className="bg-white/5 text-white/60 font-mono text-[10px] rounded-lg">Q{currentQuestionIndex + 1}</Badge>
                                   <Badge className="bg-primary/10 text-primary font-bold text-[10px] rounded-lg">{currentQuestion.marks} Marks</Badge>
                                </div>
                                <h2 className="text-2xl font-black text-white leading-tight">
                                  {currentQuestion.prompt}
                                </h2>
                              </div>

                              <div className="prose prose-invert prose-sm max-w-none">
                                 {/* Potential extra markdown content for problem description */}
                                 <p className="text-white/60 leading-relaxed italic">
                                    Implement the requested functionality in the editor. Ensure your code is optimized and follows best practices.
                                 </p>
                              </div>

                              <div className="space-y-4 pt-10 border-t border-white/5">
                                 <h4 className="text-xs font-bold text-white/40 uppercase tracking-widest flex items-center gap-2">
                                    <Sparkles className="w-3 h-3 text-primary" /> AI Assistant
                                 </h4>
                                 <div className="p-4 rounded-2xl bg-primary/5 border border-primary/20 space-y-3">
                                    <p className="text-[11px] text-white/60 leading-relaxed">
                                      Need a conceptual hint? Using a hint deducts 10% of total marks for this question.
                                    </p>
                                    <Button 
                                      variant="outline" 
                                      size="sm" 
                                      className="w-full rounded-xl border-primary/20 bg-primary/10 text-primary text-[10px] font-black h-8"
                                    >
                                      UNLOCK HINT (-1.5 Marks)
                                    </Button>
                                 </div>
                              </div>
                           </div>
                        </ResizablePanel>

                        <ResizableHandle className="w-[1px] bg-white/5" />

                        {/* Editor Panel */}
                        <ResizablePanel defaultSize={65}>
                           <div className="h-full flex flex-col">
                              <div className="h-10 bg-black/40 border-b border-white/5 flex items-center px-4 justify-between">
                                 <div className="flex items-center gap-2">
                                    <Settings className="w-3 h-3 text-white/40" />
                                    <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">{currentQuestion.language} Editor</span>
                                 </div>
                                 <div className="flex items-center gap-4">
                                    <span className="text-[10px] text-white/20 font-mono">UTF-8</span>
                                 </div>
                              </div>
                              <div className="flex-1 bg-[#1e1e1e]">
                                <MonacoEditor
                                  height="100%"
                                  language={currentQuestion.language}
                                  theme="vs-dark"
                                  value={answers[currentQuestion.id] ?? currentQuestion.starterCode}
                                  onChange={(value) => setAnswer(currentQuestion.id, value ?? '')}
                                  options={{ 
                                    minimap: { enabled: false }, 
                                    fontSize: 14, 
                                    lineNumbersMinChars: 3,
                                    padding: { top: 20 },
                                    fontFamily: 'JetBrains Mono, monospace',
                                    cursorSmoothCaretAnimation: 'on',
                                    smoothScrolling: true,
                                    scrollBeyondLastLine: false,
                                    automaticLayout: true
                                  }}
                                />
                              </div>
                           </div>
                        </ResizablePanel>
                     </ResizablePanelGroup>
                   ) : (
                     /* Non-coding layout (Centered) */
                     <div className="h-full flex items-center justify-center p-10 overflow-y-auto custom-scrollbar">
                        <div className="max-w-2xl w-full space-y-10">
                           <div className="space-y-6">
                              <div className="flex items-center gap-3">
                                <Badge className="bg-white/5 text-white/60 font-mono text-[10px] rounded-lg">Q{currentQuestionIndex + 1}</Badge>
                                <Badge className="bg-primary/10 text-primary font-bold text-[10px] rounded-lg">{currentQuestion.marks} Marks</Badge>
                              </div>
                              <h2 className="text-3xl md:text-4xl font-black text-white leading-tight">
                                {currentQuestion.prompt}
                              </h2>
                           </div>

                           <div className="space-y-4">
                              {currentQuestion.type === 'mcq' && (
                                <RadioGroup
                                  value={answers[currentQuestion.id] ?? ''}
                                  onValueChange={(value) => setAnswer(currentQuestion.id, value)}
                                  className="grid gap-3"
                                >
                                  {(currentQuestion.options ?? []).map((option, index) => (
                                    <Label
                                      key={`${currentQuestion.id}-${index}`}
                                      className={`flex cursor-pointer items-center gap-4 rounded-2xl border p-5 transition-all
                                        ${answers[currentQuestion.id] === option
                                          ? 'border-primary/50 bg-primary/5 text-primary scale-[1.02]'
                                          : 'border-white/5 bg-white/[0.02] hover:bg-white/[0.05] text-white/60'
                                      }`}
                                    >
                                      <div className={`h-5 w-5 rounded-full border flex items-center justify-center ${answers[currentQuestion.id] === option ? 'border-primary' : 'border-white/20'}`}>
                                         {answers[currentQuestion.id] === option && <div className="h-2 w-2 rounded-full bg-primary" />}
                                      </div>
                                      <span className="text-base font-medium">{option}</span>
                                      <RadioGroupItem value={option} className="sr-only" />
                                    </Label>
                                  ))}
                                </RadioGroup>
                              )}

                              {currentQuestion.type === 'fill' && (
                                <div className="space-y-4">
                                   <Label className="text-xs font-bold text-white/40 uppercase tracking-widest ml-1">Your Answer</Label>
                                   <Input
                                      className="h-16 rounded-2xl bg-white/5 border-white/10 text-xl font-bold focus:ring-primary/40 focus:border-primary/40"
                                      placeholder={currentQuestion.placeholder ?? 'Type here...'}
                                      value={answers[currentQuestion.id] ?? ''}
                                      onChange={(event) => setAnswer(currentQuestion.id, event.target.value)}
                                   />
                                </div>
                              )}
                           </div>
                        </div>
                     </div>
                   )}
                </div>

                {/* BOTTOM NAVIGATION BAR */}
                <footer className="h-20 border-t border-white/5 bg-black/40 backdrop-blur-xl px-10 flex items-center justify-between">
                   <div className="flex items-center gap-3">
                      <Button
                        variant="outline"
                        disabled={currentQuestionIndex <= 0}
                        onClick={() => setCurrentQuestionId(session.questions[currentQuestionIndex - 1].id)}
                        className="rounded-xl border-white/5 bg-white/5 hover:bg-white/10 h-11 px-6"
                      >
                         <ChevronLeft className="w-4 h-4 mr-2" /> Previous
                      </Button>
                      
                      <Button
                        variant="outline"
                        onClick={() => {
                          setReviewQuestionIds(prev => 
                            prev.includes(currentQuestion.id) 
                            ? prev.filter(id => id !== currentQuestion.id) 
                            : [...prev, currentQuestion.id]
                          )
                        }}
                        className={`rounded-xl h-11 px-6 border-white/5 transition-all
                          ${reviewQuestionIds.includes(currentQuestion.id) 
                            ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' 
                            : 'bg-white/5 hover:bg-white/10 text-white/60'}`}
                      >
                         <Bookmark className={`w-4 h-4 mr-2 ${reviewQuestionIds.includes(currentQuestion.id) ? 'fill-current' : ''}`} />
                         {reviewQuestionIds.includes(currentQuestion.id) ? 'Marked' : 'Mark for Review'}
                      </Button>
                   </div>

                   <div className="flex items-center gap-3">
                      {isLastQuestion ? (
                        <Button 
                          onClick={() => void submitNow(false)}
                          disabled={submitMutation.isPending}
                          className="rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-black h-11 px-8 shadow-lg shadow-emerald-500/20"
                        >
                          {submitMutation.isPending ? 'SUBMITTING...' : 'FINISH EXAM'} <Send className="w-4 h-4 ml-2" />
                        </Button>
                      ) : (
                        <Button 
                          onClick={() => setCurrentQuestionId(session.questions[currentQuestionIndex + 1].id)}
                          className="rounded-xl bg-primary hover:bg-primary/90 text-black font-black h-11 px-8 shadow-lg shadow-primary/20"
                        >
                          Next Question <ChevronRight className="w-4 h-4 ml-2" />
                        </Button>
                      )}
                   </div>
                </footer>

              </div>
            </ResizablePanel>
          </ResizablePanelGroup>

          {/* ⚡ SECURITY ALERTS */}
          <AnimatePresence>
             {showSecurityAlert && (
               <motion.div 
                initial={{ opacity: 0, y: 100 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 100 }}
                className="absolute bottom-24 right-10 z-[60] max-w-xs"
               >
                  <Alert className="bg-[#0f1117] border-red-500/30 text-white shadow-2xl p-5 rounded-[2rem]">
                    <ShieldAlert className="w-6 h-6 text-red-500 mb-2" />
                    <AlertTitle className="text-sm font-black mb-1">Strict Proctored Session</AlertTitle>
                    <AlertDescription className="text-xs text-white/40 leading-relaxed">
                      All activity is logged. Tab switching, screen exiting, or copy-pasting will result in <strong>immediate disqualification</strong>.
                    </AlertDescription>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setShowSecurityAlert(false)}
                      className="mt-3 w-full rounded-xl bg-white/5 hover:bg-white/10 text-[10px] font-bold"
                    >
                      I UNDERSTAND
                    </Button>
                  </Alert>
               </motion.div>
             )}
          </AnimatePresence>

        </main>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.1);
        }
      `}</style>
    </PageTransition>
  );
}
