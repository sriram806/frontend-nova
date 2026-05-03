'use client';

import type { ReactNode } from 'react';
import { ShieldCheck, Sparkles } from 'lucide-react';

interface PlatformShellProps {
  eyebrow: string;
  title: ReactNode;
  description: string;
  badges?: string[];
  children: ReactNode;
}

export function PlatformShell({ eyebrow, title, description, badges = [], children }: PlatformShellProps) {
  return (
    <section className="relative overflow-hidden border-b border-white/5 bg-background">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(34,211,238,0.08),transparent_40%),radial-gradient(circle_at_80%_15%,rgba(129,140,248,0.10),transparent_35%),linear-gradient(180deg,rgba(255,255,255,0.02),transparent_24%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(148,163,184,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.08)_1px,transparent_1px)] bg-[size:48px_48px] opacity-25 pointer-events-none" />

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10 py-16 sm:py-20 lg:py-24">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-neon-cyan/20 bg-neon-cyan/10 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-neon-cyan shadow-[0_0_0_1px_rgba(34,211,238,0.08)]">
            <ShieldCheck className="w-3.5 h-3.5" />
            {eyebrow}
            <Sparkles className="w-3.5 h-3.5" />
          </div>

          <h1 className="mt-6 text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[0.95] text-foreground" style={{ fontFamily: 'var(--font-syne)' }}>
            {title}
          </h1>

          <p className="mt-5 text-base sm:text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            {description}
          </p>

          {badges.length > 0 && (
            <div className="mt-8 flex flex-wrap justify-center gap-2.5">
              {badges.map((badge) => (
                <span
                  key={badge}
                  className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-xs font-medium text-foreground/80 backdrop-blur-xl"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-neon-cyan" />
                  {badge}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="mt-12">{children}</div>
      </div>
    </section>
  );
}