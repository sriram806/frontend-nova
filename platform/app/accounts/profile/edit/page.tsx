'use client';

import Link from 'next/link';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, LockKeyhole, Save, UserRound } from 'lucide-react';
import { PageTransition } from '@/components/common/page-transition';
import { AuthButton, Field, Message } from '@/components/auth/form-primitives';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { userService } from '@/services/userService';
import { getApiErrorMessage } from '@/services/api';
import { useAuthStore } from '@/store/authStore';
import type { UserProfile } from '@/types/platform';
import { toast } from '@/utils/toast';

type EditableProfile = {
  displayName: string;
  bio: string;
  socialLinks: {
    github: string;
    linkedin: string;
    twitter: string;
    portfolio: string;
  };
};

function toEditableProfile(user: UserProfile): EditableProfile {
  return {
    displayName: user.displayName ?? '',
    bio: user.bio ?? '',
    socialLinks: {
      github: user.socialLinks?.github ?? '',
      linkedin: user.socialLinks?.linkedin ?? '',
      twitter: user.socialLinks?.twitter ?? '',
      portfolio: user.socialLinks?.portfolio ?? '',
    },
  };
}

export default function AccountProfileEditPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const authUser = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const [form, setForm] = useState<EditableProfile>({
    displayName: '',
    bio: '',
    socialLinks: {
      github: '',
      linkedin: '',
      twitter: '',
      portfolio: '',
    },
  });
  const [feedback, setFeedback] = useState<{ tone: 'success' | 'error'; text: string } | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['current-user-profile'],
    queryFn: userService.getCurrentUser,
    initialData: authUser ?? undefined,
  });

  const user = data ?? authUser ?? null;

  useEffect(() => {
    if (user) {
      setForm(toEditableProfile(user));
    }
  }, [user?.id, user?.displayName, user?.bio]);

  const isDirty = useMemo(() => {
    if (!user) {
      return false;
    }
    const original = toEditableProfile(user);
    return (
      form.displayName !== original.displayName ||
      form.bio !== original.bio ||
      form.socialLinks.github !== original.socialLinks.github ||
      form.socialLinks.linkedin !== original.socialLinks.linkedin ||
      form.socialLinks.twitter !== original.socialLinks.twitter ||
      form.socialLinks.portfolio !== original.socialLinks.portfolio
    );
  }, [form, user]);

  const mutation = useMutation({
    mutationFn: async (payload: EditableProfile) =>
      userService.updateCurrentUser({
        displayName: payload.displayName.trim(),
        bio: payload.bio.trim() || null,
        socialLinks: payload.socialLinks,
      }),
    onSuccess: (updatedUser) => {
      setUser(updatedUser);
      queryClient.setQueryData(['current-user-profile'], updatedUser);
      toast.success('Profile updated successfully.');
      setFeedback({ tone: 'success', text: 'Profile saved. Redirecting to your profile page...' });
      setTimeout(() => {
        router.push('/accounts/profile');
      }, 650);
    },
    onError: (error) => {
      const message = getApiErrorMessage(error, 'Unable to update profile.');
      setFeedback({ tone: 'error', text: message });
      toast.error(message);
    },
  });

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFeedback(null);

    if (!form.displayName.trim()) {
      setFeedback({ tone: 'error', text: 'Display name is required.' });
      return;
    }

    mutation.mutate(form);
  };

  if (isLoading && !user) {
    return (
      <PageTransition>
        <div className="mx-auto h-80 w-full max-w-6xl animate-pulse rounded-3xl border border-border bg-muted/30" />
      </PageTransition>
    );
  }

  if (!user) {
    return (
      <PageTransition>
        <div className="mx-auto max-w-xl rounded-3xl border border-border bg-card p-6">
          <h1 className="text-xl font-bold text-foreground">Unable to load profile</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {isError ? 'We hit an error while fetching your profile.' : 'Your session data is missing.'}
          </p>
          <Link
            href="/login"
            className="mt-4 inline-flex rounded-xl border border-border px-4 py-2 text-sm font-semibold text-foreground hover:bg-accent"
          >
            Go to Login
          </Link>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="mx-auto w-full max-w-6xl space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Link
            href="/accounts/profile"
            className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to profile
          </Link>
          <p className="text-xs text-muted-foreground">Email and target role are locked on this screen.</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_1.45fr]">
          <Card className="rounded-3xl border-border bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <LockKeyhole className="h-5 w-5 text-primary" />
                Locked Fields
              </CardTitle>
              <CardDescription>
                These are managed by account verification and onboarding preferences.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Field label="Email Address" value={user.email} disabled readOnly />
              <Field label="Target Role" value={user.targetRole || 'Not configured'} disabled readOnly />
              <div className="rounded-2xl border border-border bg-muted/30 p-4">
                <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Status</p>
                <p className="mt-2 text-sm font-semibold text-foreground">{user.emailVerified ? 'Email Verified' : 'Verification Pending'}</p>
                <p className="mt-2 text-xs leading-5 text-muted-foreground">
                  If you want to update these fields, use onboarding/profile flow from account setup.
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="relative overflow-hidden rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-8">
            <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-primary/10 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-20 left-8 h-40 w-40 rounded-full bg-chart-2/15 blur-3xl" />
            <div className="relative z-10">
              <div className="mb-8 flex items-center gap-3">
                <div className="rounded-xl border border-border bg-background/80 p-2.5">
                  <UserRound className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h1 className="text-2xl font-black tracking-tight text-foreground sm:text-3xl">Edit Public Profile</h1>
                  <p className="text-sm text-muted-foreground">Update your display name and bio across the platform.</p>
                </div>
              </div>

              <form className="space-y-5" onSubmit={onSubmit}>
                <Field
                  label="Display Name"
                  value={form.displayName}
                  onChange={(event) => setForm((prev) => ({ ...prev, displayName: event.target.value }))}
                  disabled={mutation.isPending}
                  required
                />

                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Bio</label>
                  <Textarea
                    value={form.bio}
                    onChange={(event) => setForm((prev) => ({ ...prev, bio: event.target.value }))}
                    disabled={mutation.isPending}
                    placeholder="Write a short bio about your goals, strengths, and current focus."
                    className="min-h-[140px] rounded-2xl border-border bg-background/80 text-foreground placeholder:text-muted-foreground"
                  />
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <Field
                    label="GitHub URL"
                    value={form.socialLinks.github}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        socialLinks: { ...prev.socialLinks, github: event.target.value },
                      }))
                    }
                    disabled={mutation.isPending}
                    placeholder="https://github.com/your-username"
                  />
                  <Field
                    label="LinkedIn URL"
                    value={form.socialLinks.linkedin}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        socialLinks: { ...prev.socialLinks, linkedin: event.target.value },
                      }))
                    }
                    disabled={mutation.isPending}
                    placeholder="https://linkedin.com/in/your-profile"
                  />
                  <Field
                    label="Twitter / X URL"
                    value={form.socialLinks.twitter}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        socialLinks: { ...prev.socialLinks, twitter: event.target.value },
                      }))
                    }
                    disabled={mutation.isPending}
                    placeholder="https://twitter.com/your-handle"
                  />
                  <Field
                    label="Portfolio URL"
                    value={form.socialLinks.portfolio}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        socialLinks: { ...prev.socialLinks, portfolio: event.target.value },
                      }))
                    }
                    disabled={mutation.isPending}
                    placeholder="https://your-portfolio.com"
                  />
                </div>

                {feedback ? <Message tone={feedback.tone}>{feedback.text}</Message> : null}

                <div className="grid gap-3 pt-1 sm:grid-cols-2">
                  <AuthButton type="submit" disabled={mutation.isPending || !isDirty}>
                    {mutation.isPending ? 'Saving changes...' : 'Save Changes'}
                  </AuthButton>
                  <Button variant="outline" asChild className="h-[52px] rounded-xl">
                    <Link href="/accounts/profile">
                      <Save className="mr-2 h-4 w-4" />
                      Cancel
                    </Link>
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
