import { cloneElement, useId, useState, type ReactElement, type ReactNode } from 'react';

import { cn } from '@/lib/utils';

export interface TooltipProps {
  content: ReactNode;
  children: ReactElement;
  side?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
}

const positions = {
  top: 'bottom-full left-1/2 -translate-x-1/2 mb-1.5',
  bottom: 'top-full left-1/2 -translate-x-1/2 mt-1.5',
  left: 'right-full top-1/2 -translate-y-1/2 mr-1.5',
  right: 'left-full top-1/2 -translate-y-1/2 ml-1.5',
};

/** Describes its trigger via `aria-describedby`, and opens on focus as well as hover. */
export function Tooltip({ content, children, side = 'top', className }: TooltipProps) {
  const [open, setOpen] = useState(false);
  const id = useId();

  return (
    <span className="relative inline-flex">
      {cloneElement(children, {
        'aria-describedby': open ? id : undefined,
        onMouseEnter: () => setOpen(true),
        onMouseLeave: () => setOpen(false),
        onFocus: () => setOpen(true),
        onBlur: () => setOpen(false),
      })}
      {open && (
        <span
          id={id}
          role="tooltip"
          className={cn(
            'pointer-events-none absolute z-popover w-max max-w-56 animate-fade-in rounded-lg',
            'bg-slate-900 px-2.5 py-1.5 text-xs leading-snug text-white shadow-md dark:bg-slate-800',
            positions[side],
            className,
          )}
        >
          {content}
        </span>
      )}
    </span>
  );
}
