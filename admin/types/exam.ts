import { Pagination } from './admin';

export type ExamSkillType = 'STANDARD' | 'PROGRAMMING_LANGUAGE';

export interface ExamTemplateSummary {
  id: string;
  organizationId: string | null;
  skillName: string;
  title: string;
  description: string;
  skillType: ExamSkillType;
  difficultyLevel: number;
  passPercentage: number;
  mcqCount: number;
  fillBlankCount: number;
  codingCount: number;
  isPublished: boolean;
  createdAt: string;
  availableQuestions: {
    total: number;
    mcq: number;
    fill: number;
    code: number;
  };
}

export interface ExamTemplateQuestion {
  id: string;
  examId: string;
  skillName: string;
  type: 'MCQ' | 'FILL' | 'CODE';
  question: string;
  options: string[] | null;
  answer: string;
  placeholder: string | null;
  starterCode: string | null;
  language: string | null;
  explanation: string | null;
  difficulty: number;
  marks: number;
  metadata: Record<string, unknown> | null;
}

export interface UpsertExamTemplatePayload {
  organizationId?: string | null;
  skillName: string;
  title?: string;
  description?: string;
  skillType?: ExamSkillType;
  difficultyLevel?: number;
  passPercentage?: number;
  mcqCount?: number;
  fillBlankCount?: number;
  codingCount?: number;
  isPublished?: boolean;
}

export interface BulkQuestionPayload {
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
}

export interface ExamAttemptSummary {
  id: string;
  userId: string;
  userEmail: string;
  userName: string | null;
  skillName: string;
  score: number;
  passed: boolean;
  startedAt: string;
  submittedAt: string | null;
  timeTakenSeconds: number | null;
}

export interface ListExamAttemptsResponse {
  attempts: ExamAttemptSummary[];
  pagination: Pagination;
}
