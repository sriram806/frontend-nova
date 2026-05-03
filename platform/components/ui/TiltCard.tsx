'use client';

import { ReactNode, useRef } from 'react';

type TiltCardProps = {
  children: ReactNode;
  className?: string;
};

export default function TiltCard({ children, className }: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = ref.current;
    if (!card) return;

    const rect = card.getBoundingClientRect();

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const midX = rect.width / 2;
    const midY = rect.height / 2;

    const rotateX = ((y - midY) / midY) * 12;
    const rotateY = ((x - midX) / midX) * -12;

    card.style.transform = `
      perspective(1000px)
      rotateX(${rotateX}deg)
      rotateY(${rotateY}deg)
      scale(1.04)
    `;

    // lighting effect
    card.style.setProperty('--x', `${x}px`);
    card.style.setProperty('--y', `${y}px`);
  };

  const handleMouseLeave = () => {
    const card = ref.current;
    if (!card) return;

    card.style.transform = `
      perspective(1000px)
      rotateX(0deg)
      rotateY(0deg)
      scale(1)
    `;
  };

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`group relative transition-transform duration-300 ease-out will-change-transform ${className}`}
      style={{
        transformStyle: 'preserve-3d',
      }}
    >
      {/* LIGHT REFLECTION */}
      <div
        className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition duration-300 group-hover:opacity-100"
        style={{
          background: `radial-gradient(circle at var(--x) var(--y), rgba(255,255,255,0.12), transparent 40%)`,
        }}
      />

      {/* GLOW */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-aurora-violet/20 to-aurora-indigo/20 blur-xl opacity-0 transition duration-300 group-hover:opacity-100" />

      {/* CONTENT */}
      <div className="relative z-10 h-full w-full">
        {children}
      </div>
    </div>
  );
}