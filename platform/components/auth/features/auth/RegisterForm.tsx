'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Chrome, Github } from 'lucide-react';
import { AuthShell } from '@/components/auth/auth-shell';
import { AuthButton, Field, Message, OAuthButton } from '@/components/auth/form-primitives';
import { authService } from '@/services/authService';
import { setPendingRegistrationFromBackend } from '@/lib/auth';
import { toast } from '@/utils/toast';

export function RegisterForm() {
  const router = useRouter();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleRegister = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLocalError(null);

    if (!name.trim() || !email.trim() || !password) {
      setLocalError('All fields are required.');
      return;
    }

    setLoading(true);

    try {
      const response = await authService.register({ name, email, password });
      const result = response.data?.data ?? response.data;

      setPendingRegistrationFromBackend(email, result?.otp);
      toast.success('Account created');

      const params = new URLSearchParams();
      params.set('email', email);

      if (result && typeof result === 'object' && 'otp' in result) {
        const otpHint = (result as { otp?: unknown }).otp;
        if (typeof otpHint === 'string' && otpHint) {
          params.set('otp_hint', otpHint);
        }
      }

      router.push(`/verify-otp?${params.toString()}`);
    } catch (error: any) {
      const message = error.response?.data?.message || 'Unable to create account.';
      setLocalError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Create account"
      subtitle="Join Nova and start building your future today."
      preTitle="Sign Up"
      backgroundImage="/signup-hero.png"
      leftPanelTitle="Unlimited Growth"
      leftPanelSubtitle="Accelerate Your Career"
      leftPanelFooter="Start your journey with Nova, the most advanced AI platform for ambitious professionals."
      topCta={{ label: '', href: '/' }}
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <OAuthButton
            disabled={loading}
            onClick={() => setLocalError('Google OAuth will be enabled soon.')}
          >
            <Chrome className="h-5 w-5 text-[#4285F4]" />
            <span className="hidden sm:inline">Google</span>
          </OAuthButton>
          <OAuthButton
            disabled={loading}
            onClick={() => setLocalError('GitHub OAuth will be enabled soon.')}
          >
            <Github className="h-5 w-5" />
            <span className="hidden sm:inline">GitHub</span>
          </OAuthButton>
        </div>

        <div className="relative flex items-center gap-4">
          <div className="h-px flex-1 bg-white/5" />
          <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/30">Or Register with</span>
          <div className="h-px flex-1 bg-white/5" />
        </div>

        <form className="space-y-4" onSubmit={handleRegister}>
          <Field
            label="Full Legal Name"
            type="text"
            autoComplete="name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            disabled={loading}
            required
          />
          <Field
            label="Email address"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            disabled={loading}
            required
          />
          <Field
            label="Secure Password"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            disabled={loading}
            required
          />

          {localError ? <Message tone="error">{localError}</Message> : null}

          <div className="pt-2 space-y-6">
            <AuthButton disabled={loading}>
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                  <span>Creating account...</span>
                </div>
              ) : 'Create account'}
            </AuthButton>

            <p className="text-center text-sm font-medium text-white/50">
              Already have an account?{' '}
              <Link href="/login" className="text-white hover:text-indigo-400 transition-colors font-bold">
                Login Here
              </Link>
            </p>
          </div>
        </form>
      </div>
    </AuthShell>
  );
}

