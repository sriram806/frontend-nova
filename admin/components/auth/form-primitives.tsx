'use client';

import { InputHTMLAttributes, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/* ================= FIELD ================= */
type FieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
};

export function Field({ label, className, ...inputProps }: FieldProps) {
  return (
    <div className="relative w-full group">
      {/* Input */}
      <input
        {...inputProps}
        placeholder=" "
        className={`peer w-full rounded-[1.25rem] border border-white/5 bg-white/[0.03] pt-7 pb-2.5 px-6 text-[15px] font-bold text-white
        transition-all duration-300 ease-in-out backdrop-blur-sm
        hover:bg-white/[0.06] hover:border-white/10
        focus:bg-white/[0.01] focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/5 focus:outline-none
        disabled:cursor-not-allowed disabled:opacity-50
        ${className ?? ''}`}
      />

      {/* Label */}
      <label
        className="pointer-events-none absolute left-6 top-1/2 -translate-y-1/2 text-[12px] font-black text-white/30 uppercase tracking-[0.2em]
        transition-all duration-300 ease-in-out
        peer-focus:top-3.5 peer-focus:text-[10px] peer-focus:text-blue-400
        peer-[:not(:placeholder-shown)]:top-3.5 peer-[:not(:placeholder-shown)]:text-[10px] peer-[:not(:placeholder-shown)]:text-blue-500/60"
      >
        {label}
      </label>
      
      {/* High-tech focus corner indicators */}
      <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-blue-500/0 group-focus-within:border-blue-500/50 transition-all rounded-tl-lg" />
      <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-blue-500/0 group-focus-within:border-blue-500/50 transition-all rounded-tr-lg" />
      <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-blue-500/0 group-focus-within:border-blue-500/50 transition-all rounded-bl-lg" />
      <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-blue-500/0 group-focus-within:border-blue-500/50 transition-all rounded-br-lg" />
    </div>
  );
}

/* ================= BUTTON ================= */
type AuthButtonProps = {
  children: ReactNode;
  disabled?: boolean;
  type?: 'button' | 'submit';
  onClick?: () => void;
};

export function AuthButton({ children, disabled, type = 'submit', onClick }: AuthButtonProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.01, y: -1 }}
      whileTap={{ scale: 0.98 }}
      type={type}
      disabled={disabled}
      onClick={onClick}
      className="relative flex w-full items-center justify-center overflow-hidden rounded-[1.25rem] 
      bg-blue-600 px-6 py-4 text-[14px] font-black uppercase tracking-[0.25em] text-white
      shadow-[0_20px_50px_rgba(37,99,235,0.25)]
      transition-all duration-300 ease-out
      hover:bg-blue-500 hover:shadow-[0_25px_60px_rgba(37,99,235,0.4)]
      disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none disabled:translate-y-0"
    >
      <span className="relative z-10 flex items-center gap-3">
        {children}
      </span>
      {/* Animated scanline effect */}
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-transparent via-white/5 to-transparent h-1/2 -top-full group-hover:top-full transition-all duration-1000 ease-linear" />
      <div className="absolute inset-0 z-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] animate-shimmer" />
    </motion.button>
  );
}

/* ================= MESSAGE ================= */
export function Message({ tone = 'default', children }: { tone?: 'default' | 'error' | 'success'; children: ReactNode }) {
  const styles = {
    default: 'border-white/10 bg-white/5 text-white/60',
    error: 'border-red-500/20 bg-red-500/10 text-red-400',
    success: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400',
  } as const;

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className={`rounded-[1.25rem] border px-6 py-4 text-[13px] font-bold flex items-center gap-4 backdrop-blur-md ${styles[tone]}`}
    >
      <div className={`h-1.5 w-1.5 rounded-full animate-pulse ${tone === 'error' ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]' : tone === 'success' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]'}`} />
      <span className="uppercase tracking-wider">{children}</span>
    </motion.div>
  );
}

/* ================= OAUTH BUTTON ================= */
type OAuthButtonProps = {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
};

export function OAuthButton({ children, onClick, disabled }: OAuthButtonProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.01, backgroundColor: 'rgba(255,255,255,0.06)', borderColor: 'rgba(255,255,255,0.15)' }}
      whileTap={{ scale: 0.98 }}
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex w-full items-center justify-center gap-4 rounded-[1.25rem] 
      border border-white/5 bg-white/[0.02]
      px-6 py-4 text-[12px] font-black uppercase tracking-[0.2em] text-white/60
      transition-all duration-300 backdrop-blur-sm
      disabled:cursor-not-allowed disabled:opacity-40"
    >
      {children}
    </motion.button>
  );
}

