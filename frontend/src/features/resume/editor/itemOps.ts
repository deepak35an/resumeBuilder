/** Add / update / remove / duplicate / reorder helpers for section item lists. */

import { createId } from '@/lib/utils';

export interface Identified {
  id: string;
}

export interface ItemOps<T extends Identified> {
  items: T[];
  add: () => void;
  update: (id: string, patch: Partial<T>) => void;
  remove: (id: string) => void;
  duplicate: (id: string) => void;
  reorder: (activeId: string, overId: string) => void;
}

export function createItemOps<T extends Identified>(
  items: T[],
  onChange: (items: T[]) => void,
  factory: () => T,
): ItemOps<T> {
  return {
    items,
    add: () => onChange([...items, factory()]),
    update: (id, patch) =>
      onChange(items.map((item) => (item.id === id ? { ...item, ...patch } : item))),
    remove: (id) => onChange(items.filter((item) => item.id !== id)),
    duplicate: (id) => {
      const index = items.findIndex((item) => item.id === id);
      if (index === -1) return;
      const copy = { ...structuredClone(items[index]), id: createId() };
      const next = [...items];
      next.splice(index + 1, 0, copy);
      onChange(next);
    },
    reorder: (activeId, overId) => {
      const from = items.findIndex((item) => item.id === activeId);
      const to = items.findIndex((item) => item.id === overId);
      if (from === -1 || to === -1) return;
      const next = [...items];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      onChange(next);
    },
  };
}
