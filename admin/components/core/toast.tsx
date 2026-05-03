'use client';

import { AnimatePresence, motion } from 'framer-motion';

type ToastProps = {
  show: boolean;
  message: string;
  tone?: 'success' | 'error' | 'default';
};

const toneClass = {
  success: 'border-emerald-300/30 bg-emerald-400/10 text-emerald-100',
  error: 'border-red-300/30 bg-red-400/10 text-red-100',
  default: 'border-white/15 bg-white/10 text-white',
} as const;

export function Toast({ show, message, tone = 'default' }: ToastProps) {
  return (
    <AnimatePresence>
      {show ? (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          className={`fixed bottom-5 right-5 z-50 rounded-xl border px-4 py-2 text-sm shadow-2xl ${toneClass[tone]}`}
        >
          {message}
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
