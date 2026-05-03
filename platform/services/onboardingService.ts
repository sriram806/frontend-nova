import { extractApiData, userApi } from '@/services/api';
import type { StoredResumeRecord, StructuredResume } from '@/services/resumeService';

export type TargetRolePayload = {
  title: string;
  level: 'intern' | 'junior' | 'mid' | 'senior' | 'lead';
  industry?: string;
  locationPreference?: string;
  keywords: string[];
};

export type OnboardingStatus = {
  subscriptionActive: boolean;
  resumeCompleted: boolean;
  targetRoleCompleted: boolean;
  isOnboarded: boolean;
  currentStep: 'subscription' | 'resume' | 'target_role' | 'complete';
  nextPath: string;
  resume: StoredResumeRecord | null;
  targetRole: (TargetRolePayload & { id: string }) | null;
};

export async function saveOnboardingResume(resume: StructuredResume, mode: 'draft' | 'final') {
  return extractApiData<{ resume: StoredResumeRecord; onboarding: OnboardingStatus }>(
    await userApi.post('/onboarding/resume', {
      mode,
      resume,
    })
  );
}

export async function saveOnboardingTargetRole(payload: TargetRolePayload) {
  return extractApiData<OnboardingStatus>(await userApi.post('/onboarding/target-role', payload));
}

export async function getOnboardingStatus() {
  return extractApiData<OnboardingStatus>(await userApi.get('/onboarding/status'));
}
