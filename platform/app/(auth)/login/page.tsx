import { Suspense } from 'react';
import { Metadata } from 'next';
import { LoginForm } from '@/components/auth/features/auth/LoginForm';

export const metadata: Metadata = {
  title: 'Sign In | ThinkAI',
  description: 'Log in to continue into the ThinkAI dashboard client.',
};

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen w-full bg-[#0B101E]" />}>
      <LoginForm />
    </Suspense>
  );
}
