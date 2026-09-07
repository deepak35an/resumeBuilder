import { Plus } from 'lucide-react';

import { Button, Checkbox, EmptyState, Field, Input, MonthPicker, TagInput } from '@/components/ui';
import { BulletsEditor } from '@/features/resume/editor/BulletsEditor';
import { ItemCard } from '@/features/resume/editor/ItemCard';
import { SortableItem, SortableList } from '@/features/resume/editor/SortableList';
import { createItemOps } from '@/features/resume/editor/itemOps';
import { formatDateRange } from '@/features/resume/formatting';
import { newEducationItem } from '@/features/resume/sections';
import type { EducationSection } from '@/types/resume';

export function EducationSectionEditor({
  section,
  onChange,
}: {
  section: EducationSection;
  onChange: (section: EducationSection) => void;
}) {
  const ops = createItemOps(
    section.items,
    (items) => onChange({ ...section, items }),
    newEducationItem,
  );

  if (ops.items.length === 0) {
    return (
      <EmptyState
        title="No education yet"
        description="Add your highest qualification first. A GPA is optional - include it only if it helps."
        action={
          <Button leadingIcon={<Plus />} onClick={ops.add}>
            Add education
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
                  title={[item.degree, item.field].filter(Boolean).join(', ') || item.institution}
                  subtitle={
                    [item.institution, formatDateRange(item.startDate, item.endDate, item.current)]
                      .filter(Boolean)
                      .join(' \u00b7 ') || undefined
                  }
                  defaultOpen={index === 0 && !item.institution}
                  removeLabel="qualification"
                  placeholder="Untitled qualification"
                  dragHandleProps={{ ...attributes, ...listeners }}
                  onDuplicate={() => ops.duplicate(item.id)}
                  onRemove={() => ops.remove(item.id)}
                >
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Degree" hint="B.S., M.Sc., MBA, Diploma">
                      <Input
                        value={item.degree}
                        placeholder="B.S."
                        onChange={(event) => ops.update(item.id, { degree: event.target.value })}
                      />
                    </Field>
                    <Field label="Field of study">
                      <Input
                        value={item.field}
                        placeholder="Computer Science"
                        onChange={(event) => ops.update(item.id, { field: event.target.value })}
                      />
                    </Field>
                    <Field label="Institution">
                      <Input
                        value={item.institution}
                        placeholder="University of Washington"
                        onChange={(event) =>
                          ops.update(item.id, { institution: event.target.value })
                        }
                      />
                    </Field>
                    <Field label="Location" optional>
                      <Input
                        value={item.location}
                        placeholder="Seattle, WA"
                        onChange={(event) => ops.update(item.id, { location: event.target.value })}
                      />
                    </Field>
                    <Field label="Start date" optional>
                      <MonthPicker
                        label="Start"
                        value={item.startDate}
                        onChange={(startDate) => ops.update(item.id, { startDate })}
                      />
                    </Field>
                    <div className="space-y-2">
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
                        label="Currently studying"
                        onChange={(event) =>
                          ops.update(item.id, {
                            current: event.target.checked,
                            endDate: event.target.checked ? '' : item.endDate,
                          })
                        }
                      />
                    </div>
                    <Field
                      label="GPA or grade"
                      optional
                      hint="Leave blank unless it is strong or expected in your market."
                      className="sm:col-span-2"
                    >
                      <Input
                        value={item.gpa}
                        placeholder="3.8/4.0"
                        className="max-w-[12rem]"
                        onChange={(event) => ops.update(item.id, { gpa: event.target.value })}
                      />
                    </Field>
                  </div>

                  <Field label="Relevant coursework" optional>
                    <TagInput
                      value={item.coursework}
                      ariaLabel="Relevant coursework"
                      placeholder="Distributed Systems, Databases"
                      onChange={(coursework) => ops.update(item.id, { coursework })}
                    />
                  </Field>

                  <BulletsEditor
                    bullets={item.bullets}
                    onChange={(bullets) => ops.update(item.id, { bullets })}
                    label="Highlights"
                    addLabel="Add highlight"
                    placeholder="Thesis on distributed consensus, graded with distinction"
                    showHints={false}
                  />
                </ItemCard>
              )}
            </SortableItem>
          ))}
        </div>
      </SortableList>

      <Button size="sm" variant="subtle" leadingIcon={<Plus />} onClick={ops.add}>
        Add education
      </Button>
    </div>
  );
}
