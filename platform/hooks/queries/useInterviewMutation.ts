'use client';

import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { apiPost } from '@/lib/api/client';
import { getApiErrorMessage } from '@/lib/api/errors';
import { InterviewMessage } from '@/types/platform';

type AskInterviewPayload = {
  sessionId?: string;
  message: string;
};

type AskInterviewResponse = {
  reply: InterviewMessage;
  sessionId: string;
};

export function useInterviewMutation() {
  return useMutation({
    mutationFn: (payload: AskInterviewPayload) =>
      apiPost<AskInterviewPayload, AskInterviewResponse>('/api/interview/message', payload),
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Interview service is unavailable.'));
    },
  });
}
