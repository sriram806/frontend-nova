'use client';

import React, { useState, useEffect, Suspense, useRef } from 'react';
import { Check, Zap, Rocket, Building2, Loader2, ShieldCheck, Clock, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useBillingStore } from '@/store/billingStore';
import { useAuthStore } from '@/store/authStore';
import { BillingPlan, createBillingOrder, hasActiveSubscription } from '@/services/billingService';
import { getOnboardingStatus } from '@/services/onboardingService';
import { useRouter, useSearchParams } from 'next/navigation';
import Script from 'next/script';
import { PageTransition } from '@/components/common/page-transition';
import { motion, AnimatePresence, Variants } from 'framer-motion';

const PLANS = [
  {
    id: 'LITE' as BillingPlan,
    name: 'Lite',
    price: 2199,
    period: 'Quarterly',
    savingLabel: 'Best for Individuals',
    description: 'Foundational AI workspace for strategic career planning.',
    features: [
      '5 Neural Roadmaps / month',
      'Advanced Skill DNA Analysis',
      'Standard Career Analyzer',
      'ATS Resume Optimization',
      'Community Access',
      'Standard Support'
    ],
    detailedBenefits: [
      'Generate up to 5 comprehensive learning roadmaps to guide your career path.',
      'Analyze your skills against real-time industry demands and identify critical gaps.',
      'Use the standard career analyzer for ongoing progress tracking.',
      'Optimize your resume to pass Applicant Tracking Systems (ATS).',
      'Access the community forums and network with peers.',
      'Get standard support response within 24 hours.'
    ],
    icon: <Zap className="w-5 h-5" />,
    popular: false,
    rank: 1,
    color: 'from-blue-500/20 to-cyan-500/20',
    borderColor: 'border-cyan-500/30'
  },
  {
    id: 'PRO' as BillingPlan,
    name: 'Pro',
    price: 2999,
    period: 'Quarterly',
    savingLabel: 'Most Comprehensive',
    description: 'Elite infrastructure for zero-compromise career growth.',
    features: [
      'Unlimited Neural Roadmaps',
      'Neural Video Mock Interviews',
      'GPU-Accelerated Cloud IDE',
      'Verified Elite Profile Badge',
      'Direct Industry Referrals',
      '24/7 Neural Priority Support'
    ],
    detailedBenefits: [
      'Never hit a limit. Generate unlimited neural roadmaps for endless learning paths.',
      'Practice with an AI avatar in neural video mock interviews, complete with real-time feedback.',
      'Access our blazing fast GPU-accelerated cloud IDE directly from your browser.',
      'Stand out to recruiters with a Verified Elite Profile Badge.',
      'Unlock the ability to get direct industry referrals to our partner network.',
      'Skip the queue with 24/7 Priority Support across all channels.'
    ],
    icon: <Rocket className="w-5 h-5 text-primary" />,
    popular: true,
    rank: 2,
    color: 'from-primary/20 to-violet-600/20',
    borderColor: 'border-primary/50'
  },
  {
    id: 'ENTERPRISE' as BillingPlan,
    name: 'Enterprise',
    price: 'Custom',
    period: 'Annually',
    description: 'Scalable intelligence for large institutions and teams.',
    features: [
      'Institutional Governance Dash',
      'Dean & Admin Control Layer',
      'Bulk Student Intelligence',
      'Custom API Data Hooks',
      'Volume-Based Licensing',
      'Dedicated Account Success'
    ],
    detailedBenefits: [
      'Full institutional governance dashboard for overarching metrics and analytics.',
      'Advanced role-based access control for deans, admins, and faculty members.',
      'Analyze the skill trajectories and success rates of large student cohorts simultaneously.',
      'Pull data directly into your existing infrastructure with custom API hooks.',
      'Flexible, volume-based licensing designed for scale and budget efficiency.',
      'A dedicated account success manager aligned with your institutional goals.'
    ],
    icon: <Building2 className="w-5 h-5" />,
    popular: false,
    rank: 3,
    color: 'from-emerald-500/20 to-teal-500/20',
    borderColor: 'border-emerald-500/30'
  }
];

function PricingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextParam = searchParams.get('next');
  const { user, isAuthenticated } = useAuthStore();
  const { subscription, verifyAndSync, fetchSubscription } = useBillingStore();
  const [processingPlan, setProcessingPlan] = useState<BillingPlan | null>(null);

  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      fetchSubscription();
    }
  }, [isAuthenticated, fetchSubscription]);

  const staggerContainer: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.3 }
    }
  };

  const featureItem: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } }
  };

  const ctaVariant: Variants = {
    hidden: { opacity: 0, scale: 0.95, y: 10 },
    show: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.6, type: 'spring', bounce: 0.4, delay: 0.8 } }
  };

  const resolvePostSubscriptionPath = async (fallback: string) => {
    try {
      const onboarding = await getOnboardingStatus();
      if (!onboarding.subscriptionActive) return `/pricing${nextParam ? `?next=${encodeURIComponent(nextParam)}` : ''}`;
      if (!onboarding.isOnboarded) return onboarding.nextPath || '/onboarding/resume';
      return nextParam || '/dashboard';
    } catch {
      return nextParam || fallback;
    }
  };

  const handleCheckout = async (planId: BillingPlan) => {
    if (!isAuthenticated) {
      const loginNext = nextParam ? `/pricing?next=${encodeURIComponent(nextParam)}` : '/pricing';
      router.push(`/login?next=${encodeURIComponent(loginNext)}`);
      return;
    }

    const currentPlanId = subscription?.plan || 'NONE';
    const isActive = subscription ? hasActiveSubscription(subscription) : false;
    
    // Only block checkout if they already have the EXACT same plan AND it's currently active
    if (planId === currentPlanId && isActive) {
      console.log('User already has an active subscription for this plan');
      return;
    }

    if (planId === 'ENTERPRISE') {
      window.location.href = 'mailto:boddusriram1234@gmail.com';
      return;
    }

    console.log('Initiating checkout for plan:', planId);
    setProcessingPlan(planId);
    try {
      if (typeof (window as any).Razorpay === 'undefined') {
        console.error('Razorpay SDK not loaded');
        // Simple retry mechanism
        await new Promise(resolve => setTimeout(resolve, 1000));
        if (typeof (window as any).Razorpay === 'undefined') {
          alert('The payment gateway is taking a bit longer to load. Please refresh the page if this persists.');
          return;
        }
      }

      console.log('Creating billing order...');
      const orderData = await createBillingOrder(planId);
      console.log('Order created:', orderData);
      
      if (!orderData.order) throw new Error('Failed to create order');

      const options = {
        key: orderData.keyId,
        amount: orderData.order.amount,
        currency: orderData.order.currency,
        name: 'Nova',
        description: `${planId} Subscription`,
        order_id: orderData.order.id,
        handler: async (response: any) => {
          const success = await verifyAndSync({
            razorpayOrderId: response.razorpay_order_id,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature,
          });

          if (success) {
            const targetPath = await resolvePostSubscriptionPath('/onboarding/resume?payment=success');
            router.push(targetPath);
          } else {
            alert('Payment verification failed.');
          }
        },
        prefill: {
          name: user?.displayName,
          email: user?.email,
        },
        theme: { color: '#6366f1' },
        modal: { ondismiss: () => setProcessingPlan(null) }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Something went wrong. Please try again.');
    } finally {
      setProcessingPlan(null);
    }
  };

  const currentPlanId = subscription?.plan || 'NONE';
  const isActive = subscription ? hasActiveSubscription(subscription) : false;
  const effectivePlanId = isActive ? currentPlanId : 'NONE';
  const effectivePlanRank = PLANS.find(p => p.id === effectivePlanId)?.rank || 0;

  const selectedPlan = PLANS.find(p => p.id === selectedPlanId);

  return (
    <div className="flex-grow flex flex-col items-center justify-center py-12 px-4 md:px-8 max-w-6xl mx-auto w-full min-h-[80vh]">
      <AnimatePresence mode="wait">
        {!selectedPlanId ? (
          <motion.div
            key="grid"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95, filter: 'blur(10px)', transition: { duration: 0.3 } }}
            className="w-full flex flex-col items-center"
          >
            <div className="text-center mb-12 space-y-4">
              <h1 className="text-3xl md:text-5xl font-black tracking-tight text-foreground">
                Choose your <span className="text-primary">Evolution</span>
              </h1>
              <p className="text-muted-foreground max-w-lg mx-auto text-sm md:text-base">
                Unlock the full potential of your career with our AI-powered strategic roadmaps.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
              {PLANS.map((plan) => {
                const isCurrentPlan = currentPlanId === plan.id && isActive;

                let ctaLabel = 'View Benefits';
                if (plan.id === 'ENTERPRISE') ctaLabel = 'Build My Org';
                else if (isCurrentPlan) ctaLabel = 'Active Plan';

                return (
                  <motion.div
                    key={plan.id}
                    layoutId={`plan-container-${plan.id}`}
                    onClick={() => setSelectedPlanId(plan.id)}
                    className={`relative flex flex-col p-8 rounded-[2.5rem] border transition-all duration-300 cursor-pointer group ${plan.popular
                        ? 'bg-card border-primary/50 shadow-xl shadow-primary/10 hover:shadow-2xl hover:-translate-y-1'
                        : 'bg-card border-border hover:border-primary/30 hover:shadow-xl hover:-translate-y-1'
                      }`}
                  >
                    {plan.popular && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-primary text-primary-foreground text-[10px] font-black uppercase tracking-widest shadow-md">
                        Most Popular
                      </div>
                    )}

                    <motion.div layoutId={`plan-header-${plan.id}`} className="flex items-center gap-4 mb-6">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${plan.popular ? 'bg-primary text-white shadow-md' : 'bg-muted text-muted-foreground border'}`}>
                        {plan.icon}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold">{plan.name}</h3>
                        <div className="text-[10px] font-bold text-primary uppercase tracking-widest mt-0.5">
                          {plan.savingLabel || 'Flexible'}
                        </div>
                      </div>
                    </motion.div>

                    <div className="mb-6">
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-4xl font-black">
                          {typeof plan.price === 'number' ? `₹${plan.price}` : plan.price}
                        </span>
                        <span className="text-muted-foreground font-medium text-sm">
                          {typeof plan.price === 'number' ? `/${plan.period}` : ''}
                        </span>
                      </div>
                      <p className="text-muted-foreground mt-3 text-sm leading-relaxed">
                        {plan.description}
                      </p>
                    </div>

                    <div className="space-y-4 mb-8 flex-grow">
                      {plan.features.slice(0, 4).map((feature, i) => (
                        <div key={i} className="flex items-start gap-3">
                          <div className={`mt-0.5 flex-shrink-0 p-1 rounded-full ${plan.popular ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}`}>
                            <Check className="w-3 h-3" strokeWidth={3} />
                          </div>
                          <span className="text-sm font-medium">{feature}</span>
                        </div>
                      ))}
                      <div className="text-sm font-bold text-primary/70 pt-2">+ {plan.features.length - 4} more features</div>
                    </div>

                    <Button
                      variant={isCurrentPlan ? "outline" : (plan.popular ? "default" : "secondary")}
                      className={`w-full h-12 rounded-xl font-bold ${isCurrentPlan ? 'border-primary/30' : ''}`}
                    >
                      {isCurrentPlan ? (
                        <span className="flex items-center gap-2">
                          <ShieldCheck className="w-4 h-4 text-emerald-500" />
                          Active Plan
                        </span>
                      ) : (
                        ctaLabel
                      )}
                    </Button>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        ) : selectedPlan ? (
          <motion.div
            key="details"
            layoutId={`plan-container-${selectedPlan.id}`}
            className={`w-full max-w-4xl mx-auto bg-card border ${selectedPlan.borderColor} rounded-[3rem] p-8 md:p-12 shadow-2xl relative overflow-hidden flex flex-col md:flex-row gap-12`}
          >
            {/* Background Gradient */}
            <div className={`absolute top-0 right-0 w-full h-full bg-gradient-to-br ${selectedPlan.color} opacity-10 pointer-events-none`} />

            <div className="flex-1 relative z-10">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedPlanId(null)}
                className="mb-8 rounded-full -ml-3 text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="w-4 h-4 mr-2" /> Back to plans
              </Button>

              <motion.div layoutId={`plan-header-${selectedPlan.id}`} className="flex items-center gap-4 mb-8">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-primary text-white shadow-xl shadow-primary/20">
                  {selectedPlan.icon}
                </div>
                <div>
                  <h3 className="text-3xl font-black">{selectedPlan.name} Plan</h3>
                  <div className="text-xs font-bold text-primary uppercase tracking-widest mt-1">
                    Everything you need to succeed
                  </div>
                </div>
              </motion.div>

              <motion.div variants={staggerContainer} initial="hidden" animate="show" className="space-y-6">
                {selectedPlan.detailedBenefits.map((benefit, i) => (
                  <motion.div key={i} variants={featureItem} className="flex gap-4 items-start">
                    <div className="mt-1 bg-primary/10 text-primary p-1.5 rounded-full shrink-0 shadow-sm border border-primary/20">
                      <CheckCircle2 className="w-4 h-4" strokeWidth={2.5} />
                    </div>
                    <p className="text-foreground font-medium leading-relaxed">{benefit}</p>
                  </motion.div>
                ))}
              </motion.div>
            </div>

            <div className="w-full md:w-80 flex flex-col relative z-10 pt-12 md:pt-0 border-t md:border-t-0 md:border-l border-border/50 md:pl-12">
              <div className="sticky top-8">
                <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-4">Subscription Summary</p>
                <div className="mb-8 p-6 bg-background rounded-3xl border border-border/50 shadow-inner">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-5xl font-black text-foreground">
                      {typeof selectedPlan.price === 'number' ? `₹${selectedPlan.price}` : selectedPlan.price}
                    </span>
                  </div>
                  <p className="text-muted-foreground font-medium text-sm mt-1">
                    {typeof selectedPlan.price === 'number' ? `Billed ${selectedPlan.period.toLowerCase()}` : 'Contact us for pricing'}
                  </p>

                  {typeof selectedPlan.price === 'number' && (
                    <div className="mt-6 flex items-center gap-2 text-xs text-muted-foreground font-bold uppercase tracking-wider bg-muted/50 p-3 rounded-xl border border-border/50">
                      <Clock className="w-4 h-4 text-primary" /> Auto-renews automatically
                    </div>
                  )}
                </div>

                <motion.div variants={ctaVariant} initial="hidden" animate="show">
                  <Button
                    onClick={() => handleCheckout(selectedPlan.id)}
                    disabled={processingPlan === selectedPlan.id || (currentPlanId === selectedPlan.id && isActive)}
                    className="w-full h-14 rounded-2xl text-lg font-black bg-primary text-primary-foreground hover:bg-primary/90 shadow-xl shadow-primary/20 transition-all hover:scale-[1.02]"
                  >
                    {processingPlan === selectedPlan.id ? (
                      <Loader2 className="w-6 h-6 animate-spin" />
                    ) : (currentPlanId === selectedPlan.id && isActive) ? (
                      <span className="flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5" /> Current Plan
                      </span>
                    ) : (
                      'Proceed to Checkout'
                    )}
                  </Button>
                  <p className="text-center text-xs text-muted-foreground mt-4 font-medium">
                    Secured by Razorpay Neural Gateway
                  </p>
                </motion.div>
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

export default function PricingPage() {
  const router = useRouter();

  return (
    <PageTransition>
      <div className="min-h-screen bg-background flex flex-col">
        <Script 
          src="https://checkout.razorpay.com/v1/checkout.js" 
          strategy="lazyOnload"
        />

        {/* Minimal Nav Header */}
        <header className="w-full flex items-center justify-between p-6">
          <div className="font-black text-xl tracking-tight text-primary">Nova.</div>
          <Button variant="ghost" size="sm" onClick={() => router.back()} className="rounded-full text-xs font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground">
            Go Back
          </Button>
        </header>

        <main className="flex-grow flex items-stretch">
          <Suspense fallback={<div className="flex h-full w-full items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>}>
            <PricingContent />
          </Suspense>
        </main>
      </div>
    </PageTransition>
  );
}
