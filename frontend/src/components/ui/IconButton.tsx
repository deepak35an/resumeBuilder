import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';

import { cn } from '@/lib/utils';

type Size = 'xs' | 'sm' | 'md';
type Variant = 'ghost' | 'outline' | 'subtle' | 'danger';

const sizes: Record<Size, string> = {
  xs: 'h-6 w-6 rounded-md [&_svg]:h-3.5 [&_svg]:w-3.5',
  sm: 'h-8 w-8 rounded-md [&_svg]:h-4 [&_svg]:w-4',
  md: 'h-9.5 w-9.5 rounded-lg [&_svg]:h-4.5 [&_svg]:w-4.5',
};

const variants: Record<Variant, string> = {
  ghost: 'text-muted-foreground hover:bg-muted hover:text-foreground',
  outline: 'border border-border text-foreground hover:bg-muted',
  subtle: 'bg-muted text-foreground hover:bg-surface-sunken',
  danger: 'text-danger hover:bg-danger-subtle',
};

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Required: icon-only controls must expose an accessible name. */
  label: string;
  icon: ReactNode;
  size?: Size;
  variant?: Variant;
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  { label, icon, size = 'sm', variant = 'ghost', className, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type={rest.type ?? 'button'}
      aria-label={label}
      title={label}
      className={cn(
        'inline-flex shrink-0 items-center justify-center transition-colors duration-fast',
        'disabled:pointer-events-none disabled:opacity-40',
        sizes[size],
        variants[variant],
        className,
      )}
      {...rest}
    >
      {icon}
    </button>
  );
});
