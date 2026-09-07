import { Check, Plus, X } from 'lucide-react';

import { cn } from '@/lib/utils';

export type KeywordState = 'matched' | 'missing' | 'related' | 'neutral';

const states: Record<KeywordState, string> = {
  matched: 'border-success/30 bg-success-subtle text-success-foreground',
  missing: 'border-warning/30 bg-warning-subtle text-warning-foreground',
  related: 'border-info/30 bg-info-subtle text-info-foreground',
  neutral: 'border-border bg-muted text-muted-foreground',
};

const icons: Record<KeywordState, typeof Check | null> = {
  matched: Check,
  missing: X,
  related: Plus,
  neutral: null,
};

export interface KeywordChipProps {
  term: string;
  state?: KeywordState;
  /** How many times the term appears, shown when greater than one. */
  count?: number;
  onAdd?: () => void;
  addLabel?: string;
  className?: string;
  title?: string;
}

export function KeywordChip({
  term,
  state = 'neutral',
  count,
  onAdd,
  addLabel = 'Add to skills',
  className,
  title,
}: KeywordChipProps) {
  const Icon = icons[state];

  return (
    <span
      title={title}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-xs font-medium',
        states[state],
        className,
      )}
    >
      {Icon && <Icon aria-hidden="true" className="h-3 w-3" />}
      <span>{term}</span>
      {count !== undefined && count > 1 && (
        <span className="font-mono text-2xs opacity-70">×{count}</span>
      )}
      {onAdd && (
        <button
          type="button"
          onClick={onAdd}
          aria-label={`${addLabel}: ${term}`}
          className="-mr-0.5 ml-0.5 rounded p-0.5 transition-colors hover:bg-surface/60"
        >
          <Plus aria-hidden="true" className="h-3 w-3" />
        </button>
      )}
    </span>
  );
}
