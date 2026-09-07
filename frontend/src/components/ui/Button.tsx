import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { Link, type LinkProps } from 'react-router-dom';

import { cn } from '@/lib/utils';

export type ButtonVariant =
  | 'primary'
  | 'accent'
  | 'secondary'
  | 'outline'
  | 'ghost'
  | 'subtle'
  | 'danger';
export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg';

const base =
  'relative inline-flex select-none items-center justify-center gap-2 whitespace-nowrap font-medium ' +
  'transition-[background-color,border-color,color,box-shadow,transform] duration-base ease-out ' +
  'disabled:pointer-events-none disabled:opacity-50 active:translate-y-px';

const variants: Record<ButtonVariant, string> = {
  primary: 'bg-primary text-primary-foreground hover:bg-primary-hover shadow-xs',
  accent: 'bg-accent text-accent-foreground hover:bg-accent-strong shadow-xs',
  secondary: 'bg-surface text-foreground border border-border hover:bg-muted shadow-xs',
  outline: 'border border-border-strong text-foreground hover:bg-muted',
  ghost: 'text-muted-foreground hover:bg-muted hover:text-foreground',
  subtle: 'bg-muted text-foreground hover:bg-surface-sunken',
  danger: 'bg-danger text-white hover:brightness-95 shadow-xs',
};

const sizes: Record<ButtonSize, string> = {
  xs: 'h-7 rounded-md px-2 text-xs',
  sm: 'h-8 rounded-md px-3 text-sm',
  md: 'h-9.5 rounded-lg px-4 text-sm',
  lg: 'h-11 rounded-lg px-5 text-base',
};

interface CommonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
}

function content({
  loading,
  leadingIcon,
  trailingIcon,
  children,
}: CommonProps & { children?: ReactNode }): ReactNode {
  return (
    <>
      {loading ? (
        <span
          aria-hidden="true"
          className="h-3.5 w-3.5 shrink-0 animate-spin rounded-full border-[1.5px] border-current border-t-transparent"
        />
      ) : (
        leadingIcon
      )}
      {children}
      {trailingIcon}
    </>
  );
}

function classes(props: CommonProps, className?: string): string {
  return cn(
    base,
    variants[props.variant ?? 'primary'],
    sizes[props.size ?? 'md'],
    props.fullWidth && 'w-full',
    className,
  );
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, CommonProps {}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant, size, loading, fullWidth, leadingIcon, trailingIcon, children, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type={rest.type ?? 'button'}
      aria-busy={loading || undefined}
      disabled={rest.disabled || loading}
      className={classes({ variant, size, fullWidth }, className)}
      {...rest}
    >
      {content({ loading, leadingIcon, trailingIcon, children })}
    </button>
  );
});

export interface ButtonLinkProps extends LinkProps, CommonProps {}

/** Same visual language as `Button`, but renders a router link. */
export const ButtonLink = forwardRef<HTMLAnchorElement, ButtonLinkProps>(function ButtonLink(
  { className, variant, size, fullWidth, leadingIcon, trailingIcon, children, ...rest },
  ref,
) {
  return (
    <Link ref={ref} className={classes({ variant, size, fullWidth }, className)} {...rest}>
      {content({ leadingIcon, trailingIcon, children })}
    </Link>
  );
});

export interface ExternalButtonLinkProps
  extends React.AnchorHTMLAttributes<HTMLAnchorElement>,
    CommonProps {}

export function ExternalButtonLink({
  className,
  variant,
  size,
  fullWidth,
  leadingIcon,
  trailingIcon,
  children,
  ...rest
}: ExternalButtonLinkProps) {
  return (
    <a
      className={classes({ variant, size, fullWidth }, className)}
      rel="noreferrer noopener"
      {...rest}
    >
      {content({ leadingIcon, trailingIcon, children })}
    </a>
  );
}
