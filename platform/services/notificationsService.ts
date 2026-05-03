import { api, requestFirst } from '@/lib/api';
import type { NotificationItem } from '@/services/userService';

export async function fetchNotifications() {
  return requestFirst<NotificationItem[]>([
    () => api.get('/notifications'),
  ]);
}
