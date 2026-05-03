'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { Rocket, Send, Sparkles, Zap, Star, MousePointer2, Plane, Origami } from 'lucide-react';

export function FloatingIcons() {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            const icons = containerRef.current?.querySelectorAll('.floating-icon');
            if (icons) {
                icons.forEach((icon, i) => {
                    // Floating motion
                    gsap.to(icon, {
                        y: "random(-60, 60)",
                        x: "random(-60, 60)",
                        rotation: "random(-20, 20)",
                        duration: `random(4, 8)`,
                        repeat: -1,
                        yoyo: true,
                        ease: "sine.inOut",
                        delay: i * 0.3
                    });

                    // Panning/Parallax effect based on mouse move could be added here but keeping it autonomous
                });
            }
        }, containerRef);

        return () => ctx.revert();
    }, []);

    return (
        <div ref={containerRef} className="absolute inset-0 pointer-events-none overflow-hidden z-0">
            {/* Rocket - Large & Prominent */}
            <div className="floating-icon absolute top-[10%] left-[8%] opacity-20 text-primary drop-shadow-[0_0_15px_rgba(var(--primary),0.5)]">
                <Rocket size={84} className="rotate-[25deg]" />
            </div>

            {/* Paper Airplane - Origami Style */}
            <div className="floating-icon absolute top-[20%] right-[12%] opacity-15 text-indigo-400">
                <Origami size={56} className="-rotate-12" />
            </div>

            {/* Paper Airplane - Classic Style */}
            <div className="floating-icon absolute bottom-[25%] left-[15%] opacity-10 text-cyan-400">
                <Send size={44} className="-rotate-45" />
            </div>

            <div className="floating-icon absolute top-[55%] right-[20%] opacity-10 text-purple-400">
                <Sparkles size={64} />
            </div>

            <div className="floating-icon absolute bottom-[40%] right-[8%] opacity-15 text-amber-400">
                <Star size={40} fill="currentColor" />
            </div>

            <div className="floating-icon absolute top-[45%] left-[4%] opacity-10 text-primary">
                <Zap size={48} fill="currentColor" className="opacity-50" />
            </div>

            {/* Decorative Orbs with Dynamic Glow */}
            <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[160px] animate-aurora-pulse" />
            <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[180px] animate-aurora-pulse [animation-delay:2s]" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-cyan-500/5 rounded-full blur-[200px] animate-aurora-pulse [animation-delay:4s]" />
        </div>
    );
}
