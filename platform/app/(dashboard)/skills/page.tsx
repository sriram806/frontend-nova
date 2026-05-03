'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Code2,
  FileText,
  RotateCcw,
  Sparkles,
  XCircle,
} from 'lucide-react';
import { useState } from 'react';
import { PageTransition } from '@/components/common/page-transition';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { useRetakeSkillMutation, useSkillsQuery } from '@/hooks/queries/useSkillsQueries';
import { useExamStore } from '@/store/examStore';
import type { ExamQuestionReview } from '@/types/platform';

// ─── Skill List (default view) ───────────────────────────────────────────────

function SkillsListView() {
  const { data, isLoading, isError, refetch } = useSkillsQuery();
  const retakeMutation = useRetakeSkillMutation();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Skill Progress</h2>
        <p className="text-sm text-muted-foreground">
          Passed and failed skills with retake actions and progress details.
        </p>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-40 rounded-2xl" />
          ))}
        </div>
      ) : null}

      {isError ? (
        <Card className="glass rounded-3xl border-white/10">
          <CardHeader>
            <CardTitle>Unable to load skills</CardTitle>
            <CardDescription>Try again to fetch latest exam outcomes.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="gradient-primary rounded-2xl" onClick={() => refetch()}>
              Retry
            </Button>
          </CardContent>
        </Card>
      ) : null}

      {!isLoading && !isError && data ? (
        <div className="grid gap-4 md:grid-cols-2">
          {data.map((skill) => {
            const passed = skill.status === 'passed';
            const failed = skill.status === 'failed';
            return (
              <Card key={skill.skill} className="glass rounded-3xl border-white/10">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between text-lg">
                    {skill.skill}
                    {passed ? (
                      <Badge className="bg-emerald-500/20 text-emerald-300">Passed</Badge>
                    ) : failed ? (
                      <Badge variant="destructive">Failed</Badge>
                    ) : (
                      <Badge variant="secondary">In progress</Badge>
                    )}
                  </CardTitle>
                  <CardDescription>Attempts: {skill.attempts}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Progress value={skill.progress} className="h-2" />

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      {passed ? <CheckCircle2 className="h-4 w-4 text-emerald-400" /> : <AlertCircle className="h-4 w-4" />}
                      Status confidence
                    </div>
                    <span>{skill.progress}%</span>
                  </div>

                  {failed ? (
                    <Button
                      variant="outline"
                      className="w-full rounded-2xl"
                      onClick={() => retakeMutation.mutate(skill.skill)}
                      disabled={retakeMutation.isPending}
                    >
                      <RotateCcw className="mr-2 h-4 w-4" />
                      Retake skill exam
                    </Button>
                  ) : null}
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

// ─── Question Review Card ─────────────────────────────────────────────────────

function QuestionReviewCard({ question, index }: { question: ExamQuestionReview; index: number }) {
  const [expanded, setExpanded] = useState(!question.correct);

  const typeLabel = question.type === 'mcq' ? 'MCQ' : question.type === 'fill' ? 'Fill-in' : 'Coding';
  const TypeIcon = question.type === 'coding' ? Code2 : question.type === 'fill' ? FileText : BookOpen;

  return (
    <div
      className={`rounded-2xl border transition-colors ${
        question.correct
          ? 'border-emerald-500/30 bg-emerald-500/5'
          : 'border-red-500/30 bg-red-500/5'
      }`}
    >
      <button
        type="button"
        className="flex w-full items-start gap-4 px-5 py-4 text-left"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="mt-0.5 flex-shrink-0">
          {question.correct ? (
            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
          ) : (
            <XCircle className="h-5 w-5 text-red-500" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="mb-1.5 flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Q{index + 1}
            </span>
            <Badge variant="outline" className="text-[10px]">
              <TypeIcon className="mr-1 h-3 w-3" />
              {typeLabel}
            </Badge>
            <Badge
              className={`text-[10px] ${
                question.correct
                  ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                  : 'bg-red-500/15 text-red-700 dark:text-red-300'
              }`}
            >
              {question.correct ? `+${question.marksAwarded}` : '0'} / {question.marks} marks
            </Badge>
          </div>
          <p className="text-sm font-medium leading-relaxed text-foreground">{question.prompt}</p>
        </div>
        <div className="flex-shrink-0 text-muted-foreground">
          {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </div>
      </button>

      {expanded && (
        <div className="space-y-3 border-t border-border/50 px-5 pb-5 pt-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-border/70 bg-background/60 p-3">
              <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                Your Answer
              </p>
              {question.submittedAnswer ? (
                <p className={`text-sm font-medium ${question.correct ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                  {question.submittedAnswer}
                </p>
              ) : (
                <p className="text-sm italic text-muted-foreground">Not attempted</p>
              )}
            </div>

            {!question.correct && question.expectedAnswer !== '[hidden]' && (
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3">
                <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  Correct Answer
                </p>
                <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">
                  {question.expectedAnswer}
                </p>
              </div>
            )}
          </div>

          {question.explanation ? (
            <div className="rounded-xl border border-sky-500/30 bg-sky-500/10 p-3">
              <p className="mb-1.5 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-sky-700 dark:text-sky-300">
                <Sparkles className="h-3 w-3" />
                Explanation
              </p>
              <p className="text-sm leading-relaxed text-foreground/90">{question.explanation}</p>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}

// ─── Skill Review View (post-exam) ────────────────────────────────────────────

function SkillReviewView({ skillName }: { skillName: string }) {
  const result = useExamStore((state) => state.result);
  const reviewQuestions = useExamStore((state) => state.reviewQuestions);
  const session = useExamStore((state) => state.session);

  const [filter, setFilter] = useState<'all' | 'correct' | 'wrong'>('all');

  // If no result yet in store, redirect user to skills list
  if (!result || !session || session.skillName !== skillName) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/skills"
            className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            All Skills
          </Link>
        </div>
        <Card className="rounded-3xl border-border/80 bg-card/80">
          <CardHeader>
            <CardTitle className="text-lg">No recent exam data</CardTitle>
            <CardDescription>
              Complete a <strong>{skillName}</strong> exam to see a detailed question review here. Questions with explanations will appear immediately after submission.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="rounded-2xl">
              <Link href={`/exam?skill=${encodeURIComponent(skillName)}`}>
                Start {skillName} Exam
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const filteredQuestions =
    filter === 'all'
      ? reviewQuestions
      : filter === 'correct'
        ? reviewQuestions.filter((q) => q.correct)
        : reviewQuestions.filter((q) => !q.correct);

  const correctCount = reviewQuestions.filter((q) => q.correct).length;
  const wrongCount = reviewQuestions.filter((q) => !q.correct).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/dashboard/skills"
          className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          All Skills
        </Link>
        <div className="flex gap-2">
          <Button asChild variant="outline" size="sm" className="rounded-xl">
            <Link href="/exams">Exam Center</Link>
          </Button>
          <Button asChild size="sm" className="rounded-xl">
            <Link href={`/exam?skill=${encodeURIComponent(skillName)}`}>Retake Exam</Link>
          </Button>
        </div>
      </div>

      {/* Score summary */}
      <Card className="rounded-3xl border-border/80 bg-gradient-to-br from-background via-background to-primary/5 shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">{skillName}</Badge>
            <Badge
              className={result.passed
                ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300'
                : 'bg-red-500/20 text-red-700 dark:text-red-300'
              }
            >
              {result.passed ? <CheckCircle2 className="mr-1 h-3 w-3" /> : <XCircle className="mr-1 h-3 w-3" />}
              {result.passed ? 'Passed' : 'Failed'}
            </Badge>
          </div>
          <CardTitle className="text-2xl">Question Review</CardTitle>
          <CardDescription>
            Submitted at {new Date(result.submittedAt).toLocaleString()} •{' '}
            {result.timedOut ? 'Auto-submitted on timeout' : 'Manual submission'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-4">
            <div className="rounded-2xl border border-border/70 bg-background/60 p-4 text-center">
              <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Score</p>
              <p className="mt-1 text-3xl font-black">{result.score}%</p>
            </div>
            <div className="rounded-2xl border border-border/70 bg-background/60 p-4 text-center">
              <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Marks</p>
              <p className="mt-1 text-3xl font-black">{result.scoredMarks}/{result.totalMarks}</p>
            </div>
            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-center">
              <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Correct</p>
              <p className="mt-1 text-3xl font-black text-emerald-600 dark:text-emerald-400">{correctCount}</p>
            </div>
            <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-center">
              <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Wrong</p>
              <p className="mt-1 text-3xl font-black text-red-600 dark:text-red-400">{wrongCount}</p>
            </div>
          </div>
          <Progress value={result.score} className="h-3" />
        </CardContent>
      </Card>

      {/* Filter tabs */}
      <div className="flex gap-2">
        {(['all', 'correct', 'wrong'] as const).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={`rounded-xl border px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] transition ${
              filter === f
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-border/70 bg-background/60 text-muted-foreground hover:bg-muted/50'
            }`}
          >
            {f === 'all' ? `All (${reviewQuestions.length})` : f === 'correct' ? `Correct (${correctCount})` : `Wrong (${wrongCount})`}
          </button>
        ))}
      </div>

      {/* Question list */}
      {filteredQuestions.length === 0 ? (
        <Card className="rounded-3xl border-border/80 bg-card/80">
          <CardContent className="py-12 text-center">
            <p className="text-sm text-muted-foreground">No questions match this filter.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredQuestions.map((q, index) => (
            <QuestionReviewCard key={q.questionId} question={q} index={index} />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Page entry ───────────────────────────────────────────────────────────────

export default function SkillsPage() {
  const searchParams = useSearchParams();
  const skillParam = searchParams.get('skill');

  return (
    <PageTransition>
      {skillParam ? <SkillReviewView skillName={skillParam} /> : <SkillsListView />}
    </PageTransition>
  );
}
