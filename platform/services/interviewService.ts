import { api, requestFirst } from '@/lib/api';

export type InterviewSession = {
  sessionId: string;
  status: 'created' | 'active' | 'ended';
  createdAt?: string;
};

export async function createInterviewSession(payload: { role: string; mode?: string }) {
  return requestFirst<InterviewSession>([
    () => api.post('/interview/sessions', payload),
  ]);
}
