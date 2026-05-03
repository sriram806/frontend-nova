import { Metadata } from 'next';
import { RegisterForm } from '@/components/auth/features/auth/RegisterForm';

export const metadata: Metadata = {
  title: 'Create an account | ThinkAI',
  description: 'Join ThinkAI and start building your future today.',
};

export default function RegisterPage() {
  return <RegisterForm />;
}
