import type { Metadata } from 'next';
import { createMetadata } from '@/utils/seo';

export async function generateMetadata(): Promise<Metadata> {
  return createMetadata({
    title: 'Subscription Plans | Nova',
    description: 'Elevate your professional trajectory with our premium AI-powered plans.',
    path: '/pricing',
    keywords: ['pricing', 'subscription', 'nova ai', 'pro plan'],
  });
}

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
