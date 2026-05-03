import { aiApi, extractApiData, userApi } from '@/services/api';

export type ResumeSkill = {
  name: string;
  category: 'technical' | 'tool' | 'domain' | 'soft';
  proficiency: 'beginner' | 'intermediate' | 'advanced' | 'expert';
};

export type ResumeExperience = {
  company: string;
  role: string;
  location?: string;
  startDate: string;
  endDate?: string;
  isCurrent: boolean;
  bullets: string[];
  technologies: string[];
};

export type ResumeProject = {
  name: string;
  role?: string;
  url?: string;
  bullets: string[];
  technologies: string[];
};

export type ResumeEducation = {
  institution: string;
  degree: string;
  field?: string;
  startYear?: string;
  endYear?: string;
  grade?: string;
  highlights: string[];
};

export type StructuredResume = {
  title: string;
  summary: string;
  skills: ResumeSkill[];
  experience: ResumeExperience[];
  projects: ResumeProject[];
  education: ResumeEducation[];
};

export interface ResumeAnalysisResult {
  userId: string;
  targetRole: string;
  atsScore: number;
  overallScore?: number;
  sectionScores?: Record<string, number>;
  suggestions?: Array<string | Record<string, unknown>>;
  improvements?: string[];
  strengths?: string[];
  keywords?: string[];
  extractedSkills?: string[];
  matchedSkills?: string[];
  missingSkills?: string[];
  expectedSkills?: string[];
  keywordGaps?: string[];
  structuredText?: Record<string, unknown>;
  rawText?: string;
  createdAt?: string;
}

export interface ResumeSectionRewriteResult {
  rewrittenText: string;
  explanation?: string;
}

export interface StoredResumeRecord {
  id: string;
  userId: string;
  title: string;
  status: 'draft' | 'active' | 'archived';
  version: number;
  resume: StructuredResume;
  resumeText: string;
  structuredText: Record<string, string>;
  completenessScore: number;
  atsScore: number;
  sectionScores: Record<string, number>;
  keywordSuggestions: Array<{ keyword: string; reason: string; section: string }>;
  isCurrent: boolean;
  submittedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export async function saveStructuredResume(resume: StructuredResume, mode: 'draft' | 'final' = 'draft'): Promise<StoredResumeRecord> {
  return extractApiData<StoredResumeRecord>(
    await userApi.post('/user/resume', {
      mode,
      resume,
    })
  );
}

export async function analyzeStructuredResume(
  resume: StructuredResume,
  userId?: string,
  targetRole = 'Software Engineer',
  jobDescription = ''
): Promise<ResumeAnalysisResult> {
  if (!userId) {
    throw new Error('Sign in to analyze your resume.');
  }

  return extractApiData<ResumeAnalysisResult>(
    await aiApi.post('/ai/resume/analyze-structured', {
      userId,
      targetRole,
      jobDescription,
      resume,
    })
  );
}

export async function analyzeStoredResume(
  userId?: string,
  targetRole = 'Software Engineer',
  jobDescription = ''
): Promise<ResumeAnalysisResult> {
  if (!userId) {
    throw new Error('Sign in to analyze your resume.');
  }

  return extractApiData<ResumeAnalysisResult>(
    await aiApi.post('/ai/resume/analyze', {
      userId,
      targetRole,
      jobDescription,
    })
  );
}

export async function getLatestResumeAnalysis(userId?: string): Promise<ResumeAnalysisResult | null> {
  if (!userId) {
    return null;
  }

  try {
    return extractApiData<ResumeAnalysisResult>(
      await aiApi.get('/ai/resume/latest', {
        params: {
          userId,
        },
      })
    );
  } catch {
    return null;
  }
}

export async function rewriteResumeSection(
  sectionText: string,
  sectionName: string,
  role: string,
  userId?: string
): Promise<ResumeSectionRewriteResult> {
  if (!userId) {
    throw new Error('Sign in to rewrite resume sections.');
  }

  return extractApiData<ResumeSectionRewriteResult>(
    await aiApi.post('/ai/resume/rewrite', { sectionText, sectionName, role, userId })
  );
}

export async function getStoredResume(includeHistory = false): Promise<StoredResumeRecord | null> {
  try {
    return extractApiData<StoredResumeRecord>(
      await userApi.get('/user/resume', {
        params: { includeHistory },
      })
    );
  } catch {
    return null;
  }
}
