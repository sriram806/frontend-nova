'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Search, Map, CheckCircle, Rocket, LucideIcon } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const STEPS = [
    {
        icon: Search,
        title: "Initial Assessment",
        desc: "Our AI scans your background and current skills to find your baseline.",
        color: "text-blue-400"
    },
    {
        icon: Map,
        title: "Blueprint Design",
        desc: "A custom 90-day trajectory is calculated based on your target role.",
        color: "text-purple-400"
    },
    {
        icon: CheckCircle,
        title: "Skill Validation",
        desc: "Interactive assessments and IDE challenges prove your market readiness.",
        color: "text-emerald-400"
    },
    {
        icon: Rocket,
        title: "Career Launch",
        desc: "Direct integration with global top-tier partners for placement.",
        color: "text-orange-400"
    }
];

export function HowItWorks() {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.from(".step-item", {
                scrollTrigger: {
                    trigger: containerRef.current,
                    start: "top 80%",
                },
                opacity: 0,
                x: (i) => i % 2 === 0 ? -50 : 50,
                stagger: 0.2,
                duration: 1,
                ease: "power2.out"
            });

            // Line animation
            gsap.from(".process-line", {
                scrollTrigger: {
                    trigger: containerRef.current,
                    start: "top 70%",
                    end: "bottom 80%",
                    scrub: true
                },
                scaleY: 0,
                transformOrigin: "top"
            });
        }, containerRef);

        return () => ctx.revert();
    }, []);

    return (
        <section ref={containerRef} className="relative py-40 bg-background overflow-hidden">
            <div className="container mx-auto px-4">
                <div className="text-center mb-32">
                    <h2 className="text-4xl md:text-6xl font-black text-foreground mb-6">How It Works</h2>
                    <p className="text-xl text-muted-foreground/70 max-w-2xl mx-auto font-light">
                        A scientifically backed process to take you from where you are to where you deserve to be.
                    </p>
                </div>

                <div className="relative max-w-4xl mx-auto">
                    {/* Vertical line for desktop */}
                    <div className="process-line absolute left-1/2 top-0 w-px h-full bg-gradient-to-b from-primary via-indigo-500 to-transparent hidden md:block" />

                    <div className="space-y-24">
                        {STEPS.map((step, i) => (
                            <div key={i} className={`step-item flex flex-col items-center gap-8 ${i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                                <div className="md:w-1/2 flex justify-center md:justify-end pr-0 md:pr-12">
                                    <div className={`p-10 rounded-[2.5rem] bg-white/5 border border-white/10 backdrop-blur-3xl transition-all hover:bg-white/10 hover:border-primary/20 ${i % 2 !== 0 ? 'md:mr-auto md:ml-0 md:text-left' : 'md:text-right'}`}>
                                        <h3 className="text-2xl font-black text-white mb-4">{step.title}</h3>
                                        <p className="text-muted-foreground/80 leading-relaxed">{step.desc}</p>
                                    </div>
                                </div>

                                {/* Center Circle */}
                                <div className="relative z-10 w-20 h-20 rounded-full bg-background border-4 border-primary flex items-center justify-center shadow-[0_0_20px_rgba(var(--primary),0.3)]">
                                    <step.icon className={`w-8 h-8 ${step.color}`} />
                                </div>

                                <div className="md:w-1/2 md:pl-12 hidden md:block">
                                    <div className="text-8xl font-black text-white/5 select-none uppercase tracking-widest">
                                        Step 0{i + 1}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
