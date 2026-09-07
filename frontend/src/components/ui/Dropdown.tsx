import { useCallback, useRef, useState, type ReactNode } from 'react';

import { useEscapeKey, useOnClickOutside } from '@/hooks/useUiPrimitives';
import { cn } from '@/lib/utils';

export interface DropdownItem {
  id: string;
  label: string;
  icon?: ReactNode;
  onSelect: () => void;
  tone?: 'default' | 'danger';
  disabled?: boolean;
  /** Renders a lock affordance instead of disabling silently. */
  locked?: boolean;
  shortcut?: string;
  separatorBefore?: boolean;
}

export interface DropdownProps {
  trigger: (props: { open: boolean; toggle: () => void; ref: React.Ref<HTMLButtonElement> }) => ReactNode;
  items: DropdownItem[];
  align?: 'start' | 'end';
  className?: string;
  menuLabel?: string;
}

/** Keyboard-navigable menu used by resume cards and toolbars. */
export function Dropdown({ trigger, items, align = 'end', className, menuLabel }: DropdownProps) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const close = useCallback(() => {
    setOpen(false);
    setActiveIndex(-1);
  }, []);

  useOnClickOutside(containerRef, close, open);
  useEscapeKey(open, () => {
    close();
    triggerRef.current?.focus();
  });

  const selectable = items.filter((item) => !item.disabled);

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (!open) return;
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      const direction = event.key === 'ArrowDown' ? 1 : -1;
      const next = (activeIndex + direction + selectable.length) % selectable.length;
      setActiveIndex(next);
    } else if (event.key === 'Enter' && activeIndex >= 0) {
      event.preventDefault();
      selectable[activeIndex].onSelect();
      close();
    }
  };

  return (
    <div ref={containerRef} className={cn('relative', className)} onKeyDown={onKeyDown}>
      {trigger({ open, toggle: () => setOpen((value) => !value), ref: triggerRef })}

      {open && (
        <div
          role="menu"
          aria-label={menuLabel}
          className={cn(
            'absolute z-dropdown mt-1.5 min-w-[11rem] animate-scale-in overflow-hidden rounded-xl',
            'border border-border bg-surface p-1 shadow-lg',
            align === 'end' ? 'right-0' : 'left-0',
          )}
        >
          {items.map((item, index) => {
            const selectableIndex = selectable.indexOf(item);
            return (
              <div key={item.id}>
                {item.separatorBefore && index > 0 && (
                  <div role="separator" className="my-1 h-px bg-border" />
                )}
                <button
                  type="button"
                  role="menuitem"
                  disabled={item.disabled}
                  onClick={() => {
                    item.onSelect();
                    close();
                  }}
                  onMouseEnter={() => setActiveIndex(selectableIndex)}
                  className={cn(
                    'flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-left text-sm transition-colors duration-fast',
                    'disabled:cursor-not-allowed disabled:opacity-50',
                    item.tone === 'danger'
                      ? 'text-danger hover:bg-danger-subtle'
                      : 'text-foreground hover:bg-muted',
                    selectableIndex === activeIndex && selectableIndex >= 0 && 'bg-muted',
                  )}
                >
                  {item.icon && (
                    <span
                      aria-hidden="true"
                      className="shrink-0 text-muted-foreground [&_svg]:h-4 [&_svg]:w-4"
                    >
                      {item.icon}
                    </span>
                  )}
                  <span className="flex-1 truncate">{item.label}</span>
                  {item.locked && (
                    <span className="text-2xs font-medium uppercase tracking-wide text-accent-strong">
                      Pro
                    </span>
                  )}
                  {item.shortcut && (
                    <span className="font-mono text-2xs text-muted-foreground">{item.shortcut}</span>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
