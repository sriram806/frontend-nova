type LoaderProps = {
  label?: string;
};

export function Loader({ label = 'Loading...' }: LoaderProps) {
  return (
    <div className="inline-flex items-center gap-2 text-sm text-[hsl(var(--dash-muted))]">
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-aurora-violet" />
      {label}
    </div>
  );
}
