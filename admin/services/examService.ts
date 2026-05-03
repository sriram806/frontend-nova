import { api, extractApiData } from '@/lib/api';
import type { 
  ExamTemplateSummary, 
  ExamTemplateQuestion, 
  UpsertExamTemplatePayload, 
  BulkQuestionPayload,
  ListExamAttemptsResponse
} from '@/types/exam';

const BASE = '/api/exam/admin';

export const listTemplates = async () => {
  const res = await api.get<{ success: true; data: ExamTemplateSummary[] }>(`${BASE}/templates`);
  return extractApiData(res);
};

export const upsertTemplate = async (payload: UpsertExamTemplatePayload) => {
  const res = await api.post<{ success: true; data: ExamTemplateSummary }>(`${BASE}/templates`, payload);
  return extractApiData(res);
};

export const getTemplateQuestions = async (skillName: string) => {
  const res = await api.get<{ success: true; data: ExamTemplateQuestion[] }>(
    `${BASE}/templates/${encodeURIComponent(skillName)}/questions`
  );
  return extractApiData(res);
};

export const bulkUploadQuestions = async (skillName: string, payload: BulkQuestionPayload) => {
  const res = await api.post<{ success: true; data: { examId: string; skillName: string; inserted: number } }>(
    `${BASE}/templates/${encodeURIComponent(skillName)}/questions`,
    payload
  );
  return extractApiData(res);
};

export const updateQuestion = async (questionId: string, payload: Partial<ExamTemplateQuestion>) => {
  const res = await api.patch<{ success: true; data: ExamTemplateQuestion }>(
    `${BASE}/questions/${encodeURIComponent(questionId)}`,
    payload
  );
  return extractApiData(res);
};

export const deleteQuestion = async (questionId: string) => {
  const res = await api.delete<{ success: true; data: { deleted: boolean } }>(
    `${BASE}/questions/${encodeURIComponent(questionId)}`
  );
  return extractApiData(res);
};

export const listAttempts = async (skillName: string, params: Record<string, string | number | undefined> = {}) => {
  const query = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== '') query.set(k, String(v));
  }
  const res = await api.get<{ success: true; data: ListExamAttemptsResponse }>(
    `${BASE}/attempts/${encodeURIComponent(skillName)}?${query.toString()}`
  );
  return extractApiData(res);
};

export const getAnalytics = async (skillName: string) => {
  const res = await api.get<{ success: true; data: any }>(`${BASE}/analytics/${encodeURIComponent(skillName)}`);
  return extractApiData(res);
};

export const listSkillRequests = async () => {
  const res = await api.get<{ success: true; data: any[] }>(`${BASE}/requests`);
  return extractApiData(res);
};

export const updateRequestStatus = async (requestId: string, status: string) => {
  const res = await api.patch<{ success: true; data: any }>(`${BASE}/requests/${requestId}`, { status });
  return extractApiData(res);
};

export const getModerationOverview = async () => {
  const res = await api.get<{ success: true; data: any }>(`${BASE}/moderation/overview`);
  return extractApiData(res);
};
