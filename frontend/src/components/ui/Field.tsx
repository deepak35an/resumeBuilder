import { createContext, useContext, useId, type ReactNode } from 'react';

import { cn } from '@/lib/utils';

interface FieldContextValue {
  id: string;
  describedBy: string | undefined;
  invalid: boolean;
}

const FieldContext = createContext<FieldContextValue | null>(null);

export function useFieldContext(): FieldContextValue | null {
  return useContext(FieldContext);
}

export interface FieldProps {
  label?: string;
  hint?: string;
  /** Rendered as an `aria-describedby` live region so screen readers announce it. */
  error?: string;
  optional?: boolean;
  className?: string;
  children: ReactNode;
  /** Trailing control rendered on the label row, e.g. a character counter. */
  action?: ReactNode;
}

/**
 * Accessible form field wrapper: associates the label, hint and error text with
 * the control and announces validation messages.
 */
export function Field({
  label,
  hint,
  error,
  optional,
  className,
  action,
  children,
}: FieldProps) {
  const id = useId();
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [errorId, hintId].filter(Boolean).join(' ') || undefined;

  return (
    <FieldContext.Provider value={{ id, describedBy, invalid: Boolean(error) }}>
      <div className={cn('space-y-1.5', className)}>
        {(label || action) && (
          <div className="flex items-baseline justify-between gap-3">
            {label && (
              <label htmlFor={id} className="text-sm font-medium text-foreground">
                {label}
                {optional && (
                  <span className="ml-1.5 text-xs font-normal text-muted-foreground">
                    Optional
                  </span>
                )}
              </label>
            )}
            {action}
          </div>
        )}
        {children}
        {error ? (
          <p id={errorId} role="alert" className="text-xs text-danger">
            {error}
          </p>
        ) : (
          hint && (
            <p id={hintId} className="text-xs text-muted-foreground">
              {hint}
            </p>
          )
        )}
      </div>
    </FieldContext.Provider>
  );
}
