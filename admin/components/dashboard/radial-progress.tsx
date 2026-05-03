'use client';

interface RadialProgressProps {
  value: number;
  size?: number | 'sm' | 'md' | 'lg';
  color?: string | 'cyan' | 'magenta' | 'lime';
}

export const RadialProgress = ({ value, size = 120, color = 'cyan' }: RadialProgressProps) => {
  const sizeMap = { sm: 80, md: 120, lg: 160 };
  const finalSize = typeof size === 'string' ? sizeMap[size] : size;
  
  const colorMap: Record<string, string> = {
    cyan: '#06b6d4',
    magenta: '#d946ef',
    lime: '#84cc16'
  };
  const finalColor = colorMap[color] || color;

  const r = (finalSize - 20) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - value / 100);
  
  return (
    <svg width={finalSize} height={finalSize} className="-rotate-90">
      <circle cx={finalSize / 2} cy={finalSize / 2} r={r} fill="none" stroke="hsl(var(--dash-border))" strokeWidth="8" />
      <circle cx={finalSize / 2} cy={finalSize / 2} r={r} fill="none" stroke={finalColor} strokeWidth="8"
        strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 1s ease' }}
      />
      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        dy=".3em"
        className="text-xl font-bold fill-current rotate-90"
        style={{ fontSize: finalSize * 0.2 }}
      >
        {value}%
      </text>
    </svg>
  );
};
