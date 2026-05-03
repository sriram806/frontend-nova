import { aiApi, extractApiData } from '@/services/api';

export interface RoadmapDay {
  day: string;
  topic: string;
  tasks: string[];
  done?: boolean;
  resources?: string[];
}

export interface RoadmapPhase {
  title: string;
  range: string;
  days: RoadmapDay[];
}

export interface RoadmapResult {
  userId: string;
  targetRole: string;
  durationDays: number;
  phases: RoadmapPhase[];
  totalTasks?: number;
  completedTasks?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface GenerateRoadmapRequest {
  userId?: string;
  targetRole: string;
  skillGaps?: string[];
  durationDays?: number;
  adaptiveContext?: Record<string, unknown>;
  forceRefresh?: boolean;
}

export interface AdaptRoadmapRequest {
  userId?: string;
  targetRole: string;
  skillGaps?: string[];
  missedDays?: number[];
  irrelevantTasks?: string[];
  baseRoadmap?: RoadmapResult;
}

export async function generateRoadmap(req: GenerateRoadmapRequest): Promise<RoadmapResult> {
  if (!req.userId) {
    throw new Error('Sign in to generate a roadmap.');
  }

  return extractApiData<RoadmapResult>(
    await aiApi.post('/ai/roadmap/generate', { durationDays: 90, ...req })
  );
}

export async function getCurrentRoadmap(userId?: string): Promise<RoadmapResult | null> {
  if (!userId) {
    return null;
  }

  try {
    return extractApiData<RoadmapResult>(
      await aiApi.get('/ai/roadmap/current', {
        params: {
          userId,
        },
      })
    );
  } catch {
    return null;
  }
}

export async function adaptRoadmap(req: AdaptRoadmapRequest): Promise<RoadmapResult> {
  if (!req.userId) {
    throw new Error('Sign in to adapt your roadmap.');
  }

  return extractApiData<RoadmapResult>(
    await aiApi.post('/ai/roadmap/adapt', req)
  );
}
