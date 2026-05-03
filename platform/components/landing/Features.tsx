"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  Shield,
  UserCircle,
  CheckCircle2,
  LineChart,
  Map,
  MessageSquare,
  Zap,
  ArrowRight,
  Sparkles,
  Command
} from "lucide-react";
import { Button } from "@/components/ui/button";

const BENTO_FEATURES = [
  {
    id: "roadmap",
    size: "large",
    icon: <Map className="w-10 h-10" />,
    tag: "90-Day Cycles",
    title: "Adaptive Growth Roadmaps",
    desc: "AI-driven professional development plans that shift as you master new skills, keeping you consistently ahead of industry shifts.",
    theme: "bg-blue-500/5 border-blue-500/10",
    iconColor: "text-blue-400"
  },
  {
    id: "interview",
    size: "medium",
    icon: <MessageSquare className="w-8 h-8" />,
    tag: "Simulation",
    title: "AI Interview Architect",
    desc: "Realistic technical and behavioral simulations with granular feedback loops.",
    theme: "bg-purple-500/5 border-purple-500/10",
    iconColor: "text-purple-400"
  },
  {
    id: "score",
    size: "small",
    icon: <LineChart className="w-6 h-6" />,
    tag: "Metrics",
    title: "Career Score v4",
    desc: "A singular metric for your market value.",
    theme: "bg-emerald-500/5 border-emerald-500/10",
    iconColor: "text-emerald-400"
  },
  {
    id: "auth",
    size: "small",
    icon: <Shield className="w-6 h-6" />,
    tag: "Security",
    title: "Bio-Sync Auth",
    desc: "Secure access protocols.",
    theme: "bg-orange-500/5 border-orange-500/10",
    iconColor: "text-orange-400"
  },
  {
    id: "exam",
    size: "medium",
    icon: <CheckCircle2 className="w-8 h-8" />,
    tag: "Proof of Skill",
    title: "High-Stakes Exams",
    desc: "Rigorous anti-cheat assessments that yield globally recognized credentials.",
    theme: "bg-rose-500/5 border-rose-500/10",
    iconColor: "text-rose-400"
  }
];

export function Features() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      gsap.from(".bento-item", {
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 70%",
        },
        opacity: 0,
        y: 40,
        stagger: 0.1,
        duration: 0.8,
        ease: "power2.out",
        clearProps: "all"
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} className="relative py-32 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mb-24">
          <div className="flex items-center gap-2 text-primary font-black uppercase tracking-[0.3em] text-[10px] mb-6">
            <Command className="w-4 h-4" />
            Core Capabilities
          </div>
          <h2 className="text-5xl md:text-7xl font-black tracking-tight text-foreground mb-8">
            The Infrastructure <br />
            <span className="text-gradient">of Modern Excellence.</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[280px]">
          {BENTO_FEATURES.map((feature) => (
            <div
              key={feature.id}
              className={`bento-item group relative overflow-hidden rounded-[3rem] border ${feature.theme} p-10 transition-all duration-500 hover:bg-white/[0.02]
                ${feature.size === 'large' ? 'md:col-span-2 md:row-span-2 shadow-2xl shadow-blue-500/5' : ''}
                ${feature.size === 'medium' ? 'md:col-span-1 md:row-span-2 shadow-xl shadow-purple-500/5' : ''}
                ${feature.size === 'small' ? 'md:col-span-1 md:row-span-1' : ''}
              `}
            >
              <div className="space-y-6 relative z-10 h-full flex flex-col justify-between">
                <div className="space-y-6">
                  <div className={`w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center ${feature.iconColor} group-hover:scale-110 transition-transform duration-500`}>
                    {feature.icon}
                  </div>
                  <div className="space-y-3">
                    <div className={`text-[10px] font-black uppercase tracking-widest ${feature.iconColor}`}>
                      {feature.tag}
                    </div>
                    <h3 className={`font-black text-foreground ${feature.size === 'large' ? 'text-4xl' : 'text-2xl'}`}>
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground/70 leading-relaxed font-light line-clamp-3">
                      {feature.desc}
                    </p>
                  </div>
                </div>

                {feature.size === 'large' && (
                  <div className="pt-8">
                    <Button variant="outline" className="rounded-2xl border-white/10 bg-white/5 hover:bg-white/10 group h-12 px-8">
                      Explore Framework <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="bento-item mt-20 p-12 md:p-24 rounded-[4rem] bg-gradient-to-br from-primary/10 via-indigo-500/5 to-transparent border border-primary/20 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(var(--primary),0.1),transparent_70%)]" />
          <div className="relative z-10 max-w-3xl mx-auto space-y-10">
            <Sparkles className="w-16 h-16 text-primary mx-auto animate-pulse" />
            <h2 className="text-4xl md:text-6xl font-black text-foreground leading-[1.1]">Ready to architect <br /> your next level?</h2>
            <p className="text-xl text-muted-foreground/70 font-light leading-relaxed">
              Join the ecosystem where ambition meets precision.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <Button size="lg" className="h-16 px-12 text-xl font-black bg-primary rounded-2xl shadow-2xl shadow-primary/30">
                Onboard Now
              </Button>
              <Button size="lg" variant="ghost" className="h-16 px-12 text-xl font-bold rounded-2xl border border-white/5 bg-white/5 hover:bg-white/10">
                View Enterprise
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}