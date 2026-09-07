import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';

import { cn } from '@/lib/utils';

import { useFieldContext } from './Field';

export const controlClasses =
  'w-full rounded-lg border bg-surface text-foreground shadow-xs transition-colors duration-fast ' +
  'placeholder:text-muted-foreground/70 disabled:cursor-not-allowed disabled:bg-muted disabled:opacity-70 ' +
  'focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
  leadingIcon?: ReactNode;
  trailingSlot?: ReactNode;
  inputSize?: 'sm' | 'md';
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, invalid, leadingIcon, trailingSlot, inputSize = 'md', ...rest },
  ref,
) {
  const field = useFieldContext();
  const isInvalid = invalid ?? field?.invalid ?? false;

  const control = (
    <input
      ref={ref}
      id={rest.id ?? field?.id}
      aria-invalid={isInvalid || undefined}
      aria-describedby={rest['aria-describedby'] ?? field?.describedBy}
      className={cn(
        controlClasses,
        inputSize === 'sm' ? 'h-8 px-2.5 text-sm' : 'h-9.5 px-3 text-sm',
        isInvalid ? 'border-danger' : 'border-border hover:border-border-strong',
        leadingIcon && 'pl-9',
        trailingSlot && 'pr-9',
        className,
      )}
      {...rest}
    />
  );

  if (!leadingIcon && !trailingSlot) return control;

  return (
    <div className="relative">
      {leadingIcon && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground [&_svg]:h-4 [&_svg]:w-4"
        >
          {leadingIcon}
        </span>
      )}
      {control}
      {trailingSlot && (
        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground">
          {trailingSlot}
        </span>
      )}
    </div>
  );
});
