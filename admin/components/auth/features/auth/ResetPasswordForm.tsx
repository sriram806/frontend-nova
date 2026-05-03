'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AuthShell } from '@/components/auth/auth-shell';
import { AuthButton, Field, Message } from '@/components/auth/form-primitives';
import { OtpInput } from '@/components/auth/otp-input';
import { authService } from '@/services/authService';
import { toast } from '@/utils/toast';

export function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailParam = searchParams.get('email');

  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleReset = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLocalError(null);

    if (!emailParam) {
      toast.error('Email address is missing. Please initiate the reset process again.');
      return;
    }

    if (!otp.trim() || otp.length < 5) {
      setLocalError('Please enter a valid recovery code.');
      return;
    }

    if (!newPassword || newPassword.length < 8) {
      setLocalError('Password must be at least 8 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setLocalError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      await authService.resetPassword(emailParam, otp, newPassword);
      toast.success('Password reset successfully! You can now log in.');
      router.push('/login');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to reset password. Recovery code might be invalid or expired.';
      setLocalError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Create new password"
      subtitle="Enter the recovery code sent to your email and your new secure password."
      preTitle="Security"
      backgroundImage="/login-hero.png"
      leftPanelTitle="Secure Access"
      leftPanelSubtitle="Protecting Your Digital Identity"
      leftPanelFooter="Nova uses industry-standard encryption to keep your data safe and private."
      topCta={{ label: 'Back to login', href: '/login' }}
    >
      <div className="space-y-6">
        <form className="space-y-8" onSubmit={handleReset}>
          <OtpInput
            label="Recovery Code"
            helperText="Enter the 6-digit code sent to your email"
            value={otp}
            onChange={setOtp}
            disabled={loading}
            length={6}
          />

          <div className="space-y-5">
            <Field
              label="New Password"
              type="password"
              autoComplete="new-password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              disabled={loading}
              required
            />

            <Field
              label="Confirm New Password"
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              disabled={loading}
              required
            />
          </div>

          {localError ? <Message tone="error">{localError}</Message> : null}

          <div className="pt-2">
            <AuthButton disabled={loading || !emailParam}>
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                  <span>Resetting...</span>
                </div>
              ) : 'Reset Password'}
            </AuthButton>
          </div>
        </form>

        <div className="text-center pt-2">
          <p className="text-sm font-medium text-white/50">
            Didn't receive the code?{' '}
            <Link href="/forgot-password" className="text-white hover:text-indigo-400 transition-colors font-bold">
              Try again
            </Link>
          </p>
        </div>
      </div>
    </AuthShell>
  );
}

