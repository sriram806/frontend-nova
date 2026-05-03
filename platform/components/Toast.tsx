'use client';

import { useEffect, useState } from 'react';
import { toast, ToastItem } from '@/utils/toast';

const toneClass: Record<ToastItem['type'], string> = {
  success: 'border-emerald-400/40 bg-emerald-500/15 text-emerald-100',
  error: 'border-red-400/40 bg-red-500/15 text-red-100',
  info: 'border-cyan-400/40 bg-cyan-500/15 text-cyan-100',
};

export function ToastHost() {
  const [items, setItems] = useState<ToastItem[]>([]);

  useEffect(() => {
    return toast.subscribe((item) => {
      setItems((prev) => [...prev, item]);
      setTimeout(() => {
        setItems((prev) => prev.filter((toastItem) => toastItem.id !== item.id));
      }, 3000);
    });
  }, []);

  return (
    <div className="pointer-events-none fixed right-4 top-4 z-[100] flex w-[92vw] max-w-sm flex-col gap-2">
      {items.map((item) => (
        <div
          key={item.id}
          className={`pointer-events-auto rounded-xl border px-4 py-3 text-sm shadow-xl backdrop-blur ${toneClass[item.type]}`}
        >
          {item.message}
        </div>
      ))}
    </div>
  );
}
