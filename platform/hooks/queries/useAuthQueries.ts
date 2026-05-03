'use client';

import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { apiPost } from '@/lib/api/client';
import { getApiErrorMessage } from '@/lib/api/errors';
import { ForgotPasswordInput, LoginInput, RegisterInput } from '@/lib/schemas/auth';
import { AuthPayload } from '@/types/platform';
import { useAuthStore } from '@/store/authStore';

type GenericAuthResponse = {
  message: string;
};

export function useLoginMutation() {
  const setSession = useAuthStore((state) => state.setSession);

  return useMutation({
    mutationFn: (payload: LoginInput) => apiPost<LoginInput, AuthPayload>('/api/auth/login', payload),
    onSuccess: (response) => {
      setSession(response);
      toast.success('Welcome back. Login successful.');
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Unable to login.'));
    },
  });
}

export function useRegisterMutation() {
  return useMutation({
    mutationFn: (payload: RegisterInput) => apiPost<RegisterInput, AuthPayload>('/api/auth/register', payload),
    onSuccess: () => {
      toast.success('Registration complete. Your account is ready.');
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Unable to register your account.'));
    },
  });
}

export function useForgotPasswordMutation() {
  return useMutation({
    mutationFn: (payload: ForgotPasswordInput) =>
      apiPost<ForgotPasswordInput, GenericAuthResponse>('/api/auth/forgot-password', payload),
    onSuccess: () => {
      toast.success('Password reset OTP sent to your email.');
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Unable to send reset instructions.'));
    },
  });
}
