import { GripVertical, Plus, Trash2 } from 'lucide-react';

import { Alert, Button, Field, IconButton, Input, SegmentedControl, TagInput } from '@/components/ui';
import { SortableItem, SortableList } from '@/features/resume/editor/SortableList';
import { createItemOps } from '@/features/resume/editor/itemOps';
import { newSkillGroup } from '@/features/resume/sections';
import type { SkillsSection } from '@/types/resume';

const SUGGESTIONS: Record<string, string[]> = {
  'technical-skills': [
    'Python',
    'TypeScript',
    'React',
    'SQL',
    'Docker',
    'AWS',
    'Git',
    'PostgreSQL',
  ],
  'soft-skills': [
    'Stakeholder communication',
    'Mentoring',
    'Cross-functional collaboration',
    'Prioritisation',
  ],
};

export function SkillsSectionEditor({
  section,
  onChange,
}: {
  section: SkillsSection;
  onChange: (section: SkillsSection) => void;
}) {
  const ops = createItemOps(section.groups, (groups) => onChange({ ...section, groups }), () =>
    newSkillGroup(),
  );
  const suggestions = SUGGESTIONS[section.type] ?? [];

  return (
    <div className="space-y-4">
      <SegmentedControl
        label="Skill layout"
        size="sm"
        value={section.display}
        onChange={(display) => onChange({ ...section, display })}
        options={[
          { value: 'grouped', label: 'Grouped by category' },
          { value: 'inline', label: 'One flowing line' },
        ]}
      />

      {section.groups.length === 0 && (
        <p className="text-sm text-muted-foreground">
          Add a category such as Languages, Frameworks or Tools, then list the skills inside it.
        </p>
      )}

      <SortableList ids={ops.items.map((group) => group.id)} onReorder={ops.reorder}>
        <div className="space-y-3">
          {ops.items.map((group, index) => (
            <SortableItem key={group.id} id={group.id}>
              {({ attributes, listeners }) => (
                <div className="rounded-xl border border-border bg-surface p-3">
                  <div className="mb-2 flex items-center gap-1">
                    <span
                      {...attributes}
                      {...listeners}
                      className="flex h-7 w-5 shrink-0 cursor-grab items-center justify-center
                        rounded text-muted-foreground hover:text-foreground active:cursor-grabbing"
                    >
                      <GripVertical aria-hidden="true" className="h-4 w-4" />
                    </span>
                    <Input
                      value={group.name}
                      inputSize="sm"
                      aria-label={`Category ${index + 1} name`}
                      placeholder="Category, e.g. Languages"
                      className="max-w-[16rem] font-medium"
                      onChange={(event) => ops.update(group.id, { name: event.target.value })}
                    />
                    <span className="ml-auto text-xs text-muted-foreground">
                      {group.skills.length} skills
                    </span>
                    <IconButton
                      size="sm"
                      variant="ghost"
                      label={`Remove ${group.name || 'category'}`}
                      icon={<Trash2 />}
                      onClick={() => ops.remove(group.id)}
                    />
                  </div>

                  <Field>
                    <TagInput
                      value={group.skills}
                      suggestions={index === 0 ? suggestions : []}
                      ariaLabel={`Skills in ${group.name || 'this category'}`}
                      placeholder="Type a skill and press Enter"
                      onChange={(skills) => ops.update(group.id, { skills })}
                    />
                  </Field>
                </div>
              )}
            </SortableItem>
          ))}
        </div>
      </SortableList>

      <Button size="sm" variant="subtle" leadingIcon={<Plus />} onClick={ops.add}>
        Add category
      </Button>

      <Alert tone="neutral" title="Why there are no skill bars">
        Progress bars and star ratings cannot be read by applicant tracking systems, and a recruiter
        has no way to interpret "React: 80%". ResumeForge always renders skills as plain text.
      </Alert>
    </div>
  );
}
