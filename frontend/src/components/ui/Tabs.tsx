import { useId, type ReactNode } from 'react';

import { cn } from '@/lib/utils';

export interface TabItem<T extends string = string> {
  value: T;
  label: string;
  icon?: ReactNode;
  count?: number;
  disabled?: boolean;
}

export interface TabsProps<T extends string = string> {
  items: TabItem<T>[];
  value: T;
  onChange: (value: T) => void;
  variant?: 'underline' | 'pill';
  className?: string;
  label: string;
}

export function Tabs<T extends string = string>({
  items,
  value,
  onChange,
  variant = 'underline',
  className,
  label,
}: TabsProps<T>) {
  const id = useId();

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
    event.preventDefault();
    const enabled = items.filter((item) => !item.disabled);
    const current = enabled.findIndex((item) => item.value === value);
    const direction = event.key === 'ArrowRight' ? 1 : -1;
    const next = enabled[(current + direction + enabled.length) % enabled.length];
    onChange(next.value);
  };

  return (
    <div
      role="tablist"
      aria-label={label}
      onKeyDown={onKeyDown}
      className={cn(
        'flex items-center gap-1 overflow-x-auto',
        variant === 'underline'
          ? 'border-b border-border'
          : 'rounded-lg border border-border bg-surface-sunken p-1',
        className,
      )}
    >
      {items.map((item) => {
        const active = item.value === value;
        return (
          <button
            key={item.value}
            id={`${id}-${item.value}`}
            role="tab"
            type="button"
            aria-selected={active}
            tabIndex={active ? 0 : -1}
            disabled={item.disabled}
            onClick={() => onChange(item.value)}
            className={cn(
              'inline-flex shrink-0 items-center gap-2 text-sm font-medium transition-colors duration-fast',
              'disabled:cursor-not-allowed disabled:opacity-50',
              variant === 'underline'
                ? cn(
                    '-mb-px border-b-2 px-3 py-2.5',
                    active
                      ? 'border-foreground text-foreground'
                      : 'border-transparent text-muted-foreground hover:text-foreground',
                  )
                : cn(
                    'rounded-md px-3 py-1.5',
                    active
                      ? 'bg-surface text-foreground shadow-xs'
                      : 'text-muted-foreground hover:text-foreground',
                  ),
            )}
          >
            {item.icon && (
              <span aria-hidden="true" className="[&_svg]:h-4 [&_svg]:w-4">
                {item.icon}
              </span>
            )}
            {item.label}
            {item.count !== undefined && (
              <span
                className={cn(
                  'rounded-full px-1.5 py-0.5 text-2xs font-semibold',
                  active ? 'bg-muted text-foreground' : 'bg-muted text-muted-foreground',
                )}
              >
                {item.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

export function TabPanel({
  children,
  className,
  label,
}: {
  children: ReactNode;
  className?: string;
  label?: string;
}) {
  return (
    <div role="tabpanel" aria-label={label} className={className}>
      {children}
    </div>
  );
}
