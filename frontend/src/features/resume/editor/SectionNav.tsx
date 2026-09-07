/** Left panel: contact block plus a reorderable, hideable list of sections. */

import {
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  GripVertical,
  MoreVertical,
  Pencil,
  Plus,
  Trash2,
  User,
} from 'lucide-react';
import { useState } from 'react';

import { Button, Dropdown, IconButton, Input } from '@/components/ui';
import { AddSectionModal } from '@/features/resume/editor/AddSectionModal';
import { SortableItem, SortableList } from '@/features/resume/editor/SortableList';
import { sectionItemCount } from '@/features/resume/sections';
import { cn } from '@/lib/utils';
import { useResumeEditor } from '@/store/resumeEditor';
import type { ResumeSection } from '@/types/resume';

export const PERSONAL_PANEL_ID = '__personal__';

export function SectionNav({ onNavigate }: { onNavigate?: () => void }) {
  const sections = useResumeEditor((state) => state.doc?.data.sections ?? []);
  const activeSectionId = useResumeEditor((state) => state.activeSectionId);
  const setActiveSection = useResumeEditor((state) => state.setActiveSection);
  const addSection = useResumeEditor((state) => state.addSection);
  const removeSection = useResumeEditor((state) => state.removeSection);
  const renameSection = useResumeEditor((state) => state.renameSection);
  const toggleVisibility = useResumeEditor((state) => state.toggleSectionVisibility);
  const reorderSections = useResumeEditor((state) => state.reorderSections);
  const moveSection = useResumeEditor((state) => state.moveSection);

  const [adding, setAdding] = useState(false);
  const [renamingId, setRenamingId] = useState<string | null>(null);

  const select = (id: string) => {
    setActiveSection(id);
    onNavigate?.();
  };

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-border p-3">
        <button
          type="button"
          onClick={() => select(PERSONAL_PANEL_ID)}
          className={cn(
            'flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm transition-colors',
            activeSectionId === PERSONAL_PANEL_ID
              ? 'bg-accent-subtle text-accent-strong'
              : 'text-foreground hover:bg-muted',
          )}
        >
          <User aria-hidden="true" className="h-4 w-4" />
          <span className="font-medium">Contact details</span>
        </button>
      </div>

      <div className="flex items-center justify-between px-4 pb-1.5 pt-3">
        <h2 className="text-2xs font-semibold uppercase tracking-wider text-muted-foreground">
          Sections
        </h2>
        <span className="text-2xs text-muted-foreground">{sections.length}</span>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-2 pb-2">
        <SortableList ids={sections.map((section) => section.id)} onReorder={reorderSections}>
          <ul className="space-y-0.5">
            {sections.map((section, index) => (
              <SortableItem key={section.id} id={section.id}>
                {({ attributes, listeners, isDragging }) => (
                  <SectionRow
                    section={section}
                    active={section.id === activeSectionId}
                    dragging={isDragging}
                    renaming={renamingId === section.id}
                    isFirst={index === 0}
                    isLast={index === sections.length - 1}
                    dragHandleProps={{ ...attributes, ...listeners }}
                    onSelect={() => select(section.id)}
                    onStartRename={() => setRenamingId(section.id)}
                    onRename={(title) => {
                      renameSection(section.id, title);
                      setRenamingId(null);
                    }}
                    onCancelRename={() => setRenamingId(null)}
                    onToggleVisibility={() => toggleVisibility(section.id)}
                    onRemove={() => removeSection(section.id)}
                    onMoveUp={() => moveSection(section.id, -1)}
                    onMoveDown={() => moveSection(section.id, 1)}
                  />
                )}
              </SortableItem>
            ))}
          </ul>
        </SortableList>
      </div>

      <div className="border-t border-border p-3">
        <Button
          variant="secondary"
          fullWidth
          leadingIcon={<Plus />}
          onClick={() => setAdding(true)}
        >
          Add section
        </Button>
      </div>

      <AddSectionModal
        open={adding}
        onClose={() => setAdding(false)}
        existingTypes={sections.map((section) => section.type)}
        onAdd={(type) => {
          addSection(type);
          onNavigate?.();
        }}
      />
    </div>
  );
}

interface SectionRowProps {
  section: ResumeSection;
  active: boolean;
  dragging: boolean;
  renaming: boolean;
  isFirst: boolean;
  isLast: boolean;
  dragHandleProps: Record<string, unknown>;
  onSelect: () => void;
  onStartRename: () => void;
  onRename: (title: string) => void;
  onCancelRename: () => void;
  onToggleVisibility: () => void;
  onRemove: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}

function SectionRow({
  section,
  active,
  dragging,
  renaming,
  isFirst,
  isLast,
  dragHandleProps,
  onSelect,
  onStartRename,
  onRename,
  onCancelRename,
  onToggleVisibility,
  onRemove,
  onMoveUp,
  onMoveDown,
}: SectionRowProps) {
  const count = sectionItemCount(section);

  if (renaming) {
    return (
      <li className="px-1 py-0.5">
        <Input
          defaultValue={section.title}
          inputSize="sm"
          autoFocus
          aria-label={`Rename ${section.title}`}
          onBlur={(event) => onRename(event.target.value.trim() || section.title)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              onRename(event.currentTarget.value.trim() || section.title);
            }
            if (event.key === 'Escape') onCancelRename();
          }}
        />
      </li>
    );
  }

  return (
    <li
      className={cn(
        'group flex items-center gap-0.5 rounded-lg pr-1 transition-colors',
        active ? 'bg-accent-subtle' : 'hover:bg-muted',
        dragging && 'bg-surface shadow-md',
      )}
    >
      <span
        {...dragHandleProps}
        className="flex h-8 w-5 shrink-0 cursor-grab items-center justify-center text-muted-foreground
          opacity-0 transition-opacity hover:text-foreground focus-visible:opacity-100
          active:cursor-grabbing group-hover:opacity-100"
      >
        <GripVertical aria-hidden="true" className="h-4 w-4" />
      </span>

      <button
        type="button"
        onClick={onSelect}
        aria-current={active ? 'true' : undefined}
        className="flex min-w-0 flex-1 items-center gap-2 py-2 text-left focus-visible:outline-none"
      >
        <span
          className={cn(
            'min-w-0 flex-1 truncate text-sm',
            active ? 'font-medium text-accent-strong' : 'text-foreground',
            !section.visible && 'text-muted-foreground line-through decoration-1',
          )}
        >
          {section.title}
        </span>
        {count > 0 && (
          <span className="shrink-0 text-2xs tabular-nums text-muted-foreground">{count}</span>
        )}
      </button>

      <IconButton
        size="xs"
        variant="ghost"
        label={section.visible ? `Hide ${section.title}` : `Show ${section.title}`}
        icon={section.visible ? <Eye /> : <EyeOff />}
        className={cn(
          'shrink-0 transition-opacity',
          section.visible && 'opacity-0 group-hover:opacity-100 focus-visible:opacity-100',
        )}
        onClick={onToggleVisibility}
      />

      <Dropdown
        menuLabel={`${section.title} actions`}
        items={[
          { id: 'rename', label: 'Rename', icon: <Pencil />, onSelect: onStartRename },
          {
            id: 'up',
            label: 'Move up',
            icon: <ChevronUp />,
            disabled: isFirst,
            onSelect: onMoveUp,
          },
          {
            id: 'down',
            label: 'Move down',
            icon: <ChevronDown />,
            disabled: isLast,
            onSelect: onMoveDown,
          },
          {
            id: 'visibility',
            label: section.visible ? 'Hide from resume' : 'Show on resume',
            icon: section.visible ? <EyeOff /> : <Eye />,
            onSelect: onToggleVisibility,
            separatorBefore: true,
          },
          {
            id: 'remove',
            label: 'Delete section',
            icon: <Trash2 />,
            tone: 'danger',
            onSelect: onRemove,
          },
        ]}
        trigger={({ toggle, ref }) => (
          <IconButton
            ref={ref}
            size="xs"
            variant="ghost"
            label={`${section.title} actions`}
            icon={<MoreVertical />}
            className="shrink-0 opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
            onClick={toggle}
          />
        )}
      />
    </li>
  );
}
