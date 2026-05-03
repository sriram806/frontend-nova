'use client';

import Link from 'next/link';
import { FormEvent, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AuthShell } from '@/components/auth/auth-shell';
import { AuthButton, Message } from '@/components/auth/form-primitives';
import { OtpInput } from '@/components/auth/otp-input';
import { authService } from '@/services/authService';
import { toast } from '@/utils/toast';

const OTP_RESEND_STORAGE_KEY = 'think_ai_otp_resends';
const MAX_RESENDS_PER_DAY = 3;

const getResendData = () => {
  if (typeof window === 'undefined') return { count: 0, date: new Date().toDateString() };
  try {
    const data = JSON.parse(localStorage.getItem(OTP_RESEND_STORAGE_KEY) || '{}');
    if (data.date === new Date().toDateString()) {
      return data;
    }
  } catch { }
  return { count: 0, date: new Date().toDateString() };
};

const incrementResendData = () => {
  if (typeof window === 'undefined') return 0;
  const data = getResendData();
  data.count += 1;
  localStorage.setItem(OTP_RESEND_STORAGE_KEY, JSON.stringify(data));
  return data.count;
};

export function VerifyOTPForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailParam = searchParams.get('email');

  const [otp, setOtp] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [resendsLeft, setResendsLeft] = useState(MAX_RESENDS_PER_DAY);

  // Initialize resends counter exclusively on the client side
  useEffect(() => {
    setResendsLeft(Math.max(0, MAX_RESENDS_PER_DAY - getResendData().count));
  }, []);

  // Focus effect for countdown
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleVerify = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLocalError(null);

    if (!emailParam) {
      setLocalError('Email address is missing. Please try registering again.');
      return;
    }

    if (!otp.trim() || otp.length < 5) {
      setLocalError('Please enter a valid OTP.');
      return;
    }

    setLoading(true);

    try {
      await authService.verifyEmail(emailParam, otp);
      toast.success('Email verified successfully! Please sign in.');
      router.push('/login');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Invalid or expired OTP. Please try again.';
      setLocalError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (!emailParam) return;
    if (countdown > 0) return;

    const currentData = getResendData();
    if (currentData.count >= MAX_RESENDS_PER_DAY) {
      setLocalError('You have exceeded the maximum limit of 3 resends per day. Try again tomorrow.');
      toast.error('Resend limit reached.');
      return;
    }

    setResending(true);
    setLocalError(null);

    try {
      await authService.sendVerifyOtp(emailParam);
      const newCount = incrementResendData();
      setResendsLeft(Math.max(0, MAX_RESENDS_PER_DAY - newCount));
      toast.success('A new OTP has been sent to your email.');
      setCountdown(60); // 60 seconds cooldown
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to resend OTP. Please try again later.';
      setLocalError(message);
      toast.error(message);
    } finally {
      setResending(false);
    }
  };

  return (
    <AuthShell
      title="Verify your email"
      subtitle={`We've sent a verification code to ${emailParam || 'your email'}. Enter it below to confirm your account.`}
      preTitle="Verification"
      backgroundImage="/signup-hero.png"
      leftPanelTitle="Security & Privacy"
      leftPanelSubtitle="Your Data, Protected."
      leftPanelFooter="We employ industry-leading encryption and security protocols to ensure your data is always safe."
      topCta={{ label: '', href: '/register' }}
    >
      <div className="space-y-6">
        <form className="space-y-6" onSubmit={handleVerify}>
          <OtpInput
            value={otp}
            onChange={setOtp}
            disabled={loading}
            length={6}
            groupSize={3}
            onComplete={() => {
              // Optionally trigger validation when complete
            }}
          />

          {localError ? <Message tone="error">{localError}</Message> : null}

          <div className="pt-2">
            <AuthButton disabled={loading || !emailParam}>
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                  <span>Verifying...</span>
                </div>
              ) : 'Verify Account'}
            </AuthButton>
          </div>
        </form>

        <div className="flex flex-col items-center gap-4 pt-4 border-t border-white/10 text-center">
          <div className="text-sm font-medium text-white/50 space-y-2">
            <p>Didn't receive the code?</p>
            <button
              type="button"
              onClick={handleResendOTP}
              disabled={resending || countdown > 0 || !emailParam || resendsLeft === 0}
              className={`font-bold transition-colors ${resending || countdown > 0 || !emailParam || resendsLeft === 0
                ? 'text-white/30 cursor-not-allowed'
                : 'text-white hover:text-indigo-400'
                }`}
            >
              {resendsLeft === 0
                ? 'Limit reached for today'
                : resending
                  ? 'Sending...'
                  : countdown > 0
                    ? `Resend code in ${countdown}s`
                    : 'Resend code'}
            </button>
            <p className="text-xs opacity-60 m-0">
              ({resendsLeft} {resendsLeft === 1 ? 'chance' : 'chances'} remaining today)
            </p>
          </div>
          <Link href="/login" className="text-xs text-white/40 hover:text-white transition-colors">
            Return to Login
          </Link>
        </div>
      </div>
    </AuthShell>
  );
}
