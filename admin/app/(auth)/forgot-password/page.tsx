import { Metadata } from 'next';
import { ForgotPasswordForm } from '@/components/auth/features/auth/ForgotPasswordForm';

export const metadata: Metadata = {
  title: 'Reset Password | ThinkAI Admin',
  description: 'Recover your admin account access.',
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />;
}


