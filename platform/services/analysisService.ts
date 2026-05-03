import { requestFirst, userApi } from '@/lib/api';
import type { CareerReport } from '@/types/career';

export type AsyncJobStatus = 'pending' | 'processing' | 'completed' | 'failed';

export type AsyncJobResult<T> = {
  jobId: string;
  status: AsyncJobStatus;
  type?: string;
  progress?: number;
  result?: T;
  error?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type CreateAnalysisJobPayload = {
  targetRole?: string;
  resumeData?: {
    resumeText?: string;
    githubScore?: number;
    quizScore?: number;
  };
};

type PollOptions<T> = {
  intervalMs?: number;
  timeoutMs?: number;
  onTick?: (job: AsyncJobResult<T>) => void;
};

function wait(ms: number) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

export async function createAnalysisJob(payload: CreateAnalysisJobPayload) {
  return requestFirst<{ jobId: string; status: AsyncJobStatus }>([
    () => userApi.post('/ai/analysis/jobs', payload),
  ]);
}

export async function getAnalysisJob(jobId: string) {
  return requestFirst<AsyncJobResult<CareerReport>>([
    () => userApi.get(`/ai/analysis/jobs/${jobId}`),
  ]);
}

export async function pollAnalysisJob(jobId: string, options: PollOptions<CareerReport> = {}) {
  const intervalMs = options.intervalMs ?? 2500;
  const timeoutMs = options.timeoutMs ?? 60000;
  const startedAt = Date.now();

  while (Date.now() - startedAt < timeoutMs) {
    const job = await getAnalysisJob(jobId);
    options.onTick?.(job);

    if (job.status === 'completed' || job.status === 'failed') {
      return job;
    }

    await wait(intervalMs);
  }

  throw new Error('Timed out while waiting for analysis to complete.');
}
