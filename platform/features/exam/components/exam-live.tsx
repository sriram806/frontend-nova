'use client';

import dynamic from 'next/dynamic';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import screenfull from 'screenfull';
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
  HelpCircle,
  Activity,
  MousePointer2
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
import { apiPost } from '@/lib/api/client';

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
  const [tabSwitchCount, setTabSwitchCount] = useState(0);

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
      toast.error(`Security Violation: ${violationReason}. Submitting exam...`, {
        duration: 5000,
      });
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
      if (screenfull.isEnabled && screenfull.isFullscreen) {
        screenfull.exit().catch(() => { });
      }

      router.replace('/exam/result');
    } catch (err) {
      console.error('Submission failed', err);
      submittingRef.current = false;
    }
  };

  // Timer Tick
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

  // Security Logic
  useEffect(() => {
    if (!session) {
      return;
    }

    const config = session.securityConfig;

    const logEvent = async (event: string, metadata?: any) => {
      try {
        await apiPost(`/api/exam/session/${session.id}/log`, { event, metadata });
      } catch (err) {
        console.error('Failed to log proctoring event:', err);
      }
    };

    // 1. Initial Fullscreen Request
    const initFullscreen = async () => {
      if (config.enforceFullscreen && screenfull.isEnabled && !screenfull.isFullscreen) {
        try {
          await screenfull.request();
        } catch {
          toast.error("Please enable full-screen to continue the exam.", {
            action: {
              label: "Go Fullscreen",
              onClick: () => screenfull.request()
            }
          });
        }
      }
    };

    void initFullscreen();

    // 2. Event Handlers
    const onVisibilityChange = () => {
      if (document.hidden && config.trackTabSwitches) {
        setTabSwitchCount(prev => {
          const next = prev + 1;
          void logEvent('TAB_SWITCH', { count: next });
          if (config.maxTabSwitches && next > config.maxTabSwitches) {
            void submitNow(false, 'Too many tab switches');
          } else if (config.enforceFullscreen) {
            void submitNow(false, 'Tab Switch Detected');
          } else {
            toast.warning(`Warning: Tab switch detected. This event is logged. (${next})`);
          }
          return next;
        });
      }
    };

    const onBlur = () => {
      if (config.enforceFullscreen || config.trackTabSwitches) {
        void logEvent('WINDOW_BLUR');
        console.warn('Window focus lost');
      }
    };

    const onFullscreenChange = () => {
      if (config.enforceFullscreen && screenfull.isEnabled && !screenfull.isFullscreen && !submittingRef.current) {
        void logEvent('FULLSCREEN_EXIT');
        void submitNow(false, 'Fullscreen Exited');
      }
    };

    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!submittingRef.current) {
        event.preventDefault();
        event.returnValue = 'Exam in progress. Leaving will submit your current answers.';
      }
    };

    const onContextMenu = (event: MouseEvent) => {
      if (config.disableCopyPaste) {
        event.preventDefault();
        toast.error('Right-click is disabled for security.');
      }
    };

    const onCopyCutPaste = (event: ClipboardEvent) => {
      if (config.disableCopyPaste) {
        event.preventDefault();
        toast.error('Copy/Paste is disabled.');
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      // Block common shortcuts
      if (config.disableCopyPaste && (event.ctrlKey || event.metaKey) && ['c', 'v', 'x', 'u', 's', 'p', 'a', 'l', 'r'].includes(key)) {
        event.preventDefault();
        toast.warning('Shortcuts are disabled for security.');
      }
      if (event.key === 'F12') {
        event.preventDefault();
        toast.error('DevTools access is restricted.');
      }
    };

    // 3. Attach Listeners
    document.addEventListener('visibilitychange', onVisibilityChange);
    if (screenfull.isEnabled) {
      screenfull.on('change', onFullscreenChange);
    }
    window.addEventListener('blur', onBlur);
    window.addEventListener('beforeunload', onBeforeUnload);
    window.addEventListener('contextmenu', onContextMenu);
    window.addEventListener('copy', onCopyCutPaste);
    window.addEventListener('cut', onCopyCutPaste);
    window.addEventListener('paste', onCopyCutPaste);
    window.addEventListener('keydown', onKeyDown);

    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange);
      if (screenfull.isEnabled) {
        screenfull.off('change', onFullscreenChange);
      }
      window.removeEventListener('blur', onBlur);
      window.removeEventListener('beforeunload', onBeforeUnload);
      window.removeEventListener('contextmenu', onContextMenu);
      window.removeEventListener('copy', onCopyCutPaste);
      window.removeEventListener('cut', onCopyCutPaste);
      window.removeEventListener('paste', onCopyCutPaste);
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

        {/* 🔒 SECURITY HEADER */}
        <header className="h-14 border-b border-white/5 flex items-center px-6 justify-between bg-black/40 backdrop-blur-xl z-50">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className={`h-2 w-2 rounded-full ${session.securityConfig.enforceFullscreen ? 'bg-red-500 animate-pulse' : 'bg-emerald-500'}`} />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60">
                {session.securityConfig.enforceFullscreen ? 'Strict Proctored Session' : 'Standard Session'}
              </span>
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

                  <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-4">
                    <div className="flex items-center gap-2 text-xs font-bold text-white/60">
                      <Lock className="w-3.5 h-3.5 text-primary" /> Active Rules
                    </div>
                    <div className="grid gap-3">
                      <RuleStatus icon={<Maximize2 className="h-3 w-3" />} label="Full-screen" active={session.securityConfig.enforceFullscreen} />
                      <RuleStatus icon={<MousePointer2 className="h-3 w-3" />} label="Anti-Copy" active={session.securityConfig.disableCopyPaste} />
                      <RuleStatus icon={<Activity className="h-3 w-3" />} label="Tab Switch" active={session.securityConfig.trackTabSwitches} />
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <Alert className="bg-orange-500/5 border-orange-500/20 py-3">
                    <ShieldAlert className="w-3.5 h-3.5 text-orange-400" />
                    <AlertDescription className="text-[10px] leading-tight text-orange-400/80">
                      Proctoring v2.0 is monitoring this session.
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
                                automaticLayout: true,
                                readOnly: false,
                                // Block copy/paste at editor level if needed
                                contextmenu: !session.securityConfig.disableCopyPaste
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
            {showSecurityAlert && session.securityConfig.enforceFullscreen && (
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
                    This exam requires full-screen mode. Tab switching or exiting full-screen will result in <strong>immediate submission</strong>.
                  </AlertDescription>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setShowSecurityAlert(false);
                      if (!screenfull.isFullscreen) screenfull.request();
                    }}
                    className="mt-3 w-full rounded-xl bg-white/5 hover:bg-white/10 text-[10px] font-bold"
                  >
                    ENABLE FULLSCREEN & START
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
          border-radius: 10px;
        }
      `}</style>
    </PageTransition>
  );
}

const RuleStatus = ({ icon, label, active }: any) => (
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-2">
      <div className={`p-1.5 rounded-md ${active ? 'bg-primary/10 text-primary' : 'bg-white/5 text-white/20'}`}>
        {icon}
      </div>
      <span className={`text-[10px] font-bold ${active ? 'text-white/80' : 'text-white/20'}`}>{label}</span>
    </div>
    <div className={`h-1 w-1 rounded-full ${active ? 'bg-primary shadow-[0_0_5px_rgba(var(--primary),0.5)]' : 'bg-white/10'}`} />
  </div>
);
