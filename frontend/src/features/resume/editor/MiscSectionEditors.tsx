/** Publications, languages, interests and references editors. */

import { GripVertical, Plus, Trash2 } from 'lucide-react';

import {
  Alert,
  Button,
  Field,
  IconButton,
  Input,
  MonthPicker,
  Select,
  Switch,
  TagInput,
  Textarea,
} from '@/components/ui';
import { ItemCard } from '@/features/resume/editor/ItemCard';
import { SortableItem, SortableList } from '@/features/resume/editor/SortableList';
import { createItemOps } from '@/features/resume/editor/itemOps';
import { formatResumeDate } from '@/features/resume/formatting';
import {
  newLanguageItem,
  newPublicationItem,
  newReferenceItem,
} from '@/features/resume/sections';
import type {
  LanguagesSection,
  PublicationsSection,
  ReferencesSection,
  TagsSection,
} from '@/types/resume';

// --- Publications -----------------------------------------------------------

export function PublicationsSectionEditor({
  section,
  onChange,
}: {
  section: PublicationsSection;
  onChange: (section: PublicationsSection) => void;
}) {
  const ops = createItemOps(
    section.items,
    (items) => onChange({ ...section, items }),
    newPublicationItem,
  );

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
                    [item.publisher, formatResumeDate(item.date)].filter(Boolean).join(' \u00b7 ') ||
                    undefined
                  }
                  defaultOpen={index === 0 && !item.title}
                  removeLabel="publication"
                  placeholder="Untitled publication"
                  dragHandleProps={{ ...attributes, ...listeners }}
                  onDuplicate={() => ops.duplicate(item.id)}
                  onRemove={() => ops.remove(item.id)}
                >
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Title" className="sm:col-span-2">
                      <Input
                        value={item.title}
                        onChange={(event) => ops.update(item.id, { title: event.target.value })}
                      />
                    </Field>
                    <Field label="Authors" hint="List in the order they appear on the paper.">
                      <Input
                        value={item.authors}
                        placeholder="Chen A., Okafor N., Silva R."
                        onChange={(event) => ops.update(item.id, { authors: event.target.value })}
                      />
                    </Field>
                    <Field label="Publisher or venue">
                      <Input
                        value={item.publisher}
                        placeholder="ACM SIGMOD"
                        onChange={(event) => ops.update(item.id, { publisher: event.target.value })}
                      />
                    </Field>
                    <Field label="Date" optional>
                      <MonthPicker
                        label="Published"
                        value={item.date}
                        onChange={(date) => ops.update(item.id, { date })}
                      />
                    </Field>
                    <Field label="DOI or URL" optional>
                      <Input
                        value={item.url}
                        placeholder="doi.org/10.1145/..."
                        onChange={(event) => ops.update(item.id, { url: event.target.value })}
                      />
                    </Field>
                    <Field label="Abstract or note" optional className="sm:col-span-2">
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
                </ItemCard>
              )}
            </SortableItem>
          ))}
        </div>
      </SortableList>

      <Button size="sm" variant="subtle" leadingIcon={<Plus />} onClick={ops.add}>
        Add publication
      </Button>
    </div>
  );
}

// --- Languages --------------------------------------------------------------

const PROFICIENCIES = [
  'Native',
  'Bilingual',
  'Fluent',
  'Professional',
  'Conversational',
  'Basic',
];

export function LanguagesSectionEditor({
  section,
  onChange,
}: {
  section: LanguagesSection;
  onChange: (section: LanguagesSection) => void;
}) {
  const ops = createItemOps(
    section.items,
    (items) => onChange({ ...section, items }),
    newLanguageItem,
  );

  return (
    <div className="space-y-3">
      <SortableList ids={ops.items.map((item) => item.id)} onReorder={ops.reorder}>
        <ul className="space-y-2">
          {ops.items.map((item, index) => (
            <SortableItem key={item.id} id={item.id}>
              {({ attributes, listeners }) => (
                <li className="flex items-center gap-2 rounded-lg border border-border bg-surface p-2">
                  <span
                    {...attributes}
                    {...listeners}
                    className="flex h-7 w-5 shrink-0 cursor-grab items-center justify-center
                      rounded text-muted-foreground hover:text-foreground active:cursor-grabbing"
                  >
                    <GripVertical aria-hidden="true" className="h-4 w-4" />
                  </span>
                  <Input
                    value={item.name}
                    inputSize="sm"
                    aria-label={`Language ${index + 1}`}
                    placeholder="Language"
                    onChange={(event) => ops.update(item.id, { name: event.target.value })}
                  />
                  <Select
                    value={item.proficiency}
                    selectSize="sm"
                    aria-label={`Proficiency in ${item.name || 'this language'}`}
                    placeholder="Proficiency"
                    className="max-w-[12rem]"
                    options={PROFICIENCIES.map((value) => ({ value, label: value }))}
                    onChange={(event) => ops.update(item.id, { proficiency: event.target.value })}
                  />
                  <IconButton
                    size="sm"
                    variant="ghost"
                    label={`Remove ${item.name || 'language'}`}
                    icon={<Trash2 />}
                    onClick={() => ops.remove(item.id)}
                  />
                </li>
              )}
            </SortableItem>
          ))}
        </ul>
      </SortableList>

      <Button size="sm" variant="subtle" leadingIcon={<Plus />} onClick={ops.add}>
        Add language
      </Button>
    </div>
  );
}

// --- Interests --------------------------------------------------------------

export function TagsSectionEditor({
  section,
  onChange,
}: {
  section: TagsSection;
  onChange: (section: TagsSection) => void;
}) {
  return (
    <Field
      label={section.title}
      hint="Rendered as a single comma-separated line. Keep it to a handful."
    >
      <TagInput
        value={section.tags}
        ariaLabel={section.title}
        placeholder="Long-distance running, open-source mapping"
        onChange={(tags) => onChange({ ...section, tags })}
      />
    </Field>
  );
}

// --- References -------------------------------------------------------------

export function ReferencesSectionEditor({
  section,
  onChange,
}: {
  section: ReferencesSection;
  onChange: (section: ReferencesSection) => void;
}) {
  const ops = createItemOps(
    section.items,
    (items) => onChange({ ...section, items }),
    newReferenceItem,
  );

  return (
    <div className="space-y-4">
      <Switch
        checked={section.hideDetails}
        label="Print &ldquo;References available on request&rdquo; instead of details"
        description="Recommended. Share a referee's contact details only once they have agreed."
        onChange={(hideDetails) => onChange({ ...section, hideDetails })}
      />

      {!section.hideDetails && (
        <>
          <SortableList ids={ops.items.map((item) => item.id)} onReorder={ops.reorder}>
            <div className="space-y-2">
              {ops.items.map((item, index) => (
                <SortableItem key={item.id} id={item.id}>
                  {({ attributes, listeners }) => (
                    <ItemCard
                      title={item.name}
                      subtitle={[item.title, item.company].filter(Boolean).join(', ') || undefined}
                      defaultOpen={index === 0 && !item.name}
                      removeLabel="referee"
                      placeholder="Unnamed referee"
                      dragHandleProps={{ ...attributes, ...listeners }}
                      onRemove={() => ops.remove(item.id)}
                    >
                      <div className="grid gap-4 sm:grid-cols-2">
                        <Field label="Name">
                          <Input
                            value={item.name}
                            onChange={(event) => ops.update(item.id, { name: event.target.value })}
                          />
                        </Field>
                        <Field label="Their title">
                          <Input
                            value={item.title}
                            onChange={(event) => ops.update(item.id, { title: event.target.value })}
                          />
                        </Field>
                        <Field label="Company">
                          <Input
                            value={item.company}
                            onChange={(event) =>
                              ops.update(item.id, { company: event.target.value })
                            }
                          />
                        </Field>
                        <Field label="Relationship" optional>
                          <Input
                            value={item.relationship}
                            placeholder="Former manager"
                            onChange={(event) =>
                              ops.update(item.id, { relationship: event.target.value })
                            }
                          />
                        </Field>
                        <Field label="Email" optional>
                          <Input
                            type="email"
                            value={item.email}
                            onChange={(event) => ops.update(item.id, { email: event.target.value })}
                          />
                        </Field>
                        <Field label="Phone" optional>
                          <Input
                            type="tel"
                            value={item.phone}
                            onChange={(event) => ops.update(item.id, { phone: event.target.value })}
                          />
                        </Field>
                      </div>
                    </ItemCard>
                  )}
                </SortableItem>
              ))}
            </div>
          </SortableList>

          <Button size="sm" variant="subtle" leadingIcon={<Plus />} onClick={ops.add}>
            Add referee
          </Button>

          <Alert tone="warning" title="Ask first">
            Publishing someone's contact details without asking them is a good way to lose a
            reference. Most employers request them separately anyway.
          </Alert>
        </>
      )}
    </div>
  );
}
