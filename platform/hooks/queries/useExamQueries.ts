'use client';

import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { apiDelete, apiGet, apiPatch, apiPost } from '@/lib/api/client';
import { getApiErrorMessage } from '@/lib/api/errors';
import { DeleteExamQuestionResult, ExamCatalogItem, ExamSession, ExamTemplateQuestion, ExamTemplateSummary, SubmitExamResult } from '@/types/platform';

type SubmitExamPayload = {
  sessionId: string;
  answers: Record<string, string>;
};

type UpsertExamTemplatePayload = {
  organizationId?: string | null;
  skillName: string;
  title?: string;
  description?: string;
  skillType?: 'STANDARD' | 'PROGRAMMING_LANGUAGE';
  difficultyLevel?: number;
  passPercentage?: number;
  mcqCount?: number;
  fillBlankCount?: number;
  codingCount?: number;
  isPublished?: boolean;
};

type BulkQuestionPayload = {
  replaceExisting: boolean;
  questions: Array<{
    type: 'MCQ' | 'FILL' | 'CODE';
    question: string;
    options?: string[] | null;
    answer: string;
    placeholder?: string | null;
    starterCode?: string | null;
    language?: string | null;
    explanation?: string | null;
    difficulty?: number;
    marks?: number;
    metadata?: Record<string, unknown>;
  }>;
};

export function useExamSessionQuery(skillName?: string) {
  return useQuery({
    queryKey: ['exam-session', skillName ?? 'next'],
    queryFn: () => apiGet<ExamSession>(skillName ? `/api/exam/session?skill=${encodeURIComponent(skillName)}` : '/api/exam/session'),
    enabled: false,
    retry: false,
  });
}

export function useSubmitExamMutation() {
  return useMutation({
    mutationFn: (payload: SubmitExamPayload) => apiPost<SubmitExamPayload, SubmitExamResult>('/api/exam/submit', payload),
    onSuccess: (result) => {
      const status = result.passed ? 'Passed' : 'Not passed';
      toast.success(`Exam submitted. ${status}. Score: ${result.score}%`);
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Unable to submit exam.'));
    },
  });
}

export function useExamCatalogQuery() {
  return useQuery({
    queryKey: ['exam-catalog'],
    queryFn: () => apiGet<ExamCatalogItem[]>('/api/exam/catalog'),
    retry: false,
  });
}

export function useAdminExamTemplatesQuery() {
  return useQuery({
    queryKey: ['admin-exam-templates'],
    queryFn: () => apiGet<ExamTemplateSummary[]>('/api/exam/admin/templates'),
    retry: false,
  });
}

export function useAdminExamTemplateQuestionsQuery(skillName?: string) {
  return useQuery({
    queryKey: ['admin-exam-template-questions', skillName ?? ''],
    queryFn: () => apiGet<ExamTemplateQuestion[]>(`/api/exam/admin/templates/${encodeURIComponent(skillName ?? '')}/questions`),
    enabled: Boolean(skillName),
    retry: false,
  });
}

export function useUpsertExamTemplateMutation() {
  return useMutation({
    mutationFn: (payload: UpsertExamTemplatePayload) => apiPost<UpsertExamTemplatePayload, ExamTemplateSummary>('/api/exam/admin/templates', payload),
    onSuccess: () => {
      toast.success('Exam template saved.');
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Unable to save exam template.'));
    },
  });
}

export function useBulkQuestionUploadMutation() {
  return useMutation({
    mutationFn: ({ skillName, payload }: { skillName: string; payload: BulkQuestionPayload }) =>
      apiPost<BulkQuestionPayload, { examId: string; skillName: string; inserted: number }>(
        `/api/exam/admin/templates/${encodeURIComponent(skillName)}/questions`,
        payload
      ),
    onSuccess: (result) => {
      toast.success(`Question bank saved for ${result.skillName}. Added ${result.inserted} questions.`);
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Unable to save question bank.'));
    },
  });
}

export function useUpdateExamQuestionMutation() {
  return useMutation({
    mutationFn: ({ questionId, payload }: { questionId: string; payload: BulkQuestionPayload['questions'][number] }) =>
      apiPatch<typeof payload, ExamTemplateQuestion>(`/api/exam/admin/questions/${encodeURIComponent(questionId)}`, payload),
    onSuccess: () => {
      toast.success('Question updated.');
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Unable to update question.'));
    },
  });
}

export function useDeleteExamQuestionMutation() {
  return useMutation({
    mutationFn: (questionId: string) =>
      apiDelete<DeleteExamQuestionResult>(`/api/exam/admin/questions/${encodeURIComponent(questionId)}`),
    onSuccess: () => {
      toast.success('Question deleted.');
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Unable to delete question.'));
    },
  });
}

export function useAssignmentsQuery() {
  return useQuery({
    queryKey: ['exam-assignments'],
    queryFn: () => apiGet<any[]>('/api/exam/assignments'),
    retry: false,
  });
}
