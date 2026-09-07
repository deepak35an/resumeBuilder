import { Plus } from 'lucide-react';

import { Button, EmptyState, Field, Input, MonthPicker, TagInput, Textarea } from '@/components/ui';
import { BulletsEditor } from '@/features/resume/editor/BulletsEditor';
import { ItemCard } from '@/features/resume/editor/ItemCard';
import { SortableItem, SortableList } from '@/features/resume/editor/SortableList';
import { createItemOps } from '@/features/resume/editor/itemOps';
import { formatDateRange } from '@/features/resume/formatting';
import { newProjectItem } from '@/features/resume/sections';
import type { ProjectsSection } from '@/types/resume';

export function ProjectsSectionEditor({
  section,
  onChange,
}: {
  section: ProjectsSection;
  onChange: (section: ProjectsSection) => void;
}) {
  const ops = createItemOps(
    section.items,
    (items) => onChange({ ...section, items }),
    newProjectItem,
  );

  if (ops.items.length === 0) {
    return (
      <EmptyState
        title="No projects yet"
        description="Projects carry real weight when you are early in your career or changing field."
        action={
          <Button leadingIcon={<Plus />} onClick={ops.add}>
            Add project
          </Button>
        }
        size="sm"
      />
    );
  }

  return (
    <div className="space-y-3">
      <SortableList ids={ops.items.map((item) => item.id)} onReorder={ops.reorder}>
        <div className="space-y-2">
          {ops.items.map((item, index) => (
            <SortableItem key={item.id} id={item.id}>
              {({ attributes, listeners }) => (
                <ItemCard
                  title={item.name}
                  subtitle={
                    [item.role, formatDateRange(item.startDate, item.endDate, false)]
                      .filter(Boolean)
                      .join(' \u00b7 ') || undefined
                  }
                  defaultOpen={index === 0 && !item.name}
                  removeLabel="project"
                  placeholder="Untitled project"
                  dragHandleProps={{ ...attributes, ...listeners }}
                  onDuplicate={() => ops.duplicate(item.id)}
                  onRemove={() => ops.remove(item.id)}
                >
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Project name">
                      <Input
                        value={item.name}
                        placeholder="Ledger"
                        onChange={(event) => ops.update(item.id, { name: event.target.value })}
                      />
                    </Field>
                    <Field label="Your role" optional>
                      <Input
                        value={item.role}
                        placeholder="Creator, Lead developer"
                        onChange={(event) => ops.update(item.id, { role: event.target.value })}
                      />
                    </Field>
                    <Field label="Live URL" optional>
                      <Input
                        value={item.url}
                        placeholder="ledger.dev"
                        onChange={(event) => ops.update(item.id, { url: event.target.value })}
                      />
                    </Field>
                    <Field label="Repository" optional>
                      <Input
                        value={item.github}
                        placeholder="github.com/averychen/ledger"
                        onChange={(event) => ops.update(item.id, { github: event.target.value })}
                      />
                    </Field>
                    <Field label="Start date" optional>
                      <MonthPicker
                        label="Start"
                        value={item.startDate}
                        onChange={(startDate) => ops.update(item.id, { startDate })}
                      />
                    </Field>
                    <Field label="End date" optional>
                      <MonthPicker
                        label="End"
                        value={item.endDate}
                        onChange={(endDate) => ops.update(item.id, { endDate })}
                      />
                    </Field>
                  </div>

                  <Field label="One-line description" optional>
                    <Textarea
                      value={item.description}
                      autoResize
                      minRows={2}
                      placeholder="Open-source double-entry accounting library with 3.4k GitHub stars."
                      onChange={(event) =>
                        ops.update(item.id, { description: event.target.value })
                      }
                    />
                  </Field>

                  <Field label="Technologies" optional>
                    <TagInput
                      value={item.technologies}
                      ariaLabel="Technologies used in this project"
                      placeholder="TypeScript, SQLite"
                      onChange={(technologies) => ops.update(item.id, { technologies })}
                    />
                  </Field>

                  <BulletsEditor
                    bullets={item.bullets}
                    onChange={(bullets) => ops.update(item.id, { bullets })}
                    label="Highlights"
                    addLabel="Add highlight"
                    placeholder="Handled 60k monthly downloads with zero reported data-loss bugs"
                  />
                </ItemCard>
              )}
            </SortableItem>
          ))}
        </div>
      </SortableList>

      <Button size="sm" variant="subtle" leadingIcon={<Plus />} onClick={ops.add}>
        Add project
      </Button>
    </div>
  );
}
