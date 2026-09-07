import { X } from 'lucide-react';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

import { useBodyScrollLock, useEscapeKey, useFocusTrap } from '@/hooks/useUiPrimitives';
import { cn } from '@/lib/utils';

import { IconButton } from './IconButton';

export interface SheetProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  /** `right` is the desktop side panel; `bottom` is the mobile bottom sheet. */
  side?: 'right' | 'bottom';
  width?: 'sm' | 'md' | 'lg';
  className?: string;
}

const widths = { sm: 'sm:max-w-sm', md: 'sm:max-w-md', lg: 'sm:max-w-xl' };

/**
 * Side drawer / bottom sheet. Used for the Resume Copilot, mobile section
 * actions and the export flow.
 */
export function Sheet({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  side = 'right',
  width = 'md',
  className,
}: SheetProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  useBodyScrollLock(open);
  useEscapeKey(open, onClose);
  useFocusTrap(panelRef, open);

  if (!mounted || !open) return null;

  return createPortal(
    <div className="fixed inset-0 z-drawer">
      <div
        aria-hidden="true"
        onClick={onClose}
        className="absolute inset-0 animate-fade-in bg-slate-950/40"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        className={cn(
          'absolute flex flex-col bg-surface shadow-lg',
          side === 'right'
            ? cn(
                'inset-y-0 right-0 w-full animate-slide-in-right border-l border-border',
                widths[width],
              )
            : 'inset-x-0 bottom-0 max-h-[85vh] animate-slide-in-bottom rounded-t-2xl border-t border-border',
          className,
        )}
      >
        {side === 'bottom' && (
          <div aria-hidden="true" className="mx-auto mt-2.5 h-1 w-10 rounded-full bg-border-strong" />
        )}
        <div className="flex items-start justify-between gap-4 border-b border-border px-5 py-4">
          <div className="min-w-0">
            <h2 className="text-base font-semibold text-foreground">{title}</h2>
            {description && (
              <p className="mt-1 text-sm text-muted-foreground text-pretty">{description}</p>
            )}
          </div>
          <IconButton label="Close" icon={<X />} onClick={onClose} className="-mr-1 -mt-1" />
        </div>

        <div className="scroll-area min-h-0 flex-1 overflow-y-auto px-5 py-4">{children}</div>

        {footer && (
          <div className="flex items-center justify-end gap-2 border-t border-border bg-surface-sunken px-5 py-3.5">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}
