'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { getOnboardingStatus } from '@/services/onboardingService';
import { Loader } from '@/components/Loader';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

export function HomeStatusManager() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [onboardingPath, setOnboardingPath] = useState<string | null>(null);

  useEffect(() => {
    const checkStatus = async () => {
      if (!isAuthenticated || !user) {
        setLoading(false);
        return;
      }

      try {
        const onboarding = await getOnboardingStatus();
        
        // If fully onboarded and subscribed, go to dashboard
        if (onboarding.isOnboarded && onboarding.subscriptionActive) {
          router.replace('/dashboard');
          return;
        }

        setOnboardingPath(onboarding.nextPath || '/onboarding/target-role');
      } catch (error) {
        console.error('Failed to sync status on home:', error);
      } finally {
        setLoading(false);
      }
    };

    checkStatus();
  }, [isAuthenticated, user, router]);

  if (loading) {
    return (
      <div className="flex h-20 items-center justify-center">
        <Loader label="Syncing workspace..." />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="container mx-auto px-4 pt-10"
      >
        {!user?.subscription ? (
          <div className="glass rounded-[2.5rem] border border-orange-500/20 bg-orange-500/5 p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl">
            <div className="space-y-4 text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 text-orange-400 text-[10px] font-bold uppercase tracking-widest">
                <AlertCircle className="h-3 w-3" />
                Upgrade Required
              </div>
              <h2 className="text-3xl md:text-4xl font-black tracking-tight">Activate your Nova account.</h2>
              <p className="text-muted-foreground text-lg max-w-xl">
                Your subscription is currently inactive. Upgrade to unlock personalized roadmaps, exams, and AI career guidance.
              </p>
            </div>
            <Link href="/pricing" className="shrink-0">
              <Button size="lg" className="h-16 px-10 text-lg font-black bg-orange-500 hover:bg-orange-600 text-white shadow-xl shadow-orange-500/20 rounded-2xl group">
                Upgrade Now
                <ArrowRight className="ml-3 h-6 w-6 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </div>
        ) : !user?.isOnboarded ? (
          <div className="glass rounded-[2.5rem] border border-primary/20 bg-primary/5 p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl">
            <div className="space-y-4 text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-widest">
                <Sparkles className="h-3 w-3" />
                Onboarding Pending
              </div>
              <h2 className="text-3xl md:text-4xl font-black tracking-tight text-gradient">Your journey is waiting.</h2>
              <p className="text-muted-foreground text-lg max-w-xl">
                You're subscribed! Now, let's set up your target role and resume to build your custom growth roadmap.
              </p>
            </div>
            <Link href={onboardingPath || '/onboarding/target-role'} className="shrink-0">
              <Button size="lg" className="h-16 px-10 text-lg font-black bg-primary hover:opacity-90 shadow-xl shadow-primary/20 rounded-2xl group">
                Start Onboarding
                <ArrowRight className="ml-3 h-6 w-6 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </div>
        ) : null}
      </motion.div>
    </AnimatePresence>
  );
}
