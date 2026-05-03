'use client';

import { create } from 'zustand';
import { createJSONStorage, persist, StateStorage } from 'zustand/middleware';
import { ResumeInput, TargetRoleInput } from '@/lib/schemas/onboarding';

const noopStorage: StateStorage = {
  getItem: () => null,
  setItem: () => undefined,
  removeItem: () => undefined,
};

type UserState = {
  targetRole: TargetRoleInput | null;
  resumeDraft: ResumeInput | null;
  lastSavedAt: string | null;
  setTargetRole: (payload: TargetRoleInput) => void;
  setResumeDraft: (payload: ResumeInput) => void;
  clearOnboarding: () => void;
};

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      targetRole: null,
      resumeDraft: null,
      lastSavedAt: null,
      setTargetRole: (payload) => {
        set({ targetRole: payload, lastSavedAt: new Date().toISOString() });
      },
      setResumeDraft: (payload) => {
        set({ resumeDraft: payload, lastSavedAt: new Date().toISOString() });
      },
      clearOnboarding: () => {
        set({
          targetRole: null,
          resumeDraft: null,
          lastSavedAt: null,
        });
      },
    }),
    {
      name: 'think-ai-user',
      storage: createJSONStorage(() => (typeof window === 'undefined' ? noopStorage : localStorage)),
      partialize: (state) => ({
        targetRole: state.targetRole,
        resumeDraft: state.resumeDraft,
        lastSavedAt: state.lastSavedAt,
      }),
    }
  )
);
