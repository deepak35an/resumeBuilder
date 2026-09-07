import { Check } from 'lucide-react';
import { forwardRef, useId, type InputHTMLAttributes } from 'react';

import { cn } from '@/lib/utils';

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  description?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  { label, description, className, ...rest },
  ref,
) {
  const generated = useId();
  const id = rest.id ?? generated;

  return (
    <div className={cn('flex items-start gap-2.5', className)}>
      <span className="relative mt-0.5 inline-flex h-4 w-4 shrink-0">
        <input
          ref={ref}
          id={id}
          type="checkbox"
          className="peer h-4 w-4 cursor-pointer appearance-none rounded-[5px] border border-border-strong
            bg-surface transition-colors duration-fast checked:border-accent checked:bg-accent
            focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1
            focus-visible:ring-offset-background disabled:opacity-50"
          {...rest}
        />
        <Check
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 m-auto h-3 w-3 text-accent-foreground opacity-0 peer-checked:opacity-100"
          strokeWidth={3}
        />
      </span>
      {(label || description) && (
        <span className="min-w-0">
          {label && (
            <label htmlFor={id} className="block cursor-pointer text-sm text-foreground">
              {label}
            </label>
          )}
          {description && <p className="text-xs text-muted-foreground">{description}</p>}
        </span>
      )}
    </div>
  );
});
