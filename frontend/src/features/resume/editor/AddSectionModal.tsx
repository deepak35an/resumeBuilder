import { Plus, Search } from 'lucide-react';
import { useMemo, useState } from 'react';

import { Badge, Input, Modal } from '@/components/ui';
import {
  SECTION_DEFINITIONS,
  SECTION_GROUP_LABELS,
  type SectionDefinition,
  type SectionGroup,
} from '@/features/resume/sections';
import { cn } from '@/lib/utils';
import type { SectionType } from '@/types/resume';

const GROUP_ORDER: SectionGroup[] = ['core', 'achievements', 'academic', 'learning', 'additional'];

export function AddSectionModal({
  open,
  onClose,
  onAdd,
  existingTypes,
}: {
  open: boolean;
  onClose: () => void;
  onAdd: (type: SectionType) => void;
  existingTypes: SectionType[];
}) {
  const [query, setQuery] = useState('');

  const grouped = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const matches = SECTION_DEFINITIONS.filter(
      (definition) =>
        !needle ||
        definition.title.toLowerCase().includes(needle) ||
        definition.description.toLowerCase().includes(needle),
    );
    return GROUP_ORDER.map((group) => ({
      group,
      items: matches.filter((definition) => definition.group === group),
    })).filter((entry) => entry.items.length > 0);
  }, [query]);

  const isUsed = (definition: SectionDefinition) =>
    !definition.repeatable && existingTypes.includes(definition.type);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Add a section"
      description="Everything here renders as plain, parseable text. You can rename any section after adding it."
      size="lg"
    >
      <div className="space-y-4">
        <Input
          value={query}
          autoFocus
          leadingIcon={<Search />}
          placeholder="Search sections"
          aria-label="Search sections"
          onChange={(event) => setQuery(event.target.value)}
        />

        {grouped.length === 0 && (
          <p className="py-6 text-center text-sm text-muted-foreground">
            No section matches &ldquo;{query}&rdquo;. Try a Custom Section instead.
          </p>
        )}

        <div className="max-h-[26rem] space-y-5 overflow-y-auto pr-1">
          {grouped.map(({ group, items }) => (
            <div key={group}>
              <h3 className="mb-2 text-2xs font-semibold uppercase tracking-wider text-muted-foreground">
                {SECTION_GROUP_LABELS[group]}
              </h3>
              <ul className="grid gap-2 sm:grid-cols-2">
                {items.map((definition) => {
                  const used = isUsed(definition);
                  return (
                    <li key={definition.type}>
                      <button
                        type="button"
                        disabled={used}
                        onClick={() => {
                          onAdd(definition.type);
                          onClose();
                        }}
                        className={cn(
                          'group flex h-full w-full flex-col gap-1 rounded-xl border p-3 text-left transition-colors',
                          used
                            ? 'cursor-not-allowed border-border bg-muted/50 opacity-60'
                            : 'border-border bg-surface hover:border-accent hover:bg-accent-subtle',
                        )}
                      >
                        <span className="flex items-center gap-2">
                          <span className="text-sm font-medium text-foreground">
                            {definition.title}
                          </span>
                          {used ? (
                            <Badge tone="neutral" size="xs">
                              Added
                            </Badge>
                          ) : (
                            <Plus
                              aria-hidden="true"
                              className="ml-auto h-4 w-4 text-muted-foreground transition-colors group-hover:text-accent"
                            />
                          )}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {definition.description}
                        </span>
                        {definition.suggestedFor.length > 0 && (
                          <span className="mt-1 text-2xs uppercase tracking-wide text-accent-strong">
                            Good for {definition.suggestedFor.join(', ')}
                          </span>
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </Modal>
  );
}
