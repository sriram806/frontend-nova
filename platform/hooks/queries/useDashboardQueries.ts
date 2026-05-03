'use client';

import { useQuery } from '@tanstack/react-query';
import { userApi, extractApiData } from '@/lib/api';
import { DashboardOverview, UserProfile } from '@/types/platform';
import { useAuthStore } from '@/store/authStore';
import { apiGet } from '@/lib/api/client';

export function useDashboardOverviewQuery() {
  return useQuery({
    queryKey: ['dashboard-overview'],
    queryFn: async () => {
      // 1. Fetch real dashboard insights from exam-service
      const insights = await apiGet<DashboardOverview>('/api/exam/dashboard/insights');

      // 2. Refresh user data in background (silent sync)
      try {
        const response = await userApi.get<UserProfile | { data: UserProfile; success: boolean }>('/users/me');
        const user = extractApiData<UserProfile>(response);
        const currentToken = useAuthStore.getState().accessToken;
        if (currentToken) {
          useAuthStore.getState().setSession({ accessToken: currentToken, user: user });
        }
      } catch (e) {
        console.error('Silent user sync failed:', e);
      }

      return insights;
    },
  });
}
