import { billingApi, extractApiData, requestFirst } from '@/lib/api';

export type BillingPlan = 'LITE' | 'PRO' | 'ENTERPRISE';

export type BillingSubscriptionResponse = {
  subscription?: {
    id: string;
    plan: BillingPlan;
    status: string;
    endDate?: string;
  };
  checkout?: unknown;
  order?: {
    id: string;
    amount: number;
    currency: string;
  };
  keyId?: string;
  amount?: number;
  currency?: string;
  plan?: BillingPlan;
  idempotent?: boolean;
};

export type CurrentSubscription = {
  plan: BillingPlan;
  status: string;
  endDate?: string;
  isInGracePeriod?: boolean;
};

const ACTIVE_SUBSCRIPTION_STATUSES = new Set(['active', 'paid', 'trialing']);

export function hasActiveSubscription(
  subscription: Pick<CurrentSubscription, 'status'> | null | undefined
): boolean {
  if (!subscription?.status) {
    return false;
  }

  return ACTIVE_SUBSCRIPTION_STATUSES.has(subscription.status.trim().toLowerCase());
}

export type PaymentStatusResponse = {
  orderId: string;
  paymentId?: string;
  status: 'created' | 'authorized' | 'captured' | 'paid' | 'failed';
  plan: BillingPlan;
  amount: number;
  currency: string;
  attempts: number;
  failureCode?: string;
  failureReason?: string;
};

function makeIdempotencyKey(plan: BillingPlan) {
  return `billing_${plan}_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

export async function createBillingOrder(plan: BillingPlan, idempotencyKey = makeIdempotencyKey(plan)) {
  const response = await billingApi.post<BillingSubscriptionResponse>('/billing/orders', { plan }, {
    headers: {
      'x-idempotency-key': idempotencyKey
    }
  });

  return {
    ...(extractApiData<BillingSubscriptionResponse>(response)),
    idempotencyKey
  };
}

export async function subscribeToBilling(plan: BillingPlan) {
  return requestFirst<BillingSubscriptionResponse>([
    () => billingApi.post('/billing/subscribe', { plan }),
  ]);
}

export async function getCurrentSubscription() {
  return extractApiData<CurrentSubscription>(await billingApi.get('/billing/subscription'));
}

export async function verifyBillingPayment(payload: {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}) {
  return extractApiData<{ verified: boolean; plan: BillingPlan; endDate: string }>(
    await billingApi.post('/billing/verify', payload)
  );
}

export async function getPaymentStatus(orderId: string) {
  return extractApiData<PaymentStatusResponse>(
    await billingApi.get(`/billing/payments/${encodeURIComponent(orderId)}/status`)
  );
}
