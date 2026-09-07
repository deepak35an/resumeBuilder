import { Link } from 'react-router-dom';

import { Badge } from '@/components/ui';
import { ResumeDocument } from '@/features/resume/render/ResumeDocument';
import { sampleResumeData, sampleSettings } from '@/features/resume/sampleData';
import { ATS_RATING_LABELS, CATEGORY_LABELS, type TemplateDefinition } from '@/features/resume/templates/types';
import { cn } from '@/lib/utils';

export function TemplateCard({
  template,
  className,
}: {
  template: TemplateDefinition;
  className?: string;
}) {
  const settings = sampleSettings({
    fontSize: 8.5,
    ...template.settingsDefaults,
  });

  return (
    <article
      className={cn(
        'group flex flex-col overflow-hidden rounded-xl border border-border bg-surface',
        className,
      )}
    >
      <Link
        to={`/resume-template/${template.slug}`}
        className="relative block overflow-hidden bg-surface-sunken"
        aria-label={`${template.name} template`}
      >
        <div className="pointer-events-none flex h-56 items-start justify-center overflow-hidden p-3">
          <div className="origin-top scale-[0.32]">
            <ResumeDocument
              data={sampleResumeData()}
              settings={settings}
              templateId={template.id}
              showPageBoundaries={false}
              zoom={1}
            />
          </div>
        </div>
      </Link>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-sm font-semibold text-foreground">
            <Link to={`/resume-template/${template.slug}`} className="link-underline">
              {template.name}
            </Link>
          </h3>
          {template.isPremium && (
            <Badge tone="pro" size="xs" uppercase>
              Pro
            </Badge>
          )}
        </div>
        <p className="text-xs text-muted-foreground">{CATEGORY_LABELS[template.category]}</p>
        <p className="text-sm text-muted-foreground text-pretty">{template.description}</p>
        <Badge
          tone={template.atsRating === 'excellent' ? 'success' : 'warning'}
          size="xs"
          className="mt-auto w-fit"
        >
          {ATS_RATING_LABELS[template.atsRating]}
        </Badge>
      </div>
    </article>
  );
}
