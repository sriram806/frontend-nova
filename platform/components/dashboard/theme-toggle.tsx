'use client';

import { Moon } from 'lucide-react';

export function ThemeToggle() {
  return (
    <div
      aria-label="Dark mode enabled"
      className="relative p-2 rounded-lg transition-all duration-200 hover:bg-[hsl(var(--dash-surface-raised))] border border-transparent hover:border-[hsl(var(--dash-border))] group"
    >
      <Moon className="w-4 h-4 text-[hsl(var(--dash-muted))] group-hover:text-aurora-indigo transition-colors duration-200" />
    </div>
  );
}
