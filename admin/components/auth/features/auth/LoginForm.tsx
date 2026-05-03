'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AuthShell } from '@/components/auth/auth-shell';
import { AuthButton, Field, Message } from '@/components/auth/form-primitives';
import { authService } from '@/services/authService';
import { useAuthStore } from '@/store/authStore';
import { toast } from '@/utils/toast';
import { motion, AnimatePresence } from 'framer-motion';

export function LoginForm() {
  const router = useRouter();
  const setSession = useAuthStore((state) => state.setSession);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);

  const resolveDefaultPostLoginPath = async () => {
    return '/dashboard';
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLocalError(null);

    if (!email || !password) {
      toast.error('Identity credentials required');
      return;
    }

    setLoading(true);

    try {
      const response = await authService.login({ email, password });
      const result = response.data?.data ?? response.data;
      const accessToken = result?.accessToken || result?.token;
      const user = result?.user || { 
        id: 'temp', 
        displayName: email.split('@')[0], 
        email,
        role: 'guest',
        status: 'active',
        emailVerified: false,
        isOnboarded: false,
        subscription: false
      };

      if (!accessToken) {
        throw new Error('Access denied: Authentication failure');
      }

      // Only allow admin/moderator roles
      if (user.role !== 'admin' && user.role !== 'moderator') {
        toast.error('Restricted: Admin privileges required');
        return;
      }

      setSession({ accessToken, user });
      toast.success(`Welcome, ${user.displayName || 'Administrator'}`);

      setIsNavigating(true);

      const targetUrl = await resolveDefaultPostLoginPath();
      setTimeout(() => {
        window.location.href = targetUrl;
      }, 500);
    } catch (error: any) {
      const code = error.response?.data?.code;
      const message = error.response?.data?.message || 'Invalid credentials. Verification failed.';
      
      if (code === 'ACCOUNT_LOCKED') {
        setLocalError('This account has been temporarily locked due to multiple failed attempts. Please contact security or try again later.');
        toast.error('Account Locked: Security protocols active.');
      } else if (code === 'EMAIL_NOT_VERIFIED') {
        setLocalError('Your administrative identity is not yet verified. Please complete the OTP verification.');
        toast.info('Verification Required');
        router.push(`/verify-otp?email=${encodeURIComponent(email)}`);
      } else {
        setLocalError(message);
        toast.error(message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Systems Access"
      subtitle="Authorized personnel only. Please verify your administrative credentials to proceed."
      backgroundImage="/auth-images/login_image.avif"
      leftPanelTitle="Nova Command"
      leftPanelSubtitle="Real-time Platform Orchestration"
      leftPanelFooter="Secure, high-performance management for the next generation of AI."
    >
      <div className="space-y-8">
        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <Field
              label="Admin Identity"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              disabled={loading || isNavigating}
              required
            />
            <Field
              label="Security Key"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              disabled={loading || isNavigating}
              required
            />
          </div>

          <AnimatePresence>
            {localError && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <Message tone="error">{localError}</Message>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="pt-4 space-y-8">
            <AuthButton disabled={loading || isNavigating}>
              {(loading || isNavigating) ? (
                <div className="flex items-center gap-3">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                  <span className="uppercase tracking-widest font-black">Verifying...</span>
                </div>
              ) : 'Establish Connection'}
            </AuthButton>

            <div className="flex flex-col items-center gap-4 text-center">
              <Link href="/forgot-password" title="Recover password" className="text-[11px] font-black uppercase tracking-[0.2em] text-white/30 transition hover:text-primary">
                Lost access key?
              </Link>
            </div>
          </div>
        </form>
      </div>
    </AuthShell>
  );
}
