'use client';

import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  initialCareerFormValues,
  toCareerAnalyzeRequest,
  type CareerFormErrors,
  type CareerFormValues,
  validateCareerForm,
} from '@/lib/career-validation';
import type { CareerAnalyzeRequest } from '@/types/career';

type CareerFormProps = {
  loading: boolean;
  onAnalyze: (payload: CareerAnalyzeRequest) => Promise<void>;
  onLoadLatest: (userId: string) => Promise<void>;
  onStartAction: () => void;
};

function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return <p className="mt-1 text-xs text-red-500">{message}</p>;
}

export function CareerForm({ loading, onAnalyze, onLoadLatest, onStartAction }: CareerFormProps) {
  const [values, setValues] = useState<CareerFormValues>(initialCareerFormValues);
  const [errors, setErrors] = useState<CareerFormErrors>({});

  const resumeLength = values.resumeText.trim().length;
  const resumeHint = useMemo(() => `${resumeLength} / 20+ characters`, [resumeLength]);

  function updateField<Key extends keyof CareerFormValues>(field: Key, value: CareerFormValues[Key]) {
    setValues((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  }

  async function handleAnalyzeSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onStartAction();

    const nextErrors = validateCareerForm(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    await onAnalyze(toCareerAnalyzeRequest(values));
  }

  async function handleLoadLatest() {
    onStartAction();

    const userId = values.userId.trim();
    if (userId.length === 0) {
      setErrors((prev) => ({ ...prev, userId: 'User ID is required.' }));
      return;
    }

    await onLoadLatest(userId);
  }

  return (
    <form onSubmit={handleAnalyzeSubmit} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="resumeText">Resume Text</Label>
        <Textarea
          id="resumeText"
          value={values.resumeText}
          onChange={(event) => updateField('resumeText', event.target.value)}
          placeholder="Paste resume content, achievements, projects, and skill details..."
          className="min-h-[180px]"
          disabled={loading}
        />
        <div className="flex items-center justify-between">
          <FieldError message={errors.resumeText} />
          <span className="text-xs text-muted-foreground">{resumeHint}</span>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="targetRole">Target Role</Label>
          <Input
            id="targetRole"
            value={values.targetRole}
            onChange={(event) => updateField('targetRole', event.target.value)}
            placeholder="e.g. Senior Frontend Engineer"
            disabled={loading}
          />
          <FieldError message={errors.targetRole} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="userId">User ID</Label>
          <Input
            id="userId"
            value={values.userId}
            onChange={(event) => updateField('userId', event.target.value)}
            placeholder="Unique user identifier"
            disabled={loading}
          />
          <FieldError message={errors.userId} />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="githubScore">GitHub Score (optional)</Label>
          <Input
            id="githubScore"
            type="number"
            min={0}
            max={100}
            value={values.githubScore}
            onChange={(event) => updateField('githubScore', event.target.value)}
            placeholder="0 - 100"
            disabled={loading}
          />
          <FieldError message={errors.githubScore} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="quizScore">Quiz Score (optional)</Label>
          <Input
            id="quizScore"
            type="number"
            min={0}
            max={100}
            value={values.quizScore}
            onChange={(event) => updateField('quizScore', event.target.value)}
            placeholder="0 - 100"
            disabled={loading}
          />
          <FieldError message={errors.quizScore} />
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button type="submit" disabled={loading}>
          Analyze Now
        </Button>
        <Button type="button" variant="secondary" disabled={loading} onClick={handleLoadLatest}>
          Load Latest Report
        </Button>
      </div>
    </form>
  );
}
