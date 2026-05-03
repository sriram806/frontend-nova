'use client';

import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { userApi, extractApiData, getApiErrorMessage } from '@/lib/api';
import { ResumeInput, TargetRoleInput } from '@/lib/schemas/onboarding';

type RolesResponse = {
  roles: string[];
};

export function useTargetRolesQuery() {
  return useQuery({
    queryKey: ['target-roles'],
    queryFn: async () => {
      const response = await userApi.get('/onboarding/target-roles');
      return extractApiData<RolesResponse>(response);
    },
    select: (payload) => payload.roles,
    initialData: { roles: [] },
  });
}

export function useSaveTargetRoleMutation() {
  return useMutation({
    mutationFn: async (payload: TargetRoleInput) => {
      const response = await userApi.post('/onboarding/target-role', payload);
      return extractApiData<{ message: string }>(response);
    },
    onSuccess: () => {
      toast.success('Target role saved.');
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Unable to save target role.'));
    },
  });
}

type SaveResumePayload = {
  resume: ResumeInput;
  mode?: 'draft' | 'final';
};

export function useSaveResumeMutation() {
  return useMutation({
    mutationFn: async ({ resume, mode = 'final' }: SaveResumePayload) => {
      const response = await userApi.post('/onboarding/resume', {
        mode,
        resume,
      });
      return extractApiData<{ message: string }>(response);
    },
    onSuccess: (_data, variables) => {
      toast.success(variables.mode === 'draft' ? 'Resume draft saved.' : 'Resume saved.');
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Unable to save resume.'));
    },
  });
}
