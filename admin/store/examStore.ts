'use client';

import { create } from 'zustand';
import { createJSONStorage, persist, StateStorage } from 'zustand/middleware';
import { ExamQuestionReview, ExamSession, SubmitExamResult } from '@/types/platform';

type ExamState = {
  session: ExamSession | null;
  currentQuestionId: string | null;
  answers: Record<string, string>;
  timeRemainingInSeconds: number;
  result: SubmitExamResult | null;
  reviewQuestions: ExamQuestionReview[];
  setSession: (session: ExamSession) => void;
  setCurrentQuestionId: (id: string) => void;
  setAnswer: (questionId: string, value: string) => void;
  setResult: (result: SubmitExamResult | null) => void;
  tick: () => void;
  reset: () => void;
};

const initialState = {
  session: null,
  currentQuestionId: null,
  answers: {},
  timeRemainingInSeconds: 0,
  result: null,
  reviewQuestions: [],
};

const noopStorage: StateStorage = {
  getItem: () => null,
  setItem: () => undefined,
  removeItem: () => undefined,
};

export const useExamStore = create<ExamState>()(
  persist(
    (set) => ({
      ...initialState,
      setSession: (session) =>
        set((state) => {
          const isSameSession = state.session?.id === session.id;
          return {
            session,
            currentQuestionId: isSameSession
              ? (state.currentQuestionId ?? session.questions[0]?.id ?? null)
              : (session.questions[0]?.id ?? null),
            timeRemainingInSeconds: session.timeRemainingInSeconds,
            answers: isSameSession ? state.answers : {},
            result: isSameSession ? state.result : null,
            reviewQuestions: isSameSession ? state.reviewQuestions : [],
          };
        }),
      setCurrentQuestionId: (id) => set({ currentQuestionId: id }),
      setAnswer: (questionId, value) =>
        set((state) => ({
          answers: {
            ...state.answers,
            [questionId]: value,
          },
        })),
      setResult: (result) =>
        set({
          result,
          reviewQuestions: result?.questions ?? [],
        }),
      tick: () =>
        set((state) => ({
          timeRemainingInSeconds: Math.max(0, state.timeRemainingInSeconds - 1),
        })),
      reset: () => set({ ...initialState }),
    }),
    {
      name: 'think-ai-exam-session',
      storage: createJSONStorage(() => (typeof window === 'undefined' ? noopStorage : sessionStorage)),
    }
  )
);
