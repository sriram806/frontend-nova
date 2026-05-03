import { authApi, requestFirst, userApi } from '@/services/api';
import type { UserProfile } from '@/types/platform';

type LoginPayload = {
  email: string;
  password: string;
};

type RegisterPayload = {
  name: string;
  email: string;
  password: string;
};

export const authService = {
  login(data: LoginPayload) {
    return authApi.post('/auth/login', data);
  },
  register(data: RegisterPayload) {
    return authApi.post('/auth/register', {
      email: data.email,
      password: data.password,
      fullName: data.name,
    });
  },
  refreshToken() {
    return authApi.post('/auth/refresh-token');
  },
  logout() {
    return authApi.delete('/auth/logout');
  },
  getCurrentUser() {
    return requestFirst<UserProfile>([
      () => userApi.get('/users/me'),
    ]);
  },
  updateCurrentUser(data: Record<string, unknown>) {
    return requestFirst<UserProfile>([
      () => userApi.patch('/users/me', data),
    ]);
  },
  forgotPassword(email: string) {
    return authApi.post('/auth/forgot-password', { email });
  },
  resetPassword(email: string, otp: string, newPassword: string) {
    return authApi.post('/auth/reset-password', {
      email,
      otp,
      newPassword,
    });
  },
  sendVerifyOtp(email: string) {
    return authApi.post('/auth/send-verify-otp', { email });
  },
  verifyEmail(email: string, otp: string) {
    return authApi.post('/auth/verify-email', { email, otp });
  },
};
