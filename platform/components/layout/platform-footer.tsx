'use client';

import Link from 'next/link';
import {
  ArrowUpRight,
  Github,
  Mail,
  Sparkles,
  Twitter,
  Linkedin,
  Youtube,
  Command,
  Globe,
  Zap
} from 'lucide-react';
import { BrandLogo } from '@/components/brand-logo';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';

const FOOTER_SECTIONS = [
  {
    title: "Platform",
    links: [
      { label: 'Nova Engine', href: '/#features' },
      { label: 'Career Roadmap', href: '/dashboard/roadmap' },
      { label: 'Skill Validation', href: '/exams' },
      { label: 'Ecosystem', href: '/#platform' },
    ]
  },
  {
    title: "Resources",
    links: [
      { label: 'Documentation', href: '#' },
      { label: 'Pricing Plans', href: '/pricing' },
      { label: 'Enterprise', href: '/#enterprise' },
      { label: 'Global Specs', href: '#' },
    ]
  },
  {
    title: "Company",
    links: [
      { label: 'About Nova', href: '#' },
      { label: 'Contact Support', href: 'mailto:support@nova.ai' },
      { label: 'Privacy Policy', href: '#' },
      { label: 'Terms of Sync', href: '#' },
    ]
  }
];

export function PlatformFooter() {
  const user = useAuthStore((state) => state.user);
  const targetRole = user?.targetRole || 'Career Growth';

  return (
    <footer className="relative bg-background/80 backdrop-blur-xl border-t border-white/10 pt-32 pb-16 overflow-hidden">

      {/* 🌌 Gradient Effects */}
      <div className="absolute top-[-100px] left-1/3 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[140px] opacity-60 animate-pulse" />
      <div className="absolute bottom-[-150px] right-1/4 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[120px]" />

      <div className="container mx-auto px-4 relative z-10">

        {/* 🚀 CTA SECTION */}
        <div className="mb-24 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Start Building Your Future Today
          </h2>
          <p className="text-muted-foreground/70 mb-6">
            Join Nova and accelerate your career with AI-powered guidance.
          </p>
          <Button className="px-6 py-3 text-lg rounded-xl shadow-lg hover:scale-105 transition-all">
            Get Started
          </Button>
        </div>

        {/* 🔥 Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-16 mb-24">

          {/* 🧠 Brand Column */}
          <div className="lg:col-span-2 space-y-8">
            <BrandLogo size="md" />

            <p className="text-muted-foreground/70 text-lg leading-relaxed max-w-sm font-light">
              Designing the future of professional evolution. Nova provides the neural infrastructure for elite careers.
            </p>

            {/* 🌐 Social Icons */}
            <div className="flex items-center gap-6">
              {[Twitter, Github, Linkedin, Youtube].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="p-3 rounded-xl bg-white/5 border border-white/10 text-muted-foreground 
                  hover:text-primary hover:bg-primary/10 hover:scale-110 
                  hover:shadow-[0_0_20px_rgba(99,102,241,0.4)]
                  transition-all duration-300"
                >
                  <Icon size={20} />
                </a>
              ))}
            </div>

            {/* ⚡ Live Badge */}
            <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-primary/10 border border-primary/20 w-fit shadow-[0_0_15px_rgba(99,102,241,0.3)]">
              <Zap className="w-4 h-4 text-primary animate-ping" />
              <span className="text-[10px] font-black uppercase tracking-widest text-primary">
                Live for Future {targetRole}
              </span>
            </div>
          </div>

          {/* 📚 Sections */}
          {FOOTER_SECTIONS.map((section, idx) => (
            <div key={idx} className="space-y-8">
              <h3 className="text-xs font-black uppercase tracking-[0.3em] text-white/40">
                {section.title}
              </h3>

              <ul className="space-y-4">
                {section.links.map((link, i) => (
                  <li key={i}>
                    <Link
                      href={link.href}
                      className="text-muted-foreground/70 hover:text-white transition-all duration-300 text-[15px] font-medium flex items-center group"
                    >
                      <ArrowUpRight className="w-4 h-4 mr-2 opacity-0 -ml-6 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300" />
                      <span className="group-hover:translate-x-1 transition-transform duration-300">
                        {link.label}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

        </div>

        {/* Divider */}
        <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent mb-10" />

        {/* ⚡ Bottom Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 border-t border-white/5 pt-8">

          <div className="text-muted-foreground/40 text-sm font-medium flex items-center gap-4 flex-wrap justify-center">
            <span>© 2026 Nova Intelligence Systems</span>
            <span className="hidden md:block w-1.5 h-1.5 rounded-full bg-white/10" />
            <span className="flex items-center gap-1">
              <Globe className="w-3.5 h-3.5" /> Earth (HQ)
            </span>
          </div>

          <div className="flex items-center gap-2 text-muted-foreground/40 text-sm font-medium">
            Handcrafted with ❤️ in India
            <Command className="w-4 h-4 text-primary opacity-60" />
          </div>

        </div>

      </div>
    </footer>
  );
}

export default PlatformFooter;