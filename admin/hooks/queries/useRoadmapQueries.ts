'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { apiGet, apiPatch } from '@/lib/api/client';
import { getApiErrorMessage } from '@/lib/api/errors';
import { RoadmapMilestone } from '@/types/platform';

export function useRoadmapQuery() {
  return useQuery({
    queryKey: ['roadmap'],
    queryFn: () => apiGet<RoadmapMilestone[]>('/api/roadmap'),
  });
}

export function useToggleRoadmapTaskMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: { milestoneId: string; taskId: string; completed: boolean }) =>
      apiPatch<typeof payload, { message: string }>('/api/roadmap/task', payload),
    onSuccess: () => {
      toast.success('Roadmap updated.');
      void queryClient.invalidateQueries({ queryKey: ['roadmap'] });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Unable to update task.'));
    },
  });
}
