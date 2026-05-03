'use client';

import { ReactNode } from 'react';

interface DashboardCardProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  className?: string;
  gradient?: boolean;
}

export function DashboardCard({ children, title, subtitle, className = '', gradient = false }: DashboardCardProps) {
  return (
    <div className={`rounded-2xl bg-[hsl(var(--dash-surface))] border border-[hsl(var(--dash-border))] p-6 hover:bg-[hsl(var(--dash-surface-raised))] transition-all duration-300 shadow-sm ${gradient ? 'border-neon-cyan/20 bg-gradient-to-br from-neon-cyan/10 to-transparent' : ''} ${className}`}>
      {(title || subtitle) && (
        <div className="mb-4">
          {title && <h3 className="text-sm font-bold text-[hsl(var(--dash-text))] uppercase tracking-widest">{title}</h3>}
          {subtitle && <p className="text-xs text-[hsl(var(--dash-muted))] mt-1">{subtitle}</p>}
        </div>
      )}
      {children}
    </div>
  );
}
