import { Suspense } from 'react';
import { Metadata } from 'next';
import { ResetPasswordForm } from '@/components/auth/features/auth/ResetPasswordForm';

export const metadata: Metadata = {
  title: 'Reset Password | ThinkAI',
  description: 'Create a new secure password for your ThinkAI account.',
};

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen w-full bg-[#0B101E]" />}>
      <ResetPasswordForm />
    </Suspense>
  );
}
