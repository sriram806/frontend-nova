import { create } from 'zustand';
import { getApiErrorMessage } from '@/lib/api';
import {
  createAnalysisJob,
  pollAnalysisJob,
  type AsyncJobResult,
  type CreateAnalysisJobPayload,
} from '@/services/analysisService';
import { subscribeToBilling, type BillingSubscriptionResponse } from '@/services/billingService';
import { createInterviewSession, type InterviewSession } from '@/services/interviewService';
import { matchJobs, type JobMatchResult, type MatchJobsRequest } from '@/services/jobsService';
import {
  generateRoadmap,
  getCurrentRoadmap,
  type GenerateRoadmapRequest,
  type RoadmapResult,
} from '@/services/roadmapService';
import {
  analyzeStructuredResume,
  rewriteResumeSection,
  type ResumeAnalysisResult,
  type ResumeSectionRewriteResult,
  type StructuredResume,
} from '@/services/resumeService';
import type { CareerReport } from '@/types/career';

export type WorkflowFeature = 'career' | 'resume' | 'roadmap' | 'jobs' | 'interview' | 'billing';

type AsyncJobState = AsyncJobResult<unknown> & {
  feature: WorkflowFeature;
};

type WorkflowState = {
  jobs: Record<string, AsyncJobState>;
  activeJobIds: Partial<Record<WorkflowFeature, string>>;
  careerReport: CareerReport | null;
  resumeAnalysis: ResumeAnalysisResult | null;
  roadmap: RoadmapResult | null;
  jobMatches: JobMatchResult | null;
  interviewSession: InterviewSession | null;
  billing: BillingSubscriptionResponse | null;
  loading: Partial<Record<WorkflowFeature, boolean>>;
  errors: Partial<Record<WorkflowFeature, string | null>>;
  resumeRewrite: ResumeSectionRewriteResult | null;

  setCareerReport: (report: CareerReport | null) => void;
  setResumeAnalysisState: (analysis: ResumeAnalysisResult | null) => void;
  upsertJob: (job: AsyncJobState) => void;
  applyRealtimeJobEvent: (eventName: string, payload: AsyncJobResult<unknown> & { type?: string }) => void;
  clearWorkflowError: (feature: WorkflowFeature) => void;

  // Thunks
  submitCareerAnalysis: (payload: CreateAnalysisJobPayload) => Promise<void>;
  submitResumeAnalysis: (payload: { resume: StructuredResume; userId?: string; targetRole?: string; jobDescription?: string }) => Promise<void>;
  submitResumeRewrite: (payload: { sectionText: string; sectionName: string; role: string; userId?: string }) => Promise<void>;
  fetchRoadmap: (userId?: string) => Promise<void>;
  submitRoadmapGeneration: (payload: GenerateRoadmapRequest) => Promise<void>;
  fetchJobMatches: (payload?: MatchJobsRequest) => Promise<void>;
  createInterviewSessionThunk: (payload: { role: string; mode?: string }) => Promise<void>;
  subscribeBillingThunk: (payload: { plan: 'LITE' | 'PRO' | 'ENTERPRISE' }) => Promise<void>;
};

export const useWorkflowStore = create<WorkflowState>((set, get) => ({
  jobs: {},
  activeJobIds: {},
  careerReport: null,
  resumeAnalysis: null,
  roadmap: null,
  jobMatches: null,
  interviewSession: null,
  billing: null,
  loading: {},
  errors: {},
  resumeRewrite: null,

  setCareerReport: (report) => set({ careerReport: report }),
  setResumeAnalysisState: (analysis) => set({ resumeAnalysis: analysis }),
  upsertJob: (job) =>
    set((state) => ({
      jobs: { ...state.jobs, [job.jobId]: job },
      activeJobIds: { ...state.activeJobIds, [job.feature]: job.jobId },
    })),
  applyRealtimeJobEvent: (eventName, payload) =>
    set((state) => {
      const featureMap: Record<string, WorkflowFeature> = {
        analysis: 'career',
        resume: 'resume',
        roadmap: 'roadmap',
        jobs: 'jobs',
      };

      const inferredType = payload.type ?? eventName.split(':')[0] ?? 'career';
      const feature = featureMap[inferredType] ?? 'career';

      const newState = {
        jobs: {
          ...state.jobs,
          [payload.jobId]: {
            ...payload,
            feature,
          },
        },
        activeJobIds: {
          ...state.activeJobIds,
          [feature]: payload.jobId,
        },
        careerReport: state.careerReport,
      };

      if (payload.status === 'completed' && feature === 'career' && payload.result) {
        newState.careerReport = payload.result as CareerReport;
      }

      return newState;
    }),
  clearWorkflowError: (feature) =>
    set((state) => ({
      errors: { ...state.errors, [feature]: null },
    })),

  submitCareerAnalysis: async (payload) => {
    set((state) => ({ loading: { ...state.loading, career: true }, errors: { ...state.errors, career: null } }));
    try {
      const created = await createAnalysisJob(payload);
      get().upsertJob({ jobId: created.jobId, status: created.status, feature: 'career' });

      const result = await pollAnalysisJob(created.jobId, {
        onTick: (job) => {
          get().upsertJob({ ...job, feature: 'career' });
        },
      });

      set((state) => ({
        loading: { ...state.loading, career: false },
        jobs: { ...state.jobs, [result.jobId]: { ...result, feature: 'career' } },
        activeJobIds: { ...state.activeJobIds, career: result.jobId },
        careerReport: result.result as CareerReport ?? null,
      }));
    } catch (error) {
      set((state) => ({
        loading: { ...state.loading, career: false },
        errors: { ...state.errors, career: getApiErrorMessage(error, 'Unable to submit career analysis.') }
      }));
    }
  },

  submitResumeAnalysis: async (payload) => {
    set((state) => ({ loading: { ...state.loading, resume: true }, errors: { ...state.errors, resume: null } }));
    try {
      const result = await analyzeStructuredResume(payload.resume, payload.userId, payload.targetRole, payload.jobDescription);
      set((state) => ({ loading: { ...state.loading, resume: false }, resumeAnalysis: result }));
    } catch (error) {
      set((state) => ({
        loading: { ...state.loading, resume: false },
        errors: { ...state.errors, resume: getApiErrorMessage(error, 'Unable to analyze resume.') }
      }));
    }
  },

  submitResumeRewrite: async (payload) => {
    try {
      const result = await rewriteResumeSection(payload.sectionText, payload.sectionName, payload.role, payload.userId);
      set({ resumeRewrite: result });
    } catch (error) {
      // no loading state handled in old slice for rewrite
    }
  },

  fetchRoadmap: async (userId) => {
    set((state) => ({ loading: { ...state.loading, roadmap: true }, errors: { ...state.errors, roadmap: null } }));
    try {
      const result = await getCurrentRoadmap(userId);
      set((state) => ({ loading: { ...state.loading, roadmap: false }, roadmap: result }));
    } catch (error) {
      set((state) => ({
        loading: { ...state.loading, roadmap: false },
        errors: { ...state.errors, roadmap: getApiErrorMessage(error, 'Unable to load roadmap.') }
      }));
    }
  },

  submitRoadmapGeneration: async (payload) => {
    set((state) => ({ loading: { ...state.loading, roadmap: true }, errors: { ...state.errors, roadmap: null } }));
    try {
      const result = await generateRoadmap(payload);
      set((state) => ({ loading: { ...state.loading, roadmap: false }, roadmap: result }));
    } catch (error) {
      set((state) => ({
        loading: { ...state.loading, roadmap: false },
        errors: { ...state.errors, roadmap: getApiErrorMessage(error, 'Unable to generate roadmap.') }
      }));
    }
  },

  fetchJobMatches: async (payload) => {
    set((state) => ({ loading: { ...state.loading, jobs: true }, errors: { ...state.errors, jobs: null } }));
    try {
      const result = await matchJobs(payload);
      set((state) => ({ loading: { ...state.loading, jobs: false }, jobMatches: result }));
    } catch (error) {
      set((state) => ({
        loading: { ...state.loading, jobs: false },
        errors: { ...state.errors, jobs: getApiErrorMessage(error, 'Unable to load job matches.') }
      }));
    }
  },

  createInterviewSessionThunk: async (payload) => {
    try {
      const result = await createInterviewSession(payload);
      set({ interviewSession: result });
    } catch (error) {
    }
  },

  subscribeBillingThunk: async (payload) => {
    try {
      const result = await subscribeToBilling(payload.plan);
      set({ billing: result });
    } catch (error) {
    }
  },

}));
