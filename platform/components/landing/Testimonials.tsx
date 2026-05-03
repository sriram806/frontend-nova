'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Quote, Star, Sparkles } from 'lucide-react';

const REVIEWS = [
    {
        name: "Aarav Sharma",
        role: "Senior Dev @ Google",
        content: "ThinkAI completely transformed my trajectory. The 90-day roadmap was spot on, and the IDE assessments gave me the confidence I needed for my interview.",
        avatar: "AS",
        color: "from-blue-500/20 to-indigo-500/20"
    },
    {
        name: "Priya Patel",
        role: "Data Scientist @ Meta",
        content: "The most advanced platform for career growth. The AI simulations are indistinguishable from real-world senior level interviews.",
        avatar: "PP",
        color: "from-purple-500/20 to-violet-500/20"
    },
    {
        name: "Rohan Das",
        role: "Product Manager @ Amazon",
        content: "Validated my skills in half the time. The dashboard analytics are incredibly detailed and helpful for identifying blind spots.",
        avatar: "RD",
        color: "from-cyan-500/20 to-blue-500/20"
    }
];

export function Testimonials() {
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        gsap.registerPlugin(ScrollTrigger);

        const ctx = gsap.context(() => {
            gsap.from(".testimonial-card", {
                scrollTrigger: {
                    trigger: scrollRef.current,
                    start: "top 75%",
                },
                opacity: 0,
                y: 30,
                stagger: 0.15,
                duration: 0.8,
                ease: "power2.out",
                clearProps: "all"
            });
        }, scrollRef);

        return () => ctx.revert();
    }, []);

    return (
        <section ref={scrollRef} className="py-40 bg-background overflow-hidden border-t border-white/5">
            <div className="container mx-auto px-4">
                <div className="flex flex-col items-center text-center mb-24 space-y-8">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[10px] font-black uppercase tracking-[0.3em]">
                        <Sparkles className="w-3 h-3" />
                        Social Proof
                    </div>
                    <h2 className="text-5xl md:text-7xl font-black tracking-tight text-foreground">
                        Trusted by <span className="text-gradient">World-Class Talent.</span>
                    </h2>
                    <p className="text-xl text-muted-foreground/70 max-w-2xl font-light leading-relaxed">
                        Success stories from professionals who utilized Nova's neural engine to redefine their career limits.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
                    {REVIEWS.map((review, i) => (
                        <div
                            key={i}
                            className={`testimonial-card relative p-12 rounded-[3.5rem] bg-gradient-to-br ${review.color} border border-white/5 backdrop-blur-2xl transition-all duration-500 hover:-translate-y-3 group overflow-hidden`}
                        >
                            <Quote className="absolute top-10 right-10 w-16 h-16 text-primary opacity-[0.03] group-hover:opacity-[0.08] transition-all duration-700 -rotate-12" />

                            <div className="flex gap-1 mb-8">
                                {[1, 2, 3, 4, 5].map((s) => (
                                    <Star key={s} className="w-4 h-4 text-amber-400 fill-amber-400 opacity-80" />
                                ))}
                            </div>

                            <p className="text-xl text-white/90 leading-relaxed mb-12 font-light italic">
                                "{review.content}"
                            </p>

                            <div className="flex items-center gap-5">
                                <div className="w-16 h-16 rounded-[1.5rem] bg-gradient-to-br from-primary to-indigo-600 flex items-center justify-center font-black text-white text-2xl shadow-xl shadow-primary/20 transition-transform group-hover:scale-110">
                                    {review.avatar}
                                </div>
                                <div>
                                    <div className="font-black text-white text-xl tracking-tight">{review.name}</div>
                                    <div className="text-xs text-primary font-bold uppercase tracking-widest mt-1 opacity-80">{review.role}</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
