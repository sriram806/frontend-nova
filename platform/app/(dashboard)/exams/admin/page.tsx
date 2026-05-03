'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowRight, ClipboardList, FolderKanban, GraduationCap, PlusCircle, ShieldCheck, Sparkles } from 'lucide-react';
import { PageTransition } from '@/components/common/page-transition';
import { AdminExamDetailPage } from '@/features/exam/components/admin-exam-detail-page';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { useAdminExamTemplatesQuery, useUpsertExamTemplateMutation } from '@/hooks/queries/useExamQueries';
import { useAuthStore } from '@/store/authStore';
import { ExamTemplateSummary } from '@/types/platform';

type TemplateFormState = {
  skillName: string;
  title: string;
  description: string;
  skillType: 'STANDARD' | 'PROGRAMMING_LANGUAGE';
  difficultyLevel: number;
  passPercentage: number;
  mcqCount: number;
  fillBlankCount: number;
  codingCount: number;
  isPublished: boolean;
};

const EMPTY_TEMPLATE: TemplateFormState = {
  skillName: '',
  title: '',
  description: '',
  skillType: 'STANDARD',
  difficultyLevel: 1,
  passPercentage: 65,
  mcqCount: 15,
  fillBlankCount: 10,
  codingCount: 0,
  isPublished: true
};

function defaultsBySkillType(skillType: 'STANDARD' | 'PROGRAMMING_LANGUAGE') {
  return skillType === 'PROGRAMMING_LANGUAGE'
    ? { mcqCount: 25, fillBlankCount: 0, codingCount: 3 }
    : { mcqCount: 15, fillBlankCount: 10, codingCount: 0 };
}

function toTemplateForm(template: ExamTemplateSummary): TemplateFormState {
  return {
    skillName: template.skillName,
    title: template.title,
    description: template.description,
    skillType: template.skillType,
    difficultyLevel: template.difficultyLevel,
    passPercentage: template.passPercentage,
    mcqCount: template.mcqCount,
    fillBlankCount: template.fillBlankCount,
    codingCount: template.codingCount,
    isPublished: template.isPublished
  };
}

export default function AdminExamRegistryPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const user = useAuthStore((state) => state.user);
  const isAdmin = user?.role === 'admin';
  const selectedExam = searchParams.get('exam');
  const [form, setForm] = useState<TemplateFormState>(EMPTY_TEMPLATE);
  const [editingSkill, setEditingSkill] = useState<string | null>(null);
  const { data: templates, isLoading, refetch } = useAdminExamTemplatesQuery();
  const upsertTemplateMutation = useUpsertExamTemplateMutation();

  useEffect(() => {
    if (user && !isAdmin) {
      router.replace('/exams');
    }
  }, [isAdmin, router, user]);

  const metrics = useMemo(() => {
    const items = templates ?? [];
    return {
      total: items.length,
      skills: items.filter((item) => item.skillType === 'STANDARD').length,
      languages: items.filter((item) => item.skillType === 'PROGRAMMING_LANGUAGE').length,
      published: items.filter((item) => item.isPublished).length,
      savedQuestions: items.reduce((sum, item) => sum + item.availableQuestions.total, 0)
    };
  }, [templates]);

  if (!isAdmin) {
    return null;
  }

  if (selectedExam) {
    return <AdminExamDetailPage skillName={selectedExam} />;
  }

  const resetForm = () => {
    setEditingSkill(null);
    setForm(EMPTY_TEMPLATE);
  };

  const saveTemplate = async () => {
    await upsertTemplateMutation.mutateAsync(form);
    await refetch();
    setEditingSkill(form.skillName);
  };

  return (
    <PageTransition>
      <div className="space-y-6">
        <Card className="rounded-3xl border-border/80 bg-gradient-to-br from-background via-background to-sky-500/5 shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5" />
              <CardTitle>Exam Admin Registry</CardTitle>
            </div>
            <CardDescription>
              One place to list all skill exams and programming language exams, inspect their service-backed details, and create a new exam template.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-5">
            <div className="rounded-2xl border border-border/70 bg-background/70 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Total Exams</p>
              <p className="mt-2 text-3xl font-semibold">{metrics.total}</p>
              <p className="text-sm text-muted-foreground">templates in exam service</p>
            </div>
            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Skill Exams</p>
              <p className="mt-2 text-3xl font-semibold">{metrics.skills}</p>
              <p className="text-sm text-muted-foreground">standard assessments</p>
            </div>
            <div className="rounded-2xl border border-sky-500/20 bg-sky-500/10 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Language Exams</p>
              <p className="mt-2 text-3xl font-semibold">{metrics.languages}</p>
              <p className="text-sm text-muted-foreground">coding assessments</p>
            </div>
            <div className="rounded-2xl border border-violet-500/20 bg-violet-500/10 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Published</p>
              <p className="mt-2 text-3xl font-semibold">{metrics.published}</p>
              <p className="text-sm text-muted-foreground">visible to users</p>
            </div>
            <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Saved Questions</p>
              <p className="mt-2 text-3xl font-semibold">{metrics.savedQuestions}</p>
              <p className="text-sm text-muted-foreground">inventory across all exams</p>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
          <Card className="rounded-3xl border-border/80 bg-card/80 shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <ClipboardList className="h-4 w-4" />
                    All Exams
                  </CardTitle>
                  <CardDescription>List of all skill and language exams with backend-driven details and quick entry into question management.</CardDescription>
                </div>
                <Button type="button" variant="outline" className="rounded-2xl" onClick={resetForm}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Create New Exam
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, index) => <Skeleton key={index} className="h-40 rounded-3xl" />)
              ) : null}

              {!isLoading && !(templates?.length) ? (
                <div className="rounded-3xl border border-border/70 bg-background/60 p-5 text-sm text-muted-foreground">
                  No exam templates found yet. Use the create panel to add the first skill or programming language exam.
                </div>
              ) : null}

              {!isLoading && templates?.map((template) => (
                <div key={template.id} className="rounded-3xl border border-border/70 bg-background/60 p-5">
                  <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="secondary">{template.skillName}</Badge>
                        <Badge variant="outline">{template.skillType === 'PROGRAMMING_LANGUAGE' ? 'Programming language' : 'Skill exam'}</Badge>
                        <Badge variant={template.isPublished ? 'secondary' : 'outline'}>
                          {template.isPublished ? 'Published' : 'Draft'}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-xl font-semibold">{template.title}</p>
                        <p className="text-sm text-muted-foreground">{template.description}</p>
                      </div>
                      <div className="grid gap-2 text-sm text-muted-foreground md:grid-cols-2 xl:grid-cols-5">
                        <div className="rounded-2xl border border-border/70 bg-card px-3 py-2">Difficulty: {template.difficultyLevel}</div>
                        <div className="rounded-2xl border border-border/70 bg-card px-3 py-2">Pass: {template.passPercentage}%</div>
                        <div className="rounded-2xl border border-border/70 bg-card px-3 py-2">MCQ: {template.availableQuestions.mcq}/{template.mcqCount}</div>
                        <div className="rounded-2xl border border-border/70 bg-card px-3 py-2">Fill: {template.availableQuestions.fill}/{template.fillBlankCount}</div>
                        <div className="rounded-2xl border border-border/70 bg-card px-3 py-2">Code: {template.availableQuestions.code}/{template.codingCount}</div>
                      </div>
                      <div className="rounded-2xl border border-border/70 bg-card px-4 py-3 text-sm text-muted-foreground">
                        Total saved questions in database: <span className="font-medium text-foreground">{template.availableQuestions.total}</span>
                      </div>
                    </div>

                    <div className="flex min-w-[240px] flex-col gap-2">
                      <Button asChild className="rounded-2xl">
                        <Link href={`/exams/admin?exam=${encodeURIComponent(template.skillName)}`}>
                          Manage Questions
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        className="rounded-2xl"
                        onClick={() => {
                          setEditingSkill(template.skillName);
                          setForm(toTemplateForm(template));
                        }}
                      >
                        Edit Exam Details
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-border/80 bg-card/80 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                {editingSkill ? <FolderKanban className="h-4 w-4" /> : <GraduationCap className="h-4 w-4" />}
                {editingSkill ? `Edit ${editingSkill}` : 'Create New Exam'}
              </CardTitle>
              <CardDescription>
                Create a new skill exam or programming language exam on this page. Question creation and CRUD lives on the dedicated exam detail page.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Skill or language name</Label>
                <Input value={form.skillName} onChange={(event) => setForm((prev) => ({ ...prev, skillName: event.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Exam title</Label>
                <Input value={form.title} onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea value={form.description} onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Exam type</Label>
                <Select
                  value={form.skillType}
                  onValueChange={(value: 'STANDARD' | 'PROGRAMMING_LANGUAGE') => {
                    const defaults = defaultsBySkillType(value);
                    setForm((prev) => ({ ...prev, skillType: value, ...defaults }));
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="STANDARD">Skill exam</SelectItem>
                    <SelectItem value="PROGRAMMING_LANGUAGE">Programming language exam</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Difficulty</Label>
                  <Input type="number" value={form.difficultyLevel} onChange={(event) => setForm((prev) => ({ ...prev, difficultyLevel: Number(event.target.value) }))} />
                </div>
                <div className="space-y-2">
                  <Label>Pass percentage</Label>
                  <Input type="number" value={form.passPercentage} onChange={(event) => setForm((prev) => ({ ...prev, passPercentage: Number(event.target.value) }))} />
                </div>
                <div className="space-y-2">
                  <Label>MCQ count</Label>
                  <Input type="number" value={form.mcqCount} onChange={(event) => setForm((prev) => ({ ...prev, mcqCount: Number(event.target.value) }))} />
                </div>
                <div className="space-y-2">
                  <Label>Fill count</Label>
                  <Input type="number" value={form.fillBlankCount} onChange={(event) => setForm((prev) => ({ ...prev, fillBlankCount: Number(event.target.value) }))} />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Coding count</Label>
                  <Input type="number" value={form.codingCount} onChange={(event) => setForm((prev) => ({ ...prev, codingCount: Number(event.target.value) }))} />
                </div>
              </div>
              <div className="flex items-center justify-between rounded-2xl border border-border/70 bg-background/60 px-4 py-3">
                <div>
                  <p className="font-medium">Published</p>
                  <p className="text-sm text-muted-foreground">Published exams appear immediately in the learner exam catalog.</p>
                </div>
                <Switch checked={form.isPublished} onCheckedChange={(checked) => setForm((prev) => ({ ...prev, isPublished: checked }))} />
              </div>
              <div className="rounded-2xl border border-border/70 bg-background/60 p-4 text-sm text-muted-foreground">
                The detail page lets you add questions, edit questions, delete questions, view all saved prompts, and use bulk import or replace flows with a better question-bank UI.
              </div>
              <div className="flex flex-wrap gap-3">
                <Button className="rounded-2xl" onClick={() => void saveTemplate()} disabled={upsertTemplateMutation.isPending}>
                  {upsertTemplateMutation.isPending ? 'Saving...' : editingSkill ? 'Update Exam' : 'Create Exam'}
                </Button>
                <Button type="button" variant="outline" className="rounded-2xl" onClick={resetForm}>
                  Reset
                </Button>
              </div>
              {editingSkill ? (
                <div className="rounded-2xl border border-sky-500/20 bg-sky-500/10 p-4 text-sm text-sky-900 dark:text-sky-100">
                  <Sparkles className="mb-2 h-4 w-4" />
                  After updating the exam details here, open the exam detail page to manage the complete question bank.
                </div>
              ) : null}
            </CardContent>
          </Card>
        </div>
      </div>
    </PageTransition>
  );
}
