'use client';

import Image from 'next/image';
import { cn } from '@/lib/utils';

interface BrandLogoProps {
  className?: string;
  showWordmark?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'dark' | 'light';
  wordmarkClassName?: string;
}

const sizeMap = {
  sm: { logo: 'h-8 w-[120px]' },
  md: { logo: 'h-12 w-[176px]' },
  lg: { logo: 'h-16 w-[236px]' },
  xl: { logo: 'h-24 w-[352px]' },
} as const;

export function BrandLogo({
  className,
  showWordmark = true,
  size = 'md',
  variant = 'dark',
  wordmarkClassName,
}: BrandLogoProps) {
  const { logo } = sizeMap[size];
  const filterClassName = variant === 'light' ? 'brightness-0 invert' : '';

  return (
    <div className={cn('flex items-center', className)}>
      <div className={cn('relative flex-shrink-0', logo, !showWordmark ? 'w-auto aspect-square' : '', wordmarkClassName)}>
        <Image
          src="/logo_nova.png"
          alt="Nova"
          fill
          className={cn('object-contain object-left', filterClassName)}
          sizes="(max-width: 768px) 120px, 240px"
          priority={size === 'lg' || size === 'xl'}
        />
      </div>
    </div>
  );
}
