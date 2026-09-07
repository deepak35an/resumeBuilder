import { Plus } from 'lucide-react';

import { Button, EmptyState, Field, Input, MonthPicker, Textarea } from '@/components/ui';
import { BulletsEditor } from '@/features/resume/editor/BulletsEditor';
import { ItemCard } from '@/features/resume/editor/ItemCard';
import { SortableItem, SortableList } from '@/features/resume/editor/SortableList';
import { createItemOps } from '@/features/resume/editor/itemOps';
import { formatResumeDate } from '@/features/resume/formatting';
import { definitionFor, newListItem } from '@/features/resume/sections';
import type { GenericListSection } from '@/types/resume';

/** Labels vary by section type so an award does not ask for a "subtitle". */
const LABELS: Partial<Record<string, { title: string; subtitle: string; noun: string }>> = {
  awards: { title: 'Award', subtitle: 'Awarded by', noun: 'award' },
  achievements: { title: 'Achievement', subtitle: 'Context', noun: 'achievement' },
  courses: { title: 'Course', subtitle: 'Provider', noun: 'course' },
  training: { title: 'Training', subtitle: 'Provider', noun: 'training' },
  conferences: { title: 'Conference', subtitle: 'Role or organiser', noun: 'conference' },
  memberships: { title: 'Organisation', subtitle: 'Membership type', noun: 'membership' },
};

export function ListSectionEditor({
  section,
  onChange,
}: {
  section: GenericListSection;
  onChange: (section: GenericListSection) => void;
}) {
  const labels = LABELS[section.type] ?? { title: 'Title', subtitle: 'Subtitle', noun: 'entry' };
  const ops = createItemOps(section.items, (items) => onChange({ ...section, items }), newListItem);

  if (ops.items.length === 0) {
    return (
      <EmptyState
        title={`No ${labels.noun}s yet`}
        description={definitionFor(section.type).emptyHint}
        action={
          <Button leadingIcon={<Plus />} onClick={ops.add}>
            Add {labels.noun}
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
                  title={item.title}
                  subtitle={
                    [item.subtitle, formatResumeDate(item.date)].filter(Boolean).join(' \u00b7 ') ||
                    undefined
                  }
                  defaultOpen={index === 0 && !item.title}
                  removeLabel={labels.noun}
                  placeholder={`Untitled ${labels.noun}`}
                  dragHandleProps={{ ...attributes, ...listeners }}
                  onDuplicate={() => ops.duplicate(item.id)}
                  onRemove={() => ops.remove(item.id)}
                >
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label={labels.title} className="sm:col-span-2">
                      <Input
                        value={item.title}
                        onChange={(event) => ops.update(item.id, { title: event.target.value })}
                      />
                    </Field>
                    <Field label={labels.subtitle} optional>
                      <Input
                        value={item.subtitle}
                        onChange={(event) => ops.update(item.id, { subtitle: event.target.value })}
                      />
                    </Field>
                    <Field label="Date" optional>
                      <MonthPicker
                        label="Date"
                        value={item.date}
                        onChange={(date) => ops.update(item.id, { date })}
                      />
                    </Field>
                    <Field label="Description" optional className="sm:col-span-2">
                      <Textarea
                        value={item.description}
                        autoResize
                        minRows={2}
                        onChange={(event) =>
                          ops.update(item.id, { description: event.target.value })
                        }
                      />
                    </Field>
                  </div>

                  <BulletsEditor
                    bullets={item.bullets}
                    onChange={(bullets) => ops.update(item.id, { bullets })}
                    label="Details"
                    addLabel="Add detail"
                    placeholder="Add a detail"
                    showHints={false}
                  />
                </ItemCard>
              )}
            </SortableItem>
          ))}
        </div>
      </SortableList>

      <Button size="sm" variant="subtle" leadingIcon={<Plus />} onClick={ops.add}>
        Add {labels.noun}
      </Button>
    </div>
  );
}
