'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowUpRight,
  BriefcaseBusiness,
  Clock3,
  FileText,
  FolderGit2,
  GraduationCap,
  Sparkles,
  Wrench,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { getStoredResume } from '@/services/resumeService';

function prettyDate(value?: string | null) {
  if (!value) {
    return 'N/A';
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return parsed.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

function DateRange({
  start,
  end,
  active = false,
}: {
  start?: string;
  end?: string;
  active?: boolean;
}) {
  return (
    <p className="text-xs text-muted-foreground">
      {prettyDate(start)} - {active ? 'Present' : prettyDate(end)}
    </p>
  );
}

function MetricCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: typeof Sparkles;
}) {
  return (
    <div className="rounded-2xl border border-border bg-background/60 p-4">
      <div className="mb-2 inline-flex rounded-lg border border-border bg-muted/40 p-2">
        <Icon className="h-4 w-4 text-primary" />
      </div>
      <p className="text-[11px] uppercase tracking-[0.15em] text-muted-foreground">{label}</p>
      <p className="mt-1 text-base font-semibold text-foreground">{value}</p>
    </div>
  );
}

export function ResumeDetailsSection() {
  const { data, isLoading } = useQuery({
    queryKey: ['profile-stored-resume'],
    queryFn: () => getStoredResume(false),
  });

  if (isLoading) {
    return (
      <section className="space-y-4">
        <Skeleton className="h-10 w-64 rounded-lg" />
        <div className="grid gap-4 md:grid-cols-4">
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
        </div>
        <Skeleton className="h-52 rounded-3xl" />
      </section>
    );
  }

  if (!data) {
    return (
      <Card className="rounded-3xl border-border bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <FileText className="h-5 w-5 text-primary" />
            Resume Details
          </CardTitle>
          <CardDescription>No resume found for this account yet.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild className="rounded-xl">
            <Link href="/onboarding/resume">
              Build Resume
              <ArrowUpRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const resume = data.resume;
  const skills = Array.isArray(resume.skills) ? resume.skills : [];
  const experience = Array.isArray(resume.experience) ? resume.experience : [];
  const projects = Array.isArray(resume.projects) ? resume.projects : [];
  const education = Array.isArray(resume.education) ? resume.education : [];

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-foreground">Resume Details</h2>
          <p className="text-sm text-muted-foreground">Your structured resume snapshot is shown here in separate modules.</p>
        </div>
        <Button asChild variant="outline" className="rounded-xl">
          <Link href="/onboarding/resume">
            Update Resume
            <ArrowUpRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Completeness" value={`${data.completenessScore}%`} icon={Sparkles} />
        <MetricCard label="ATS Score" value={`${data.atsScore}%`} icon={Wrench} />
        <MetricCard label="Version" value={`v${data.version}`} icon={Clock3} />
        <MetricCard label="Updated" value={prettyDate(data.updatedAt)} icon={FileText} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="rounded-3xl border-border bg-card">
          <CardHeader>
            <CardTitle className="text-lg">Professional Summary</CardTitle>
            <CardDescription>Headline and role summary pulled from your latest resume.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-2xl border border-border bg-background/50 p-4">
              <p className="text-xs uppercase tracking-[0.15em] text-muted-foreground">Title</p>
              <p className="mt-1 text-sm font-semibold text-foreground">{resume.title || data.title || 'Untitled Resume'}</p>
            </div>
            <div className="rounded-2xl border border-border bg-background/50 p-4">
              <p className="text-xs uppercase tracking-[0.15em] text-muted-foreground">Summary</p>
              <p className="mt-2 text-sm leading-6 text-foreground">
                {resume.summary?.trim() || 'No summary provided in your latest resume.'}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-border bg-card">
          <CardHeader>
            <CardTitle className="text-lg">Skills</CardTitle>
            <CardDescription>{skills.length} skills captured in your structured resume.</CardDescription>
          </CardHeader>
          <CardContent>
            {skills.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {skills.slice(0, 14).map((skill, index) => (
                  <span
                    key={`${skill.name}-${index}`}
                    className="inline-flex items-center rounded-full border border-border bg-background/70 px-3 py-1 text-xs font-medium text-foreground"
                  >
                    {skill.name}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No skills added yet.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="rounded-3xl border-border bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <BriefcaseBusiness className="h-4 w-4 text-primary" />
              Experience
            </CardTitle>
            <CardDescription>{experience.length} roles listed.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {experience.length > 0 ? (
              experience.slice(0, 2).map((item, index) => {
                const technologies = Array.isArray(item.technologies) ? item.technologies : [];

                return (
                  <div key={`${item.company}-${index}`} className="rounded-2xl border border-border bg-background/50 p-4">
                    <p className="text-sm font-semibold text-foreground">{item.role || 'Role'} at {item.company || 'Company'}</p>
                    <DateRange start={item.startDate} end={item.endDate} active={item.isCurrent} />
                    {technologies.length > 0 ? (
                      <p className="mt-2 text-xs text-muted-foreground">Tech: {technologies.slice(0, 5).join(', ')}</p>
                    ) : null}
                  </div>
                );
              })
            ) : (
              <p className="text-sm text-muted-foreground">No experience entries yet.</p>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-border bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <FolderGit2 className="h-4 w-4 text-primary" />
              Projects
            </CardTitle>
            <CardDescription>{projects.length} projects listed.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {projects.length > 0 ? (
              projects.slice(0, 2).map((project, index) => {
                const technologies = Array.isArray(project.technologies) ? project.technologies : [];

                return (
                  <div key={`${project.name}-${index}`} className="rounded-2xl border border-border bg-background/50 p-4">
                    <p className="text-sm font-semibold text-foreground">{project.name || 'Project'}</p>
                    {project.role ? <p className="text-xs text-muted-foreground">{project.role}</p> : null}
                    {technologies.length > 0 ? (
                      <p className="mt-2 text-xs text-muted-foreground">Tech: {technologies.slice(0, 5).join(', ')}</p>
                    ) : null}
                  </div>
                );
              })
            ) : (
              <p className="text-sm text-muted-foreground">No projects listed yet.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-3xl border-border bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <GraduationCap className="h-4 w-4 text-primary" />
            Education
          </CardTitle>
          <CardDescription>{education.length} education records listed.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2">
          {education.length > 0 ? (
            education.slice(0, 4).map((item, index) => (
              <div key={`${item.institution}-${index}`} className="rounded-2xl border border-border bg-background/50 p-4">
                <p className="text-sm font-semibold text-foreground">{item.institution || 'Institution'}</p>
                <p className="text-xs text-muted-foreground">
                  {[item.degree, item.field].filter(Boolean).join(' - ') || 'Degree not specified'}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {[item.startYear, item.endYear].filter(Boolean).join(' - ') || 'Year not specified'}
                </p>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">No education details listed yet.</p>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
