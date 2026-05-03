import { aiApi, extractApiData } from '@/services/api';

export interface JobMatch {
  company?: string;
  role: string;
  location?: string;
  salary?: string;
  matchScore: number;
  tags?: string[];
  description?: string;
  applyUrl?: string;
  featured?: boolean;
}

export interface JobMatchResult {
  userId: string;
  targetRole: string;
  matches: JobMatch[];
  totalMatches?: number;
  createdAt?: string;
}

export interface MatchJobsRequest {
  userId?: string;
  targetRole?: string;
  resumeText?: string;
  location?: string;
  experienceYears?: number;
  topN?: number;
  forceRefresh?: boolean;
}

export async function matchJobs(req: MatchJobsRequest = {}): Promise<JobMatchResult> {
  if (!req.userId) {
    throw new Error('Sign in to load job matches.');
  }

  return extractApiData<JobMatchResult>(
    await aiApi.get('/ai/jobs/match', {
      params: {
        userId: req.userId,
        targetRole: req.targetRole ?? 'Software Engineer',
        topN: req.topN ?? 10,
        ...(req.resumeText ? { resumeText: req.resumeText } : {}),
        ...(req.location ? { location: req.location } : {}),
        ...(req.experienceYears !== undefined ? { experienceYears: req.experienceYears } : {}),
        ...(req.forceRefresh ? { forceRefresh: true } : {}),
      },
    })
  );
}
