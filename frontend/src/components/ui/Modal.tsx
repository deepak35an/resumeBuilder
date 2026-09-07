import { X } from 'lucide-react';
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

import { useBodyScrollLock, useEscapeKey, useFocusTrap } from '@/hooks/useUiPrimitives';
import { cn } from '@/lib/utils';

import { IconButton } from './IconButton';

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

const widths: Record<ModalSize, string> = {
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-5xl',
  full: 'max-w-[min(96rem,95vw)]',
};

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: ModalSize;
  /** Hide the visible heading but keep it as the dialog's accessible name. */
  hideTitle?: boolean;
  closeOnBackdrop?: boolean;
  className?: string;
  bodyClassName?: string;
}

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'md',
  hideTitle,
  closeOnBackdrop = true,
  className,
  bodyClassName,
}: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  useBodyScrollLock(open);
  useEscapeKey(open, onClose);
  useFocusTrap(panelRef, open);

  const onBackdrop = useCallback(() => {
    if (closeOnBackdrop) onClose();
  }, [closeOnBackdrop, onClose]);

  if (!mounted || !open) return null;

  return createPortal(
    <div className="fixed inset-0 z-modal flex items-end justify-center p-0 sm:items-center sm:p-6">
      <div
        aria-hidden="true"
        onClick={onBackdrop}
        className="absolute inset-0 animate-fade-in bg-slate-950/45 backdrop-blur-[2px]"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        aria-describedby={description ? 'modal-description' : undefined}
        tabIndex={-1}
        className={cn(
          'relative flex max-h-[92vh] w-full flex-col overflow-hidden bg-surface shadow-lg',
          'animate-slide-in-bottom rounded-t-2xl sm:animate-scale-in sm:rounded-2xl',
          widths[size],
          className,
        )}
      >
        <div className="flex items-start justify-between gap-4 border-b border-border px-5 py-4">
          <div className={cn('min-w-0', hideTitle && 'sr-only')}>
            <h2 className="text-base font-semibold text-foreground">{title}</h2>
            {description && (
              <p id="modal-description" className="mt-1 text-sm text-muted-foreground text-pretty">
                {description}
              </p>
            )}
          </div>
          <IconButton label="Close" icon={<X />} onClick={onClose} className="-mr-1 -mt-1" />
        </div>

        <div className={cn('scroll-area min-h-0 flex-1 overflow-y-auto px-5 py-4', bodyClassName)}>
          {children}
        </div>

        {footer && (
          <div className="flex flex-wrap items-center justify-end gap-2 border-t border-border bg-surface-sunken px-5 py-3.5">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}
