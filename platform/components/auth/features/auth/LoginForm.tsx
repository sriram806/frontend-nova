'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Chrome, Github } from 'lucide-react';
import { AuthShell } from '@/components/auth/auth-shell';
import { AuthButton, Field, Message, OAuthButton } from '@/components/auth/form-primitives';
import { authService } from '@/services/authService';
import { getOnboardingStatus } from '@/services/onboardingService';
import { useAuthStore } from '@/store/authStore';
import { toast } from '@/utils/toast';

function sanitizeNextPath(next: string | null): string | null {
  if (!next) {
    return null;
  }

  if (!next.startsWith('/') || next.startsWith('//')) {
    return null;
  }

  return next;
}

export function LoginForm() {
  const router = useRouter();
  const setSession = useAuthStore((state) => state.setSession);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);

  const resolveDefaultPostLoginPath = async () => {
    try {
      const onboarding = await getOnboardingStatus();

      // IF subscribed and fully set up, go to dashboard
      if (onboarding.subscriptionActive && onboarding.isOnboarded) {
        return '/dashboard';
      }

      // IF subscribed but NOT onboarded, go to onboarding
      if (onboarding.subscriptionActive && !onboarding.isOnboarded) {
        return onboarding.nextPath || '/onboarding/target-role';
      }

      // OTHERWISE (not subscribed or other cases), land on home
      return '/';
    } catch {
      return '/';
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLocalError(null);

    if (!email || !password) {
      setLocalError('Email and password are required.');
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
        role: 'user',
        status: 'active',
        emailVerified: false,
        isOnboarded: false,
        subscription: false
      };

      if (!accessToken) {
        throw new Error('Missing access token in login response.');
      }

      setSession({ accessToken, user });
      toast.success('Welcome back!');

      setIsNavigating(true);

      const nextUrl = sanitizeNextPath(new URLSearchParams(window.location.search).get('next'));
      const targetUrl = nextUrl || (await resolveDefaultPostLoginPath());
      window.location.href = targetUrl;
    } catch (error: any) {
      const code = error.response?.data?.code;
      const message = error.response?.data?.message || 'Invalid credentials. Please try again.';

      if (code === 'ACCOUNT_LOCKED') {
        setLocalError('Your account has been temporarily locked due to multiple failed attempts. Please try again later or reset your password.');
        toast.error('Account Locked: Too many failed attempts.');
      } else if (code === 'EMAIL_NOT_VERIFIED') {
        setLocalError('Your email address is not yet verified. Please complete the verification process.');
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
      title="Welcome back"
      subtitle="Enter your credentials to access your Nova account."
      preTitle="Sign In"
      backgroundImage="/login-hero.png"
      leftPanelTitle="Experience Nova"
      leftPanelSubtitle="Unleash your potential with Nova"
      leftPanelFooter="Join thousands of professionals using the next generation of career AI."
      topCta={{ label: '', href: '/' }}
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <OAuthButton
            disabled={loading || isNavigating}
            onClick={() => setLocalError('Google OAuth will be enabled soon.')}
          >
            <Chrome className="h-5 w-5 text-[#4285F4]" />
            <span className="hidden sm:inline">Google</span>
          </OAuthButton>
          <OAuthButton
            disabled={loading || isNavigating}
            onClick={() => setLocalError('GitHub OAuth will be enabled soon.')}
          >
            <Github className="h-5 w-5" />
            <span className="hidden sm:inline">GitHub</span>
          </OAuthButton>
        </div>

        <div className="relative flex items-center gap-4">
          <div className="h-px flex-1 bg-white/5" />
          <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/30">Or Continue with</span>
          <div className="h-px flex-1 bg-white/5" />
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <Field
            label="Email address"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            disabled={loading || isNavigating}
            required
          />
          <Field
            label="Password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            disabled={loading || isNavigating}
            required
          />

          {localError ? <Message tone="error">{localError}</Message> : null}

          <div className="pt-2 space-y-6">
            <AuthButton disabled={loading || isNavigating}>
              {(loading || isNavigating) ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                  <span>Signing in...</span>
                </div>
              ) : 'Sign In'}
            </AuthButton>

            <div className="flex flex-col items-center gap-4 text-center">
              <Link href="/forgot-password" title="Recover password" className="text-xs font-medium text-white/40 transition hover:text-indigo-400">
                Forgot your password?
              </Link>

              <p className="text-sm font-medium text-white/50">
                Don't have an account?{' '}
                <Link href="/register" className="text-white hover:text-indigo-400 transition-colors font-bold">
                  Create an account
                </Link>
              </p>
            </div>
          </div>
        </form>
      </div>
    </AuthShell>
  );
}
