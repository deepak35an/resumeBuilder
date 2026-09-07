import { cn } from '@/lib/utils';

import { useFieldContext } from './Field';
import { controlClasses } from './Input';

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export interface MonthPickerProps {
  /** Partial ISO value: `""`, `"2024"` or `"2024-03"`. */
  value: string;
  onChange: (value: string) => void;
  label: string;
  disabled?: boolean;
  className?: string;
  /** Years offered, counting back from this year. */
  yearsBack?: number;
  yearsForward?: number;
}

/**
 * Month + year selector. Resume dates are stored as partial ISO strings so the
 * display format (Jan 2024, January 2024, 01/2024, 2024) stays a setting.
 */
export function MonthPicker({
  value,
  onChange,
  label,
  disabled,
  className,
  yearsBack = 45,
  yearsForward = 6,
}: MonthPickerProps) {
  const field = useFieldContext();
  const [year = '', month = ''] = value.split('-');
  const currentYear = new Date().getFullYear();
  const years = Array.from(
    { length: yearsBack + yearsForward + 1 },
    (_, index) => currentYear + yearsForward - index,
  );

  const update = (nextMonth: string, nextYear: string) => {
    if (!nextYear) {
      onChange('');
      return;
    }
    onChange(nextMonth ? `${nextYear}-${nextMonth}` : nextYear);
  };

  const selectClass = cn(
    controlClasses,
    'h-9.5 cursor-pointer appearance-none px-2.5 text-sm',
    'border-border hover:border-border-strong',
  );

  return (
    <div className={cn('grid grid-cols-2 gap-2', className)} id={field?.id}>
      <select
        aria-label={`${label} month`}
        value={month}
        disabled={disabled}
        onChange={(event) => update(event.target.value, year)}
        className={selectClass}
      >
        <option value="">Month</option>
        {MONTHS.map((name, index) => (
          <option key={name} value={String(index + 1).padStart(2, '0')}>
            {name}
          </option>
        ))}
      </select>
      <select
        aria-label={`${label} year`}
        value={year}
        disabled={disabled}
        onChange={(event) => update(month, event.target.value)}
        className={selectClass}
      >
        <option value="">Year</option>
        {years.map((option) => (
          <option key={option} value={String(option)}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}
