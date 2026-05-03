'use client';

import { ElementType } from 'react';
import { LucideIcon } from 'lucide-react';

interface SectionHeaderProps {
  badge?: string;
  badgeIcon?: LucideIcon;
  title: string | React.ReactNode;
  description?: string;
  badgeColor?: string;
  badgeBg?: string;
  badgeBorder?: string;
  className?: string;
  titleClassName?: string;
}

export function SectionHeader({
  badge,
  badgeIcon: BadgeIcon,
  title,
  description,
  badgeColor = 'text-aurora-violet',
  badgeBg = 'bg-aurora-violet/10',
  badgeBorder = 'border-aurora-violet/30',
  className = 'mb-12 sm:mb-16',
  titleClassName = '',
}: SectionHeaderProps) {
  return (
    <div className={`text-center flex flex-col items-center px-4 ${className}`}>
      {badge && (
        <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border ${badgeBg} ${badgeBorder} ${badgeColor} text-sm font-medium mb-6 backdrop-blur-sm`}>
          {BadgeIcon && <BadgeIcon className="w-3.5 h-3.5" />}
          <span style={{ fontFamily: 'var(--font-syne)' }}>{badge}</span>
        </div>
      )}
      
      <h2 
        className={`text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-foreground tracking-tighter mb-4 sm:mb-5 ${titleClassName}`}
        style={{ fontFamily: 'var(--font-syne)' }}
      >
        {title}
      </h2>
      
      {description && (
        <p className="text-base sm:text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto font-light leading-relaxed">
          {description}
        </p>
      )}
    </div>
  );
}
