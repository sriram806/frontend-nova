'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, FileJson, PencilLine, PlusCircle, RefreshCcw, Trash2 } from 'lucide-react';
import { PageTransition } from '@/components/common/page-transition';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { getAnalytics } from '@/services/examService';
import { ExamAnalytics } from './ExamAnalytics';
import {
  useAdminExamTemplateQuestionsQuery,
  useAdminExamTemplatesQuery,
  useBulkQuestionUploadMutation,
  useDeleteExamQuestionMutation,
  useUpdateExamQuestionMutation
} from '@/hooks/queries/useExamQueries';
import { useAuthStore } from '@/store/authStore';
import { ExamTemplateQuestion } from '@/types/platform';
import { toast } from 'sonner';

type DraftQuestion = {
  type: 'MCQ' | 'FILL' | 'CODE';
  question: string;
  optionsText: string;
  answer: string;
  placeholder: string;
  starterCode: string;
  language: string;
  explanation: string;
  difficulty: number;
  marks: number;
};

const EMPTY_DRAFT: DraftQuestion = {
  type: 'MCQ',
  question: '',
  optionsText: '',
  answer: '',
  placeholder: '',
  starterCode: '',
  language: '',
  explanation: '',
  difficulty: 1,
  marks: 1
};

function questionToDraft(question: ExamTemplateQuestion): DraftQuestion {
  return {
    type: question.type,
    question: question.question,
    optionsText: question.options?.join('\n') ?? '',
    answer: question.answer,
    placeholder: question.placeholder ?? '',
    starterCode: question.starterCode ?? '',
    language: question.language ?? '',
    explanation: question.explanation ?? '',
    difficulty: question.difficulty,
    marks: question.marks
  };
}

function getRatio(current: number, required: number) {
  if (required <= 0) {
    return 'Not required';
  }

  return `${current}/${required}`;
}

export function AdminExamDetailPage({
  skillName,
  initialTab = 'questions',
  editQuestionId = null
}: {
  skillName: string;
  initialTab?: string;
  editQuestionId?: string | null;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const user = useAuthStore((state) => state.user);
  const isAdmin = user?.role === 'admin';

  const { data: templates, isLoading: isTemplatesLoading, refetch: refetchTemplates } = useAdminExamTemplatesQuery();
  const questionsQuery = useAdminExamTemplateQuestionsQuery(skillName);
  const bulkQuestionMutation = useBulkQuestionUploadMutation();
  const updateQuestionMutation = useUpdateExamQuestionMutation();
  const deleteQuestionMutation = useDeleteExamQuestionMutation();

  const [draftQuestion, setDraftQuestion] = useState<DraftQuestion>(EMPTY_DRAFT);
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(editQuestionId);
  const [bulkJson, setBulkJson] = useState('');
  const [replaceExisting, setReplaceExisting] = useState(false);
  const [questionFilter, setQuestionFilter] = useState<'ALL' | 'MCQ' | 'FILL' | 'CODE'>('ALL');
  const [bulkExampleType, setBulkExampleType] = useState<'MCQ' | 'FILL' | 'CODE'>('MCQ');
  const [activeTab, setActiveTab] = useState(initialTab === 'add' ? 'editor' : initialTab);
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [isAnalyticsLoading, setIsAnalyticsLoading] = useState(false);

  const fetchAnalytics = async () => {
    setIsAnalyticsLoading(true);
    try {
      const data = await getAnalytics(skillName);
      setAnalyticsData(data);
    } catch (err) {
      console.error('Failed to fetch analytics', err);
    } finally {
      setIsAnalyticsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'analytics') {
      fetchAnalytics();
    }
  }, [activeTab, skillName]);

  // Sync with props
  useEffect(() => {
    if (initialTab === 'add') setActiveTab('editor');
    else if (initialTab === 'questions') setActiveTab('questions');
  }, [initialTab]);

  useEffect(() => {
    if (editQuestionId && questionsQuery.data) {
      const q = questionsQuery.data.find(item => item.id === editQuestionId);
      if (q) {
        setEditingQuestionId(q.id);
        setDraftQuestion(questionToDraft(q));
        setActiveTab('editor');
      }
    }
  }, [editQuestionId, questionsQuery.data]);

  useEffect(() => {
    if (user && !isAdmin) {
      router.replace('/exams');
    }
  }, [isAdmin, router, user]);

  const currentTemplate = useMemo(
    () => templates?.find((item) => item.skillName === skillName) ?? null,
    [skillName, templates]
  );
  const questions = questionsQuery.data ?? [];

  const filteredQuestions = useMemo(
    () => questionFilter === 'ALL' ? questions : questions.filter((question) => question.type === questionFilter),
    [questionFilter, questions]
  );

  const bulkSchemaExample = useMemo(() => {
    if (bulkExampleType === 'FILL') {
      return `[
  {
    "type": "FILL",
    "question": "React is maintained by _____.",
    "answer": "Meta",
    "placeholder": "Type the company name",
    "explanation": "React is maintained by Meta.",
    "difficulty": 1,
    "marks": 1
  }
]`;
    }

    if (bulkExampleType === 'CODE') {
      return `[
  {
    "type": "CODE",
    "question": "Write a function that returns the sum of two integers.",
    "answer": "add,sum,+",
    "starterCode": "function add(a, b) {\\n  // your code here\\n}",
    "language": "javascript",
    "explanation": "Expect a valid function that returns the computed sum.",
    "difficulty": 2,
    "marks": 5,
    "metadata": {
      "evaluator": "platform",
      "requiredTokens": ["return", "+"]
    }
  }
]`;
    }

    return `[
  {
    "type": "MCQ",
    "question": "What is Node.js?",
    "options": ["Runtime", "Database", "Protocol", "IDE"],
    "answer": "Runtime",
    "explanation": "Node.js is a JavaScript runtime.",
    "difficulty": 1,
    "marks": 1
  }
]`;
  }, [bulkExampleType]);

  const currentCounts = useMemo(() => {
    return questions.reduce(
      (acc, question) => {
        if (question.type === 'MCQ') {
          acc.mcq += 1;
        } else if (question.type === 'FILL') {
          acc.fill += 1;
        } else {
          acc.code += 1;
        }
        acc.total += 1;
        return acc;
      },
      { total: 0, mcq: 0, fill: 0, code: 0 }
    );
  }, [questions]);

  if (!isAdmin) {
    return null;
  }

  const buildPayload = () => ({
    type: draftQuestion.type,
    question: draftQuestion.question,
    options: draftQuestion.type === 'MCQ'
      ? draftQuestion.optionsText.split('\n').map((item) => item.trim()).filter(Boolean)
      : null,
    answer: draftQuestion.answer,
    placeholder: draftQuestion.placeholder || null,
    starterCode: draftQuestion.starterCode || null,
    language: draftQuestion.language || null,
    explanation: draftQuestion.explanation || null,
    difficulty: draftQuestion.difficulty,
    marks: draftQuestion.marks,
    metadata: draftQuestion.type === 'CODE'
      ? { evaluator: 'platform', requiredTokens: draftQuestion.answer.split(',').map((item) => item.trim()).filter(Boolean) }
      : {}
  });

  const resetEditor = () => {
    setEditingQuestionId(null);
    setDraftQuestion(EMPTY_DRAFT);
  };

  const saveQuestion = async () => {
    if (!draftQuestion.question.trim() || !draftQuestion.answer.trim()) {
      return;
    }

    const payload = buildPayload();
    try {
      if (editingQuestionId) {
        await updateQuestionMutation.mutateAsync({ questionId: editingQuestionId, payload });
      } else {
        await bulkQuestionMutation.mutateAsync({
          skillName,
          payload: {
            replaceExisting: false,
            questions: [payload as any]
          }
        });
      }

      resetEditor();
      await questionsQuery.refetch();
      await refetchTemplates();
    } catch (err) {
      console.error(err);
    }
  };

  const importBulkQuestions = async () => {
    if (!bulkJson.trim()) {
      return;
    }

    try {
      const parsed = JSON.parse(bulkJson) as Array<Record<string, unknown>>;
      await bulkQuestionMutation.mutateAsync({
        skillName,
        payload: {
          replaceExisting,
          questions: parsed as never
        }
      });
      setBulkJson('');
      setReplaceExisting(false);
      await questionsQuery.refetch();
      await refetchTemplates();
    } catch (err) {
      toast.error('Invalid JSON format');
    }
  };

  const deleteQuestion = async (question: ExamTemplateQuestion) => {
    if (!window.confirm(`Delete this question from ${question.skillName}?`)) {
      return;
    }

    try {
      await deleteQuestionMutation.mutateAsync(question.id);
      if (editingQuestionId === question.id) {
        resetEditor();
      }
      await questionsQuery.refetch();
      await refetchTemplates();
    } catch (err) {
      console.error(err);
    }
  };

  const handleTabChange = (val: string) => {
    setActiveTab(val);
    const params = new URLSearchParams(searchParams.toString());
    if (val === 'editor') params.set('view', 'add');
    else if (val === 'questions') params.set('view', 'questions');
    else if (val === 'analytics') params.set('view', 'analytics');
    else if (val === 'bulk') params.set('view', 'questions'); // Bulk stays under questions/manage view
    router.replace(`/exams/manage?${params.toString()}`);
  };

  return (
    <PageTransition>
      <div className="space-y-6">
        <Card className="rounded-3xl border-border/80 bg-gradient-to-br from-background via-background to-sky-500/5 shadow-sm">
          <CardHeader>
            <div className="flex flex-wrap items-center gap-3">
              <Button asChild variant="outline" className="rounded-2xl">
                <Link href="/exams">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Exams
                </Link>
              </Button>
              <Badge variant="secondary">{skillName}</Badge>
              {currentTemplate ? (
                <Badge variant="outline">
                  {currentTemplate.skillType === 'PROGRAMMING_LANGUAGE' ? 'Programming language exam' : 'Skill exam'}
                </Badge>
              ) : null}
            </div>
            <CardTitle className="pt-3">Question Management Workspace</CardTitle>
            <CardDescription>
              Add questions, edit questions, view all saved questions, delete questions, and run bulk update or replace flows for this specific exam template.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-5">
            <div className="rounded-2xl border border-border/70 bg-background/70 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Total Questions</p>
              <p className="mt-2 text-3xl font-semibold">{currentCounts.total}</p>
              <p className="text-sm text-muted-foreground">saved in database</p>
            </div>
            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">MCQ Bank</p>
              <p className="mt-2 text-3xl font-semibold">{getRatio(currentCounts.mcq, currentTemplate?.mcqCount ?? 0)}</p>
              <p className="text-sm text-muted-foreground">service target</p>
            </div>
            <div className="rounded-2xl border border-sky-500/20 bg-sky-500/10 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Fill Bank</p>
              <p className="mt-2 text-3xl font-semibold">{getRatio(currentCounts.fill, currentTemplate?.fillBlankCount ?? 0)}</p>
              <p className="text-sm text-muted-foreground">service target</p>
            </div>
            <div className="rounded-2xl border border-violet-500/20 bg-violet-500/10 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Coding Bank</p>
              <p className="mt-2 text-3xl font-semibold">{getRatio(currentCounts.code, currentTemplate?.codingCount ?? 0)}</p>
              <p className="text-sm text-muted-foreground">service target</p>
            </div>
            <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Published</p>
              <p className="mt-2 text-3xl font-semibold">{currentTemplate?.isPublished ? 'Yes' : 'No'}</p>
              <p className="text-sm text-muted-foreground">catalog visibility</p>
            </div>
          </CardContent>
        </Card>

        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4">
          <TabsList className="rounded-2xl">
            <TabsTrigger value="editor">Add / Edit Question</TabsTrigger>
            <TabsTrigger value="questions">View All Questions</TabsTrigger>
            <TabsTrigger value="analytics">Performance Analytics</TabsTrigger>
            <TabsTrigger value="bulk">Bulk Update</TabsTrigger>
          </TabsList>

          <TabsContent value="editor">
            <Card className="rounded-3xl border-border/80 bg-card/80 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  {editingQuestionId ? <PencilLine className="h-4 w-4" /> : <PlusCircle className="h-4 w-4" />}
                  {editingQuestionId ? 'Edit Question' : 'Add New Question'}
                </CardTitle>
                <CardDescription>
                  Create a question for this exam or update a selected question with full service-backed fields including answer, options, placeholder, starter code, explanation, difficulty, and marks.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                {editingQuestionId ? (
                  <div className="flex items-center justify-between rounded-2xl border border-sky-500/30 bg-sky-500/10 p-4 text-sm md:col-span-2">
                    <div>
                      <p className="font-medium">Editing existing question</p>
                      <p className="text-muted-foreground">You can now update the saved question record and keep the rest of the bank untouched.</p>
                    </div>
                    <Button type="button" variant="outline" className="rounded-2xl" onClick={resetEditor}>
                      Cancel Edit
                    </Button>
                  </div>
                ) : null}
                <div className="space-y-2">
                  <Label>Question type</Label>
                  <Select value={draftQuestion.type} onValueChange={(value: 'MCQ' | 'FILL' | 'CODE') => setDraftQuestion((prev) => ({ ...prev, type: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MCQ">MCQ</SelectItem>
                      <SelectItem value="FILL">Fill in the blank</SelectItem>
                      <SelectItem value="CODE">Coding</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Marks</Label>
                  <Input type="number" value={draftQuestion.marks} onChange={(event) => setDraftQuestion((prev) => ({ ...prev, marks: Number(event.target.value) }))} />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Question prompt</Label>
                  <Textarea value={draftQuestion.question} onChange={(event) => setDraftQuestion((prev) => ({ ...prev, question: event.target.value }))} />
                </div>
                {draftQuestion.type === 'MCQ' ? (
                  <div className="space-y-2 md:col-span-2">
                    <Label>Options, one per line</Label>
                    <Textarea value={draftQuestion.optionsText} onChange={(event) => setDraftQuestion((prev) => ({ ...prev, optionsText: event.target.value }))} />
                  </div>
                ) : null}
                <div className="space-y-2">
                  <Label>Answer</Label>
                  <Input value={draftQuestion.answer} onChange={(event) => setDraftQuestion((prev) => ({ ...prev, answer: event.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>Placeholder</Label>
                  <Input value={draftQuestion.placeholder} onChange={(event) => setDraftQuestion((prev) => ({ ...prev, placeholder: event.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>Difficulty</Label>
                  <Input type="number" value={draftQuestion.difficulty} onChange={(event) => setDraftQuestion((prev) => ({ ...prev, difficulty: Number(event.target.value) }))} />
                </div>
                <div className="space-y-2">
                  <Label>Language</Label>
                  <Input value={draftQuestion.language} onChange={(event) => setDraftQuestion((prev) => ({ ...prev, language: event.target.value }))} />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Starter code</Label>
                  <Textarea value={draftQuestion.starterCode} onChange={(event) => setDraftQuestion((prev) => ({ ...prev, starterCode: event.target.value }))} />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Explanation</Label>
                  <Textarea value={draftQuestion.explanation} onChange={(event) => setDraftQuestion((prev) => ({ ...prev, explanation: event.target.value }))} />
                </div>
                <div className="flex flex-wrap gap-3 md:col-span-2">
                  <Button
                    className="rounded-2xl"
                    onClick={() => void saveQuestion()}
                    disabled={bulkQuestionMutation.isPending || updateQuestionMutation.isPending}
                  >
                    {bulkQuestionMutation.isPending || updateQuestionMutation.isPending
                      ? 'Saving...'
                      : editingQuestionId ? 'Update Question' : 'Add Question'}
                  </Button>
                  <Button type="button" variant="outline" className="rounded-2xl" onClick={resetEditor}>
                    Reset Form
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="questions">
            <Card className="rounded-3xl border-border/80 bg-card/80 shadow-sm">
              <CardHeader>
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <CardTitle>All Saved Questions</CardTitle>
                    <CardDescription>View the complete bank for this exam and run question-level edit or delete actions.</CardDescription>
                  </div>
                  <div className="w-full md:w-[240px]">
                    <Select value={questionFilter} onValueChange={(value: 'ALL' | 'MCQ' | 'FILL' | 'CODE') => setQuestionFilter(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ALL">All types</SelectItem>
                        <SelectItem value="MCQ">MCQ only</SelectItem>
                        <SelectItem value="FILL">Fill only</SelectItem>
                        <SelectItem value="CODE">Code only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {isTemplatesLoading || questionsQuery.isLoading ? (
                  Array.from({ length: 6 }).map((_, index) => <Skeleton key={index} className="h-32 rounded-3xl" />)
                ) : null}

                {!isTemplatesLoading && !questionsQuery.isLoading && !filteredQuestions.length ? (
                  <div className="rounded-3xl border border-border/70 bg-background/60 p-5 text-sm text-muted-foreground">
                    No questions match this filter yet.
                  </div>
                ) : null}

                {!questionsQuery.isLoading && filteredQuestions.map((question) => (
                  <div key={question.id} className="rounded-3xl border border-border/70 bg-background/60 p-5">
                    <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                      <div className="space-y-3">
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="secondary">{question.type}</Badge>
                          <Badge variant="outline">{question.marks} marks</Badge>
                          <Badge variant="outline">Difficulty {question.difficulty}</Badge>
                          {question.language ? <Badge variant="outline">{question.language}</Badge> : null}
                        </div>
                        <p className="text-base font-semibold">{question.question}</p>
                        {question.options?.length ? (
                          <div className="flex flex-wrap gap-2 text-xs">
                            {question.options.map((option) => (
                              <span key={option} className="rounded-full border border-border/70 bg-card px-2.5 py-1">
                                {option}
                              </span>
                            ))}
                          </div>
                        ) : null}
                        <div className="grid gap-2 text-sm text-muted-foreground md:grid-cols-2">
                          <div className="rounded-2xl border border-border/70 bg-card px-3 py-2">
                            Answer: {question.type === 'CODE' ? '[rubric/metadata driven]' : question.answer}
                          </div>
                          <div className="rounded-2xl border border-border/70 bg-card px-3 py-2">
                            Placeholder: {question.placeholder || 'Not set'}
                          </div>
                        </div>
                      </div>
                      <div className="flex min-w-[220px] flex-col gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          className="rounded-2xl"
                          onClick={() => {
                            setEditingQuestionId(question.id);
                            setDraftQuestion(questionToDraft(question));
                            setActiveTab('editor');
                            const params = new URLSearchParams(searchParams.toString());
                            params.set('view', 'edit');
                            params.set('id', question.id);
                            router.push(`/exams/manage?${params.toString()}`);
                          }}
                        >
                          <PencilLine className="mr-2 h-4 w-4" />
                          Edit Question
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          className="rounded-2xl"
                          onClick={() => void deleteQuestion(question)}
                          disabled={deleteQuestionMutation.isPending}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete Question
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="bulk">
            <Card className="rounded-3xl border-border/80 bg-card/80 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <FileJson className="h-4 w-4" />
                  Bulk Update Workspace
                </CardTitle>
                <CardDescription>
                  Paste a JSON array for large bank updates. Turn on replace mode if you want to wipe the current bank and replace it completely in one operation.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between rounded-2xl border border-border/70 bg-background/60 px-4 py-3">
                  <div>
                    <p className="font-medium">Replace existing question bank</p>
                    <p className="text-sm text-muted-foreground">Use this for a bulk refresh when the old questions should be deleted before import.</p>
                  </div>
                  <Switch checked={replaceExisting} onCheckedChange={setReplaceExisting} />
                </div>
                <div className="rounded-2xl border border-border/70 bg-background/60 p-4 text-sm text-muted-foreground">
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <p className="font-medium text-foreground">JSON should follow the exam-service schema</p>
                    <div className="w-full md:w-[220px]">
                      <Select value={bulkExampleType} onValueChange={(value: 'MCQ' | 'FILL' | 'CODE') => setBulkExampleType(value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="MCQ">MCQ example</SelectItem>
                          <SelectItem value="FILL">Fill blank example</SelectItem>
                          <SelectItem value="CODE">Coding example</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <pre className="mt-3 overflow-x-auto whitespace-pre-wrap text-xs">{bulkSchemaExample}</pre>
                </div>
                <Textarea
                  className="min-h-[320px] font-mono text-xs"
                  value={bulkJson}
                  onChange={(event) => setBulkJson(event.target.value)}
                  placeholder='[{"type":"MCQ","question":"...","options":["A","B"],"answer":"A","marks":1}]'
                />
                <div className="flex flex-wrap gap-3">
                  <Button className="rounded-2xl" onClick={() => void importBulkQuestions()} disabled={bulkQuestionMutation.isPending}>
                    {bulkQuestionMutation.isPending ? 'Importing...' : replaceExisting ? 'Replace and Import' : 'Import Questions'}
                  </Button>
                  <Button type="button" variant="outline" className="rounded-2xl" onClick={() => void questionsQuery.refetch()}>
                    <RefreshCcw className="mr-2 h-4 w-4" />
                    Refresh Questions
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="animate-in fade-in duration-500">
            <ExamAnalytics data={analyticsData} loading={isAnalyticsLoading} />
          </TabsContent>
        </Tabs>
      </div>
    </PageTransition>
  );
}
