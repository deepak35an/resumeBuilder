import { AlertTriangle, CheckCircle2, Info } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import {
  Alert,
  Badge,
  Card,
  KeywordChip,
  ScoreMeter,
  ScoreRing,
  SectionHeading,
} from '@/components/ui';
import { cn } from '@/lib/utils';
import type { ATSIssue, ATSReport, IssueSeverity, KeywordMatch } from '@/types/api';

const severityTone: Record<IssueSeverity, 'danger' | 'warning' | 'accent' | 'neutral'> = {
  critical: 'danger',
  high: 'warning',
  medium: 'accent',
  low: 'neutral',
};

function IssueRow({ issue }: { issue: ATSIssue }) {
  const Icon =
    issue.status === 'good' ? CheckCircle2 : issue.status === 'critical' ? AlertTriangle : Info;

  return (
    <li className="rounded-lg border border-border bg-surface px-3 py-3">
      <div className="flex items-start gap-2.5">
        <Icon
          aria-hidden="true"
          className={cn(
            'mt-0.5 h-4 w-4 shrink-0',
            issue.status === 'good'
              ? 'text-success'
              : issue.status === 'critical'
                ? 'text-danger'
                : 'text-warning',
          )}
        />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-medium text-foreground">{issue.title}</p>
            <Badge tone={severityTone[issue.severity]} size="xs" uppercase>
              {issue.severity}
            </Badge>
          </div>
          <p className="mt-1 text-sm text-muted-foreground text-pretty">{issue.detail}</p>
          {issue.why && <p className="mt-1 text-xs text-muted-foreground">{issue.why}</p>}
          {issue.action && (
            <p className="mt-2 text-xs font-medium text-foreground">{issue.action.label}</p>
          )}
        </div>
      </div>
    </li>
  );
}

function KeywordList({
  title,
  terms,
  state,
}: {
  title: string;
  terms: KeywordMatch[];
  state: 'matched' | 'missing' | 'related';
}) {
  if (terms.length === 0) return null;
  return (
    <div>
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {terms.map((term) => (
          <KeywordChip
            key={`${state}-${term.term}`}
            term={term.term}
            state={state}
            count={term.resumeCount}
            title={term.locations.join(', ') || undefined}
          />
        ))}
      </div>
    </div>
  );
}

export function AtsReportView({
  report,
  className,
}: {
  report: ATSReport;
  className?: string;
}) {
  const { t } = useTranslation();
  const issues = report.issues.filter((issue) => issue.status !== 'good');
  const strengths = report.strengths.length > 0 ? report.strengths : report.issues.filter((i) => i.status === 'good');

  return (
    <div className={cn('space-y-8', className)}>
      <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
        <ScoreRing
          score={report.matchScore ?? report.overallScore}
          size="lg"
          label={report.matchScore != null ? 'Match score' : t('ats.score')}
          caption={report.bandLabel}
        />
        <div className="min-w-0 flex-1">
          <p className="text-lg font-semibold text-foreground text-pretty">{report.headline}</p>
          <p className="mt-2 text-sm text-muted-foreground">
            {report.wordCount} words · about {report.estimatedPages} page
            {report.estimatedPages === 1 ? '' : 's'}
          </p>
          {report.breakdown.length > 0 && (
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {report.breakdown.map((entry) => (
                <ScoreMeter
                  key={entry.key}
                  label={entry.label}
                  score={entry.score}
                  explanation={entry.explanation}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <Alert tone="neutral">{report.disclaimer || t('ats.disclaimer')}</Alert>

      {issues.length > 0 && (
        <section>
          <SectionHeading title={t('ats.criticalIssues')} description="Fix these first — they are the most likely to hurt parsing or ranking." />
          <ul className="mt-4 space-y-2">
            {issues.map((issue) => (
              <IssueRow key={issue.id} issue={issue} />
            ))}
          </ul>
        </section>
      )}

      {strengths.length > 0 && (
        <section>
          <SectionHeading title={t('ats.strengths')} />
          <ul className="mt-4 space-y-2">
            {strengths.map((issue) => (
              <IssueRow key={issue.id} issue={issue} />
            ))}
          </ul>
        </section>
      )}

      <section className="grid gap-6 lg:grid-cols-2">
        <KeywordList title={t('ats.matchedKeywords')} terms={report.matchedKeywords} state="matched" />
        <KeywordList title={t('ats.missingKeywords')} terms={report.missingKeywords} state="missing" />
      </section>

      {report.relatedKeywords.length > 0 && (
        <KeywordList title="Related terms" terms={report.relatedKeywords} state="related" />
      )}

      {report.recommendations.length > 0 && (
        <section>
          <SectionHeading title={t('ats.recommendations')} />
          <ul className="mt-4 space-y-3">
            {report.recommendations.map((item) => (
              <li key={item.id} className="rounded-lg border border-border px-3 py-3">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-medium text-foreground">{item.title}</p>
                  <Badge tone={severityTone[item.priority]} size="xs" uppercase>
                    {item.priority}
                  </Badge>
                </div>
                <p className="mt-1 text-sm text-muted-foreground text-pretty">{item.detail}</p>
              </li>
            ))}
          </ul>
        </section>
      )}

      {report.sections.length > 0 && (
        <section>
          <SectionHeading title={t('ats.sectionAnalysis')} />
          <ul className="mt-4 grid gap-2 sm:grid-cols-2">
            {report.sections.map((section) => (
              <li key={section.key}>
                <Card padded={false} className="px-3 py-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium text-foreground">{section.label}</p>
                    <Badge
                      size="xs"
                      tone={
                        section.status === 'good'
                          ? 'success'
                          : section.status === 'critical'
                            ? 'danger'
                            : 'warning'
                      }
                    >
                      {section.present ? section.status : 'missing'}
                    </Badge>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{section.detail}</p>
                </Card>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
