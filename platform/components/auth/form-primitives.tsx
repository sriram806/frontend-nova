'use client';

import React, { InputHTMLAttributes, TextareaHTMLAttributes, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

/* ================= CARD ================= */
export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn(
      "bg-[#0A0A0A]/40 border border-white/5 rounded-[2.5rem] p-8 backdrop-blur-3xl shadow-2xl transition-all hover:bg-[#0A0A0A]/60 hover:border-white/10 relative overflow-hidden group/card",
      "before:absolute before:inset-0 before:bg-gradient-to-br before:from-primary/5 before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity",
      className
    )}>
      {children}
    </div>
  );
}

/* ================= FIELD ================= */
type FieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
};

export function Field({ label, error, className, ...props }: FieldProps) {
  const [isFocused, setIsFocused] = React.useState(false);
  const hasValue = props.value !== undefined && props.value !== '';

  return (
    <div className="relative w-full group/input">
      <div className={cn(
        "absolute left-6 transition-all duration-500 pointer-events-none",
        (isFocused || hasValue) 
          ? "-top-2.5 left-4 text-[9px] font-black uppercase tracking-[0.25em] bg-black px-3 py-0.5 text-primary rounded-full border border-primary/20 z-10" 
          : "top-1/2 -translate-y-1/2 text-sm font-bold uppercase tracking-widest text-white/20 group-hover/input:text-white/40"
      )}>
        {label}
      </div>
      <input
        {...props}
        onFocus={(e) => {
          setIsFocused(true);
          props.onFocus?.(e);
        }}
        onBlur={(e) => {
          setIsFocused(false);
          props.onBlur?.(e);
        }}
        className={cn(
          "w-full h-[4.5rem] bg-white/[0.02] border border-white/10 rounded-2xl px-6 text-lg font-black tracking-tight transition-all focus:bg-white/[0.08] focus:border-primary/50 outline-none placeholder-transparent shadow-inner group-hover/input:border-white/20",
          error ? "border-red-500/50" : "focus:ring-[12px] focus:ring-primary/5",
          className
        )}
      />
      {error && <p className="absolute -bottom-5 left-2 text-[9px] text-red-400 font-black uppercase tracking-widest animate-pulse">{error}</p>}
    </div>
  );
}

/* ================= TEXT AREA ================= */
type TextAreaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string;
  error?: string;
};

export function FieldTextArea({ label, error, className, ...props }: TextAreaProps) {
  const [isFocused, setIsFocused] = React.useState(false);
  const hasValue = props.value !== undefined && props.value !== '';

  return (
    <div className="relative w-full group/input">
      <div className={cn(
        "absolute left-6 transition-all duration-500 pointer-events-none",
        (isFocused || hasValue) 
          ? "-top-2.5 left-4 text-[9px] font-black uppercase tracking-[0.25em] bg-black px-3 py-0.5 text-primary rounded-full border border-primary/20 z-10" 
          : "top-8 text-sm font-bold uppercase tracking-widest text-white/20 group-hover/input:text-white/40"
      )}>
        {label}
      </div>
      <textarea
        {...props}
        onFocus={(e) => {
          setIsFocused(true);
          props.onFocus?.(e);
        }}
        onBlur={(e) => {
          setIsFocused(false);
          props.onBlur?.(e);
        }}
        className={cn(
          "w-full bg-white/[0.02] border border-white/10 rounded-[2rem] p-8 text-xl font-black tracking-tight leading-relaxed transition-all focus:bg-white/[0.08] focus:border-primary/50 outline-none placeholder-transparent resize-none shadow-inner group-hover/input:border-white/20",
          error ? "border-red-500/50" : "focus:ring-[16px] focus:ring-primary/5",
          className
        )}
      />
      {error && <p className="absolute -bottom-5 left-2 text-[9px] text-red-400 font-black uppercase tracking-widest animate-pulse">{error}</p>}
    </div>
  );
}

/* ================= BUTTON ================= */
type AuthButtonProps = {
  children: ReactNode;
  disabled?: boolean;
  type?: 'button' | 'submit';
  onClick?: () => void;
  className?: string;
};

export function AuthButton({ children, disabled, type = 'submit', onClick, className }: AuthButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "group relative isolate flex w-full items-center justify-center overflow-hidden rounded-2xl bg-primary px-4 py-5 text-xs font-black uppercase tracking-[0.3em] text-white shadow-[0_8px_30px_rgba(var(--primary-rgb),0.3)] transition-all duration-300 ease-out hover:shadow-[0_12px_40px_rgba(var(--primary-rgb),0.4)] hover:-translate-y-0.5 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:translate-y-0 disabled:shadow-none",
        className
      )}
    >
      <span className="relative z-10 flex items-center gap-2">
        {children}
      </span>
      
      {/* Glossy overlay effect */}
      <div className="absolute inset-0 z-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      {/* Animated light flare */}
      <motion.div 
        initial={{ left: '-100%' }}
        animate={{ left: '200%' }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear", repeatDelay: 1 }}
        className="absolute top-0 bottom-0 w-20 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-[-20deg] pointer-events-none"
      />
    </button>
  );
}

/* ================= MESSAGE ================= */
export function Message({ tone = 'default', children }: { tone?: 'default' | 'error' | 'success'; children: ReactNode }) {
  const styles = {
    default: 'border-white/10 bg-white/5 text-white/70',
    error: 'border-red-500/20 bg-red-500/10 text-red-400',
    success: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400',
  } as const;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "rounded-2xl border px-6 py-4 text-[10px] font-black uppercase tracking-widest flex items-center gap-4 backdrop-blur-sm shadow-xl",
        styles[tone]
      )}
    >
      <div className={cn(
        "h-2 w-2 rounded-full animate-pulse",
        tone === 'error' ? 'bg-red-500' : tone === 'success' ? 'bg-emerald-500' : 'bg-white/40'
      )} />
      {children}
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
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="group flex w-full items-center justify-center gap-4 rounded-2xl border border-white/5 bg-white/5 px-4 py-4 text-[10px] font-black uppercase tracking-widest text-white/40 transition-all duration-300 ease-out backdrop-blur-sm hover:bg-white/10 hover:border-white/20 hover:text-white active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
    >
      {children}
    </button>
  );
}
