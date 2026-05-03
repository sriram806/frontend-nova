'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { scheduleProactiveRefresh } from '@/lib/api';

export function AuthInitializer() {
  const token = useAuthStore((state) => state.accessToken);

  useEffect(() => {
    if (token) {
      scheduleProactiveRefresh(token);
    }
  }, [token]);

  return null;
}
