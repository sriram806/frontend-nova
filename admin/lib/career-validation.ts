import type { CareerAnalyzeRequest } from '@/types/career';

export type CareerFormValues = {
  resumeText: string;
  targetRole: string;
  userId: string;
  githubScore: string;
  quizScore: string;
};

export type CareerFormErrors = Partial<Record<keyof CareerFormValues, string>>;

export const initialCareerFormValues: CareerFormValues = {
  resumeText: '',
  targetRole: '',
  userId: '',
  githubScore: '',
  quizScore: '',
};

function parseOptionalScore(value: string): number | undefined {
  if (value.trim() === '') {
    return undefined;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : Number.NaN;
}

function isScoreInRange(score: number): boolean {
  return score >= 0 && score <= 100;
}

export function validateCareerForm(values: CareerFormValues): CareerFormErrors {
  const errors: CareerFormErrors = {};

  if (values.resumeText.trim().length < 20) {
    errors.resumeText = 'Resume Text must be at least 20 characters.';
  }

  if (values.userId.trim().length === 0) {
    errors.userId = 'User ID is required.';
  }

  const githubScore = parseOptionalScore(values.githubScore);
  if (githubScore !== undefined && (!Number.isFinite(githubScore) || !isScoreInRange(githubScore))) {
    errors.githubScore = 'GitHub Score must be a number between 0 and 100.';
  }

  const quizScore = parseOptionalScore(values.quizScore);
  if (quizScore !== undefined && (!Number.isFinite(quizScore) || !isScoreInRange(quizScore))) {
    errors.quizScore = 'Quiz Score must be a number between 0 and 100.';
  }

  return errors;
}

export function toCareerAnalyzeRequest(values: CareerFormValues): CareerAnalyzeRequest {
  const githubScore = parseOptionalScore(values.githubScore);
  const quizScore = parseOptionalScore(values.quizScore);

  return {
    resumeText: values.resumeText.trim(),
    targetRole: values.targetRole.trim(),
    userId: values.userId.trim(),
    ...(githubScore !== undefined && Number.isFinite(githubScore) ? { githubScore } : {}),
    ...(quizScore !== undefined && Number.isFinite(quizScore) ? { quizScore } : {}),
  };
}
