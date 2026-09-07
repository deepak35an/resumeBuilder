import type { HTMLAttributes, ReactNode } from 'react';

import { cn } from '@/lib/utils';

export interface CardProps extends HTMLAttributes<HTMLElement> {
  /** Subtle lift on hover - used for interactive cards only. */
  interactive?: boolean;
  padded?: boolean;
  as?: 'div' | 'article' | 'section' | 'li';
}

export function Card({
  className,
  interactive,
  padded = true,
  as: Tag = 'div',
  children,
  ...rest
}: CardProps) {
  return (
    <Tag
      className={cn(
        'surface-card',
        padded && 'p-5',
        interactive &&
          'transition-[border-color,box-shadow,transform] duration-base ease-out hover:border-border-strong hover:shadow-md',
        className,
      )}
      {...rest}
    >
      {children}
    </Tag>
  );
}

export function CardHeader({
  title,
  description,
  action,
  className,
  icon,
}: {
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
  icon?: ReactNode;
}) {
  return (
    <div className={cn('flex items-start justify-between gap-4', className)}>
      <div className="flex min-w-0 items-start gap-3">
        {icon && (
          <span
            aria-hidden="true"
            className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground [&_svg]:h-4 [&_svg]:w-4"
          >
            {icon}
          </span>
        )}
        <div className="min-w-0">
          <h3 className="truncate text-sm font-semibold text-foreground">{title}</h3>
          {description && (
            <p className="mt-0.5 text-sm text-muted-foreground text-pretty">{description}</p>
          )}
        </div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

/** Section heading used on dashboards and report pages. */
export function SectionHeading({
  title,
  description,
  action,
  id,
  className,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  id?: string;
  className?: string;
}) {
  return (
    <div className={cn('flex items-end justify-between gap-4', className)}>
      <div>
        <h2 id={id} className="text-lg font-semibold tracking-tight text-foreground">
          {title}
        </h2>
        {description && (
          <p className="mt-1 max-w-prose text-sm text-muted-foreground text-pretty">
            {description}
          </p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
