import { useEffect, useState } from 'react';

import { usePrefersReducedMotion } from '@/hooks/useUiPrimitives';
import { clamp, cn } from '@/lib/utils';

export type ScoreBand = 'excellent' | 'good' | 'needs-improvement' | 'needs-major-improvement';

export function bandForScore(score: number): ScoreBand {
  if (score >= 90) return 'excellent';
  if (score >= 75) return 'good';
  if (score >= 60) return 'needs-improvement';
  return 'needs-major-improvement';
}

export const BAND_LABELS: Record<ScoreBand, string> = {
  excellent: 'Excellent',
  good: 'Good',
  'needs-improvement': 'Needs improvement',
  'needs-major-improvement': 'Needs major improvement',
};

const bandColor: Record<ScoreBand, string> = {
  excellent: 'var(--color-success)',
  good: 'var(--color-accent)',
  'needs-improvement': 'var(--color-warning)',
  'needs-major-improvement': 'var(--color-danger)',
};

const sizes = {
  sm: { box: 64, stroke: 5, value: 'text-lg', label: 'text-2xs' },
  md: { box: 104, stroke: 7, value: 'text-3xl', label: 'text-2xs' },
  lg: { box: 168, stroke: 10, value: 'text-5xl', label: 'text-xs' },
};

export interface ScoreRingProps {
  score: number;
  size?: keyof typeof sizes;
  label?: string;
  /** Shown under the number, e.g. "Excellent". Defaults to the band label. */
  caption?: string;
  className?: string;
  /** Animate from the previous value when the score changes. */
  animate?: boolean;
  showBandCaption?: boolean;
}

/**
 * The product's signature score visualisation: a progress arc rather than a bar,
 * animating between values so improvements feel earned.
 */
export function ScoreRing({
  score,
  size = 'md',
  label = 'ATS score',
  caption,
  className,
  animate = true,
  showBandCaption = true,
}: ScoreRingProps) {
  const reduceMotion = usePrefersReducedMotion();
  const target = clamp(Math.round(score), 0, 100);
  const [displayed, setDisplayed] = useState(animate && !reduceMotion ? 0 : target);

  useEffect(() => {
    if (!animate || reduceMotion) {
      setDisplayed(target);
      return;
    }
    let frame = 0;
    const start = performance.now();
    const from = displayed;
    const duration = 700;

    const step = (now: number) => {
      const progress = Math.min(1, (now - start) / duration);
      // Ease-out cubic keeps the count-up quick then settled.
      const eased = 1 - (1 - progress) ** 3;
      setDisplayed(Math.round(from + (target - from) * eased));
      if (progress < 1) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, animate, reduceMotion]);

  const { box, stroke, value, label: labelSize } = sizes[size];
  const radius = (box - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const band = bandForScore(target);
  const dash = (displayed / 100) * circumference;

  return (
    <div
      className={cn('relative inline-flex shrink-0 items-center justify-center', className)}
      role="img"
      aria-label={`${label}: ${target} out of 100. ${caption ?? BAND_LABELS[band]}.`}
    >
      <svg width={box} height={box} viewBox={`0 0 ${box} ${box}`} aria-hidden="true">
        <circle
          cx={box / 2}
          cy={box / 2}
          r={radius}
          fill="none"
          stroke="var(--color-border)"
          strokeWidth={stroke}
        />
        <circle
          cx={box / 2}
          cy={box / 2}
          r={radius}
          fill="none"
          stroke={bandColor[band]}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circumference}`}
          transform={`rotate(-90 ${box / 2} ${box / 2})`}
          style={{ transition: reduceMotion ? 'none' : 'stroke 240ms var(--ease-out)' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={cn('font-semibold leading-none tracking-tight text-foreground', value)}>
          {displayed}
        </span>
        {showBandCaption && (
          <span
            className={cn(
              'mt-1 font-medium uppercase tracking-wide text-muted-foreground',
              labelSize,
            )}
          >
            {caption ?? BAND_LABELS[band]}
          </span>
        )}
      </div>
    </div>
  );
}

/** Compact horizontal meter used for sub-scores inside reports. */
export function ScoreMeter({
  label,
  score,
  explanation,
  className,
}: {
  label: string;
  score: number;
  explanation?: string;
  className?: string;
}) {
  const band = bandForScore(score);
  return (
    <div className={cn('space-y-1.5', className)}>
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-sm text-foreground">{label}</span>
        <span className="font-mono text-sm font-medium tabular-nums text-foreground">{score}</span>
      </div>
      <div
        className="h-1.5 overflow-hidden rounded-full bg-muted"
        role="meter"
        aria-valuenow={score}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label}
      >
        <div
          className="h-full rounded-full transition-[width] duration-slow ease-out"
          style={{ width: `${clamp(score, 0, 100)}%`, background: bandColor[band] }}
        />
      </div>
      {explanation && <p className="text-xs text-muted-foreground text-pretty">{explanation}</p>}
    </div>
  );
}
