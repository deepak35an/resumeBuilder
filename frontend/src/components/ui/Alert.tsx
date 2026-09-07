import { AlertTriangle, CheckCircle2, Info, Lock, XCircle } from 'lucide-react';
import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

export type AlertTone = 'info' | 'success' | 'warning' | 'danger' | 'neutral' | 'pro';

const tones: Record<AlertTone, { wrapper: string; icon: ReactNode }> = {
  info: {
    wrapper: 'border-info/25 bg-info-subtle text-info-foreground',
    icon: <Info className="h-4 w-4 text-info" />,
  },
  success: {
    wrapper: 'border-success/25 bg-success-subtle text-success-foreground',
    icon: <CheckCircle2 className="h-4 w-4 text-success" />,
  },
  warning: {
    wrapper: 'border-warning/25 bg-warning-subtle text-warning-foreground',
    icon: <AlertTriangle className="h-4 w-4 text-warning" />,
  },
  danger: {
    wrapper: 'border-danger/25 bg-danger-subtle text-danger-foreground',
    icon: <XCircle className="h-4 w-4 text-danger" />,
  },
  neutral: {
    wrapper: 'border-border bg-surface-sunken text-muted-foreground',
    icon: <Info className="h-4 w-4 text-muted-foreground" />,
  },
  pro: {
    wrapper: 'border-accent/25 bg-accent-subtle text-accent-strong',
    icon: <Lock className="h-4 w-4 text-accent" />,
  },
};

export interface AlertProps {
  tone?: AlertTone;
  title?: string;
  children?: ReactNode;
  action?: ReactNode;
  className?: string;
  /** Errors and warnings are announced; informational notes are not. */
  assertive?: boolean;
  icon?: ReactNode;
}

export function Alert({
  tone = 'info',
  title,
  children,
  action,
  className,
  assertive,
  icon,
}: AlertProps) {
  const config = tones[tone];
  return (
    <div
      role={assertive ? 'alert' : undefined}
      className={cn(
        'flex items-start gap-3 rounded-lg border px-3.5 py-3 text-sm',
        config.wrapper,
        className,
      )}
    >
      <span aria-hidden="true" className="mt-0.5 shrink-0">
        {icon ?? config.icon}
      </span>
      <div className="min-w-0 flex-1">
        {title && <p className="font-medium">{title}</p>}
        {children && <div className={cn('text-pretty', title && 'mt-0.5 opacity-90')}>{children}</div>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
