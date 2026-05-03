'use client';

import Link from 'next/link';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Save, UserRound } from 'lucide-react';
import { PageTransition } from '@/components/common/page-transition';
import { AuthButton, Field, Message } from '@/components/auth/form-primitives';
import { userService } from '@/services/userService';
import { getApiErrorMessage } from '@/services/api';
import { useAuthStore } from '@/store/authStore';
import type { UserProfile } from '@/types/platform';
import { toast } from '@/utils/toast';

type EditableProfile = {
  displayName: string;
  email: string;
  targetRole: string;
  bio: string;
};

function toEditableProfile(user: UserProfile): EditableProfile {
  return {
    displayName: user.displayName ?? '',
    email: user.email ?? '',
    targetRole: user.targetRole ?? '',
    bio: user.bio ?? '',
  };
}

export default function EditProfilePage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const authUser = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const [form, setForm] = useState<EditableProfile>({
    displayName: '',
    email: '',
    targetRole: '',
    bio: '',
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
  }, [user?.id, user?.displayName, user?.email, user?.targetRole, user?.bio]);

  const isDirty = useMemo(() => {
    if (!user) {
      return false;
    }
    const original = toEditableProfile(user);
    return (
      form.displayName !== original.displayName ||
      form.email !== original.email ||
      form.targetRole !== original.targetRole ||
      form.bio !== original.bio
    );
  }, [form, user]);

  const mutation = useMutation({
    mutationFn: async (payload: EditableProfile) => {
      return userService.updateCurrentUser({
        displayName: payload.displayName.trim(),
        email: payload.email.trim(),
        targetRole: payload.targetRole.trim() || null,
        bio: payload.bio.trim() || null,
      });
    },
    onSuccess: (updatedUser) => {
      setUser(updatedUser);
      queryClient.setQueryData(['current-user-profile'], updatedUser);
      toast.success('Profile updated successfully.');
      setFeedback({ tone: 'success', text: 'Profile saved. Redirecting to your profile page...' });
      setTimeout(() => {
        router.push('/settings');
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

    if (!form.displayName.trim() || !form.email.trim()) {
      setFeedback({ tone: 'error', text: 'Display name and email are required.' });
      return;
    }

    mutation.mutate(form);
  };

  if (isLoading && !user) {
    return (
      <PageTransition>
        <div className="mx-auto h-72 w-full max-w-3xl animate-pulse rounded-3xl border border-white/10 bg-white/[0.03]" />
      </PageTransition>
    );
  }

  if (!user) {
    return (
      <PageTransition>
        <div className="mx-auto max-w-xl rounded-3xl border border-white/10 bg-white/[0.03] p-6">
          <h1 className="text-xl font-bold text-white">Unable to load profile</h1>
          <p className="mt-2 text-sm text-white/60">
            {isError ? 'We hit an error while fetching your profile.' : 'Your session data is missing.'}
          </p>
          <Link
            href="/login"
            className="mt-4 inline-flex rounded-xl border border-white/20 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10"
          >
            Go to Login
          </Link>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="mx-auto w-full max-w-3xl">
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-[linear-gradient(160deg,rgba(7,16,31,0.98),rgba(10,12,24,0.95))] p-6 sm:p-8">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_0%,rgba(34,211,238,0.16),transparent_32%),radial-gradient(circle_at_86%_12%,rgba(129,140,248,0.18),transparent_34%)]" />
          <div className="relative z-10">
            <Link href="/settings" className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-cyan-200/90 hover:text-cyan-100">
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to profile
            </Link>

            <div className="mt-4 flex items-center gap-3">
              <div className="rounded-xl border border-white/10 bg-white/[0.05] p-2.5">
                <UserRound className="h-5 w-5 text-cyan-200" />
              </div>
              <div>
                <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl">Edit Profile</h1>
                <p className="text-sm text-white/65">Update your identity details used across dashboard and workspace features.</p>
              </div>
            </div>

            <form className="mt-8 space-y-4" onSubmit={onSubmit}>
              <Field
                label="Display Name"
                value={form.displayName}
                onChange={(event) => setForm((prev) => ({ ...prev, displayName: event.target.value }))}
                disabled={mutation.isPending}
                required
              />
              <Field
                label="Email Address"
                type="email"
                value={form.email}
                onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
                disabled={mutation.isPending}
                required
              />
              <Field
                label="Target Role"
                value={form.targetRole}
                onChange={(event) => setForm((prev) => ({ ...prev, targetRole: event.target.value }))}
                disabled={mutation.isPending}
              />
              <Field
                label="Short Bio"
                value={form.bio}
                onChange={(event) => setForm((prev) => ({ ...prev, bio: event.target.value }))}
                disabled={mutation.isPending}
              />

              {feedback ? <Message tone={feedback.tone}>{feedback.text}</Message> : null}

              <div className="grid gap-3 pt-2 sm:grid-cols-2">
                <AuthButton type="submit" disabled={mutation.isPending || !isDirty}>
                  {mutation.isPending ? 'Saving changes...' : 'Save Profile'}
                </AuthButton>
                <Link
                  href="/settings"
                  className="inline-flex items-center justify-center rounded-xl border border-white/20 bg-white/[0.03] px-4 py-3 text-sm font-bold text-white transition-all duration-300 hover:bg-white/[0.08]"
                >
                  <Save className="mr-2 h-4 w-4" />
                  Cancel
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
