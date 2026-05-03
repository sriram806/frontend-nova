'use client';

import { MonitorSmartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

type ExamDeviceWarningProps = {
  show: boolean;
  actionLabel?: string;
  onAction?: () => void;
};

export function ExamDeviceWarning({ show, actionLabel, onAction }: ExamDeviceWarningProps) {
  if (!show) {
    return null;
  }

  return (
    <Card className="mx-auto max-w-xl rounded-3xl border-border/80">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <MonitorSmartphone className="h-5 w-5 text-primary" />
          Desktop Required
        </CardTitle>
        <CardDescription>
          Exam pages are not supported on small or medium screens. Open this page on a large desktop display.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {actionLabel && onAction ? (
          <Button className="w-full rounded-2xl" onClick={onAction}>
            {actionLabel}
          </Button>
        ) : null}
      </CardContent>
    </Card>
  );
}
