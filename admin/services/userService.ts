import { extractApiData, userApi } from '@/services/api';
import type { UserProfile } from '@/types/platform';

export type NotificationItem = {
  id: string;
  title: string;
  message: string;
  category: string;
  actionUrl?: string;
  read: boolean;
  createdAt: string;
};

export const userService = {
  async getCurrentUser() {
    return extractApiData<UserProfile>(await userApi.get('/users/me'));
  },
  async updateCurrentUser(payload: Partial<UserProfile>) {
    return extractApiData<UserProfile>(await userApi.patch('/users/me', payload));
  },
  async getNotifications() {
    return [];
  },
};
