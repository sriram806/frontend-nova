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
  label = 'Identity Verification',
  helperText = 'Enter the 6-digit administrative code.',
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
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 px-1">
        <label className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30">{label}</label>
        <span className={cn('text-[10px] font-black uppercase tracking-widest', error ? 'text-red-400' : 'text-blue-400/80')}>{length} bits</span>
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
                    className="h-14 w-12 rounded-2xl border border-white/5 bg-white/[0.03] text-lg font-bold text-white shadow-2xl transition-all duration-300 focus-within:border-blue-500/50 focus-within:ring-4 focus-within:ring-blue-500/5"
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

      <p className={cn('text-[12px] font-bold text-center uppercase tracking-wider', error ? 'text-red-400' : 'text-white/20')}>{helperText}</p>
    </div>
  );
}