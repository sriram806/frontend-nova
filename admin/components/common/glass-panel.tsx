import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type GlassPanelProps = {
  children: ReactNode;
  className?: string;
};

export function GlassPanel({ children, className }: GlassPanelProps) {
  return <div className={cn('glass rounded-2xl p-5', className)}>{children}</div>;
}
