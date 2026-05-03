'use client';

import { useEffect, useRef, useState } from 'react';

type DropdownItem = {
  label: string;
  onClick: () => void;
};

type DropdownProps = {
  triggerLabel: string;
  items: DropdownItem[];
};

export function Dropdown({ triggerLabel, items }: DropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handleOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white/80 hover:bg-white/10"
      >
        {triggerLabel}
      </button>
      {open ? (
        <div className="absolute right-0 top-11 z-40 w-48 rounded-xl border border-white/10 bg-[#0b1120] p-1 shadow-2xl">
          {items.map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() => {
                item.onClick();
                setOpen(false);
              }}
              className="w-full rounded-lg px-3 py-2 text-left text-sm text-white/80 transition hover:bg-white/10 hover:text-white"
            >
              {item.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
