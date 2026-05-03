'use client';

interface BackgroundBloomProps {
  color?: 'violet' | 'cyan' | 'indigo' | 'amber' | 'rose';
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
  opacity?: number;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const colorMap = {
  violet: 'bg-aurora-violet',
  cyan: 'bg-neon-cyan',
  indigo: 'bg-aurora-indigo',
  amber: 'bg-aurora-amber',
  rose: 'bg-aurora-rose',
};

const positionMap = {
  'top-left': 'top-0 left-0 -translate-x-1/2 -translate-y-1/2',
  'top-right': 'top-0 right-0 translate-x-1/2 -translate-y-1/2',
  'bottom-left': 'bottom-0 left-0 -translate-x-1/2 translate-y-1/2',
  'bottom-right': 'bottom-0 right-0 translate-x-1/2 translate-y-1/2',
  'center': 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
};

const sizeMap = {
  sm: 'w-[300px] h-[300px] blur-[100px]',
  md: 'w-[500px] h-[500px] blur-[150px]',
  lg: 'w-[700px] h-[700px] blur-[200px]',
  xl: 'w-[1000px] h-[1000px] blur-[250px]',
};

export function BackgroundBloom({
  color = 'indigo',
  position = 'top-right',
  opacity = 0.08,
  size = 'md',
  className = '',
}: BackgroundBloomProps) {
  return (
    <div
      className={`absolute pointer-events-none rounded-full ${colorMap[color]} ${positionMap[position]} ${sizeMap[size]} ${className}`}
      style={{ opacity }}
    />
  );
}
