import { useEffect, useMemo, useState } from 'react';

import { Badge, Button, Input, Modal } from '@/components/ui';
import { TEMPLATES } from '@/features/resume/templates/registry';
import {
  ATS_RATING_LABELS,
  CATEGORY_LABELS,
  type TemplateCategory,
  type TemplateDefinition,
} from '@/features/resume/templates/types';
import { cn } from '@/lib/utils';

type CategoryFilter = 'all' | TemplateCategory;

const CATEGORY_OPTIONS: Array<{ value: CategoryFilter; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'ats', label: CATEGORY_LABELS.ats },
  { value: 'tech', label: CATEGORY_LABELS.tech },
  { value: 'business', label: CATEGORY_LABELS.business },
  { value: 'student', label: CATEGORY_LABELS.student },
  { value: 'creative', label: CATEGORY_LABELS.creative },
];

export function TemplatePickerModal({
  open,
  onClose,
  onConfirm,
  busy = false,
  title = 'Choose a template',
  confirmLabel = 'Use this template',
  initialTemplateId = 'classic-ats',
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: (template: TemplateDefinition) => void;
  busy?: boolean;
  title?: string;
  confirmLabel?: string;
  initialTemplateId?: string;
}) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<CategoryFilter>('all');
  const [selectedId, setSelectedId] = useState(initialTemplateId);

  useEffect(() => {
    if (!open) return;
    setSelectedId(initialTemplateId);
    setQuery('');
    setCategory('all');
  }, [open, initialTemplateId]);

  const items = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return TEMPLATES.filter((template) => {
      if (category !== 'all' && template.category !== category) return false;
      if (!needle) return true;
      return (
        template.name.toLowerCase().includes(needle) ||
        template.description.toLowerCase().includes(needle) ||
        template.bestFor.some((tag) => (tag ?? '').toLowerCase().includes(needle))
      );
    });
  }, [category, query]);

  const selected = TEMPLATES.find((template) => template.id === selectedId) ?? TEMPLATES[0];

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      description="Your content stays the same. The template only changes layout and a few defaults."
      size="xl"
      footer={
        <div className="flex flex-wrap items-center justify-end gap-2">
          <Button variant="secondary" onClick={onClose} disabled={busy}>
            Cancel
          </Button>
          <Button loading={busy} disabled={!selected} onClick={() => selected && onConfirm(selected)}>
            {confirmLabel}
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-3">
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search templates"
          aria-label="Search templates"
        />
        <div className="flex flex-wrap gap-1.5">
          {CATEGORY_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setCategory(option.value)}
              className={cn(
                'rounded-full px-2.5 py-1 text-xs transition-colors',
                category === option.value
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:text-foreground',
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
        <ul className="grid max-h-[min(24rem,50vh)] gap-2 overflow-y-auto sm:grid-cols-2">
          {items.map((template) => {
            const active = template.id === selected?.id;
            return (
              <li key={template.id}>
                <button
                  type="button"
                  onClick={() => setSelectedId(template.id)}
                  className={cn(
                    'flex h-full w-full flex-col gap-1.5 rounded-xl border p-3 text-left transition-colors',
                    active
                      ? 'border-accent bg-muted ring-2 ring-accent'
                      : 'border-border hover:border-border-strong',
                  )}
                >
                  <span className="flex flex-wrap items-center gap-1.5">
                    <span className="text-sm font-semibold text-foreground">{template.name}</span>
                    {template.supportsPhoto && (
                      <Badge tone="outline" size="xs" uppercase>
                        Photo
                      </Badge>
                    )}
                  </span>
                  <span className="text-xs text-muted-foreground">{CATEGORY_LABELS[template.category]}</span>
                  <span className="text-xs text-muted-foreground text-pretty">{template.description}</span>
                  <Badge tone={template.atsRating === 'excellent' ? 'success' : 'warning'} size="xs" className="mt-auto w-fit">
                    {ATS_RATING_LABELS[template.atsRating]}
                  </Badge>
                </button>
              </li>
            );
          })}
        </ul>
        {items.length === 0 && (
          <p className="text-sm text-muted-foreground">No templates match that search.</p>
        )}
      </div>
    </Modal>
  );
}
