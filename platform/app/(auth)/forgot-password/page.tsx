import { Metadata } from 'next';
import { ForgotPasswordForm } from '@/components/auth/features/auth/ForgotPasswordForm';

export const metadata: Metadata = {
  title: 'Reset Password | ThinkAI',
  description: 'Recover your Nova account access.',
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />;
}


