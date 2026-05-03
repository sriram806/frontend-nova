'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Server,
  Layout,
  Layers,
  Brain,
  Cloud,
  Check,
  Plus,
  Briefcase,
  MapPin,
  Sparkles,
  ArrowLeft,
  ArrowRight,
  Monitor
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import { PageTransition } from '@/components/common/page-transition';
import { Stepper } from '@/components/common/stepper';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { BackgroundBloom } from '@/components/ui/background-bloom';
import { targetRoleSchema, TargetRoleInput } from '@/lib/schemas/onboarding';
import { useSaveTargetRoleMutation } from '@/hooks/queries/useOnboardingQueries';
import { useUserStore } from '@/store/userStore';
import { cn } from '@/lib/utils';
import { Field, AuthButton, Card } from '@/components/auth/form-primitives';

const featuredRoles = [
  { id: 'Backend', name: 'Backend Engineer', icon: Server, color: 'from-blue-500/20 to-cyan-500/20', glow: 'group-hover:shadow-blue-500/20', skills: ['Node.js', 'PostgreSQL', 'Redis', 'Docker', 'GraphQL'] },
  { id: 'Frontend', name: 'Frontend Engineer', icon: Layout, color: 'from-cyan-500/20 to-emerald-500/20', glow: 'group-hover:shadow-cyan-500/20', skills: ['React', 'TypeScript', 'Tailwind', 'Next.js', 'Vite'] },
  { id: 'FullStack', name: 'Full Stack Engineer', icon: Layers, color: 'from-indigo-500/20 to-purple-500/20', glow: 'group-hover:shadow-indigo-500/20', skills: ['Node.js', 'React', 'TypeScript', 'Prisma', 'PostgreSQL'] },
  { id: 'AI', name: 'AI / ML Engineer', icon: Brain, color: 'from-purple-500/20 to-pink-500/20', glow: 'group-hover:shadow-purple-500/20', skills: ['Python', 'PyTorch', 'OpenAI', 'TensorFlow', 'NLP'] },
  { id: 'DevOps', name: 'DevOps & Cloud', icon: Cloud, color: 'from-emerald-500/20 to-teal-500/20', glow: 'group-hover:shadow-emerald-500/20', skills: ['AWS', 'K8s', 'Terraform', 'CI/CD', 'Linux'] },
];

const levels = [
  { value: 'junior', label: 'Junior' },
  { value: 'mid', label: 'Mid' },
  { value: 'senior', label: 'Senior' },
  { value: 'lead', label: 'Lead' },
  { value: 'principal', label: 'Principal' },
];

const locations = [
  { value: 'Remote', label: 'Remote' },
  { value: 'Hybrid', label: 'Hybrid' },
  { value: 'On-site', label: 'On-site' },
];

export default function TargetRolePage() {
  const router = useRouter();
  const saveTargetRole = useSaveTargetRoleMutation();
  const setTargetRoleInStore = useUserStore((state) => state.setTargetRole);
  const [customKeyword, setCustomKeyword] = useState('');

  const form = useForm<TargetRoleInput>({
    resolver: zodResolver(targetRoleSchema),
    defaultValues: {
      title: '',
      level: 'junior',
      industry: '',
      locationPreference: 'Remote',
      keywords: [],
    },
  });

  const selectedTitle = form.watch('title');
  const selectedKeywords = form.watch('keywords');

  const toggleKeyword = (keyword: string) => {
    const current = form.getValues('keywords');
    if (current.includes(keyword)) {
      form.setValue('keywords', current.filter(k => k !== keyword), { shouldValidate: true });
    } else {
      form.setValue('keywords', [...current, keyword], { shouldValidate: true });
    }
  };

  const addCustomKeyword = () => {
    if (!customKeyword.trim()) return;
    toggleKeyword(customKeyword.trim());
    setCustomKeyword('');
  };

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await saveTargetRole.mutateAsync(values);
      setTargetRoleInStore(values);
      router.push('/onboarding/resume');
    } catch (error) {
      console.error('Failed to save target role:', error);
    }
  });

  const selectedRoleObj = featuredRoles.find(r => r.name === selectedTitle);

  return (
    <PageTransition>
      <div className="relative min-h-screen">
        <BackgroundBloom color="violet" size="xl" position="center" className="opacity-20" />

        <div className="relative z-10 mx-auto w-full max-w-6xl py-20 px-8 space-y-20">
          <div className="h-4" />

          <div className="text-center space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Badge variant="outline" className="border-primary/20 text-primary px-4 py-1.5 rounded-full uppercase tracking-widest text-[10px] font-bold bg-primary/5 backdrop-blur-md">
                Final Step
              </Badge>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-6xl md:text-7xl font-black tracking-tight bg-gradient-to-b from-white to-white/40 bg-clip-text text-transparent"
            >
              The Next Chapter.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-muted-foreground text-xl max-w-2xl mx-auto font-medium"
            >
              Define your destination. We'll handle the navigation, roadblocks, and final arrival.
            </motion.p>
          </div>

          <Stepper
            currentStepId="target-role"
            steps={[
              { id: 'resume', label: 'Resume Builder' },
              { id: 'target-role', label: 'Target Role' },
            ]}
          />

          <Form {...form}>
            <form onSubmit={onSubmit} className="space-y-24">
              {/* Step 1: Role Selection */}
              <div className="space-y-8">
                <div className="flex items-center justify-center gap-4">
                  <div className="h-px w-12 bg-white/10" />
                  <h2 className="text-xs font-black uppercase tracking-[0.3em] text-white/40">Select Your Track</h2>
                  <div className="h-px w-12 bg-white/10" />
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-5 gap-6">
                  {featuredRoles.map((role, idx) => {
                    const isSelected = selectedTitle === role.name;
                    const Icon = role.icon;
                    return (
                      <motion.div
                        key={role.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5, delay: idx * 0.05 }}
                        onClick={() => form.setValue('title', role.name)}
                        className={cn(
                          "relative group cursor-pointer aspect-[4/5] rounded-[3rem] border transition-all duration-700 overflow-hidden flex flex-col items-center justify-end pb-10 gap-5 px-6 shadow-2xl",
                          isSelected
                            ? "border-primary bg-primary/10 ring-1 ring-primary/50 shadow-primary/20 scale-105"
                            : "border-white/5 bg-white/[0.02] hover:border-white/10 hover:bg-white/[0.04]",
                          role.glow
                        )}
                      >
                        <div className={cn(
                          "absolute inset-0 bg-gradient-to-b opacity-0 group-hover:opacity-100 transition-opacity duration-1000",
                          role.color,
                          isSelected && "opacity-100"
                        )} />

                        <div className={cn(
                          "relative z-10 p-6 rounded-[2rem] transition-all duration-700 mb-2",
                          isSelected ? "bg-white text-black scale-110 shadow-2xl" : "bg-white/5 text-white/20 group-hover:text-white"
                        )}>
                          <Icon className="h-12 w-12" />
                        </div>

                        <span className={cn(
                          "relative z-10 font-black text-lg text-center transition-colors duration-500 tracking-tight",
                          isSelected ? "text-white" : "text-white/40 group-hover:text-white/80"
                        )}>
                          {role.name}
                        </span>

                        <AnimatePresence>
                          {isSelected && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0 }}
                              className="absolute top-6 right-6 h-8 w-8 rounded-full bg-primary flex items-center justify-center"
                            >
                              <Check className="h-4 w-4 text-primary-foreground" />
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              {/* Step 2: Details (Revealed) */}
              <AnimatePresence>
                {selectedTitle && (
                  <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 40 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="grid grid-cols-1 xl:grid-cols-5 gap-16"
                  >
                    {/* Left: Preferences (3 cols) */}
                    <div className="xl:col-span-3 space-y-12">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        <FormField
                          control={form.control}
                          name="level"
                          render={({ field }) => (
                            <FormItem className="space-y-6">
                              <FormLabel className="text-xs font-black uppercase tracking-widest text-white/40 flex items-center gap-2">
                                <Briefcase className="h-4 w-4 text-primary" /> Seniority
                              </FormLabel>
                              <ToggleGroup
                                type="single"
                                value={field.value}
                                onValueChange={(val) => val && field.onChange(val)}
                                className="flex flex-wrap justify-start gap-3"
                              >
                                {levels.map((l) => (
                                  <ToggleGroupItem
                                    key={l.value}
                                    value={l.value}
                                    className="h-14 px-8 rounded-2xl border-white/5 bg-white/[0.03] hover:bg-white/[0.08] data-[state=on]:bg-primary data-[state=on]:text-primary-foreground font-black transition-all shadow-xl shadow-primary/10"
                                  >
                                    {l.label}
                                  </ToggleGroupItem>
                                ))}
                              </ToggleGroup>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="locationPreference"
                          render={({ field }) => (
                            <FormItem className="space-y-6">
                              <FormLabel className="text-xs font-black uppercase tracking-widest text-white/40 flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-secondary" /> Workspace
                              </FormLabel>
                              <ToggleGroup
                                type="single"
                                value={field.value}
                                onValueChange={(val) => val && field.onChange(val)}
                                className="flex flex-wrap justify-start gap-3"
                              >
                                {locations.map((lp) => (
                                  <ToggleGroupItem
                                    key={lp.value}
                                    value={lp.value}
                                    className="h-14 px-8 rounded-2xl border-white/5 bg-white/[0.03] hover:bg-white/[0.08] data-[state=on]:bg-white data-[state=on]:text-black font-black transition-all shadow-xl"
                                  >
                                    {lp.label}
                                  </ToggleGroupItem>
                                ))}
                              </ToggleGroup>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="industry"
                        render={({ field }) => (
                          <FormItem className="space-y-6">
                            <FormLabel className="text-xs font-black uppercase tracking-widest text-white/40 flex items-center gap-2">
                              <Sparkles className="h-4 w-4 text-aurora-violet" /> Target Domain
                            </FormLabel>
                            <FormControl>
                              <Field
                                label="Target Domain / Industry"
                                placeholder="What industry are you targeting? (e.g. HealthTech, FinTech)"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Right: Skills (2 cols) */}
                    <Card className="xl:col-span-2 p-10 relative overflow-hidden group">
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />

                      <div className="relative z-10 space-y-10">
                        <div className="space-y-2">
                          <h3 className="text-2xl font-black tracking-tight">Focus Areas</h3>
                          <p className="text-muted-foreground font-medium">Select the core technologies for your roadmap.</p>
                        </div>

                        <div className="space-y-8">
                          <div className="flex flex-wrap gap-2.5">
                            {selectedRoleObj?.skills.map((skill) => (
                              <Badge
                                key={skill}
                                onClick={() => toggleKeyword(skill)}
                                className={cn(
                                  "cursor-pointer px-5 py-2.5 rounded-2xl border-2 transition-all duration-300 font-bold text-sm",
                                  selectedKeywords.includes(skill)
                                    ? "bg-white text-black border-white shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                                    : "bg-white/5 text-white/40 border-transparent hover:border-white/20 hover:text-white hover:bg-white/10"
                                )}
                              >
                                {skill}
                              </Badge>
                            ))}
                          </div>

                          <div className="space-y-4">
                            <div className="relative">
                              <Input
                                placeholder="Add custom technology..."
                                className="h-14 bg-white/5 border-white/5 rounded-2xl pr-14 pl-6 font-medium italic focus:bg-white/10"
                                value={customKeyword}
                                onChange={(e) => setCustomKeyword(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault();
                                    addCustomKeyword();
                                  }
                                }}
                              />
                              <Button
                                type="button"
                                size="icon"
                                onClick={addCustomKeyword}
                                className="absolute right-2 top-2 h-10 w-10 rounded-xl bg-primary hover:bg-primary/80 transition-colors"
                              >
                                <Plus className="h-5 w-5 text-primary-foreground" />
                              </Button>
                            </div>

                            <div className="flex flex-wrap gap-2">
                              {selectedKeywords.filter(k => !selectedRoleObj?.skills.includes(k)).map(k => (
                                <Badge
                                  key={k}
                                  className="bg-primary/20 text-primary border-primary/30 px-4 py-2 rounded-xl flex items-center gap-2 font-bold animate-in zoom-in-50 duration-300"
                                >
                                  {k}
                                  <div className="h-4 w-px bg-primary/20 mx-1" />
                                  <Plus className="h-3 w-3 rotate-45 cursor-pointer hover:scale-125 transition-transform" onClick={() => toggleKeyword(k)} />
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>

                    {/* Final CTA (Full Width) */}
                    <div className="xl:col-span-5 pt-12 flex flex-col md:flex-row items-center justify-between p-12 bg-white text-black rounded-[4rem] gap-8 shadow-2xl relative overflow-hidden">
                      <div className="absolute right-[-10%] top-[-20%] h-64 w-64 bg-primary/20 blur-[100px] rounded-full" />
                      <div className="relative z-10 space-y-2 text-center md:text-left">
                        <h4 className="text-3xl font-black tracking-tighter">Everything looks perfect.</h4>
                        <p className="text-black/60 text-lg font-semibold">Your personalized career engine is ready to fire up.</p>
                      </div>

                      <AuthButton
                        type="submit"
                        disabled={saveTargetRole.isPending}
                        className="w-auto h-20 px-16 rounded-[2.5rem] bg-black text-white hover:bg-black/80 text-2xl font-black shadow-2xl flex items-center gap-4 transition-all hover:scale-105 active:scale-95 group"
                      >
                        {saveTargetRole.isPending ? 'Syncing...' : 'Build Roadmap'}
                        <ArrowRight className="h-8 w-8 group-hover:translate-x-2 transition-transform" />
                      </AuthButton>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </form>
          </Form>
        </div>
      </div>
    </PageTransition>
  );
}
