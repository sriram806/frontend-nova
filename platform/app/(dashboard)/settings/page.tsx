'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BadgeCheck,
  Briefcase,
  CalendarDays,
  Crown,
  Mail,
  PencilLine,
  ShieldCheck,
  Sparkles,
  UserRound,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { PageTransition } from '@/components/common/page-transition';
import { userService } from '@/services/userService';
import { useAuthStore } from '@/store/authStore';
import type { UserProfile } from '@/types/platform';

function getInitials(name: string) {
  return (
    name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('') || 'TA'
  );
}

function ProfileMetric({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: typeof ShieldCheck;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <div className="mb-2 inline-flex rounded-xl border border-white/10 bg-white/[0.04] p-2">
        <Icon className="h-4 w-4 text-cyan-200" />
      </div>
      <p className="text-[11px] uppercase tracking-[0.16em] text-white/45">{label}</p>
      <p className="mt-1 text-sm font-semibold text-white">{value}</p>
    </div>
  );
}

export default function ProfilePage() {
  const authUser = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['current-user-profile'],
    queryFn: userService.getCurrentUser,
    initialData: authUser ?? undefined,
  });

  const user: UserProfile | null = data ?? authUser;

  useEffect(() => {
    if (user && user !== authUser) {
      setUser(user);
    }
  }, [authUser, setUser, user]);

  if (isLoading && !user) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-52 rounded-3xl" />
        <div className="grid gap-4 lg:grid-cols-3">
          <Skeleton className="h-44 rounded-3xl lg:col-span-2" />
          <Skeleton className="h-44 rounded-3xl" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <Card className="glass rounded-3xl border-white/10">
        <CardHeader>
          <CardTitle>Unable to load profile</CardTitle>
          <CardDescription>We could not fetch your account details. Please refresh and try again.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <PageTransition>
      <div className="space-y-6">
        <motion.section
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-3xl border border-white/10 bg-[linear-gradient(135deg,rgba(14,24,44,0.95),rgba(8,11,22,0.96))] p-6 md:p-8"
        >
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(34,211,238,0.16),transparent_38%),radial-gradient(circle_at_84%_12%,rgba(99,102,241,0.2),transparent_34%)]" />
          <div className="relative z-10 grid gap-6 lg:grid-cols-[1.7fr_1fr]">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
              <Avatar className="h-24 w-24 border border-white/20 shadow-[0_0_36px_rgba(56,189,248,0.25)]">
                <AvatarFallback className="bg-gradient-to-br from-cyan-300 to-indigo-500 text-xl font-bold text-black">
                  {getInitials(user.displayName || user.email)}
                </AvatarFallback>
              </Avatar>

              <div className="min-w-0 space-y-2">
                <p className="inline-flex items-center gap-2 rounded-full border border-cyan-200/20 bg-cyan-200/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-cyan-100">
                  <Sparkles className="h-3.5 w-3.5" />
                  Personal Hub
                </p>
                <h1 className="truncate text-2xl font-black tracking-tight text-white md:text-3xl">
                  {user.displayName || 'ThinkAI Member'}
                </h1>
                <p className="truncate text-sm text-white/70">{user.email}</p>
                <p className="max-w-2xl text-sm leading-6 text-white/65">
                  {user.bio?.trim()
                    ? user.bio
                    : 'Add your bio to tell recruiters and teammates what you are building next.'}
                </p>
              </div>
            </div>

            <div className="flex flex-col justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <div className="space-y-2">
                <p className="text-[11px] uppercase tracking-[0.16em] text-white/45">Focus Role</p>
                <p className="text-sm font-semibold text-white">{user.targetRole || 'Not set yet'}</p>
              </div>
              <Link href="/settings/edit" className="inline-flex">
                <Button className="w-full rounded-xl bg-cyan-400 text-black hover:bg-cyan-300">
                  <PencilLine className="mr-2 h-4 w-4" />
                  Edit Profile
                </Button>
              </Link>
            </div>
          </div>
        </motion.section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <ProfileMetric
            label="Role"
            value={user.role || 'Member'}
            icon={Briefcase}
          />
          <ProfileMetric
            label="Email Status"
            value={user.emailVerified ? 'Verified' : 'Pending'}
            icon={BadgeCheck}
          />
          <ProfileMetric
            label="Subscription"
            value={user.subscription ? 'Active' : 'Starter'}
            icon={Crown}
          />
          <ProfileMetric
            label="Onboarding"
            value={user.isOnboarded ? 'Completed' : 'In progress'}
            icon={CalendarDays}
          />
        </section>

        <section className="grid gap-4 lg:grid-cols-3">
          <Card className="glass rounded-3xl border-white/10 lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserRound className="h-4 w-4 text-cyan-200" />
                Profile Snapshot
              </CardTitle>
              <CardDescription>Everything the platform currently knows about your account identity.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-xs uppercase tracking-[0.16em] text-white/40">Display Name</p>
                <p className="mt-2 text-sm font-semibold text-white">{user.displayName || '-'}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-xs uppercase tracking-[0.16em] text-white/40">Email</p>
                <p className="mt-2 text-sm font-semibold text-white">{user.email}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-xs uppercase tracking-[0.16em] text-white/40">Target Role</p>
                <p className="mt-2 text-sm font-semibold text-white">{user.targetRole || 'Not configured'}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-xs uppercase tracking-[0.16em] text-white/40">Account State</p>
                <p className="mt-2 text-sm font-semibold text-white">{user.status || 'active'}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="glass rounded-3xl border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-cyan-200" />
                Security
              </CardTitle>
              <CardDescription>Quick identity checks for this account.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
                <p className="text-xs text-white/45">Verification</p>
                <p className="text-sm font-semibold text-white">
                  {user.emailVerified ? 'Email is verified' : 'Verification pending'}
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
                <p className="text-xs text-white/45">Profile Sync</p>
                <p className="text-sm font-semibold text-white">
                  {isError ? 'Last fetch failed' : 'Synced with user service'}
                </p>
              </div>
              <Link href="/settings/edit" className="block pt-1">
                <Button variant="outline" className="w-full rounded-xl border-white/20 bg-white/5 hover:bg-white/10">
                  Update Account Details
                </Button>
              </Link>
            </CardContent>
          </Card>
        </section>
      </div>
    </PageTransition>
  );
}
