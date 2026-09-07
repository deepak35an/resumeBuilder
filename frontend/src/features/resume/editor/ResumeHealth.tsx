/** Resume Health: completeness plus the next concrete thing to fix. */

import { Check, ChevronRight } from 'lucide-react';

import { Badge, Progress } from '@/components/ui';
import { healthChecks } from '@/features/resume/health';
import { cn } from '@/lib/utils';
import { useResumeEditor } from '@/store/resumeEditor';
import type { SectionType } from '@/types/resume';

export function ResumeHealth({ onJumpToSection }: { onJumpToSection?: (type: SectionType) => void }) {
  const data = useResumeEditor((state) => state.doc?.data);
  const score = useResumeEditor((state) => state.completeness());

  if (!data) return null;

  const checks = healthChecks(data);
  const outstanding = checks.filter((check) => !check.done);
  const done = checks.length - outstanding.length;

  return (
    <section aria-labelledby="resume-health-heading" className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <h2 id="resume-health-heading" className="text-sm font-semibold text-foreground">
          Resume health
        </h2>
        <Badge tone={score >= 80 ? 'success' : score >= 55 ? 'accent' : 'warning'} size="xs">
          {score}% complete
        </Badge>
      </div>

      <Progress
        value={score}
        label="Resume completeness"
        tone={score >= 80 ? 'success' : 'accent'}
        size="sm"
      />

      <p className="text-xs text-muted-foreground">
        {done} of {checks.length} checks passing. This is a content check, not an ATS score - run
        the ATS checker for that.
      </p>

      {outstanding.length === 0 ? (
        <p className="flex items-center gap-1.5 text-xs text-success-foreground">
          <Check aria-hidden="true" className="h-3.5 w-3.5" />
          Everything on the checklist is done. Time to run an ATS check.
        </p>
      ) : (
        <ul className="space-y-1">
          {outstanding.slice(0, 5).map((check) => (
            <li key={check.id}>
              <button
                type="button"
                disabled={!check.sectionType || !onJumpToSection}
                onClick={() => check.sectionType && onJumpToSection?.(check.sectionType)}
                className={cn(
                  'flex w-full items-center gap-2 rounded-md px-1.5 py-1 text-left text-xs transition-colors',
                  check.sectionType && onJumpToSection
                    ? 'text-foreground hover:bg-muted'
                    : 'cursor-default text-muted-foreground',
                )}
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    'h-1.5 w-1.5 shrink-0 rounded-full',
                    check.weight === 'critical'
                      ? 'bg-danger'
                      : check.weight === 'important'
                        ? 'bg-warning'
                        : 'bg-border-strong',
                  )}
                />
                <span className="flex-1">{check.label}</span>
                {check.sectionType && onJumpToSection && (
                  <ChevronRight aria-hidden="true" className="h-3.5 w-3.5 text-muted-foreground" />
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
