import { aiApi, extractApiData } from '@/services/api';
import type { CareerAnalyzeApiResponse, CareerAnalyzeRequest, CareerReport } from '@/types/career';

const CAREER_ENDPOINT = '/ai/career';

function isErrorApiResponse(value: unknown): value is { success: false; message?: string; error?: string } {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const root = value as Record<string, unknown>;
  return root.success === false;
}

function clampScore(value: number): number {
  return Math.max(0, Math.min(100, value));
}

function toStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item): item is string => typeof item === 'string');
}

function toNumber(value: unknown, fallback = 0): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function toStringValue(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback;
}

function normalizeCareerReport(value: unknown): CareerReport | null {
  if (!value || typeof value !== 'object') {
    return null;
  }

  const source = value as Record<string, unknown>;
  const marketInsightsRaw = (source.marketInsights ?? {}) as Record<string, unknown>;
  const metadataRaw = (source.metadata ?? {}) as Record<string, unknown>;

  return {
    userId: toStringValue(source.userId),
    targetRole: toStringValue(source.targetRole),
    readinessScore: clampScore(toNumber(source.readinessScore)),
    strengths: toStringArray(source.strengths),
    skillGaps: toStringArray(source.skillGaps),
    recommendations: toStringArray(source.recommendations),
    marketInsights: {
      trend: toStringValue(marketInsightsRaw.trend),
      demandLevel: toStringValue(marketInsightsRaw.demandLevel),
      topSkillsToPrioritize: toStringArray(marketInsightsRaw.topSkillsToPrioritize),
    },
    modelVersion: toStringValue(source.modelVersion),
    similarityScore: clampScore(toNumber(source.similarityScore)),
    matchedSkills: toStringArray(source.matchedSkills),
    extractedSkills: toStringArray(source.extractedSkills),
    source: toStringValue(source.source),
    createdAt: toStringValue(source.createdAt),
    metadata: {
      githubScore:
        typeof metadataRaw.githubScore === 'number' && Number.isFinite(metadataRaw.githubScore)
          ? metadataRaw.githubScore
          : undefined,
      quizScore:
        typeof metadataRaw.quizScore === 'number' && Number.isFinite(metadataRaw.quizScore)
          ? metadataRaw.quizScore
          : undefined,
      experienceYears:
        typeof metadataRaw.experienceYears === 'number' && Number.isFinite(metadataRaw.experienceYears)
          ? metadataRaw.experienceYears
          : undefined,
      entityCount:
        typeof metadataRaw.entityCount === 'number' && Number.isFinite(metadataRaw.entityCount)
          ? metadataRaw.entityCount
          : undefined,
    },
  };
}

async function requestCareerReport(url: string, init: RequestInit): Promise<CareerReport | null> {
  let response: Response;

  try {
    response = await fetch(url, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...(init.headers ?? {}),
      },
      cache: 'no-store',
    });
  } catch {
    throw new Error('Unable to connect to the AI service. Please try again.');
  }

  if (!response.ok) {
    const bodyText = await response.text();
    const reason = bodyText || `Request failed with status ${response.status}`;
    throw new Error(reason);
  }

  const json = (await response.json()) as CareerAnalyzeApiResponse | { data?: unknown; success?: boolean };

  if (isErrorApiResponse(json)) {
    throw new Error(json.message ?? json.error ?? 'Career analysis failed.');
  }

  if (!('data' in json)) {
    throw new Error('Invalid response format from AI service.');
  }

  return normalizeCareerReport(json.data);
}

export async function analyzeCareer(payload: CareerAnalyzeRequest): Promise<CareerReport> {
  const report = normalizeCareerReport(extractApiData<unknown>(await aiApi.post(CAREER_ENDPOINT, payload)));

  if (!report) {
    throw new Error('AI service returned an empty analysis result.');
  }

  return report;
}

export async function getLatestCareerReport(userId: string): Promise<CareerReport | null> {
  try {
    const response = await aiApi.get(`${CAREER_ENDPOINT}/latest`, {
      params: {
        userId,
      },
    });

    return normalizeCareerReport(extractApiData<unknown>(response));
  } catch {
    return null;
  }
}
