import { userApi, extractApiData } from '@/lib/api';
import type { NotificationItem } from '@/services/userService';

export type SendNotificationPayload = {
  target: {
    type: 'user' | 'many' | 'broadcast';
    userId?: string;
    userIds?: string[];
  };
  title: string;
  message: string;
  category: 'info' | 'success' | 'warning' | 'error' | 'system' | 'promotion';
  actionUrl?: string;
  notificationType: 'in_app' | 'email';
  emailTemplate?: 'admin_message';
};

export async function fetchNotifications(page = 1, limit = 20) {
  const response = await userApi.get(`/admin/notifications?page=${page}&limit=${limit}`);
  return extractApiData<{ notifications: NotificationItem[]; total: number }>(response);
}

export async function sendNotification(payload: SendNotificationPayload) {
  const response = await userApi.post('/admin/notifications/send', payload);
  return extractApiData<any>(response);
}

export async function markNotificationsRead(notificationIds?: string[]) {
  const response = await userApi.patch('/admin/notifications/read', { notificationIds });
  return extractApiData<any>(response);
}
