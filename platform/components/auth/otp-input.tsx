'use client';

import * as React from 'react';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { cn } from '@/lib/utils';

type OtpInputProps = {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  label?: string;
  helperText?: string;
  length?: number;
  groupSize?: number;
  autoFocus?: boolean;
  error?: string | boolean;
  onComplete?: (value: string) => void;
};

export function OtpInput({
  value,
  onChange,
  disabled,
  label = 'One-Time Password',
  helperText = 'Enter the 6-digit code from your email.',
  length = 6,
  groupSize = 3,
  autoFocus = true,
  error,
  onComplete,
}: OtpInputProps) {
  const lastCompletedValue = React.useRef<string | null>(null);

  React.useEffect(() => {
    if (onComplete && value.length === length && value !== lastCompletedValue.current) {
      lastCompletedValue.current = value;
      onComplete(value);
      return;
    }

    if (value.length !== length) {
      lastCompletedValue.current = null;
    }
  }, [length, onComplete, value]);

  const slotIndexes = React.useMemo(() => Array.from({ length }, (_, index) => index), [length]);

  const groups = React.useMemo(() => {
    const segments: number[][] = [];

    for (let index = 0; index < slotIndexes.length; index += groupSize) {
      segments.push(slotIndexes.slice(index, index + groupSize));
    }

    return segments;
  }, [groupSize, slotIndexes]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3 px-1">
        <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">{label}</label>
        <span className={cn('text-[10px] font-bold uppercase tracking-wider', error ? 'text-red-400' : 'text-indigo-400/60')}>{length} digits</span>
      </div>

      <InputOTP
        value={value}
        onChange={onChange}
        maxLength={length}
        containerClassName="justify-center"
        disabled={disabled}
        autoFocus={autoFocus}
      >
        <div className="flex flex-wrap items-center justify-center gap-3">
          {groups.map((group, groupIndex) => (
            <React.Fragment key={group[0]}>
              <InputOTPGroup className="gap-2.5">
                {group.map((index) => (
                  <InputOTPSlot
                    key={index}
                    index={index}
                    className="h-14 w-12 rounded-2xl border border-white/10 bg-white/5 text-lg font-bold text-white shadow-xl transition-all duration-300 focus-within:border-indigo-500/50 focus-within:ring-4 focus-within:ring-indigo-500/10"
                  />
                ))}
              </InputOTPGroup>

              {groupIndex < groups.length - 1 ? (
                <div className="w-2 h-0.5 rounded-full bg-white/10 mx-0.5" />
              ) : null}
            </React.Fragment>
          ))}
        </div>
      </InputOTP>

      <p className={cn('text-[12px] font-medium text-center', error ? 'text-red-400' : 'text-white/30')}>{helperText}</p>
    </div>
  );
}