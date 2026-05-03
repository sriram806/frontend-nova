import { cn } from '@/lib/utils';

type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

export function Textarea({ className, ...props }: TextareaProps) {
  return (
    <textarea
      {...props}
      className={cn(
        'min-h-[110px] w-full rounded-xl border border-white/12 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/40 outline-none transition focus:border-cyan-300/45 focus:ring-2 focus:ring-cyan-300/20',
        className
      )}
    />
  );
}
