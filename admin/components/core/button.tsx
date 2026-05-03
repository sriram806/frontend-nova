import Link from 'next/link';
import { cn } from '@/lib/utils';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'outline';
type ButtonSize = 'sm' | 'md' | 'lg';

type CommonProps = {
  children: React.ReactNode;
  className?: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
};

type ButtonAsButton = CommonProps & React.ButtonHTMLAttributes<HTMLButtonElement> & { href?: never };
type ButtonAsLink = CommonProps & { href: string } & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href'>;

const variantStyles: Record<ButtonVariant, string> = {
  primary: 'bg-cyan-400 text-black hover:bg-cyan-300',
  secondary: 'bg-white/10 text-white hover:bg-white/15',
  ghost: 'bg-transparent text-white/80 hover:bg-white/10 hover:text-white',
  outline: 'border border-white/15 bg-white/5 text-white hover:bg-white/10',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'h-9 px-3 text-xs',
  md: 'h-10 px-4 text-sm',
  lg: 'h-12 px-6 text-sm',
};

function baseClass(variant: ButtonVariant, size: ButtonSize, className?: string): string {
  return cn(
    'inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 disabled:pointer-events-none disabled:opacity-50',
    variantStyles[variant],
    sizeStyles[size],
    className
  );
}

export function Button(props: ButtonAsButton | ButtonAsLink) {
  const { children, className, variant = 'primary', size = 'md', ...rest } = props;

  if ('href' in props && props.href) {
    return (
      <Link href={props.href} className={baseClass(variant, size, className)} {...(rest as Omit<ButtonAsLink, keyof CommonProps | 'href'>)}>
        {children}
      </Link>
    );
  }

  return (
    <button className={baseClass(variant, size, className)} {...(rest as Omit<ButtonAsButton, keyof CommonProps>)}>
      {children}
    </button>
  );
}
