import { cn } from '@/lib/utils';

type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export function Input({ className, ...props }: InputProps) {
  return (
    <input
      {...props}
      className={cn(
        'h-11 w-full rounded-xl border border-white/12 bg-white/5 px-3 text-sm text-white placeholder:text-white/40 outline-none transition focus:border-cyan-300/45 focus:ring-2 focus:ring-cyan-300/20',
        className
      )}
    />
  );
}
