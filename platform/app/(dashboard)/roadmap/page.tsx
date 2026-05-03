'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { PageTransition } from '@/components/common/page-transition';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { useRoadmapQuery, useToggleRoadmapTaskMutation } from '@/hooks/queries/useRoadmapQueries';

export default function RoadmapPage() {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const { data, isLoading, isError, refetch } = useRoadmapQuery();
  const toggleTaskMutation = useToggleRoadmapTaskMutation();

  return (
    <PageTransition>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold">Learning roadmap</h2>
          <p className="text-sm text-muted-foreground">Timeline view of projects, tasks, and milestone completion.</p>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-48 rounded-2xl" />
            ))}
          </div>
        ) : null}

        {isError ? (
          <Card className="glass rounded-3xl border-white/10">
            <CardHeader>
              <CardTitle>Unable to load roadmap</CardTitle>
              <CardDescription>Retry to fetch your generated roadmap milestones.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="gradient-primary rounded-2xl" onClick={() => refetch()}>
                Retry
              </Button>
            </CardContent>
          </Card>
        ) : null}

        {!isLoading && !isError && data ? (
          <div className="space-y-4">
            {data.map((milestone) => {
              const expanded = expandedId === milestone.id;
              return (
                <Card key={milestone.id} className="glass rounded-3xl border-white/10">
                  <CardHeader className="cursor-pointer" onClick={() => setExpandedId(expanded ? null : milestone.id)}>
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-lg">{milestone.title}</CardTitle>
                          <Badge variant="secondary">{milestone.weekLabel}</Badge>
                        </div>
                        <CardDescription className="mt-1">Milestone completion {milestone.progress}%</CardDescription>
                      </div>
                      {expanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <Progress value={milestone.progress} className="h-2" />
                    {expanded ? (
                      <div className="space-y-2">
                        {milestone.tasks.map((task) => (
                          <div
                            key={task.id}
                            className="flex items-start gap-3 rounded-2xl border border-white/10 bg-muted/20 p-3"
                          >
                            <Checkbox
                              checked={task.completed}
                              onCheckedChange={(checked) =>
                                toggleTaskMutation.mutate({
                                  milestoneId: milestone.id,
                                  taskId: task.id,
                                  completed: Boolean(checked),
                                })
                              }
                            />
                            <div>
                              <p className="font-medium">{task.title}</p>
                              <p className="text-sm text-muted-foreground">{task.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : null}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : null}
      </div>
    </PageTransition>
  );
}
