'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Expand, ListChecks, ShieldAlert } from 'lucide-react';
import { PageTransition } from '@/components/common/page-transition';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useExamCatalogQuery, useExamSessionQuery } from '@/hooks/queries/useExamQueries';
import { useExamStore } from '@/store/examStore';
import { ExamDeviceWarning } from './exam-device-warning';

function formatSeconds(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

export function ExamInstructions() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestedSkill = searchParams.get('skill');
  const [selectedSkill, setSelectedSkill] = useState<string | null>(requestedSkill);
  const { data: catalog, isLoading } = useExamCatalogQuery();
  const examSessionQuery = useExamSessionQuery(selectedSkill ?? undefined);
  const storedSession = useExamStore((state) => state.session);
  const setSession = useExamStore((state) => state.setSession);
  const result = useExamStore((state) => state.result);
  const resetExamState = useExamStore((state) => state.reset);

  useEffect(() => {
    if (requestedSkill) {
      setSelectedSkill(requestedSkill);
      return;
    }

    if (!catalog?.length) {
      return;
    }

    const priority = catalog.find((item) => item.status === 'in_progress')
      ?? catalog.find((item) => item.isReady)
      ?? catalog[0];
    setSelectedSkill(priority.skillName);
  }, [catalog, requestedSkill]);

  const selectedExam = catalog?.find((item) => item.skillName === selectedSkill) ?? null;

  const onStart = async () => {
    const sessionResponse = await examSessionQuery.refetch();
    if (!sessionResponse.data) {
      return;
    }

    resetExamState();
    setSession(sessionResponse.data);
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      }
    } catch {
      // Best effort. The live page enforces secure mode again.
    }
    router.push('/exam/live');
  };

  if (isLoading) {
    return <Skeleton className="h-[70vh] w-full rounded-3xl" />;
  }

  if (!catalog?.length) {
    return (
      <PageTransition>
        <Card className="mx-auto max-w-3xl rounded-3xl border-border/80 bg-card/80">
          <CardHeader>
            <CardTitle>No exam-ready skills yet</CardTitle>
            <CardDescription>Upload or complete onboarding resume skills first, then publish question banks for those skills.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="rounded-2xl" onClick={() => router.push('/exams')}>
              Go to Exam Center
            </Button>
          </CardContent>
        </Card>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="lg:hidden">
        <ExamDeviceWarning show actionLabel="Go to Exam Center" onAction={() => router.push('/exams')} />
      </div>
      <div className="hidden lg:block">
        <Card className="mx-auto max-w-5xl rounded-3xl border-border/80 bg-gradient-to-br from-background via-background to-sky-500/5 shadow-sm">
          <CardHeader className="border-b border-border/70 pb-6">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary">Live Skill Validation</Badge>
              {selectedExam ? <Badge variant="outline">{selectedExam.skillType === 'PROGRAMMING_LANGUAGE' ? 'Programming language' : 'Skill exam'}</Badge> : null}
            </div>
            <CardTitle className="pt-3 text-3xl">{selectedExam?.title ?? 'Exam session'}</CardTitle>
            <CardDescription>{selectedExam?.description ?? 'Secure exam instructions and readiness details.'}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <Alert className="border-amber-500/40 bg-amber-500/10 text-amber-900 dark:text-amber-100">
              <ShieldAlert className="h-4 w-4" />
              <AlertTitle>Secure mode is strict</AlertTitle>
              <AlertDescription>
                Full-screen, no tab switch, and no blur. Any violation submits the exam immediately.
              </AlertDescription>
            </Alert>

            <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
              <div className="space-y-4 rounded-3xl border border-border/70 bg-card/60 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Selected skill</p>
                    <p className="mt-1 text-2xl font-semibold">{selectedExam?.skillName}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Pass target</p>
                    <p className="mt-1 text-2xl font-semibold">{selectedExam?.passPercentage ?? 65}%</p>
                  </div>
                </div>

                <div className="grid gap-3 md:grid-cols-3">
                  <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Question bank</p>
                    <p className="mt-2 text-3xl font-semibold">{selectedExam?.questionBank.total ?? 0}</p>
                    <p className="text-sm text-muted-foreground">questions available</p>
                  </div>
                  <div className="rounded-2xl border border-sky-500/20 bg-sky-500/10 p-4">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Status</p>
                    <p className="mt-2 text-2xl font-semibold capitalize">{selectedExam?.status.replace('_', ' ')}</p>
                    <p className="text-sm text-muted-foreground">{selectedExam?.isReady ? 'Ready for a real attempt' : 'Admin needs to finish the bank'}</p>
                  </div>
                  <div className="rounded-2xl border border-violet-500/20 bg-violet-500/10 p-4">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Latest score</p>
                    <p className="mt-2 text-3xl font-semibold">{selectedExam?.progress?.score ?? 0}%</p>
                    <p className="text-sm text-muted-foreground">{selectedExam?.progress?.attempts ?? 0} attempts recorded</p>
                  </div>
                </div>

                <div className="rounded-2xl border border-border/70 bg-background/70 p-4">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Exam checklist</p>
                  <div className="grid gap-3 md:grid-cols-2">
                    {(selectedExam ? [
                      `MCQ pool: ${selectedExam.questionBank.mcq}/${selectedExam.questionBank.required.mcq}`,
                      `Fill blanks: ${selectedExam.questionBank.fill}/${selectedExam.questionBank.required.fill}`,
                      `Coding prompts: ${selectedExam.questionBank.code}/${selectedExam.questionBank.required.code}`,
                      `Randomized order and jumbled options are enabled for each live session.`
                    ] : []).map((item) => (
                      <div key={item} className="rounded-2xl border border-border/60 bg-card p-3 text-sm text-muted-foreground">
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-4 rounded-3xl border border-border/70 bg-card/60 p-5">
                <div className="flex items-center gap-2">
                  <ListChecks className="h-4 w-4" />
                  <p className="text-sm font-semibold">Resume-linked exam list</p>
                </div>
                <div className="space-y-2">
                  {catalog.map((item) => (
                    <button
                      key={item.skillName}
                      type="button"
                      onClick={() => setSelectedSkill(item.skillName)}
                      className={`w-full rounded-2xl border p-4 text-left transition ${
                        item.skillName === selectedSkill
                          ? 'border-primary/50 bg-primary/10'
                          : 'border-border/70 bg-background/60 hover:bg-muted/50'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="font-medium">{item.skillName}</p>
                          <p className="text-sm text-muted-foreground">{item.skillType === 'PROGRAMMING_LANGUAGE' ? 'Language test' : 'Skill test'}</p>
                        </div>
                        <Badge variant={item.isReady ? 'secondary' : 'outline'}>{item.status.replace('_', ' ')}</Badge>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                className="h-11 flex-1 rounded-2xl text-base"
                onClick={() => void onStart()}
                disabled={!selectedExam?.isReady || examSessionQuery.isFetching}
              >
                <Expand className="mr-2 h-4 w-4" />
                {selectedExam?.status === 'in_progress'
                  ? examSessionQuery.isFetching ? 'Loading session...' : 'Resume secure exam'
                  : examSessionQuery.isFetching ? 'Preparing session...' : 'Start secure exam'}
              </Button>
              <Button variant="outline" className="h-11 rounded-2xl" onClick={() => router.push('/exams')}>
                Back to Exam Center
              </Button>
              {storedSession && storedSession.id === result?.sessionId ? (
                <Button variant="outline" className="h-11 rounded-2xl" onClick={() => router.push('/exam/result')}>
                  View latest result
                </Button>
              ) : null}
            </div>

            {selectedExam ? (
              <p className="text-sm text-muted-foreground">
                Estimated live duration: {formatSeconds(selectedExam.skillType === 'PROGRAMMING_LANGUAGE' ? 75 * 60 : 45 * 60)}
              </p>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </PageTransition>
  );
}
