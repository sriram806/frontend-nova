'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { apiGet, apiPost } from '@/lib/api/client';
import { getApiErrorMessage } from '@/lib/api/errors';
import { SkillSummary } from '@/types/platform';

export function useSkillsQuery() {
  return useQuery({
    queryKey: ['skills-summary'],
    queryFn: () => apiGet<SkillSummary[]>('/api/skills'),
  });
}

export function useRetakeSkillMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (skill: string) => apiPost<{ skill: string }, { message: string }>('/api/skills/retake', { skill }),
    onSuccess: () => {
      toast.success('Retake scheduled successfully.');
      void queryClient.invalidateQueries({ queryKey: ['skills-summary'] });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Unable to schedule retake.'));
    },
  });
}
