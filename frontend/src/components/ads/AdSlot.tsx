import { cn } from '@/lib/utils';

/**
 * Reserved ad placement for content pages only (blog, examples, templates).
 * Never render this inside the resume editor.
 */
export function AdSlot({
  slot,
  className,
}: {
  slot: 'blog' | 'examples' | 'templates';
  className?: string;
}) {
  return (
    <aside
      aria-label="Advertisement"
      data-ad-slot={slot}
      className={cn(
        'flex min-h-[90px] items-center justify-center rounded-xl border border-dashed border-border bg-surface-sunken px-4 py-6',
        className,
      )}
    >
      <p className="text-center text-xs text-muted-foreground">
        Sponsored space — no tracking runs until you accept cookies.
      </p>
    </aside>
  );
}
