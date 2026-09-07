import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

export type BadgeTone =
  | 'neutral'
  | 'accent'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'outline'
  | 'pro';

const tones: Record<BadgeTone, string> = {
  neutral: 'bg-muted text-muted-foreground',
  accent: 'bg-accent-subtle text-accent-strong',
  success: 'bg-success-subtle text-success-foreground',
  warning: 'bg-warning-subtle text-warning-foreground',
  danger: 'bg-danger-subtle text-danger-foreground',
  info: 'bg-info-subtle text-info-foreground',
  outline: 'border border-border text-muted-foreground',
  pro: 'bg-primary text-primary-foreground',
};

export interface BadgeProps {
  children: ReactNode;
  tone?: BadgeTone;
  size?: 'xs' | 'sm';
  icon?: ReactNode;
  className?: string;
  uppercase?: boolean;
}

export function Badge({
  children,
  tone = 'neutral',
  size = 'sm',
  icon,
  className,
  uppercase,
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full font-medium',
        size === 'xs' ? 'px-1.5 py-0.5 text-2xs' : 'px-2 py-0.5 text-xs',
        uppercase && 'tracking-wide uppercase',
        tones[tone],
        className,
      )}
    >
      {icon && (
        <span aria-hidden="true" className="[&_svg]:h-3 [&_svg]:w-3">
          {icon}
        </span>
      )}
      {children}
    </span>
  );
}
