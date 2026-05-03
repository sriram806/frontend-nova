'use client';

import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { authService } from '@/services/authService';
import { getApiErrorMessage } from '@/lib/api/errors';
import { ForgotPasswordInput, LoginInput, RegisterInput } from '@/lib/schemas/auth';
import { useAuthStore } from '@/store/authStore';

export function useLoginMutation() {
  const setSession = useAuthStore((state) => state.setSession);

  return useMutation({
    mutationFn: async (payload: LoginInput) => {
      const response = await authService.login(payload);
      return response.data?.data ?? response.data;
    },
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
    mutationFn: async (payload: RegisterInput) => {
      const response = await authService.register(payload);
      return response.data?.data ?? response.data;
    },
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
    mutationFn: async (payload: ForgotPasswordInput) => {
      const response = await authService.forgotPassword(payload.email);
      return response.data?.data ?? response.data;
    },
    onSuccess: () => {
      toast.success('Password reset OTP sent to your email.');
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Unable to send reset instructions.'));
    },
  });
}
