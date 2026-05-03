'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ReactNode } from 'react';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { BrandLogo } from '@/components/brand-logo';
import { motion } from 'framer-motion';

type AuthShellProps = {
  title: string;
  subtitle: string;
  children: ReactNode;
  preTitle?: string;
  leftPanelTitle?: string;
  leftPanelSubtitle?: string;
  leftPanelFooter?: string;
  backgroundImage?: string;
  topCta?: { label: string; href: string };
};

export function AuthShell({
  title,
  subtitle,
  children,
  preTitle = "Platform Access",
  leftPanelTitle = "Nova Platform",
  leftPanelSubtitle = "Next-Generation Intelligence",
  leftPanelFooter = "Empowering professionals with state-of-the-art AI capabilities.",
  backgroundImage = "/auth-bg.png",
  topCta
}: AuthShellProps) {
  return (
    <main className="flex min-h-screen w-full bg-[#030712] text-white overflow-hidden relative font-sans">
      {/* Background Ambient Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/15 blur-[120px] rounded-full animate-pulse pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 blur-[120px] rounded-full animate-pulse pointer-events-none" style={{ animationDelay: '2s' }} />

      {/* Left split pane with rounded image */}
      <section className="hidden w-1/2 p-4 lg:block relative z-10">
        <div className="relative h-full w-full overflow-hidden rounded-[2.5rem] bg-[#0A1024] shadow-2xl border border-white/5">
          <Image
            src={backgroundImage}
            alt="Auth background"
            fill
            className="object-cover object-center transition-transform duration-1000 hover:scale-110 opacity-70"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#030712] via-transparent to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#030712]/40 to-transparent" />
          
          <div className="absolute bottom-16 left-0 right-0 px-12 z-10">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="max-w-md mx-auto space-y-6 backdrop-blur-xl bg-white/5 p-10 rounded-[2.5rem] border border-white/10 shadow-2xl relative overflow-hidden group"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-50" />
              
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-indigo-400">
                   <Sparkles className="h-4 w-4" />
                   <h2 className="text-[11px] font-bold uppercase tracking-[0.3em]">{leftPanelTitle}</h2>
                </div>
                <h3 className="text-4xl font-bold text-white leading-[1.1]">{leftPanelSubtitle}</h3>
              </div>
              <p className="text-[15px] font-medium text-white/50 leading-relaxed">{leftPanelFooter}</p>
              
              <div className="flex items-center gap-4 pt-4">
                 <div className="flex -space-x-3">
                    {[1,2,3].map(i => (
                      <div key={i} className="h-8 w-8 rounded-full border-2 border-[#0A1024] bg-indigo-500/20" />
                    ))}
                 </div>
                 <span className="text-xs text-white/40 font-bold tracking-wider uppercase">Trusted by Global Innovators</span>
              </div>
            </motion.div>
          </div>

          <div className="absolute top-12 left-12 z-10">
            <BrandLogo size="lg" variant="dark" />
          </div>
        </div>
      </section>

      {/* Right split pane for form */}
      <section className="flex w-full flex-col items-center justify-center p-6 lg:w-1/2 lg:p-12 relative z-10">
        {topCta && (
          <div className="absolute top-8 left-8 lg:top-12 lg:left-12">
            <Link 
              href={topCta.href}
              className="group flex items-center gap-2 text-sm font-bold text-white/40 transition-all hover:text-white"
            >
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
              {topCta.label}
            </Link>
          </div>
        )}

        <div className="w-full max-w-[440px]">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-12 flex flex-col items-start text-left"
          >
            <span className="inline-block px-4 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-[10px] font-bold uppercase tracking-[0.2em] mb-6 border border-indigo-500/20">
              {preTitle}
            </span>
            <h1 className="text-5xl font-bold tracking-tight text-white mb-4 leading-tight">
              {title}
            </h1>
            <p className="text-[17px] text-white/50 font-medium leading-relaxed">
              {subtitle}
            </p>
          </motion.div>

          <motion.div 
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             transition={{ delay: 0.3, duration: 0.8 }}
             className="w-full relative"
          >
            {/* Subtle separator decoration */}
            <div className="absolute -left-12 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-white/5 to-transparent hidden xl:block" />
            
            {children}
          </motion.div>
        </div>

        {/* Footer info */}
        <div className="mt-20 text-center opacity-20 text-[10px] font-bold uppercase tracking-[0.4em] select-none">
           &copy; 2026 Nova Intelligence &bull; Secured with Enterprise-Grade Encryption
        </div>
      </section>
    </main>
  );
}


