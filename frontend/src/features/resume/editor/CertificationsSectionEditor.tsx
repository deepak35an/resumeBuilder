import { Plus } from 'lucide-react';

import { Button, EmptyState, Field, Input, MonthPicker } from '@/components/ui';
import { ItemCard } from '@/features/resume/editor/ItemCard';
import { SortableItem, SortableList } from '@/features/resume/editor/SortableList';
import { createItemOps } from '@/features/resume/editor/itemOps';
import { formatResumeDate } from '@/features/resume/formatting';
import { newCertificationItem } from '@/features/resume/sections';
import type { CertificationsSection } from '@/types/resume';

export function CertificationsSectionEditor({
  section,
  onChange,
}: {
  section: CertificationsSection;
  onChange: (section: CertificationsSection) => void;
}) {
  const ops = createItemOps(
    section.items,
    (items) => onChange({ ...section, items }),
    newCertificationItem,
  );

  if (ops.items.length === 0) {
    return (
      <EmptyState
        title="No certifications yet"
        description="Include the issuing organisation - applicant tracking systems often look for it."
        action={
          <Button leadingIcon={<Plus />} onClick={ops.add}>
            Add certification
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
                    [item.issuer, formatResumeDate(item.date)].filter(Boolean).join(' \u00b7 ') ||
                    undefined
                  }
                  defaultOpen={index === 0 && !item.name}
                  removeLabel="certification"
                  placeholder="Untitled certification"
                  dragHandleProps={{ ...attributes, ...listeners }}
                  onDuplicate={() => ops.duplicate(item.id)}
                  onRemove={() => ops.remove(item.id)}
                >
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Certification" className="sm:col-span-2">
                      <Input
                        value={item.name}
                        placeholder="AWS Certified Solutions Architect - Associate"
                        onChange={(event) => ops.update(item.id, { name: event.target.value })}
                      />
                    </Field>
                    <Field label="Issuing organisation">
                      <Input
                        value={item.issuer}
                        placeholder="Amazon Web Services"
                        onChange={(event) => ops.update(item.id, { issuer: event.target.value })}
                      />
                    </Field>
                    <Field label="Credential ID" optional>
                      <Input
                        value={item.credentialId}
                        placeholder="ABC-123456"
                        onChange={(event) =>
                          ops.update(item.id, { credentialId: event.target.value })
                        }
                      />
                    </Field>
                    <Field label="Issued">
                      <MonthPicker
                        label="Issued"
                        value={item.date}
                        onChange={(date) => ops.update(item.id, { date })}
                      />
                    </Field>
                    <Field label="Expires" optional>
                      <MonthPicker
                        label="Expires"
                        value={item.expiry}
                        onChange={(expiry) => ops.update(item.id, { expiry })}
                      />
                    </Field>
                    <Field label="Credential URL" optional className="sm:col-span-2">
                      <Input
                        value={item.credentialUrl}
                        placeholder="credly.com/badges/..."
                        onChange={(event) =>
                          ops.update(item.id, { credentialUrl: event.target.value })
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
        Add certification
      </Button>
    </div>
  );
}
