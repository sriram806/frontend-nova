'use client';

import { create } from 'zustand';
import { createJSONStorage, persist, StateStorage } from 'zustand/middleware';
import { UserProfile } from '@/types/platform';
import { userService } from '@/services/userService';
import { scheduleProactiveRefresh, cancelProactiveRefresh } from '@/lib/api';

const ACCESS_TOKEN_STORAGE_KEY = 'think-ai-access-token';
const AUTH_COOKIE_NAME = 'think_ai_session';

const noopStorage: StateStorage = {
  getItem: () => null,
  setItem: () => undefined,
  removeItem: () => undefined,
};

type AuthState = {
  isAuthenticated: boolean;
  accessToken: string | null;
  refreshToken: string | null;
  user: UserProfile | null;
  setSession: (payload: { accessToken: string; refreshToken?: string; user: UserProfile }) => void;
  clearSession: () => void;
  setUser: (user: UserProfile) => void;
  refreshUser: () => Promise<void>;
};

function setAuthCookie() {
  if (typeof document === 'undefined') {
    return;
  }
  document.cookie = `${AUTH_COOKIE_NAME}=1; path=/; max-age=604800; SameSite=Lax`;
}

function clearAuthCookie() {
  if (typeof document === 'undefined') {
    return;
  }
  document.cookie = `${AUTH_COOKIE_NAME}=; path=/; max-age=0; SameSite=Lax`;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      accessToken: null,
      refreshToken: null,
      user: null,
      setSession: ({ accessToken, refreshToken, user }) => {
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, accessToken);
        }

        setAuthCookie();
        set({
          isAuthenticated: true,
          accessToken,
          refreshToken: refreshToken ?? null,
          user,
        });
        
        // Schedule refresh for the 15-min token
        scheduleProactiveRefresh(accessToken);
      },
      clearSession: () => {
        if (typeof window !== 'undefined') {
          window.localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
        }

        cancelProactiveRefresh();
        clearAuthCookie();
        set({
          isAuthenticated: false,
          accessToken: null,
          refreshToken: null,
          user: null,
        });
      },
      setUser: (user) => set({ user }),
      refreshUser: async () => {
        try {
          const user = await userService.getCurrentUser();
          if (user) {
            set({ user });
          }
        } catch (error) {
          console.error('Failed to refresh user profile:', error);
        }
      },
    }),
    {
      name: 'think-ai-auth',
      storage: createJSONStorage(() => (typeof window === 'undefined' ? noopStorage : localStorage)),
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        user: state.user,
      }),
    }
  )
);
