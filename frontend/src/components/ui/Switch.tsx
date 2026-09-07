import { cn } from '@/lib/utils';

export interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  /** Hide the visible label but keep it as the accessible name. */
  hideLabel?: boolean;
  description?: string;
  disabled?: boolean;
  size?: 'sm' | 'md';
  className?: string;
}

export function Switch({
  checked,
  onChange,
  label,
  hideLabel,
  description,
  disabled,
  size = 'md',
  className,
}: SwitchProps) {
  const track = size === 'sm' ? 'h-4 w-7' : 'h-5 w-9';
  const knob = size === 'sm' ? 'h-3 w-3' : 'h-4 w-4';
  const travel = size === 'sm' ? 'translate-x-3' : 'translate-x-4';

  return (
    <div className={cn('flex items-center justify-between gap-3', className)}>
      {!hideLabel && (
        <span className="min-w-0">
          <span className="block text-sm text-foreground">{label}</span>
          {description && <span className="block text-xs text-muted-foreground">{description}</span>}
        </span>
      )}
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={hideLabel ? label : undefined}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative inline-flex shrink-0 items-center rounded-full border border-transparent transition-colors duration-base',
          track,
          checked ? 'bg-accent' : 'bg-border-strong',
          disabled && 'cursor-not-allowed opacity-50',
        )}
      >
        <span
          className={cn(
            'ml-0.5 inline-block rounded-full bg-white shadow-xs transition-transform duration-base ease-spring',
            knob,
            checked && travel,
          )}
        />
      </button>
    </div>
  );
}
