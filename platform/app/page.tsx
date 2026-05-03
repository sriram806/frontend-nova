import type { Metadata } from 'next';
import { createMetadata } from '@/utils/seo';
import { LandingHeader } from '@/components/landing/LandingHeader';
import { HomeStatusManager } from '@/components/landing/HomeStatusManager';
import { Hero } from '@/components/landing/Hero';
import { DetailedDescription } from '@/components/landing/DetailedDescription';
import { Features } from '@/components/landing/Features';
import { HowItWorks } from '@/components/landing/HowItWorks';
import { Testimonials } from '@/components/landing/Testimonials';
import { FAQ } from '@/components/landing/FAQ';
import { PlatformFooter } from '@/components/layout/platform-footer';

export async function generateMetadata(): Promise<Metadata> {
  return createMetadata({
    title: 'Nova | The Ultimate Skill Learning Platform',
    description: 'Master any skill with Nova AI. Personalized roadmaps, real-time assessments, and career guidance in one premium workspace.',
    path: '/',
    keywords: ['nova ai', 'career growth', 'skill assessment', 'nova learning', 'skill roadmap'],
  });
}

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen bg-background selection:bg-primary/30 selection:text-white overflow-x-hidden">
      <LandingHeader />

      <main className="flex-grow">
        <Hero />
        <DetailedDescription />
        <div id="workflow" className="scroll-mt-20">
          <HowItWorks />
        </div>
        <div id="features" className="scroll-mt-20">
          <Features />
        </div>
        <div id="testimonials" className="scroll-mt-20">
          <Testimonials />
        </div>
        <div id="faq" className="scroll-mt-20">
          <FAQ />
        </div>
      </main>

      <PlatformFooter />
    </div>
  );
}
