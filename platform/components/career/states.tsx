import type { ReactNode } from 'react';
import { AlertCircle, FileSearch, Loader2 } from 'lucide-react';

type StateProps = {
  title: string;
  description: string;
};

function BaseState({ title, description, icon }: StateProps & { icon: ReactNode }) {
  return (
    <div className="rounded-xl border border-dashed border-border bg-card p-8 text-center">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
        {icon}
      </div>
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

export function LoadingState() {
  return (
    <BaseState
      title="Analyzing your profile"
      description="The AI service is evaluating your readiness and generating recommendations."
      icon={<Loader2 className="h-5 w-5 animate-spin" />}
    />
  );
}

export function ErrorState({ message }: { message: string }) {
  return (
    <BaseState
      title="Unable to complete request"
      description={message}
      icon={<AlertCircle className="h-5 w-5 text-red-500" />}
    />
  );
}

export function EmptyState({ description }: { description: string }) {
  return (
    <BaseState
      title="No report available"
      description={description}
      icon={<FileSearch className="h-5 w-5" />}
    />
  );
}
