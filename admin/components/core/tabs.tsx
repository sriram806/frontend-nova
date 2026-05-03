'use client';

import { cn } from '@/lib/utils';

type TabsProps = {
  tabs: { id: string; label: string }[];
  activeTab: string;
  onChange: (id: string) => void;
  className?: string;
};

export function Tabs({ tabs, activeTab, onChange, className }: TabsProps) {
  return (
    <div className={cn('inline-flex rounded-xl border border-white/10 bg-white/5 p-1', className)}>
      {tabs.map((tab) => {
        const active = tab.id === activeTab;

        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={cn(
              'rounded-lg px-3 py-1.5 text-sm transition',
              active ? 'bg-cyan-400 text-black' : 'text-white/70 hover:bg-white/10 hover:text-white'
            )}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
