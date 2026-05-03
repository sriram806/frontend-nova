'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { LandingHeader } from '@/components/landing/LandingHeader';
import { PlatformFooter } from '@/components/layout/platform-footer';
import { Button } from '@/components/ui/button';
import {
  Check,
  ArrowLeft,
  Zap,
  Rocket,
  Building2,
  ShieldCheck,
  Cpu,
  Users,
  HelpCircle,
  CreditCard,
  Lock
} from 'lucide-react';
import Link from 'next/link';

const PLAN_DETAILS = {
  lite: {
    name: 'Lite Plan',
    price: '₹2199',
    icon: <Zap className="w-8 h-8 text-muted-foreground" />,
    description: 'Foundational AI workspace for strategic career planning.',
    fullFeatures: [
      { title: 'Neural Roadmaps', desc: '5 comprehensive growth roadmaps per month.' },
      { title: 'Skill DNA Analysis', desc: 'Advanced analysis of your technical and soft skills.' },
      { title: 'Career Analyzer', desc: 'Standard AI-driven career trajectory mapping.' },
      { title: 'ATS Optimization', desc: 'Resume tuning for modern Applicant Tracking Systems.' },
      { title: 'Community Access', desc: 'Join the Nova community of ambitious professionals.' },
      { title: 'Standard Support', desc: 'Reliable email support for all your queries.' },
    ],
    technical: [
      'Standard API priority',
      'Shared vector search node',
      'Standard email support',
    ]
  },
  pro: {
    name: 'Professional Plan',
    price: '₹2999',
    icon: <Rocket className="w-8 h-8 text-primary" />,
    description: 'Elite infrastructure for zero-compromise career growth.',
    fullFeatures: [
      { title: 'Infinite Roadmaps', desc: 'No daily limits on AI analysis or roadmap generation.' },
      { title: 'Video Mock Interviews', desc: 'Neural interactive voice/video interviews with role-specific logic.' },
      { title: 'Cloud IDE', desc: 'GPU-accelerated cloud environment for technical assessments.' },
      { title: 'Elite Badge', desc: 'Verified profile badge that stands out to recruiters.' },
      { title: 'Industry Referrals', desc: 'Direct referral hooks into our network of partner companies.' },
      { title: 'Priority Support', desc: '24/7 high-priority neural support from our core team.' },
    ],
    technical: [
      'High-priority API access (2.5x faster)',
      'Isolated vector embedding workspace',
      '24/7 Priority neural support',
      'Early access to new AI features'
    ]
  },
  enterprise: {
    name: 'Enterprise Plan',
    price: 'Custom',
    icon: <Building2 className="w-8 h-8 text-violet-500" />,
    description: 'Scalable infrastructure and governance for universities and teams.',
    fullFeatures: [
      { title: 'Institutional Hierarchy', desc: 'Dean, HOD, and Mentor roles with distinct permissions.' },
      { title: 'Cohort Analytics', desc: 'Skill heatmaps and progress tracking for thousands of users.' },
      { title: 'Custom Exam Lab', desc: 'Create and deploy your own validation exams for students.' },
      { title: 'Bulk Profile Export', desc: 'Seamlessly export student data for placement records.' },
      { title: 'Placement Feed', desc: 'Private job portal for your institute\'s students.' },
    ],
    technical: [
      'Dedicated API endpoint',
      'Custom LLM fine-tuning options',
      'SAML/SSO Integration',
      'Dedicated Account Manager'
    ]
  }
};

const FAQ = [
  { q: "How secure is the payment process?", a: "We use Razorpay, India's leading payment gateway, featuring 256-bit encryption and multi-factor authentication for every transaction." },
  { q: "Can I cancel my subscription anytime?", a: "Yes, you can cancel your Pro plan at any time from your dashboard. You will retain access until the end of your billing cycle." },
  { q: "Do you offer refunds?", a: "We offer a 7-day no-questions-asked refund policy for your first subscription period if you're not satisfied." },
  { q: "What happens if my payment fails?", a: "Our system will automatically retry twice. If both fail, your account will be moved to the Starter plan until the payment is resolved." }
];

export default function PlanDetailPage() {
  const params = useParams();
  const router = useRouter();
  const planId = (params.plan as string)?.toLowerCase() || 'lite';
  const plan = PLAN_DETAILS[planId as keyof typeof PLAN_DETAILS] || PLAN_DETAILS.lite;

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <LandingHeader />

      <main className="flex-grow pt-32 pb-24">
        <div className="container mx-auto px-4">
          {/* Header */}
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-10 group"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            Back to pricing
          </button>

          <div className="flex flex-col lg:flex-row gap-16 items-start">
            {/* Left: Content */}
            <div className="flex-1 space-y-12">
              <div className="space-y-6">
                <div className="w-16 h-16 rounded-[1.5rem] bg-card border border-border/50 flex items-center justify-center shadow-xl">
                  {plan.icon}
                </div>
                <h1 className="text-5xl md:text-6xl font-black tracking-tight text-foreground">
                  {plan.name} <br />
                  <span className="text-gradient">Deep Dive.</span>
                </h1>
                <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl">
                  {plan.description} Built on top of 17 microservices to ensure maximum reliability and speed.
                </p>
              </div>

              {/* Detailed Features */}
              <div className="space-y-8">
                <h3 className="text-2xl font-bold flex items-center gap-3">
                  <ShieldCheck className="w-6 h-6 text-primary" />
                  What's Included
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {plan.fullFeatures.map((f, i) => (
                    <div key={i} className="p-6 rounded-2xl bg-card border border-border/50 hover:border-primary/10 transition-all group">
                      <div className="flex items-start gap-4">
                        <div className="mt-1 p-1 rounded-full bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                          <Check className="w-3 h-3" />
                        </div>
                        <div>
                          <p className="font-bold text-foreground mb-1">{f.title}</p>
                          <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Technical Specifications */}
              <div className="p-10 rounded-[2.5rem] bg-card border border-border/50 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                  <Cpu className="w-64 h-64" />
                </div>
                <h3 className="text-2xl font-bold flex items-center gap-3 mb-8 relative z-10">
                  <Users className="w-6 h-6 text-primary" />
                  Technical Parameters
                </h3>
                <div className="space-y-4 relative z-10">
                  {plan.technical.map((t, i) => (
                    <div key={i} className="flex items-center gap-3 text-muted-foreground">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary/40" />
                      <span className="text-sm tracking-wide">{t}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Sticky Action Card */}
            <div className="w-full lg:w-96 lg:sticky lg:top-32">
              <div className="p-8 rounded-[2rem] bg-card border border-primary/20 shadow-2xl shadow-primary/5 space-y-8">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground mb-2">Selected Plan</p>
                  <h2 className="text-3xl font-black text-foreground">{plan.name}</h2>
                </div>

                <div className="space-y-2">
                  <div className="flex items-baseline gap-1">
                    <span className="text-5xl font-black text-foreground">{plan.price}</span>
                    <span className="text-muted-foreground font-semibold">/ quarter</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Billed quarterly. Optimized 3-month cycle.</p>
                </div>

                <div className="space-y-4">
                  <Link href={planId === 'enterprise' ? 'mailto:sales@think-ai.dev' : '/register'}>
                    <Button className="w-full h-14 rounded-2xl text-lg font-bold shadow-xl shadow-primary/20">
                      {planId === 'enterprise' ? 'Contact Sales' : 'Start with this Plan'}
                    </Button>
                  </Link>
                  <div className="flex items-center justify-center gap-2 text-[10px] uppercase font-bold text-muted-foreground tracking-widest">
                    <Lock className="w-3 h-3" />
                    Secure checkout by Razorpay
                  </div>
                </div>

                <div className="pt-8 border-t border-border/50">
                  <h4 className="text-sm font-bold flex items-center gap-2 mb-4">
                    <CreditCard className="w-4 h-4 text-primary" />
                    Accepted Methods
                  </h4>
                  <div className="flex flex-wrap gap-4 opacity-50 grayscale">
                    <span className="text-[10px] font-bold border border-white/10 px-2 py-1 rounded-md">UPI</span>
                    <span className="text-[10px] font-bold border border-white/10 px-2 py-1 rounded-md">VISA</span>
                    <span className="text-[10px] font-bold border border-white/10 px-2 py-1 rounded-md">CARDS</span>
                    <span className="text-[10px] font-bold border border-white/10 px-2 py-1 rounded-md">APPLE</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* FAQ Section */}
          <section className="mt-32 max-w-4xl">
            <h3 className="text-2xl font-bold flex items-center gap-3 mb-12">
              <HelpCircle className="w-6 h-6 text-primary" />
              Frequently Asked Questions
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {FAQ.map((item, i) => (
                <div key={i} className="space-y-3">
                  <p className="font-bold text-foreground text-lg">{item.q}</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.a}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>

      <PlatformFooter />
    </div>
  );
}
