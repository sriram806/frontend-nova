'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { scheduleProactiveRefresh } from '@/lib/api';

export function AuthInitializer() {
  const token = useAuthStore((state) => state.accessToken);
  const refreshUser = useAuthStore((state) => state.refreshUser);

  useEffect(() => {
    if (token) {
      scheduleProactiveRefresh(token);
      // Sync user profile on mount
      refreshUser();
    }
  }, [token, refreshUser]);

  return null;
}
