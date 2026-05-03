'use client';

import { create } from 'zustand';
import { createJSONStorage, persist, StateStorage } from 'zustand/middleware';
import {
  BillingPlan,
  CurrentSubscription,
  getCurrentSubscription,
  verifyBillingPayment
} from '@/services/billingService';

const noopStorage: StateStorage = {
  getItem: () => null,
  setItem: () => undefined,
  removeItem: () => undefined,
};

type BillingState = {
  subscription: CurrentSubscription | null;
  isLoading: boolean;
  error: string | null;
  fetchSubscription: () => Promise<void>;
  updateSubscriptionLocally: (subscription: CurrentSubscription) => void;
  verifyAndSync: (paymentData: {
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
  }) => Promise<boolean>;
};

export const useBillingStore = create<BillingState>()(
  persist(
    (set, get) => ({
      subscription: null,
      isLoading: false,
      error: null,

      fetchSubscription: async () => {
        set({ isLoading: true, error: null });
        try {
          const subscription = await getCurrentSubscription();
          set({ subscription, isLoading: false });
        } catch (err: any) {
          set({
            subscription: null,
            error: err.response?.data?.message || 'Failed to fetch subscription',
            isLoading: false
          });
          // If 404 or auth error, default to null
        }
      },

      updateSubscriptionLocally: (subscription) => {
        set({ subscription });
      },

      verifyAndSync: async (paymentData) => {
        set({ isLoading: true });
        try {
          const result = await verifyBillingPayment(paymentData);
          if (result.verified) {
            set((state) => ({
              subscription: {
                ...(state.subscription || { status: 'active' }),
                plan: result.plan,
                endDate: result.endDate,
                status: 'active'
              },
              isLoading: false
            }));
            return true;
          }
          set({ isLoading: false });
          return false;
        } catch (err) {
          set({ isLoading: false });
          return false;
        }
      },
    }),
    {
      name: 'think-ai-billing',
      storage: createJSONStorage(() => (typeof window === 'undefined' ? noopStorage : localStorage)),
    }
  )
);
