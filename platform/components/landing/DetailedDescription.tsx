'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Cpu, Globe, GraduationCap, MousePointer2, ShieldCheck, Zap, Layers, Network, Terminal, ArrowRight } from 'lucide-react';

const ECOSYSTEM_POINTS = [
    {
        icon: <Cpu className="w-10 h-10" />,
        title: "Neural Learning Engine",
        description: "Our AI doesn't just provide answers; it understands your cognitive load and adapts the curriculum in real-time.",
        stats: "92% Mastery",
        color: "from-blue-500/10 to-indigo-500/10",
        borderColor: "border-blue-500/20"
    },
    {
        icon: <Network className="w-10 h-10" />,
        title: "Global Talent Sync",
        description: "Connect with opportunities worldwide. Your validated skills are benchmarked against global industry standards.",
        stats: "120+ Countries",
        color: "from-purple-500/10 to-indigo-500/10",
        borderColor: "border-purple-500/20"
    },
    {
        icon: <ShieldCheck className="w-10 h-10" />,
        title: "Verification Protocol",
        description: "Every certificate issued is backed by our rigorous assessment protocol, making your credentials indisputable.",
        stats: "Blockchain Secured",
        color: "from-emerald-500/10 to-teal-500/10",
        borderColor: "border-emerald-500/20"
    },
    {
        icon: <Terminal className="w-10 h-10" />,
        title: "Real-time IDE",
        description: "Build as you learn with our integrated cloud workspace. No setup required, just pure productivity.",
        stats: "0ms Latency",
        color: "from-orange-500/10 to-red-500/10",
        borderColor: "border-orange-500/20"
    }
];

export function DetailedDescription() {
    const sectionRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        gsap.registerPlugin(ScrollTrigger);

        const ctx = gsap.context(() => {
            // Cards animation
            gsap.from(".ecosystem-card", {
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: "top 70%",
                    toggleActions: "play none none none"
                },
                opacity: 0,
                y: 40,
                stagger: 0.1,
                duration: 0.8,
                ease: "power2.out",
                clearProps: "all"
            });

            // Text reveal
            gsap.from(".reveal-text", {
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: "top 80%",
                },
                opacity: 0,
                y: 20,
                duration: 0.8,
                stagger: 0.1,
                clearProps: "all"
            });
        }, sectionRef);

        return () => ctx.revert();
    }, []);

    return (
        <section ref={sectionRef} className="relative py-32 bg-background overflow-hidden border-y border-white/5">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(var(--primary),0.05),transparent_50%)]" />

            <div className="container relative z-10 mx-auto px-4">
                <div className="max-w-4xl mx-auto text-center mb-24">
                    <div className="reveal-text inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-[0.3em] mb-8">
                        <Layers className="w-3 h-3" />
                        The Ecosystem
                    </div>
                    <h2 className="reveal-text text-5xl md:text-7xl font-black tracking-tight text-foreground leading-[1.1] mb-8">
                        A Multidimensional <br />
                        <span className="text-gradient">Architect for Growth.</span>
                    </h2>
                    <p className="reveal-text text-xl text-muted-foreground/80 font-light leading-relaxed max-w-2xl mx-auto">
                        Traditional learning is static. ThinkAI provides a dynamic ecosystem that evolves with your career aspirations and technological shifts.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
                    {ECOSYSTEM_POINTS.map((point, i) => (
                        <div
                            key={i}
                            className={`ecosystem-card group relative p-12 rounded-[2.5rem] bg-gradient-to-br ${point.color} border ${point.borderColor} backdrop-blur-xl overflow-hidden transition-all duration-500 hover:scale-[1.01]`}
                        >
                            <div className="relative z-10">
                                <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-primary mb-8 group-hover:scale-110 transition-transform duration-500">
                                    {point.icon}
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-2xl font-black text-foreground">{point.title}</h3>
                                        <span className="text-[10px] font-bold text-primary/60 uppercase tracking-widest">{point.stats}</span>
                                    </div>
                                    <p className="text-muted-foreground leading-relaxed font-light">
                                        {point.description}
                                    </p>
                                </div>

                                <div className="mt-8 pt-8 border-t border-white/5 flex items-center gap-3 text-xs font-bold text-primary cursor-pointer hover:gap-5 transition-all">
                                    Deep Dive Analysis <ArrowRight className="w-4 h-4" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
