import { ChevronDown } from 'lucide-react';
import { forwardRef, type SelectHTMLAttributes } from 'react';

import { cn } from '@/lib/utils';

import { useFieldContext } from './Field';
import { controlClasses } from './Input';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  options: SelectOption[];
  invalid?: boolean;
  placeholder?: string;
  selectSize?: 'sm' | 'md';
}

/** Native select: reliable keyboard support and correct mobile behaviour. */
export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { options, className, invalid, placeholder, selectSize = 'md', ...rest },
  ref,
) {
  const field = useFieldContext();
  const isInvalid = invalid ?? field?.invalid ?? false;

  return (
    <div className="relative">
      <select
        ref={ref}
        id={rest.id ?? field?.id}
        aria-invalid={isInvalid || undefined}
        aria-describedby={rest['aria-describedby'] ?? field?.describedBy}
        className={cn(
          controlClasses,
          'cursor-pointer appearance-none pr-9',
          selectSize === 'sm' ? 'h-8 pl-2.5 text-sm' : 'h-9.5 pl-3 text-sm',
          isInvalid ? 'border-danger' : 'border-border hover:border-border-strong',
          className,
        )}
        {...rest}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value} disabled={option.disabled}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown
        aria-hidden="true"
        className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
      />
    </div>
  );
});
