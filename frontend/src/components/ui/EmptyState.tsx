import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

export interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  /** Say what to do next, never just "No data". */
  description: string;
  action?: ReactNode;
  secondaryAction?: ReactNode;
  className?: string;
  size?: 'sm' | 'md';
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  secondaryAction,
  className,
  size = 'md',
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-xl border border-dashed border-border text-center',
        size === 'sm' ? 'px-5 py-7' : 'px-6 py-12',
        className,
      )}
    >
      {icon && (
        <span
          aria-hidden="true"
          className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-muted text-muted-foreground [&_svg]:h-5 [&_svg]:w-5"
        >
          {icon}
        </span>
      )}
      <h3 className={cn('font-semibold text-foreground', size === 'sm' ? 'text-sm' : 'text-base')}>
        {title}
      </h3>
      <p className="mt-1.5 max-w-sm text-sm text-muted-foreground text-pretty">{description}</p>
      {(action || secondaryAction) && (
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
          {action}
          {secondaryAction}
        </div>
      )}
    </div>
  );
}
