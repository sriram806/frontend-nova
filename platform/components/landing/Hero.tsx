'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { Button } from '@/components/ui/button';
import { TypingText } from '@/components/ui/TypingText';
import { ArrowRight, Play, Sparkles, CheckCircle2, Zap, BrainCircuit } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import Link from 'next/link';
import { FloatingIcons } from './FloatingIcons';

export function Hero() {
  const { isAuthenticated } = useAuthStore();
  const heroRef = useRef<HTMLDivElement>(null);
  const leftContentRef = useRef<HTMLDivElement>(null);
  const rightVisualRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power4.out" } });

      tl.from(leftContentRef.current?.children || [], {
        x: -100,
        opacity: 0,
        duration: 1.2,
        stagger: 0.15,
      })
        .from(rightVisualRef.current, {
          scale: 0.8,
          opacity: 0,
          duration: 1.5,
        }, "-=1")
        .from(statsRef.current?.children || [], {
          y: 20,
          opacity: 0,
          duration: 0.8,
          stagger: 0.1,
        }, "-=1");
    }, heroRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={heroRef} className="relative min-h-[110vh] flex items-center overflow-hidden pt-32 pb-20 bg-background">
      {/* Background Decor */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,#80808010_0%,transparent_50%)]" />
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary/5 to-transparent" />
      </div>

      <div className="container relative z-10 mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">

          {/* Left Content */}
          <div ref={leftContentRef} className="lg:w-3/5 text-left space-y-8">
            <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-2xl bg-white/5 border border-white/10 text-primary text-xs font-black uppercase tracking-[0.25em] shadow-2xl backdrop-blur-3xl">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
              </span>
              Next-Gen Cognitive Workspace
            </div>

            <h1 className="text-6xl md:text-8xl xl:text-9xl font-black tracking-tight leading-[0.95] text-foreground">
              Think Beyond <br />
              <span className="text-gradient bg-clip-text text-transparent bg-gradient-to-r from-primary via-indigo-400 to-cyan-400">Limits.</span>
            </h1>

            <p className="text-xl md:text-2xl text-muted-foreground/80 max-w-2xl leading-relaxed font-light">
              <TypingText
                text="The first AI platform that doesn't just evaluate skills but architects your entire career path with mathematical precision."
                speed={15}
              />
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-6 pt-4">
              <Link href={isAuthenticated ? "/dashboard" : "/register"}>
                <Button size="lg" className="h-20 px-14 text-xl font-black bg-primary hover:scale-[1.02] transition-all shadow-[0_0_40px_rgba(var(--primary),0.3)] rounded-[2rem] group">
                  {isAuthenticated ? "Launch Workspace" : "Join the Elite"}
                  <ArrowRight className="ml-3 h-7 w-7 transition-transform group-hover:translate-x-2" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="h-20 px-14 text-xl font-bold border-white/5 bg-white/5 backdrop-blur-2xl hover:bg-white/10 rounded-[2rem] border-2">
                <BrainCircuit className="mr-3 h-6 w-6 text-primary" />
                See Intelligence
              </Button>
            </div>

            {/* Quick Stats Integrated */}
            <div ref={statsRef} className="grid grid-cols-2 gap-8 pt-12 border-t border-white/5">
              <div className="space-y-1">
                <div className="text-3xl font-black text-foreground">99.9%</div>
                <div className="text-[10px] text-primary font-bold uppercase tracking-widest">Accuracy in Skill Prediction</div>
              </div>
              <div className="space-y-1">
                <div className="text-3xl font-black text-foreground">45M+</div>
                <div className="text-[10px] text-primary font-bold uppercase tracking-widest">Data Points Processed Yearly</div>
              </div>
            </div>
          </div>

          {/* Right Visual Area */}
          <div ref={rightVisualRef} className="lg:w-2/5 relative min-h-[600px] flex items-center justify-center">
            <div className="relative w-full aspect-square">
              {/* Central Glowing Orb */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary/20 rounded-full blur-[80px] animate-pulse" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-primary rounded-full blur-[40px] opacity-40 animate-pulse" />

              {/* Floating Objects contained here */}
              <FloatingIcons />

              {/* Holographic Stats Card */}
              <div className="absolute top-10 right-0 p-6 rounded-[2rem] bg-white/5 border border-white/10 backdrop-blur-3xl shadow-2xl animate-float">
                <Zap className="text-primary mb-3 h-8 w-8" />
                <div className="text-sm font-black text-white">4.8k Real-time Queries</div>
                <div className="text-[10px] text-white/40">Processing Nova Neural Network...</div>
              </div>

              {/* Secondary Floating Card */}
              <div className="absolute bottom-20 left-0 p-6 rounded-[2rem] bg-white/5 border border-white/10 backdrop-blur-3xl shadow-2xl animate-float [animation-delay:2s]">
                <CheckCircle2 className="text-green-400 mb-3 h-8 w-8" />
                <div className="text-sm font-black text-white">Verified Certificate</div>
                <div className="text-[10px] text-white/40">Blockchain ID: NOVA-77291</div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Decorative Bottom */}
      <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
    </section>
  );
}
