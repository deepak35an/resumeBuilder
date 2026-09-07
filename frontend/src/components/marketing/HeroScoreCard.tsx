import { ArrowUpRight, Sparkles } from 'lucide-react';

import { ScoreMeter, ScoreRing } from '@/components/ui';
import { cn } from '@/lib/utils';

const breakdown = [
  { label: 'Keywords', score: 94 },
  { label: 'Formatting', score: 98 },
  { label: 'Content', score: 87 },
  { label: 'Experience', score: 91 },
];

/**
 * Hero visual. Shows the product's actual output rather than a stock
 * illustration, using the same score components the real report uses.
 * The numbers are clearly labelled as an example.
 */
export function HeroScoreCard({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'w-full max-w-sm rounded-2xl border border-border bg-surface p-5 shadow-lg',
        className,
      )}
    >
      <div className="flex items-center justify-between">
        <p className="text-2xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          ATS report · example
        </p>
        <span className="inline-flex items-center gap-1 rounded-full bg-success-subtle px-2 py-0.5 text-2xs font-medium text-success-foreground">
          <ArrowUpRight aria-hidden="true" className="h-3 w-3" />
          +7 this week
        </span>
      </div>

      <div className="mt-4 flex items-center gap-5">
        <ScoreRing score={92} size="md" caption="Excellent" />
        <div className="min-w-0">
          <p className="text-sm font-medium text-foreground">Strong on formatting</p>
          <p className="mt-1 text-xs text-muted-foreground text-pretty">
            Standard headings, one column and extractable contact details.
          </p>
        </div>
      </div>

      <div className="mt-5 space-y-3 border-t border-border pt-4">
        {breakdown.map((entry) => (
          <ScoreMeter key={entry.label} label={entry.label} score={entry.score} />
        ))}
      </div>

      <div className="mt-4 flex items-start gap-2 rounded-lg bg-accent-subtle p-2.5">
        <Sparkles aria-hidden="true" className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent" />
        <p className="text-xs text-accent-strong text-pretty">
          Add <span className="font-medium">Kubernetes</span> to your skills if you have used it -
          it appears three times in the job description.
        </p>
      </div>
    </div>
  );
}
