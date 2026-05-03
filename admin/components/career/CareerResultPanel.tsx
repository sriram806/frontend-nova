import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import type { CareerReport } from '@/types/career';

type CareerResultPanelProps = {
  report: CareerReport;
};

function ListSection({ title, items }: { title: string; items: string[] }) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">No items available.</p>
        ) : (
          <ul className="list-disc space-y-2 pl-5 text-sm">
            {items.map((item) => (
              <li key={`${title}-${item}`}>{item}</li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString();
}

export function CareerResultPanel({ report }: CareerResultPanelProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Career Analysis Report</CardTitle>
          <CardDescription>
            User: <span className="font-medium text-foreground">{report.userId}</span> • Target Role:{' '}
            <span className="font-medium text-foreground">{report.targetRole || 'Not provided'}</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">Readiness Score</span>
              <span className="text-muted-foreground">{Math.round(report.readinessScore)} / 100</span>
            </div>
            <Progress value={report.readinessScore} className="h-2" />
          </div>

          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">Model: {report.modelVersion || 'n/a'}</Badge>
            <Badge variant="secondary">Source: {report.source || 'n/a'}</Badge>
            <Badge variant="secondary">Similarity: {Math.round(report.similarityScore)}%</Badge>
            <Badge variant="outline">Created: {formatDate(report.createdAt)}</Badge>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-3">
        <ListSection title="Strengths" items={report.strengths} />
        <ListSection title="Skill Gaps" items={report.skillGaps} />
        <ListSection title="Recommendations" items={report.recommendations} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Market Insights</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p>
              <span className="font-medium">Trend:</span> {report.marketInsights.trend || 'n/a'}
            </p>
            <p>
              <span className="font-medium">Demand Level:</span> {report.marketInsights.demandLevel || 'n/a'}
            </p>
            <div>
              <p className="font-medium">Top Skills to Prioritize</p>
              {report.marketInsights.topSkillsToPrioritize.length === 0 ? (
                <p className="text-muted-foreground">No skill priorities provided.</p>
              ) : (
                <ul className="mt-2 list-disc space-y-1 pl-5">
                  {report.marketInsights.topSkillsToPrioritize.map((skill) => (
                    <li key={`market-skill-${skill}`}>{skill}</li>
                  ))}
                </ul>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Metadata</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3 text-sm">
            <p>
              <span className="font-medium">GitHub Score:</span>{' '}
              {report.metadata.githubScore ?? 'n/a'}
            </p>
            <p>
              <span className="font-medium">Quiz Score:</span> {report.metadata.quizScore ?? 'n/a'}
            </p>
            <p>
              <span className="font-medium">Experience Years:</span>{' '}
              {report.metadata.experienceYears ?? 'n/a'}
            </p>
            <p>
              <span className="font-medium">Entity Count:</span> {report.metadata.entityCount ?? 'n/a'}
            </p>
            <div className="col-span-2">
              <p className="font-medium">Matched Skills</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {report.matchedSkills.length === 0 ? (
                  <span className="text-muted-foreground">No matched skills found.</span>
                ) : (
                  report.matchedSkills.map((skill) => (
                    <Badge key={`matched-${skill}`} variant="outline">
                      {skill}
                    </Badge>
                  ))
                )}
              </div>
            </div>
            <div className="col-span-2">
              <p className="font-medium">Extracted Skills</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {report.extractedSkills.length === 0 ? (
                  <span className="text-muted-foreground">No extracted skills found.</span>
                ) : (
                  report.extractedSkills.map((skill) => (
                    <Badge key={`extracted-${skill}`} variant="secondary">
                      {skill}
                    </Badge>
                  ))
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
