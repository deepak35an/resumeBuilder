/** Bullet list editor: reorderable textareas with inline writing hints. */

import { AlertTriangle, GripVertical, Info, Plus, Trash2 } from 'lucide-react';
import { useCallback } from 'react';

import { Button, IconButton, Textarea } from '@/components/ui';
import { AiBulletToolbar } from '@/features/resume/editor/AiBulletToolbar';
import { SortableItem, SortableList } from '@/features/resume/editor/SortableList';
import { MAX_BULLET_WORDS, bulletHints, suggestedVerbs, wordCount } from '@/features/resume/writing';
import { cn } from '@/lib/utils';

export interface BulletsEditorProps {
  bullets: string[];
  onChange: (bullets: string[]) => void;
  label?: string;
  addLabel?: string;
  placeholder?: string;
  /** Hints are noise on short lists such as coursework. */
  showHints?: boolean;
  showAi?: boolean;
}

export function BulletsEditor({
  bullets,
  onChange,
  label = 'Bullet points',
  addLabel = 'Add bullet',
  placeholder = 'Reduced page load time by 40% by moving rendering to the edge',
  showHints = true,
  showAi = true,
}: BulletsEditorProps) {
  // Bullets have no stable id in the data model, so index-based keys are the
  // honest option here; dnd-kit needs non-numeric ids.
  const ids = bullets.map((_, index) => `bullet-${index}`);

  const update = useCallback(
    (index: number, value: string) => {
      onChange(bullets.map((bullet, position) => (position === index ? value : bullet)));
    },
    [bullets, onChange],
  );

  const remove = (index: number) => onChange(bullets.filter((_, position) => position !== index));

  const add = () => onChange([...bullets, '']);

  const reorder = (activeId: string, overId: string) => {
    const from = ids.indexOf(activeId);
    const to = ids.indexOf(overId);
    if (from === -1 || to === -1) return;
    const next = [...bullets];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    onChange(next);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-foreground">{label}</span>
        <span className="text-xs text-muted-foreground">
          {bullets.filter((bullet) => bullet.trim()).length} written
        </span>
      </div>

      <SortableList ids={ids} onReorder={reorder}>
        <div className="space-y-2">
          {bullets.map((bullet, index) => {
            const hints = showHints ? bulletHints(bullet) : [];
            const words = wordCount(bullet);
            return (
              <SortableItem key={ids[index]} id={ids[index]}>
                {({ attributes, listeners, isDragging }) => (
                  <div
                    className={cn(
                      'rounded-lg border border-border bg-surface p-1.5',
                      isDragging && 'shadow-md',
                    )}
                  >
                    <div className="flex items-start gap-1">
                      <span
                        {...attributes}
                        {...listeners}
                        className="mt-2 flex h-6 w-5 shrink-0 cursor-grab items-center justify-center
                          rounded text-muted-foreground hover:text-foreground active:cursor-grabbing"
                      >
                        <GripVertical aria-hidden="true" className="h-4 w-4" />
                      </span>
                      <Textarea
                        value={bullet}
                        autoResize
                        minRows={2}
                        aria-label={`Bullet ${index + 1}`}
                        placeholder={index === 0 ? placeholder : 'Add another achievement'}
                        onChange={(event) => update(index, event.target.value)}
                        className="border-0 bg-transparent px-1.5 py-1.5 shadow-none focus-visible:ring-0"
                      />
                      <div className="flex flex-col items-center gap-0.5">
                        <IconButton
                          size="xs"
                          variant="ghost"
                          label={`Remove bullet ${index + 1}`}
                          icon={<Trash2 />}
                          onClick={() => remove(index)}
                        />
                        {words > 0 && (
                          <span
                            className={cn(
                              'text-2xs tabular-nums',
                              words > MAX_BULLET_WORDS ? 'text-warning-foreground' : 'text-muted-foreground',
                            )}
                          >
                            {words}w
                          </span>
                        )}
                      </div>
                    </div>

                    {showAi && <AiBulletToolbar text={bullet} onApply={(next) => update(index, next)} />}

                    {hints.length > 0 && (
                      <ul className="space-y-1 px-7 pb-1.5 pt-0.5">
                        {hints.map((hint) => (
                          <li
                            key={hint.id}
                            className={cn(
                              'flex items-start gap-1.5 text-xs',
                              hint.tone === 'warning'
                                ? 'text-warning-foreground'
                                : 'text-muted-foreground',
                            )}
                          >
                            {hint.tone === 'warning' ? (
                              <AlertTriangle aria-hidden="true" className="mt-0.5 h-3 w-3 shrink-0" />
                            ) : (
                              <Info aria-hidden="true" className="mt-0.5 h-3 w-3 shrink-0" />
                            )}
                            <span>{hint.message}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </SortableItem>
            );
          })}
        </div>
      </SortableList>

      <div className="flex flex-wrap items-center gap-2">
        <Button size="sm" variant="subtle" leadingIcon={<Plus />} onClick={add}>
          {addLabel}
        </Button>
        {bullets.every((bullet) => !bullet.trim()) && (
          <span className="text-xs text-muted-foreground">
            Try starting with {suggestedVerbs(3).join(', ')}
          </span>
        )}
      </div>
    </div>
  );
}
