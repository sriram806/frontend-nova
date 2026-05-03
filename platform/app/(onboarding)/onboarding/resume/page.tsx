'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useFieldArray } from 'react-hook-form';
import {
  User,
  Link as LinkIcon,
  FileText,
  Zap,
  Code2,
  Briefcase,
  Trophy,
  GraduationCap,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Save,
  Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

import { PageTransition } from '@/components/common/page-transition';
import { BackgroundBloom } from '@/components/ui/background-bloom';
import { useSaveResumeMutation } from '@/hooks/queries/useOnboardingQueries';
import { ResumeInput, resumeSchema } from '@/lib/schemas/onboarding';
import { useUserStore } from '@/store/userStore';
import { cn } from '@/lib/utils';
import { ConfettiCelebration } from '@/components/common/confetti';

// Custom Components
import {
  ModernCard,
  FloatingLabelInput,
  FloatingLabelTextArea,
  TagInput,
  DynamicSection,
  BulletPointsInput,
  SkillSelector
} from '@/components/onboarding/resume-components';
import { AuthButton } from '@/components/auth/form-primitives';
import { normalizeSkillName, getRecommendedSkillsForRole } from '@/utils/skillNormalization';

const STEPS = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'links', label: 'Links', icon: LinkIcon },
  { id: 'summary', label: 'Summary', icon: FileText },
  { id: 'skills', label: 'Skills', icon: Zap },
  { id: 'projects', label: 'Projects', icon: Code2 },
  { id: 'experience', label: 'Experience', icon: Briefcase },
  { id: 'achievements', label: 'Achievements', icon: Trophy },
  { id: 'education', label: 'Education', icon: GraduationCap },
  { id: 'review', label: 'Review', icon: CheckCircle2 },
];

export default function SdeResumeBuilderPage() {
  const router = useRouter();
  const saveResume = useSaveResumeMutation();
  const resumeDraft = useUserStore((state) => state.resumeDraft);
  const setResumeDraft = useUserStore((state) => state.setResumeDraft);
  const clearOnboarding = useUserStore((s) => s.clearOnboarding);
  const lastSavedAt = useUserStore((state) => state.lastSavedAt);

  const [activeStep, setActiveStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const form = useForm<ResumeInput>({
    resolver: zodResolver(resumeSchema),
    mode: 'onChange',
    defaultValues: resumeDraft || {
      profile: { name: '', email: '', phone: '', address: '' },
      links: { linkedUrl: '', githubUrl: '', portfolioUrl: '', resumePdfUrl: '' },
      summary: '',
      skills: [],
      projects: [{ name: '', techStack: [], link: '', bullets: ['', '', ''] }],
      experience: [],
      achievements: [],
      education: [{ degree: '', college: '', cgpa: '', year: '' }],
    },
  });

  const { control, watch, setValue, trigger, formState: { errors, isValid } } = form;

  // Field Arrays for dynamic sections
  const { fields: projectFields, append: appendProject, remove: removeProject } = useFieldArray({ control, name: 'projects' });
  const { fields: expFields, append: appendExp, remove: removeExp } = useFieldArray({ control, name: 'experience' });
  const { fields: achFields, append: appendAch, remove: removeAch } = useFieldArray({ control, name: 'achievements' });
  const { fields: eduFields, append: appendEdu, remove: removeEdu } = useFieldArray({ control, name: 'education' });

  const watchedValues = watch();

  // Calculate profile completeness percentage
  const completeness = React.useMemo(() => {
    const fields = [
      watchedValues.profile?.name,
      watchedValues.profile?.email,
      watchedValues.profile?.phone,
      watchedValues.summary,
      watchedValues.skills?.length > 0,
      watchedValues.projects?.length > 0,
      watchedValues.experience?.length > 0,
      watchedValues.education?.length > 0,
    ];
    const filled = fields.filter(Boolean).length;
    return Math.round((filled / fields.length) * 100);
  }, [watchedValues]);

  // Local-first autosave (client only). Server sync happens only on explicit submit.
  useEffect(() => {
    const timeout = setTimeout(() => {
      const data = form.getValues();
      setResumeDraft(data);
      localStorage.setItem('sde_resume_draft', JSON.stringify(data));
    }, 2000);
    return () => clearTimeout(timeout);
  }, [watchedValues, setResumeDraft, form]);

  const nextStep = async () => {
    const fieldsToValidate = getFieldsForStep(STEPS[activeStep].id);
    const result = await trigger(fieldsToValidate as any);
    if (result) {
      setActiveStep(prev => Math.min(prev + 1, STEPS.length - 1));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      toast.error(`Please complete the ${STEPS[activeStep].label} section correctly.`);
    }
  };

  const prevStep = () => {
    if (activeStep === 0) {
      router.push('/onboarding/target-role');
      return;
    }
    setActiveStep(prev => Math.max(prev - 1, 0));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const onSubmit = async () => {
    setIsSubmitting(true);
    try {
      const values = form.getValues();
      setResumeDraft(values);
      localStorage.setItem('sde_resume_draft', JSON.stringify(values));
      // Deep diagnostic using Zod directly
      const zodCheck = resumeSchema.safeParse(values);

      console.log('Form Values:', values);
      console.log('Zod Validation:', zodCheck);

      if (zodCheck.success) {
        await saveResume.mutateAsync({
          mode: 'final',
          resume: values
        });
        toast.success('Career Profile Synchronized successfully!', {
          description: 'Your roadmap is being generated.',
          icon: '🚀'
        });
        setShowConfetti(true);
        setTimeout(() => {
          router.push('/dashboard');
        }, 3000);
      } else {
        console.error('Zod Validation Failed:', zodCheck.error.format());

        // Find the first error path
        const firstError = zodCheck.error.errors[0];
        const errorPath = firstError.path.join('.');
        const errorMessage = firstError.message;

        toast.error(`Validation Error: ${errorMessage} (${errorPath})`);

        // Try to identify the step from the path
        const pathBase = firstError.path[0] as string;
        const stepIdx = STEPS.findIndex(s => s.id === pathBase);
        if (stepIdx !== -1) {
          setActiveStep(stepIdx);
        } else if (pathBase === 'summary' || pathBase === 'skills') {
          setActiveStep(STEPS.findIndex(s => s.id === pathBase));
        }
      }
    } catch (error) {
      console.error('Submission error:', error);
      toast.error('An unexpected error occurred during synchronization.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getFieldsForStep = (stepId: string) => {
    switch (stepId) {
      case 'profile': return ['profile.name', 'profile.email', 'profile.phone', 'profile.address'];
      case 'links': return ['links.linkedUrl', 'links.githubUrl'];
      case 'summary': return ['summary'];
      case 'skills': return ['skills'];
      case 'projects': return ['projects'];
      case 'experience': return ['experience'];
      case 'achievements': return ['achievements'];
      case 'education': return ['education'];
      default: return [];
    }
  };

  const renderStepContent = () => {
    const step = STEPS[activeStep].id;

    switch (step) {
      case 'profile':
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-12"
          >
            <div className="space-y-6">
              <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-[10px] font-black uppercase tracking-[0.3em] text-primary shadow-lg shadow-primary/5">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                Phase 01 / Core Identity
              </div>
              <h2 className="text-7xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-white to-white/30 leading-[0.9]">Universal <br />Coordinates.</h2>
              <p className="text-white/30 text-xl font-medium max-w-xl leading-relaxed">The bedrock of your professional presence. This data anchors your profile across the global talent network.</p>
            </div>
            <ModernCard className="p-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                <FloatingLabelInput label="Full Name" {...form.register('profile.name')} error={errors.profile?.name?.message} />
                <FloatingLabelInput label="Email Address" type="email" {...form.register('profile.email')} error={errors.profile?.email?.message} />
                <FloatingLabelInput label="Phone Number" {...form.register('profile.phone')} error={errors.profile?.phone?.message} />
                <FloatingLabelInput label="Address / Location" {...form.register('profile.address')} error={errors.profile?.address?.message} />
              </div>
            </ModernCard>
          </motion.div>
        );

      case 'links':
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-12"
          >
            <div className="space-y-6">
              <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-[10px] font-black uppercase tracking-[0.3em] text-primary shadow-lg shadow-primary/5">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                Phase 02 / Digital Presence
              </div>
              <h2 className="text-7xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-white to-white/30 leading-[0.9]">Neural <br />Bridges.</h2>
              <p className="text-white/30 text-xl font-medium max-w-xl leading-relaxed">Map your digital ecosystem. Your code repositories and professional networks are the first validation points for high-performance teams.</p>
            </div>
            <ModernCard className="p-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                <FloatingLabelInput label="LinkedIn URL" {...form.register('links.linkedUrl')} error={errors.links?.linkedUrl?.message} />
                <FloatingLabelInput label="GitHub URL" {...form.register('links.githubUrl')} error={errors.links?.githubUrl?.message} />
                <FloatingLabelInput label="Portfolio URL (Optional)" {...form.register('links.portfolioUrl')} error={errors.links?.portfolioUrl?.message} />
                <FloatingLabelInput label="Resume PDF Link (Optional)" {...form.register('links.resumePdfUrl')} error={errors.links?.resumePdfUrl?.message} />
              </div>
            </ModernCard>
          </motion.div>
        );

      case 'summary':
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-12"
          >
            <div className="space-y-6">
              <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-[10px] font-black uppercase tracking-[0.3em] text-primary shadow-lg shadow-primary/5">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                Phase 03 / Mission Statement
              </div>
              <h2 className="text-7xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-white to-white/30 leading-[0.9]">Trajectory <br />Matrix.</h2>
              <p className="text-white/30 text-xl font-medium max-w-xl leading-relaxed">Define your professional velocity. A precise summary of your impact and technical evolution.</p>
            </div>
            <ModernCard className="p-10">
              <FloatingLabelTextArea
                label="Professional Summary"
                rows={8}
                {...form.register('summary')}
                error={errors.summary?.message}
                className="text-lg leading-relaxed"
              />
              <div className="mt-4 flex justify-end">
                <span className={cn(
                  "text-[10px] font-black uppercase tracking-widest",
                  watchedValues.summary.length >= 30 ? "text-emerald-500" : "text-white/20"
                )}>
                  {watchedValues.summary.length} / 1000 characters
                </span>
              </div>
            </ModernCard>
          </motion.div>
        );

      case 'skills':
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-12"
          >
            <div className="space-y-6">
              <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-[10px] font-black uppercase tracking-[0.3em] text-primary shadow-lg shadow-primary/5">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                Phase 04 / Technical Matrix
              </div>
              <h2 className="text-7xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-white to-white/30 leading-[0.9]">Skill <br />Arsenal.</h2>
              <p className="text-white/30 text-xl font-medium max-w-xl leading-relaxed">Your specialized power grid. Map the frameworks and technologies where you hold elite proficiency.</p>
            </div>
            <div className="space-y-12">
              <ModernCard className="p-10">
                <SkillSelector
                  label="Core Technical Arsenal"
                  skills={watchedValues.skills}
                  onAdd={(name) => {
                    const normalized = normalizeSkillName(name);
                    if (!watchedValues.skills.some(s => s.name === normalized)) {
                      setValue('skills', [...watchedValues.skills, { name: normalized, proficiency: 'intermediate' }], { shouldValidate: true });
                    }
                  }}
                  onRemove={(name) => setValue('skills', watchedValues.skills.filter(s => s.name !== name), { shouldValidate: true })}
                  onUpdateProficiency={(name, proficiency) => {
                    const newSkills = watchedValues.skills.map(s => s.name === name ? { ...s, proficiency } : s);
                    setValue('skills', newSkills, { shouldValidate: true });
                  }}
                  error={errors.skills?.message}
                />
              </ModernCard>

              {/* Recommendations Section */}
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="h-px flex-1 bg-white/5" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-white/20">Recommended for {useUserStore.getState().targetRole?.title || 'your role'}</span>
                  <div className="h-px flex-1 bg-white/5" />
                </div>
                <div className="flex flex-wrap gap-3 justify-center">
                  {getRecommendedSkillsForRole(useUserStore.getState().targetRole?.title || '').map(skill => {
                    const isSelected = watchedValues.skills.some(s => s.name === skill);
                    return (
                      <button
                        key={skill}
                        type="button"
                        disabled={isSelected || watchedValues.skills.length >= 5}
                        onClick={() => {
                          setValue('skills', [...watchedValues.skills, { name: skill, proficiency: 'intermediate' }], { shouldValidate: true });
                        }}
                        className={cn(
                          "px-6 py-3 rounded-2xl border text-sm font-bold transition-all",
                          isSelected
                            ? "bg-primary/20 border-primary/30 text-primary opacity-50 cursor-default"
                            : "bg-white/5 border-white/10 text-white/40 hover:text-white hover:bg-white/10 hover:border-white/20 active:scale-95"
                        )}
                      >
                        {skill}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </motion.div>
        );

      case 'projects':
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-12"
          >
            <div className="space-y-6">
              <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-[10px] font-black uppercase tracking-[0.3em] text-primary shadow-lg shadow-primary/5">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                Phase 05 / Proof of Work
              </div>
              <h2 className="text-7xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-white to-white/30 leading-[0.9]">Build <br />Chronicles.</h2>
              <p className="text-white/30 text-xl font-medium max-w-xl leading-relaxed">Showcase your high-performance builds. Your project history is the primary signal for technical execution capability.</p>
            </div>
            <DynamicSection
              title=""
              onAdd={() => appendProject({ name: '', techStack: [], link: '', bullets: ['', '', ''] })}
              onClear={() => {
                if (confirm('Clear all projects?')) {
                  setValue('projects', []);
                }
              }}
            >
              {projectFields.map((field, idx) => (
                <ModernCard key={field.id} className="relative group/card overflow-hidden">
                  <div className="absolute top-4 right-4 z-20">
                    <button
                      type="button"
                      onClick={() => removeProject(idx)}
                      className="group/del p-3 text-white/30 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all flex items-center gap-2 bg-[#0A0A0A]/80 backdrop-blur-md border border-white/5"
                    >
                      <span className="text-[10px] font-black uppercase tracking-widest hidden group-hover/del:block transition-all">Remove Project</span>
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="space-y-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                      <FloatingLabelInput label="Project Name" {...form.register(`projects.${idx}.name`)} error={errors.projects?.[idx]?.name?.message} />
                      <FloatingLabelInput label="Project Link (GitHub/Live)" {...form.register(`projects.${idx}.link`)} error={errors.projects?.[idx]?.link?.message} />
                    </div>
                    <div className="space-y-10">
                      <TagInput
                        label="Tech Stack"
                        tags={watchedValues.projects[idx]?.techStack || []}
                        error={errors.projects?.[idx]?.techStack?.message}
                        onAdd={(tag) => {
                          const current = [...(watchedValues.projects[idx]?.techStack || [])];
                          setValue(`projects.${idx}.techStack`, [...current, tag], { shouldValidate: true });
                        }}
                        onRemove={(tag) => {
                          const current = watchedValues.projects[idx]?.techStack || [];
                          setValue(`projects.${idx}.techStack`, current.filter(t => t !== tag), { shouldValidate: true });
                        }}
                      />
                      <BulletPointsInput
                        label="Key Technical Contributions (3 strong points)"
                        points={watchedValues.projects[idx]?.bullets || ['', '', '']}
                        error={errors.projects?.[idx]?.bullets?.message || (errors.projects?.[idx]?.bullets as any)?.[0]?.message || (errors.projects?.[idx]?.bullets as any)?.[1]?.message || (errors.projects?.[idx]?.bullets as any)?.[2]?.message}
                        onChange={(points) => setValue(`projects.${idx}.bullets` as any, points, { shouldValidate: true })}
                      />
                    </div>
                  </div>
                </ModernCard>
              ))}
            </DynamicSection>
          </motion.div>
        );

      case 'experience':
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-12"
          >
            <div className="space-y-6">
              <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-[10px] font-black uppercase tracking-[0.3em] text-primary shadow-lg shadow-primary/5">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                Phase 06 / Career Velocity
              </div>
              <h2 className="text-7xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-white to-white/30 leading-[0.9]">Evolution <br />Timeline.</h2>
              <p className="text-white/30 text-xl font-medium max-w-xl leading-relaxed">Map your professional growth. Focus on high-impact contributions and technical leadership within complex ecosystems.</p>
            </div>
            <DynamicSection
              title=""
              onAdd={() => appendExp({ company: '', role: '', duration: '', techStack: [], bullets: ['', '', ''] })}
              onClear={() => {
                if (confirm('Clear all experience entries?')) {
                  setValue('experience', []);
                }
              }}
            >
              {expFields.map((field, idx) => (
                <ModernCard key={field.id} className="relative group/card overflow-hidden">
                  <div className="absolute top-4 right-4 z-20">
                    <button
                      type="button"
                      onClick={() => removeExp(idx)}
                      className="group/del p-3 text-white/30 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all flex items-center gap-2 bg-[#0A0A0A]/80 backdrop-blur-md border border-white/5"
                    >
                      <span className="text-[10px] font-black uppercase tracking-widest hidden group-hover/del:block transition-all">Remove Experience</span>
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="space-y-10">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                      <FloatingLabelInput label="Company" {...form.register(`experience.${idx}.company`)} error={errors.experience?.[idx]?.company?.message} />
                      <FloatingLabelInput label="Role" {...form.register(`experience.${idx}.role`)} error={errors.experience?.[idx]?.role?.message} />
                      <FloatingLabelInput label="Duration (e.g. June 2021 - Present)" {...form.register(`experience.${idx}.duration`)} error={errors.experience?.[idx]?.duration?.message} />
                    </div>
                    <div className="space-y-10">
                      <TagInput
                        label="Technologies Used"
                        tags={watchedValues.experience[idx]?.techStack || []}
                        error={errors.experience?.[idx]?.techStack?.message}
                        onAdd={(tag) => {
                          const current = [...(watchedValues.experience[idx]?.techStack || [])];
                          setValue(`experience.${idx}.techStack`, [...current, tag], { shouldValidate: true });
                        }}
                        onRemove={(tag) => {
                          const current = watchedValues.experience[idx]?.techStack || [];
                          setValue(`experience.${idx}.techStack`, current.filter(t => t !== tag), { shouldValidate: true });
                        }}
                      />
                      <BulletPointsInput
                        label="Core Business Impact (3 points)"
                        points={watchedValues.experience[idx]?.bullets || ['', '', '']}
                        error={errors.experience?.[idx]?.bullets?.message || (errors.experience?.[idx]?.bullets as any)?.[0]?.message || (errors.experience?.[idx]?.bullets as any)?.[1]?.message || (errors.experience?.[idx]?.bullets as any)?.[2]?.message}
                        onChange={(points) => setValue(`experience.${idx}.bullets` as any, points, { shouldValidate: true })}
                      />
                    </div>
                  </div>
                </ModernCard>
              ))}
            </DynamicSection>
          </motion.div>
        );

      case 'achievements':
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-12"
          >
            <div className="space-y-6">
              <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-[10px] font-black uppercase tracking-[0.3em] text-primary shadow-lg shadow-primary/5">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                Phase 07 / Hall of Fame
              </div>
              <h2 className="text-7xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-white to-white/30 leading-[0.9]">Honors <br />Archive.</h2>
              <p className="text-white/30 text-xl font-medium max-w-xl leading-relaxed">Your elite milestones. Competitive rankings, certifications, and institutional recognitions of excellence.</p>
            </div>
            <DynamicSection
              title=""
              onAdd={() => appendAch({ title: '', description: '', link: '' })}
              onClear={() => {
                if (confirm('Clear all achievements?')) {
                  setValue('achievements', []);
                }
              }}
            >
              {achFields.map((field, idx) => (
                <ModernCard key={field.id} className="relative group/card">
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-end">
                    <div className="md:col-span-4">
                      <FloatingLabelInput label="Achievement Title" {...form.register(`achievements.${idx}.title`)} error={errors.achievements?.[idx]?.title?.message} />
                    </div>
                    <div className="md:col-span-5">
                      <FloatingLabelInput label="Context / Link" {...form.register(`achievements.${idx}.link`)} error={errors.achievements?.[idx]?.link?.message} />
                    </div>
                    <div className="md:col-span-2">
                      <button
                        type="button"
                        onClick={() => removeAch(idx)}
                        className="group/del w-full h-16 flex items-center justify-center gap-3 text-white/30 hover:text-red-400 hover:bg-red-400/10 rounded-2xl transition-all"
                      >
                        <span className="text-[10px] font-black uppercase tracking-widest opacity-0 group-hover/del:opacity-100 transition-opacity">Delete Achievement</span>
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </ModernCard>
              ))}
            </DynamicSection>
          </motion.div>
        );

      case 'education':
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-12"
          >
            <div className="space-y-6">
              <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-[10px] font-black uppercase tracking-[0.3em] text-primary shadow-lg shadow-primary/5">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                Phase 08 / Academic Foundation
              </div>
              <h2 className="text-7xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-white to-white/30 leading-[0.9]">System <br />Training.</h2>
              <p className="text-white/30 text-xl font-medium max-w-xl leading-relaxed">Your formal theoretical background. Degrees, technical certifications, and specialized institutional programs.</p>
            </div>
            <DynamicSection
              title=""
              onAdd={() => appendEdu({ degree: '', college: '', cgpa: '', year: '' })}
              onClear={() => {
                if (confirm('Clear all education entries?')) {
                  setValue('education', []);
                }
              }}
            >
              {eduFields.map((field, idx) => (
                <ModernCard key={field.id} className="relative group/card overflow-hidden">
                  <div className="absolute top-4 right-4 z-20">
                    <button
                      type="button"
                      onClick={() => removeEdu(idx)}
                      className="group/del p-3 text-white/30 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all flex items-center gap-2 bg-[#0A0A0A]/80 backdrop-blur-md border border-white/5"
                    >
                      <span className="text-[10px] font-black uppercase tracking-widest hidden group-hover/del:block transition-all">Remove Education</span>
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                    <FloatingLabelInput label="Degree / Branch" {...form.register(`education.${idx}.degree`)} error={errors.education?.[idx]?.degree?.message} />
                    <FloatingLabelInput label="College / University" {...form.register(`education.${idx}.college`)} error={errors.education?.[idx]?.college?.message} />
                    <FloatingLabelInput label="CGPA / Percentage" {...form.register(`education.${idx}.cgpa`)} error={errors.education?.[idx]?.cgpa?.message} />
                    <FloatingLabelInput label="Year of Passing" {...form.register(`education.${idx}.year`)} error={errors.education?.[idx]?.year?.message} />
                  </div>
                </ModernCard>
              ))}
            </DynamicSection>
          </motion.div>
        );

      case 'review':
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.98, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-12"
          >
            <div className="space-y-6">
              <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500 shadow-lg shadow-emerald-500/5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Final Validation / Profile Ready
              </div>
              <h2 className="text-7xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-white to-white/30 leading-[0.9]">Neural <br />Snapshot.</h2>
              <p className="text-white/30 text-xl font-medium max-w-xl leading-relaxed">Review your professional artifact before global synchronization. This is how high-performance systems will perceive your trajectory.</p>
            </div>

            <ModernCard className="p-0 overflow-hidden bg-white/[0.01] border-white/5 relative">
              <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-primary via-violet-500 to-cyan-500" />

              {!isValid && Object.keys(errors).length > 0 && (
                <div className="p-8 bg-red-500/10 border-b border-red-500/20">
                  <div className="flex items-center gap-3 mb-4 text-red-400">
                    <Trash2 className="h-5 w-5" />
                    <span className="text-xs font-black uppercase tracking-widest">Action Required: Validation Errors Detected</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {errors.profile && (
                      <div className="p-3 bg-red-500/5 rounded-xl border border-red-500/10">
                        <p className="text-[10px] font-black uppercase text-red-400 mb-1">Profile</p>
                        <p className="text-[11px] text-red-400/60 font-medium">Core identity data incomplete</p>
                      </div>
                    )}
                    {errors.links && (
                      <div className="p-3 bg-red-500/5 rounded-xl border border-red-500/10">
                        <p className="text-[10px] font-black uppercase text-red-400 mb-1">Links</p>
                        <p className="text-[11px] text-red-400/60 font-medium">Required digital links missing</p>
                      </div>
                    )}
                    {errors.summary && (
                      <div className="p-3 bg-red-500/5 rounded-xl border border-red-500/10">
                        <p className="text-[10px] font-black uppercase text-red-400 mb-1">Summary</p>
                        <p className="text-[11px] text-red-400/60 font-medium">{errors.summary.message}</p>
                      </div>
                    )}
                    {errors.skills && (
                      <div className="p-3 bg-red-500/5 rounded-xl border border-red-500/10">
                        <p className="text-[10px] font-black uppercase text-red-400 mb-1">Skills</p>
                        <p className="text-[11px] text-red-400/60 font-medium">Technical matrix empty</p>
                      </div>
                    )}
                    {errors.projects && (
                      <div className="p-3 bg-red-500/5 rounded-xl border border-red-500/10">
                        <p className="text-[10px] font-black uppercase text-red-400 mb-1">Projects</p>
                        <p className="text-[11px] text-red-400/60 font-medium">Verify all project fields & bullets</p>
                      </div>
                    )}
                    {errors.experience && (
                      <div className="p-3 bg-red-500/5 rounded-xl border border-red-500/10">
                        <p className="text-[10px] font-black uppercase text-red-400 mb-1">Experience</p>
                        <p className="text-[11px] text-red-400/60 font-medium">Verify professional history data</p>
                      </div>
                    )}
                    {errors.education && (
                      <div className="p-3 bg-red-500/5 rounded-xl border border-red-500/10">
                        <p className="text-[10px] font-black uppercase text-red-400 mb-1">Education</p>
                        <p className="text-[11px] text-red-400/60 font-medium">Academic foundation incomplete</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="p-12 space-y-16">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-12 border-b border-white/5">
                  <div className="space-y-3">
                    <h1 className="text-4xl font-black tracking-tight">{watchedValues.profile.name || "Untitled Profile"}</h1>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-white/40 font-medium">
                      <span>{watchedValues.profile.email}</span>
                      <span className="h-1 w-1 rounded-full bg-white/20" />
                      <span>{watchedValues.profile.phone}</span>
                      <span className="h-1 w-1 rounded-full bg-white/20" />
                      <span>{watchedValues.profile.address}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {watchedValues.links.githubUrl && (
                      <a href={watchedValues.links.githubUrl} target="_blank" className="p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-colors">
                        <Code2 className="h-5 w-5 text-primary" />
                      </a>
                    )}
                    {watchedValues.links.linkedUrl && (
                      <a href={watchedValues.links.linkedUrl} target="_blank" className="p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-colors">
                        <LinkIcon className="h-5 w-5 text-primary" />
                      </a>
                    )}
                  </div>
                </div>

                {/* Grid Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
                  {/* Left Column */}
                  <div className="lg:col-span-8 space-y-16">
                    <section className="space-y-4">
                      <h3 className="text-xs font-black uppercase tracking-[0.3em] text-primary/60">Summary</h3>
                      <p className="text-lg text-white/60 leading-relaxed font-medium">
                        {watchedValues.summary}
                      </p>
                    </section>

                    <section className="space-y-8">
                      <h3 className="text-xs font-black uppercase tracking-[0.3em] text-primary/60">Professional Experience</h3>
                      <div className="space-y-12">
                        {watchedValues.experience.map((exp, i) => (
                          <div key={i} className="space-y-4">
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="text-xl font-black">{exp.role}</h4>
                                <p className="text-white/40 font-bold">{exp.company}</p>
                              </div>
                              <span className="text-xs font-black uppercase tracking-widest text-white/20">{exp.duration}</span>
                            </div>
                            <ul className="space-y-3">
                              {exp.bullets.map((b, bi) => (
                                <li key={bi} className="flex gap-3 text-white/50 text-sm font-medium leading-relaxed">
                                  <span className="mt-2 h-1.5 w-1.5 rounded-full bg-primary/30 shrink-0" />
                                  {b}
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </section>

                    <section className="space-y-8">
                      <h3 className="text-xs font-black uppercase tracking-[0.3em] text-primary/60">Featured Projects</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {watchedValues.projects.map((proj, i) => (
                          <div key={i} className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 space-y-4">
                            <div className="flex justify-between items-start">
                              <h4 className="text-lg font-black">{proj.name}</h4>
                              <a href={proj.link} target="_blank" className="text-primary hover:text-white transition-colors">
                                <LinkIcon className="h-4 w-4" />
                              </a>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {proj.techStack.map(t => (
                                <span key={t} className="px-2 py-1 bg-white/5 rounded-md text-[10px] font-black uppercase tracking-widest text-white/40">{t}</span>
                              ))}
                            </div>
                            <ul className="space-y-2">
                              {proj.bullets.map((b, bi) => (
                                <li key={bi} className="text-[11px] text-white/40 font-medium leading-relaxed list-disc list-inside">{b}</li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </section>
                  </div>

                  {/* Right Column */}
                  <div className="lg:col-span-4 space-y-16">
                    <section className="space-y-6">
                      <h3 className="text-xs font-black uppercase tracking-[0.3em] text-primary/60">Technical Skills</h3>
                      <div className="flex flex-wrap gap-2">
                        {watchedValues.skills.map(s => (
                          <div key={s.name} className="flex flex-col gap-1 px-3 py-2 bg-primary/10 border border-primary/20 rounded-xl">
                            <span className="text-xs font-black tracking-wide text-primary">{s.name}</span>
                            <span className="text-[8px] font-black uppercase tracking-widest text-primary/40">{s.proficiency}</span>
                          </div>
                        ))}
                      </div>
                    </section>

                    <section className="space-y-6">
                      <h3 className="text-xs font-black uppercase tracking-[0.3em] text-primary/60">Education</h3>
                      <div className="space-y-4">
                        {watchedValues.education.map((edu, i) => (
                          <div key={i} className="space-y-4 p-6 rounded-3xl bg-white/[0.02] border border-white/5">
                            <h4 className="font-black text-white/80">{edu.degree}</h4>
                            <p className="text-sm text-white/40 font-bold">{edu.college}</p>
                            <div className="flex justify-between text-xs font-black uppercase tracking-widest text-primary">
                              <span>{edu.year}</span>
                              <span>{edu.cgpa} CGPA</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>

                    {watchedValues.achievements.length > 0 && (
                      <section className="space-y-6">
                        <h3 className="text-xs font-black uppercase tracking-[0.3em] text-primary/60">Honors</h3>
                        <div className="space-y-4">
                          {watchedValues.achievements.map((ach, i) => (
                            <div key={i} className="flex gap-4 items-start group">
                              <div className="p-2 bg-emerald-500/10 rounded-lg shrink-0">
                                <Trophy className="h-4 w-4 text-emerald-500" />
                              </div>
                              <div>
                                <h5 className="text-sm font-black text-white/70 group-hover:text-white transition-colors">{ach.title}</h5>
                                {ach.description && <p className="text-xs text-white/30">{ach.description}</p>}
                              </div>
                            </div>
                          ))}
                        </div>
                      </section>
                    )}
                  </div>
                </div>
              </div>
            </ModernCard>

            <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-[2.5rem] p-10 flex items-center gap-8 group">
              <div className="h-20 w-20 rounded-[2rem] bg-emerald-500/20 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-500">
                <CheckCircle2 className="h-10 w-10 text-emerald-500" />
              </div>
              <div>
                <h4 className="text-2xl font-black text-white selection:bg-emerald-500/20">All Systems Optimized.</h4>
                <p className="text-white/40 font-medium max-w-lg mt-1">Your professional identity has been mapped to ATS-optimized structures. Click Submit to finalize your core profile.</p>
              </div>
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <PageTransition>
      <div className="relative min-h-screen bg-[#050505] text-white selection:bg-primary/30">
        <ConfettiCelebration fire={showConfetti} />
        {/* Deep background aesthetics */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <BackgroundBloom color="violet" size="xl" position="top-right" className="opacity-[0.07] blur-[120px]" />
          <BackgroundBloom color="cyan" size="lg" position="bottom-left" className="opacity-[0.05] blur-[100px]" />
          <div className="absolute inset-0 [mask-image:radial-gradient(white,transparent_85%)] opacity-[0.03]"
            style={{
              backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)',
              backgroundSize: '40px 40px'
            }}
          />
        </div>

        <div className="flex min-h-screen">
          {/* Enhanced Sidebar with Glassmorphism */}
          <div className="w-80 border-r border-white/5 sticky top-0 h-screen p-10 flex flex-col justify-between hidden lg:flex bg-white/[0.01] backdrop-blur-3xl">
            <div className="space-y-12">
              <nav className="flex-1 space-y-2 py-3">
                {STEPS.map((step, idx) => {
                  const Icon = step.icon;
                  const isActive = activeStep === idx;
                  const isCompleted = activeStep > idx;

                  return (
                    <button
                      key={step.id}
                      type="button"
                      onClick={() => setActiveStep(idx)}
                      className={cn(
                        "w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all group relative overflow-hidden",
                        isActive
                          ? "bg-white/[0.08] text-white shadow-[0_0_20px_rgba(255,255,255,0.05)] border border-white/10"
                          : "text-white/20 hover:text-white/60 hover:bg-white/[0.02] border border-transparent"
                      )}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="active-indicator"
                          className="absolute left-0 w-1.5 h-8 bg-primary rounded-r-full shadow-[0_0_15px_rgba(139,92,246,0.5)]"
                        />
                      )}
                      <Icon className={cn(
                        "h-5 w-5 transition-all duration-500",
                        isActive ? "text-primary scale-110" : "text-white/20 group-hover:text-white/40"
                      )} />
                      <span className={cn(
                        "text-[10px] font-black uppercase tracking-[0.25em] transition-all",
                        isActive ? "translate-x-1" : ""
                      )}>
                        {step.label}
                      </span>
                      {isCompleted && (
                        <motion.div
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className="ml-auto"
                        >
                          <CheckCircle2 className="h-4 w-4 text-emerald-500/80" />
                        </motion.div>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>

            <div className="space-y-6">
              <div className="p-8 bg-white/[0.02] border border-white/5 rounded relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative space-y-4">
                  <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-[0.2em] text-white/40">
                    <span>Profile Vitality</span>
                    <span className="text-emerald-400 flex items-center gap-1.5">
                      <span className="h-1 w-1 rounded-full bg-emerald-400 animate-pulse" />
                    </span>
                    <span className="text-white font-black text-xl">{completeness}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${completeness}%` }}
                      transition={{ type: "spring", stiffness: 100, damping: 20 }}
                      className={cn(
                        "h-full transition-all duration-1000",
                        completeness > 80 ? "bg-gradient-to-r from-emerald-500 to-teal-400 shadow-[0_0_10px_rgba(16,185,129,0.3)]" :
                          completeness > 40 ? "bg-gradient-to-r from-primary to-violet-500 shadow-[0_0_10px_rgba(139,92,246,0.3)]" :
                            "bg-gradient-to-r from-amber-500 to-orange-400 shadow-[0_0_10px_rgba(245,158,11,0.3)]"
                      )}
                    />
                  </div>
                  <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest leading-relaxed">
                    Last local save: {lastSavedAt ? new Date(lastSavedAt).toLocaleTimeString() : 'Not saved yet'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (confirm('Are you sure you want to reset the builder? This will clear all draft data.')) {
                    clearOnboarding();
                    window.location.reload();
                  }
                }}
                className="group flex items-center gap-3 px-6 py-4 text-white/20 hover:text-red-400 transition-all border border-transparent hover:border-red-400/20 hover:bg-red-400/5 rounded-2xl w-full"
              >
                <Trash2 className="h-4 w-4" />
                <span className="text-[10px] font-black uppercase tracking-widest">Reset Builder</span>
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 p-8 lg:p-24 relative overflow-x-hidden">
            <div className="max-w-5xl mx-auto space-y-24 pb-40">
              <form onSubmit={(e) => e.preventDefault()} className="space-y-24">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeStep}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  >
                    {renderStepContent()}
                  </motion.div>
                </AnimatePresence>

                {/* Navigation Footer */}
                <div className="flex items-center justify-between pt-16 border-t border-white/5">
                  <button
                    type="button"
                    onClick={prevStep}
                    className={cn(
                      "group/btn flex items-center gap-3 px-10 py-5 rounded-[2rem] font-black text-xs uppercase tracking-[0.3em] transition-all",
                      activeStep === 0 ? "text-white/20 hover:text-white/40" : "text-white/40 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/10"
                    )}
                  >
                    <ArrowLeft className="h-5 w-5 group-hover/btn:-translate-x-1 transition-transform" />
                    {activeStep === 0 ? 'Back to Role' : 'Previous Phase'}
                  </button>

                  <div className="flex items-center gap-6">
                    {activeStep < STEPS.length - 1 ? (
                      <AuthButton
                        type="button"
                        onClick={nextStep}
                        className="w-auto px-12 py-5"
                      >
                        Advance Phase
                        <ArrowRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                      </AuthButton>
                    ) : (
                      <AuthButton
                        type="button"
                        onClick={onSubmit}
                        disabled={isSubmitting}
                        className="w-auto px-14 py-6"
                      >
                        {isSubmitting ? (
                          <>Synchronizing...</>
                        ) : (
                          <>
                            Finalize Profile
                            <Zap className="h-4 w-4 group-hover/btn:scale-125 transition-transform" />
                          </>
                        )}
                      </AuthButton>
                    )}
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>

  );
}
