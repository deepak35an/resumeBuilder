import { Check, Loader2 } from 'lucide-react';

import { clamp, cn } from '@/lib/utils';

export interface ProgressProps {
  value: number;
  label: string;
  showValue?: boolean;
  tone?: 'accent' | 'success' | 'warning' | 'foreground';
  size?: 'sm' | 'md';
  className?: string;
}

const tones = {
  accent: 'bg-accent',
  success: 'bg-success',
  warning: 'bg-warning',
  foreground: 'bg-foreground',
};

export function Progress({
  value,
  label,
  showValue,
  tone = 'accent',
  size = 'sm',
  className,
}: ProgressProps) {
  const percent = clamp(Math.round(value), 0, 100);
  return (
    <div className={className}>
      {showValue && (
        <div className="mb-1.5 flex items-baseline justify-between gap-2">
          <span className="text-xs text-muted-foreground">{label}</span>
          <span className="font-mono text-xs tabular-nums text-foreground">{percent}%</span>
        </div>
      )}
      <div
        role="progressbar"
        aria-label={label}
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
        className={cn('overflow-hidden rounded-full bg-muted', size === 'sm' ? 'h-1.5' : 'h-2.5')}
      >
        <div
          className={cn('h-full rounded-full transition-[width] duration-slow ease-out', tones[tone])}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

export type StepState = 'pending' | 'active' | 'done';

export interface ProgressStep {
  id: string;
  label: string;
  state: StepState;
}

/** Checklist used by the export flow so generation feels deliberate. */
export function StepList({ steps, className }: { steps: ProgressStep[]; className?: string }) {
  return (
    <ol className={cn('space-y-2.5', className)}>
      {steps.map((step) => (
        <li key={step.id} className="flex items-center gap-2.5 text-sm">
          <span
            aria-hidden="true"
            className={cn(
              'flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-colors duration-base',
              step.state === 'done' && 'border-success bg-success text-white',
              step.state === 'active' && 'border-accent text-accent',
              step.state === 'pending' && 'border-border text-muted-foreground',
            )}
          >
            {step.state === 'done' && <Check className="h-3 w-3" strokeWidth={3} />}
            {step.state === 'active' && <Loader2 className="h-3 w-3 animate-spin" />}
          </span>
          <span
            className={cn(
              step.state === 'pending' ? 'text-muted-foreground' : 'text-foreground',
              step.state === 'done' && 'text-muted-foreground',
            )}
          >
            {step.label}
          </span>
        </li>
      ))}
    </ol>
  );
}

export function Spinner({ className, label = 'Loading' }: { className?: string; label?: string }) {
  return (
    <span role="status" aria-label={label}>
      <Loader2 className={cn('h-4 w-4 animate-spin text-muted-foreground', className)} />
    </span>
  );
}
