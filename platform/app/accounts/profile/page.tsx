'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowUpRight,
  BadgeCheck,
  CalendarCheck2,
  Crown,
  FileText,
  Globe,
  Github,
  Linkedin,
  PencilLine,
  Shield,
  Sparkles,
  Target,
  Twitter,
  User2,
  Mail,
  Medal,
} from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useExamCatalogQuery } from '@/hooks/queries/useExamQueries';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { PageTransition } from '@/components/common/page-transition';
import { ResumeDetailsSection } from '@/components/accounts/profile/resume-details-section';
import { userService } from '@/services/userService';
import { useAuthStore } from '@/store/authStore';
import { useBillingStore } from '@/store/billingStore';
import { hasActiveSubscription } from '@/services/billingService';
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

function MetricTile({
  label,
  value,
  detail,
  icon: Icon,
}: {
  label: string;
  value: string;
  detail: string;
  icon: any;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
      <div className="mb-3 inline-flex rounded-xl border border-border bg-muted/40 p-2">
        <Icon className="h-4 w-4 text-primary" />
      </div>
      <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">{label}</p>
      <p className="mt-1 text-base font-semibold text-foreground">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{detail}</p>
    </div>
  );
}

export default function AccountProfilePage() {
  const searchParams = useSearchParams();
  const section = searchParams.get('section') || (searchParams.get('') === 'resume' ? 'resume' : searchParams.get('') === 'personaldetails' ? 'personaldetails' : null);

  const authUser = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const subscription = useBillingStore((state) => state.subscription);

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
      <div className="mx-auto max-w-6xl space-y-6">
        <Skeleton className="h-52 rounded-3xl" />
        <div className="grid gap-4 lg:grid-cols-3">
          <Skeleton className="h-32 rounded-2xl" />
          <Skeleton className="h-32 rounded-2xl" />
          <Skeleton className="h-32 rounded-2xl" />
        </div>
        <Skeleton className="h-64 rounded-3xl" />
      </div>
    );
  }

  if (!user) {
    return (
      <Card className="mx-auto max-w-6xl rounded-3xl border-border bg-card">
        <CardHeader>
          <CardTitle>Unable to load profile</CardTitle>
          <CardDescription>We could not fetch your account details. Please refresh and try again.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (section === 'resume') {
    return <ResumeFormatView user={user} />;
  }

  if (section === 'personaldetails') {
    return <PersonalDetailsView user={user} />;
  }

  return (
    <PageTransition>
      <div className="mx-auto max-w-6xl space-y-6">
        <motion.section
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-3xl border border-border bg-card p-6 shadow-sm md:p-8"
        >
          <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-primary/15 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 left-8 h-44 w-44 rounded-full bg-chart-2/15 blur-3xl" />
          <div className="relative z-10 grid gap-6 lg:grid-cols-[1.8fr_1fr]">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
              <Avatar className="h-24 w-24 border border-border shadow-sm">
                <AvatarFallback className="bg-gradient-to-br from-primary to-chart-2 text-xl font-bold text-primary-foreground">
                  {getInitials(user.displayName || user.email)}
                </AvatarFallback>
              </Avatar>

              <div className="min-w-0 space-y-2">
                <p className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-primary">
                  <Sparkles className="h-3.5 w-3.5" />
                  Your Profile
                </p>
                <h1 className="truncate text-2xl font-black tracking-tight text-foreground md:text-3xl">
                  {user.displayName || 'ThinkAI Member'}
                </h1>
                <p className="truncate text-sm text-muted-foreground">{user.email}</p>
                <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
                  {user.bio?.trim()
                    ? user.bio
                    : 'No bio yet. Add one to personalize your profile and make it easier for others to know what you are focused on.'}
                </p>
              </div>
            </div>

            <div className="flex flex-col justify-between gap-4 rounded-2xl border border-border bg-background/50 p-4">
              <div className="space-y-3">
                <div className="space-y-1">
                  <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">Target Role</p>
                  <p className="text-base font-semibold text-foreground">{user.targetRole || 'Not set yet'}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Link href="/accounts/profile?section=resume">
                    <Button variant="outline" size="sm" className="h-8 rounded-lg text-[10px] uppercase tracking-wider">
                      <FileText className="mr-1.5 h-3 w-3" />
                      Resume View
                    </Button>
                  </Link>
                  <Link href="/accounts/profile?section=personaldetails">
                    <Button variant="outline" size="sm" className="h-8 rounded-lg text-[10px] uppercase tracking-wider">
                      <User2 className="mr-1.5 h-3 w-3" />
                      Details
                    </Button>
                  </Link>
                </div>
              </div>
              <Link href="/accounts/profile/edit" className="inline-flex">
                <Button className="w-full rounded-xl">
                  <PencilLine className="mr-2 h-4 w-4" />
                  Edit Display Profile
                </Button>
              </Link>
            </div>
          </div>
        </motion.section>

        <section className="grid gap-4 md:grid-cols-3">
          <MetricTile
            label="Email Status"
            value={user.emailVerified ? 'Verified' : 'Pending Verification'}
            detail="Verification helps secure your account."
            icon={BadgeCheck}
          />
          <MetricTile
            label="Subscription"
            value={subscription && hasActiveSubscription(subscription) && subscription.plan ? `${subscription.plan} Plan` : 'Starter'}
            detail={subscription && hasActiveSubscription(subscription) && subscription.plan ? 'Lifetime Access' : 'Upgrade anytime from billing.'}
            icon={Crown}
          />
          <MetricTile
            label="Onboarding"
            value={user.isOnboarded ? 'Completed' : 'In Progress'}
            detail="Complete onboarding for tailored insights."
            icon={CalendarCheck2}
          />
        </section>

        <ResumeDetailsSection />

        <section className="grid gap-4 lg:grid-cols-3">
          <Card className="rounded-3xl border-border bg-card lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <User2 className="h-5 w-5 text-primary" />
                Profile Snapshot
              </CardTitle>
              <CardDescription>Core profile details visible across your account experience.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-border bg-background/50 p-4">
                <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Display Name</p>
                <p className="mt-2 text-sm font-semibold text-foreground">{user.displayName || '-'}</p>
              </div>
              <div className="rounded-2xl border border-border bg-background/50 p-4">
                <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Email</p>
                <p className="mt-2 text-sm font-semibold text-foreground">{user.email}</p>
              </div>
              <div className="rounded-2xl border border-border bg-background/50 p-4">
                <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Target Role</p>
                <p className="mt-2 text-sm font-semibold text-foreground">{user.targetRole || 'Not configured'}</p>
              </div>
              <div className="rounded-2xl border border-border bg-background/50 p-4">
                <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Account State</p>
                <p className="mt-2 text-sm font-semibold text-foreground">{user.status || 'active'}</p>
              </div>
              <div className="rounded-2xl border border-border bg-background/50 p-4 sm:col-span-2">
                <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Bio</p>
                <p className="mt-2 text-sm leading-6 text-foreground">
                  {user.bio?.trim() ? user.bio : 'No bio added yet.'}
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <Card className="rounded-3xl border-border bg-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Shield className="h-5 w-5 text-primary" />
                  Security & Health
                </CardTitle>
                <CardDescription>Latest status from your user account service.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="rounded-2xl border border-border bg-background/50 p-3">
                  <p className="text-xs text-muted-foreground">Verification</p>
                  <p className="text-sm font-semibold text-foreground">
                    {user.emailVerified ? 'Email is verified' : 'Verification pending'}
                  </p>
                </div>
                <div className="rounded-2xl border border-border bg-background/50 p-3">
                  <p className="text-xs text-muted-foreground">Profile Sync</p>
                  <p className="text-sm font-semibold text-foreground">
                    {isError ? 'Last fetch failed' : 'Synced with user service'}
                  </p>
                </div>
                <div className="rounded-2xl border border-border bg-background/50 p-3">
                  <p className="text-xs text-muted-foreground">Career Target</p>
                  <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
                    <Target className="h-4 w-4 text-primary" />
                    {user.targetRole || 'No target role set'}
                  </p>
                </div>
                <Link href="/accounts/profile/edit" className="block pt-1">
                  <Button variant="outline" className="w-full rounded-xl">
                    Open Edit Profile
                    <ArrowUpRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <CertificationBadges />
          </div>
        </section>
      </div>
    </PageTransition>
  );
}

function ResumeFormatView({ user }: { user: UserProfile }) {
  return (
    <PageTransition>
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="flex items-center justify-between">
          <Link
            href="/accounts/profile"
            className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground hover:text-foreground"
          >
            <ArrowLeftIcon className="h-3.5 w-3.5" />
            Back to Profile
          </Link>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="rounded-lg" onClick={() => window.print()}>
              Print Resume
            </Button>
            <Link href="/onboarding/resume">
              <Button size="sm" className="rounded-lg">Update Resume</Button>
            </Link>
          </div>
        </div>

        <div className="overflow-hidden rounded-none border border-border bg-white p-12 text-slate-900 shadow-2xl dark:bg-white dark:text-slate-900 print:border-none print:p-0 print:shadow-none">
          <header className="border-b-2 border-slate-900 pb-8 text-center">
            <h1 className="text-4xl font-black uppercase tracking-tight text-slate-900">{user.displayName || 'Your Name'}</h1>
            <p className="mt-2 text-lg font-medium text-slate-700">{user.targetRole || 'Professional Role'}</p>
            <div className="mt-4 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm font-medium text-slate-600">
              <span className="flex items-center gap-1.5"><Mail className="h-3.5 w-3.5" /> {user.email}</span>
              {user.socialLinks?.linkedin && (
                <a href={user.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 hover:underline">
                  <Linkedin className="h-3.5 w-3.5" /> LinkedIn
                </a>
              )}
              {user.socialLinks?.github && (
                <a href={user.socialLinks.github} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 hover:underline">
                  <Github className="h-3.5 w-3.5" /> GitHub
                </a>
              )}
              {user.socialLinks?.portfolio && (
                <a href={user.socialLinks.portfolio} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 hover:underline">
                  <Globe className="h-3.5 w-3.5" /> Portfolio
                </a>
              )}
            </div>
          </header>

          <div className="mt-10 space-y-10">
            <section>
              <h2 className="mb-4 border-b border-slate-300 pb-1 text-sm font-black uppercase tracking-widest text-slate-900">
                Professional Summary
              </h2>
              <p className="text-sm leading-relaxed text-slate-800">
                {user.bio || 'Experienced professional with a focus on delivering high-quality solutions and continuous growth in the technology sector.'}
              </p>
            </section>

            <div className="rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/50 p-12 text-center">
              <p className="text-slate-500 italic text-sm">
                Full structured details from your resume (Experience, Projects, Education, and Skills) are being synchronized and will be rendered in this document format shortly.
              </p>
              <Link href="/onboarding/resume" className="mt-6 inline-block text-primary font-bold hover:underline">
                Complete your resume profile →
              </Link>
            </div>
          </div>

          <footer className="mt-20 border-t border-slate-100 pt-8 text-center text-[10px] uppercase tracking-widest text-slate-400">
            Generated via Nova Platform • {new Date().toLocaleDateString()}
          </footer>
        </div>
      </div>
    </PageTransition>
  );
}

function PersonalDetailsView({ user }: { user: UserProfile }) {
  return (
    <PageTransition>
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex items-center justify-between">
          <Link
            href="/accounts/profile"
            className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground hover:text-foreground"
          >
            <ArrowLeftIcon className="h-3.5 w-3.5" />
            Back to Profile
          </Link>
          <h1 className="text-xl font-black tracking-tight text-foreground">Personal & Social Details</h1>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="rounded-3xl border-border bg-card shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <User2 className="h-5 w-5 text-primary" />
                Identity & Bio
              </CardTitle>
              <CardDescription>Your public identity across the platform.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">About You</p>
                <p className="text-sm leading-7 text-foreground">
                  {user.bio || 'You haven\'t added a bio yet. Go to edit profile to share your story.'}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-2xl border border-border bg-background/50 p-4">
                  <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Full Name</p>
                  <p className="mt-1 text-sm font-semibold">{user.displayName || 'Member'}</p>
                </div>
                <div className="rounded-2xl border border-border bg-background/50 p-4">
                  <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Primary Email</p>
                  <p className="mt-1 text-sm font-semibold">{user.email}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-border bg-card shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Globe className="h-5 w-5 text-primary" />
                Digital Presence
              </CardTitle>
              <CardDescription>Connect your professional handles.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <SocialItem label="LinkedIn" value={user.socialLinks?.linkedin} icon={Linkedin} />
              <SocialItem label="GitHub" value={user.socialLinks?.github} icon={Github} />
              <SocialItem label="Twitter / X" value={user.socialLinks?.twitter} icon={Twitter} />
              <SocialItem label="Portfolio" value={user.socialLinks?.portfolio} icon={Globe} />

              <div className="pt-3">
                <Link href="/accounts/profile/edit">
                  <Button variant="outline" className="w-full rounded-xl">
                    <PencilLine className="mr-2 h-4 w-4" />
                    Edit Personal Details
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageTransition>
  );
}

function CertificationBadges() {
  const { data: catalog, isLoading } = useExamCatalogQuery();
  const passedExams = catalog?.filter((item) => item.progress?.status === 'PASSED') ?? [];

  return (
    <Card className="rounded-3xl border-border bg-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <Medal className="h-5 w-5 text-primary" />
          Certifications
        </CardTitle>
        <CardDescription>Badges earned from professional skill assessments.</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex gap-2 overflow-x-auto pb-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-12 w-12 rounded-full shrink-0" />
            ))}
          </div>
        ) : passedExams.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-6 text-center">
            <p className="text-xs text-muted-foreground">No certifications earned yet.</p>
            <Link href="/exam" className="mt-2 inline-block text-xs font-bold text-primary hover:underline">
              Browse Exams →
            </Link>
          </div>
        ) : (
          <div className="flex flex-wrap gap-3">
            {passedExams.map((exam) => (
              <div
                key={exam.skillName}
                title={`${exam.title} Certified`}
                className="group relative flex h-14 w-14 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-xl shadow-sm transition-all hover:scale-110 hover:bg-primary/20"
              >
                {exam.skillName.includes('python') ? '🐍' : 
                 exam.skillName.includes('react') ? '⚛️' : 
                 exam.skillName.includes('node') ? '🟢' : 
                 exam.skillName.includes('typescript') ? '🟦' : 
                 exam.skillName.includes('docker') ? '🐳' : 
                 exam.skillName.includes('aws') ? '☁️' : '🏆'}
                <div className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground shadow-sm">
                  <BadgeCheck className="h-3 w-3" />
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function SocialItem({ label, value, icon: Icon }: { label: string; value?: string; icon: any }) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-border bg-background/40 p-4 transition-colors hover:bg-background/60">
      <div className="flex items-center gap-3">
        <div className="rounded-xl border border-border bg-muted/30 p-2">
          <Icon className="h-4 w-4 text-primary" />
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">{label}</p>
          <p className="text-sm font-semibold text-foreground truncate max-w-[200px]">
            {value ? (
              <a href={value} target="_blank" rel="noopener noreferrer" className="hover:underline">
                {value.replace(/^https?:\/\/(www\.)?/, '')}
              </a>
            ) : (
              'Not provided'
            )}
          </p>
        </div>
      </div>
      {value && <ArrowUpRight className="h-4 w-4 text-muted-foreground" />}
    </div>
  );
}

function ArrowLeftIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="m12 19-7-7 7-7" />
      <path d="M19 12H5" />
    </svg>
  );
}
