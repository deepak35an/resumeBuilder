import { Plus } from 'lucide-react';

import { Button, Checkbox, EmptyState, Field, Input, MonthPicker, TagInput } from '@/components/ui';
import { BulletsEditor } from '@/features/resume/editor/BulletsEditor';
import { ItemCard } from '@/features/resume/editor/ItemCard';
import { SortableItem, SortableList } from '@/features/resume/editor/SortableList';
import { createItemOps } from '@/features/resume/editor/itemOps';
import { formatDateRange } from '@/features/resume/formatting';
import { definitionFor, newExperienceItem } from '@/features/resume/sections';
import type { ExperienceSection } from '@/types/resume';

export function ExperienceSectionEditor({
  section,
  onChange,
}: {
  section: ExperienceSection;
  onChange: (section: ExperienceSection) => void;
}) {
  const definition = definitionFor(section.type);
  const ops = createItemOps(
    section.items,
    (items) => onChange({ ...section, items }),
    newExperienceItem,
  );

  const noun = section.type === 'volunteer' ? 'role' : section.type === 'internships' ? 'internship' : 'role';

  if (ops.items.length === 0) {
    return (
      <EmptyState
        title={`No ${noun}s yet`}
        description={definition.emptyHint}
        action={
          <Button leadingIcon={<Plus />} onClick={ops.add}>
            Add {noun}
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
                  title={item.title || item.company}
                  subtitle={
                    [
                      item.company && item.title ? item.company : '',
                      formatDateRange(item.startDate, item.endDate, item.current),
                    ]
                      .filter(Boolean)
                      .join(' \u00b7 ') || undefined
                  }
                  defaultOpen={index === 0 && !item.title}
                  removeLabel={noun}
                  placeholder={`Untitled ${noun}`}
                  dragHandleProps={{ ...attributes, ...listeners }}
                  onDuplicate={() => ops.duplicate(item.id)}
                  onRemove={() => ops.remove(item.id)}
                >
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Job title">
                      <Input
                        value={item.title}
                        placeholder="Senior Product Engineer"
                        onChange={(event) => ops.update(item.id, { title: event.target.value })}
                      />
                    </Field>
                    <Field label={section.type === 'volunteer' ? 'Organisation' : 'Company'}>
                      <Input
                        value={item.company}
                        placeholder="Northwind Commerce"
                        onChange={(event) => ops.update(item.id, { company: event.target.value })}
                      />
                    </Field>
                    <Field label="Location" optional>
                      <Input
                        value={item.location}
                        placeholder="Seattle, WA or Remote"
                        onChange={(event) => ops.update(item.id, { location: event.target.value })}
                      />
                    </Field>
                    <div className="space-y-2">
                      <Field label="Start date">
                        <MonthPicker
                          label="Start"
                          value={item.startDate}
                          onChange={(startDate) => ops.update(item.id, { startDate })}
                        />
                      </Field>
                      <Field label="End date">
                        <MonthPicker
                          label="End"
                          value={item.endDate}
                          disabled={item.current}
                          onChange={(endDate) => ops.update(item.id, { endDate })}
                        />
                      </Field>
                      <Checkbox
                        checked={item.current}
                        label="I currently work here"
                        onChange={(event) =>
                          ops.update(item.id, {
                            current: event.target.checked,
                            endDate: event.target.checked ? '' : item.endDate,
                          })
                        }
                      />
                    </div>
                  </div>

                  <BulletsEditor
                    bullets={item.bullets}
                    onChange={(bullets) => ops.update(item.id, { bullets })}
                    label="What did you achieve?"
                  />

                  <Field
                    label="Technologies"
                    optional
                    hint="Listed as plain text under the role. Useful for keyword matching."
                  >
                    <TagInput
                      value={item.technologies}
                      ariaLabel="Technologies used in this role"
                      placeholder="TypeScript, PostgreSQL, AWS"
                      onChange={(technologies) => ops.update(item.id, { technologies })}
                    />
                  </Field>
                </ItemCard>
              )}
            </SortableItem>
          ))}
        </div>
      </SortableList>

      <Button size="sm" variant="subtle" leadingIcon={<Plus />} onClick={ops.add}>
        Add {noun}
      </Button>
    </div>
  );
}
