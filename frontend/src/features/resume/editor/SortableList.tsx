/**
 * Thin wrapper over `@dnd-kit` for the vertical, keyboard-accessible lists the
 * editor uses (sections, items, bullets).
 *
 * Drag is a convenience: every list also exposes move up / move down buttons so
 * reordering works without a pointer.
 */

import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import { restrictToVerticalAxis, restrictToParentElement } from '@dnd-kit/modifiers';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { ReactNode } from 'react';

export interface SortableListProps {
  ids: string[];
  onReorder: (activeId: string, overId: string) => void;
  children: ReactNode;
}

export function SortableList({ ids, onReorder, children }: SortableListProps) {
  const sensors = useSensors(
    // A small distance threshold keeps clicks on inputs from starting a drag.
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) onReorder(String(active.id), String(over.id));
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      modifiers={[restrictToVerticalAxis, restrictToParentElement]}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={ids} strategy={verticalListSortingStrategy}>
        {children}
      </SortableContext>
    </DndContext>
  );
}

export interface SortableRenderProps {
  attributes: Record<string, unknown>;
  listeners: Record<string, unknown> | undefined;
  isDragging: boolean;
}

export function SortableItem({
  id,
  children,
  className,
}: {
  id: string;
  className?: string;
  children: (props: SortableRenderProps) => ReactNode;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortableSafe(id);

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform), transition }}
      className={className}
      data-dragging={isDragging || undefined}
    >
      {children({ attributes, listeners, isDragging })}
    </div>
  );
}

/** `useSortable` with the pieces we need renamed for readability. */
function useSortableSafe(id: string) {
  const sortable = useSortable({ id });
  return {
    attributes: sortable.attributes as unknown as Record<string, unknown>,
    listeners: sortable.listeners as unknown as Record<string, unknown> | undefined,
    setNodeRef: sortable.setNodeRef,
    transform: sortable.transform,
    transition: sortable.transition,
    isDragging: sortable.isDragging,
  };
}
