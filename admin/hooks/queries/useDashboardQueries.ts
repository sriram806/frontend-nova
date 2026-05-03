'use client';

import { useQuery } from '@tanstack/react-query';
import { userApi, extractApiData } from '@/lib/api';
import { DashboardOverview, UserProfile } from '@/types/platform';
import { useAuthStore } from '@/store/authStore';

export function useDashboardOverviewQuery() {
  return useQuery({
    queryKey: ['dashboard-overview'],
    queryFn: async () => {
      // Call user-service (port 4002) to load user details
      const response = await userApi.get<UserProfile | { data: UserProfile; success: boolean }>('/users/me');
      const user = extractApiData<UserProfile>(response);

      // Update the user details in the auth store
      const currentToken = useAuthStore.getState().accessToken;
      if (currentToken) {
        useAuthStore.getState().setSession({ accessToken: currentToken, user: user });
      }

      // Return a simulated dashboard overview since the UI requires these fields
      return {
        greeting: 'ready to conquer today?',
        streak: 3,
        tasksDueToday: 2,
        skillProgress: [],
        recommendations: [],
        activity: [],
      } as DashboardOverview;
    },
  });
}
