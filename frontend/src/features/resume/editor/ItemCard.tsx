/** Collapsible wrapper for a single repeated entry (a role, a degree, a project). */

import { ChevronDown, Copy, GripVertical, Trash2 } from 'lucide-react';
import { useState, type ReactNode } from 'react';

import { ConfirmDialog, IconButton, Tooltip } from '@/components/ui';
import { cn } from '@/lib/utils';

export interface ItemCardProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  onRemove: () => void;
  onDuplicate?: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  dragHandleProps?: Record<string, unknown>;
  defaultOpen?: boolean;
  /** Shown when the entry has no title yet. */
  placeholder?: string;
  removeLabel?: string;
}

export function ItemCard({
  title,
  subtitle,
  children,
  onRemove,
  onDuplicate,
  dragHandleProps,
  defaultOpen = false,
  placeholder = 'Untitled entry',
  removeLabel = 'entry',
}: ItemCardProps) {
  const [open, setOpen] = useState(defaultOpen);
  const [confirming, setConfirming] = useState(false);

  return (
    <div
      className={cn(
        'rounded-xl border border-border bg-surface transition-shadow duration-fast',
        open ? 'shadow-xs' : 'hover:border-border-strong',
      )}
    >
      <div className="flex items-center gap-1 px-2 py-2">
        <span
          {...dragHandleProps}
          aria-hidden={dragHandleProps ? undefined : true}
          className={cn(
            'flex h-7 w-6 shrink-0 items-center justify-center rounded text-muted-foreground',
            dragHandleProps ? 'cursor-grab active:cursor-grabbing hover:text-foreground' : 'opacity-30',
          )}
        >
          <GripVertical aria-hidden="true" className="h-4 w-4" />
        </span>

        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          className="flex min-w-0 flex-1 items-center gap-2 rounded-md px-1 py-1 text-left
            transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2
            focus-visible:ring-ring"
        >
          <ChevronDown
            aria-hidden="true"
            className={cn(
              'h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-fast',
              open && 'rotate-180',
            )}
          />
          <span className="min-w-0 flex-1">
            <span
              className={cn(
                'block truncate text-sm font-medium',
                title ? 'text-foreground' : 'text-muted-foreground',
              )}
            >
              {title || placeholder}
            </span>
            {subtitle && (
              <span className="block truncate text-xs text-muted-foreground">{subtitle}</span>
            )}
          </span>
        </button>

        {onDuplicate && (
          <Tooltip content="Duplicate">
            <IconButton
              size="sm"
              variant="ghost"
              label={`Duplicate ${title || removeLabel}`}
              icon={<Copy />}
              onClick={onDuplicate}
            />
          </Tooltip>
        )}
        <Tooltip content="Remove">
          <IconButton
            size="sm"
            variant="ghost"
            label={`Remove ${title || removeLabel}`}
            icon={<Trash2 />}
            onClick={() => setConfirming(true)}
          />
        </Tooltip>
      </div>

      {open && <div className="space-y-4 border-t border-border px-3 pb-4 pt-4">{children}</div>}

      <ConfirmDialog
        open={confirming}
        onClose={() => setConfirming(false)}
        onConfirm={() => {
          setConfirming(false);
          onRemove();
        }}
        title={`Remove this ${removeLabel}?`}
        description={
          <>
            <strong className="text-foreground">{title || placeholder}</strong> and everything in it
            will be removed from this resume. You can undo this with Ctrl+Z.
          </>
        }
        confirmLabel="Remove"
        tone="danger"
      />
    </div>
  );
}
