import { cn } from '@/lib/utils';

type Step = {
  id: string;
  label: string;
};

type StepperProps = {
  steps: Step[];
  currentStepId: string;
};

export function Stepper({ steps, currentStepId }: StepperProps) {
  const currentIndex = steps.findIndex((step) => step.id === currentStepId);

  return (
    <div className="flex flex-wrap gap-3">
      {steps.map((step, index) => {
        const state = index < currentIndex ? 'completed' : index === currentIndex ? 'active' : 'upcoming';
        return (
          <div
            key={step.id}
            className={cn(
              'rounded-full border px-4 py-1.5 text-xs font-semibold uppercase tracking-wide',
              state === 'completed' && 'border-emerald-400/50 bg-emerald-500/20 text-emerald-200',
              state === 'active' && 'border-indigo-400/50 bg-indigo-500/20 text-indigo-100',
              state === 'upcoming' && 'border-border bg-muted/40 text-muted-foreground'
            )}
          >
            {step.label}
          </div>
        );
      })}
    </div>
  );
}
