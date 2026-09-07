import { ChevronDown } from 'lucide-react';
import { useId, useState, type ReactNode } from 'react';

import { cn } from '@/lib/utils';

export interface AccordionItemData {
  id: string;
  title: string;
  content: ReactNode;
  meta?: ReactNode;
}

export interface AccordionProps {
  items: AccordionItemData[];
  /** Allow several panels open at once (FAQ pages use single). */
  multiple?: boolean;
  defaultOpen?: string[];
  className?: string;
  itemClassName?: string;
}

export function Accordion({
  items,
  multiple = false,
  defaultOpen = [],
  className,
  itemClassName,
}: AccordionProps) {
  const [open, setOpen] = useState<string[]>(defaultOpen);
  const baseId = useId();

  const toggle = (id: string) => {
    setOpen((current) => {
      if (current.includes(id)) return current.filter((value) => value !== id);
      return multiple ? [...current, id] : [id];
    });
  };

  return (
    <div className={cn('divide-y divide-border', className)}>
      {items.map((item) => {
        const isOpen = open.includes(item.id);
        const panelId = `${baseId}-${item.id}`;
        return (
          <div key={item.id} className={itemClassName}>
            <h3>
              <button
                type="button"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => toggle(item.id)}
                className="flex w-full items-center justify-between gap-4 py-4 text-left"
              >
                <span className="text-sm font-medium text-foreground text-pretty">{item.title}</span>
                <span className="flex shrink-0 items-center gap-2">
                  {item.meta}
                  <ChevronDown
                    aria-hidden="true"
                    className={cn(
                      'h-4 w-4 text-muted-foreground transition-transform duration-base',
                      isOpen && 'rotate-180',
                    )}
                  />
                </span>
              </button>
            </h3>
            {isOpen && (
              <div
                id={panelId}
                className="pb-4 text-sm leading-relaxed text-muted-foreground text-pretty"
              >
                {item.content}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
