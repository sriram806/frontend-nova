'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AuthShell } from '@/components/auth/auth-shell';
import { AuthButton, Field, Message } from '@/components/auth/form-primitives';
import { authService } from '@/services/authService';
import { toast } from '@/utils/toast';

export function ForgotPasswordForm() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLocalError(null);

    if (!email.trim()) {
      setLocalError('Please enter your email address.');
      return;
    }

    setLoading(true);

    try {
      const response = await authService.forgotPassword(email);
      const result = response.data?.data ?? response.data;
      
      toast.success('Recovery code sent to your email.');
      
      const params = new URLSearchParams();
      params.set('email', email);
      
      // Handle OTP hint for development
      if (result && typeof result === 'object' && 'otp' in result) {
        const otpHint = (result as { otp?: unknown }).otp;
        if (typeof otpHint === 'string' && otpHint) {
          params.set('otp_hint', otpHint);
        }
      }

      router.push(`/reset-password?${params.toString()}`);
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to send recovery code. Please try again.';
      setLocalError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Reset password"
      subtitle="Enter your email to receive a secure recovery code."
      preTitle="Security"
      backgroundImage="/auth-images/forget-password-image.avif"
      leftPanelTitle="Secure Access"
      leftPanelSubtitle="Protecting Your Digital Identity"
      leftPanelFooter="ThinkAI | Nova uses industry-standard encryption to keep your data safe and private."
      topCta={{ label: 'Back to login', href: '/login' }}
    >
      <div className="space-y-6">
        <form className="space-y-4" onSubmit={handleSubmit}>
          <Field
            label="Recovery Email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            disabled={loading}
            required
          />

          {localError ? <Message tone="error">{localError}</Message> : null}

          <div className="pt-2">
            <AuthButton disabled={loading}>
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                  <span>Sending code...</span>
                </div>
              ) : 'Send reset code'}
            </AuthButton>
          </div>
        </form>

        <div className="text-center pt-2">
          <p className="text-sm font-medium text-white/50">
            Remembered your password?{' '}
            <Link href="/login" className="text-white hover:text-indigo-400 transition-colors font-bold">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </AuthShell>
  );
}
