import { useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';

import { AdSlot } from '@/components/ads/AdSlot';
import { breadcrumbJsonLd, Seo, webPageJsonLd } from '@/components/seo/Seo';
import { Badge, Input, SegmentedControl, Select } from '@/components/ui';
import { TemplateCard } from '@/features/resume/templates/TemplateCard';
import { TEMPLATES } from '@/features/resume/templates/registry';
import { CATEGORY_LABELS, type TemplateCategory } from '@/features/resume/templates/types';

type SortKey = 'recommended' | 'name' | 'ats';
type CategoryFilter = 'all' | TemplateCategory;

const CATEGORY_OPTIONS: Array<{ value: CategoryFilter; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'ats', label: CATEGORY_LABELS.ats },
  { value: 'tech', label: CATEGORY_LABELS.tech },
  { value: 'business', label: CATEGORY_LABELS.business },
  { value: 'student', label: CATEGORY_LABELS.student },
  { value: 'creative', label: CATEGORY_LABELS.creative },
];

export default function TemplatesPage() {
  const location = useLocation();
  const atsOnly = location.pathname === '/ats-resume-template';
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<CategoryFilter>(atsOnly ? 'ats' : 'all');
  const [sort, setSort] = useState<SortKey>('recommended');

  const items = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const filtered = TEMPLATES.filter((template) => {
      if (category !== 'all' && template.category !== category) return false;
      if (!needle) return true;
      return (
        template.name.toLowerCase().includes(needle) ||
        (template.description ?? '').toLowerCase().includes(needle) ||
        template.bestFor.some((tag) => (tag ?? '').toLowerCase().includes(needle))
      );
    });

    return [...filtered].sort((a, b) => {
      if (sort === 'name') return a.name.localeCompare(b.name);
      if (sort === 'ats') {
        if (a.atsRating === b.atsRating) return a.name.localeCompare(b.name);
        return a.atsRating === 'excellent' ? -1 : 1;
      }
      if (a.isPremium !== b.isPremium) return a.isPremium ? 1 : -1;
      return a.name.localeCompare(b.name);
    });
  }, [category, query, sort]);

  return (
    <>
      <Seo
        title={atsOnly ? 'ATS Resume Templates' : 'Resume Templates'}
        description="44 resume templates with live previews and honest ATS compatibility labels. Classic ATS is the default for unknown applicant systems."
        path={atsOnly ? '/ats-resume-template' : '/resume-templates'}
        keywords={['resume templates', 'ats resume template', 'ats friendly resume']}
        jsonLd={[
          webPageJsonLd({
            name: atsOnly ? 'ATS Resume Templates' : 'Resume Templates',
            description: '44 resume templates labelled with ATS compatibility.',
            path: atsOnly ? '/ats-resume-template' : '/resume-templates',
          }),
          breadcrumbJsonLd([
            { name: 'Home', path: '/' },
            { name: 'Templates', path: '/resume-templates' },
          ]),
        ]}
      />

      <section className="border-b border-border">
        <div className="mx-auto max-w-wide px-4 py-12 sm:px-6">
          <Badge tone="outline" uppercase>
            44 templates
          </Badge>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            {atsOnly ? 'ATS-first resume templates' : 'Templates that render your real resume'}
          </h1>
          <p className="mt-3 max-w-2xl text-muted-foreground text-pretty">
            Every card is a live preview of Jordan Hale’s fictional resume — the same components used
            in the editor. Sidebar and two-column layouts are labelled Good, never guaranteed.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-wide px-4 py-8 sm:px-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search templates"
            aria-label="Search templates"
            className="max-w-sm"
          />
          <div className="flex flex-wrap items-center gap-3">
            <SegmentedControl
              label="Category"
              value={category}
              onChange={setCategory}
              options={CATEGORY_OPTIONS}
            />
            <Select
              aria-label="Sort templates"
              value={sort}
              onChange={(event) => setSort(event.target.value as SortKey)}
              options={[
                { value: 'recommended', label: 'Recommended' },
                { value: 'ats', label: 'ATS rating' },
                { value: 'name', label: 'Name' },
              ]}
              selectSize="sm"
            />
          </div>
        </div>

        <p className="mt-4 text-sm text-muted-foreground">
          {items.length} template{items.length === 1 ? '' : 's'}
        </p>

        <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {items.map((template) => (
            <TemplateCard key={template.id} template={template} />
          ))}
        </div>

        <AdSlot slot="templates" className="mt-10" />
      </div>
    </>
  );
}
