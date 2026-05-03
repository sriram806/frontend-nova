import { Suspense } from 'react';
import { Metadata } from 'next';
import { VerifyOTPForm } from '@/components/auth/features/auth/VerifyOTPForm';

export const metadata: Metadata = {
  title: 'Verify Email | ThinkAI',
  description: 'Verify your email address to continue setting up your ThinkAI account.',
};

export default function VerifyOTPPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen w-full bg-[#0B101E]" />}>
      <VerifyOTPForm />
    </Suspense>
  );
}
