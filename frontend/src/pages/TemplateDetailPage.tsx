import { useQuery } from '@tanstack/react-query';
import { ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { queryClient, queryKeys } from '@/app/queryClient';
import { AdSlot } from '@/components/ads/AdSlot';
import { breadcrumbJsonLd, faqJsonLd, Seo, webPageJsonLd } from '@/components/seo/Seo';
import { Badge, Button, ButtonLink, Card } from '@/components/ui';
import { defaultSettings } from '@/features/resume/defaults';
import { ResumeDocument } from '@/features/resume/render/ResumeDocument';
import { sampleResumeData, sampleSettings } from '@/features/resume/sampleData';
import { TEMPLATES, templateBySlug } from '@/features/resume/templates/registry';
import {
  ATS_RATING_LABELS,
  CATEGORY_LABELS,
  LAYOUT_LABELS,
} from '@/features/resume/templates/types';
import { errorMessage } from '@/lib/api-client';
import { resumeService } from '@/services/resume.service';
import { templatesService } from '@/services/templates.service';
import { useIsAuthenticated } from '@/store/auth';
import { toast } from '@/store/toast';

const faqs = (name: string) => [
  {
    question: `Is ${name} safe for an ATS?`,
    answer:
      'We label every template Excellent or Good. Excellent means a single column with standard headings. Good means a human will like it, but some older parsers may read columns out of order.',
  },
  {
    question: 'Can I switch templates later?',
    answer: 'Yes. Your content stays in one ResumeData document. Switching only changes layout and a few defaults.',
  },
];

export default function TemplateDetailPage() {
  const { slug = '' } = useParams();
  const navigate = useNavigate();
  const local = templateBySlug(slug);
  const signedIn = useIsAuthenticated();
  const [starting, setStarting] = useState(false);

  const remote = useQuery({
    queryKey: queryKeys.template(slug),
    queryFn: () => templatesService.get(slug),
    enabled: Boolean(slug),
    retry: false,
  });

  if (!local) {
    return (
      <div className="mx-auto max-w-wide px-4 py-16 sm:px-6">
        <Seo title="Template not found" description="That template does not exist." path={`/resume-template/${slug}`} noindex />
        <h1 className="text-2xl font-semibold">We could not find that template</h1>
        <ButtonLink to="/resume-templates" className="mt-4">
          Browse templates
        </ButtonLink>
      </div>
    );
  }

  const related = TEMPLATES.filter(
    (template) => template.category === local.category && template.id !== local.id,
  ).slice(0, 3);
  const startTo = `/register?template=${local.id}`;

  const startWithTemplate = async () => {
    setStarting(true);
    try {
      const resume = await resumeService.create({
        title: `${local.name} resume`,
        templateId: local.id,
        settings: { ...defaultSettings(), ...local.settingsDefaults },
      });
      void queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
      void queryClient.invalidateQueries({ queryKey: ['resumes'] });
      navigate(`/resume/${resume.id}/edit`);
    } catch (error) {
      toast.error('Could not start this template', errorMessage(error));
      setStarting(false);
    }
  };

  return (
    <>
      <Seo
        title={`${local.name} resume template`}
        description={local.description}
        path={`/resume-template/${local.slug}`}
        keywords={[local.name, 'resume template', 'ats resume template']}
        jsonLd={[
          webPageJsonLd({
            name: `${local.name} resume template`,
            description: local.description,
            path: `/resume-template/${local.slug}`,
          }),
          breadcrumbJsonLd([
            { name: 'Home', path: '/' },
            { name: 'Templates', path: '/resume-templates' },
            { name: local.name, path: `/resume-template/${local.slug}` },
          ]),
          faqJsonLd(faqs(local.name)),
        ]}
      />

      <div className="mx-auto grid max-w-wide gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_0.9fr]">
        <div>
          <p className="text-xs text-muted-foreground">
            <Link to="/resume-templates" className="link-underline">
              Templates
            </Link>{' '}
            / {CATEGORY_LABELS[local.category]}
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground">{local.name}</h1>
          <p className="mt-3 text-muted-foreground text-pretty">{local.description}</p>

          <div className="mt-4 flex flex-wrap gap-2">
            <Badge tone={local.atsRating === 'excellent' ? 'success' : 'warning'}>
              {ATS_RATING_LABELS[local.atsRating]}
            </Badge>
            <Badge tone="outline">{LAYOUT_LABELS[local.layout]}</Badge>
            {local.isPremium && (
              <Badge tone="pro" uppercase>
                Pro
              </Badge>
            )}
            {remote.data?.isRecommended && <Badge tone="accent">Recommended</Badge>}
          </div>

          <ul className="mt-6 space-y-1 text-sm text-muted-foreground">
            {local.bestFor.filter(Boolean).map((item) => (
              <li key={item}>Best for {String(item).toLowerCase()}</li>
            ))}
          </ul>

          <div className="mt-8 flex flex-wrap gap-3">
            {signedIn ? (
              <Button trailingIcon={<ArrowRight />} loading={starting} onClick={() => void startWithTemplate()}>
                Use this template
              </Button>
            ) : (
              <ButtonLink to={startTo} trailingIcon={<ArrowRight />}>
                Use this template
              </ButtonLink>
            )}
            <ButtonLink to="/ats-resume-checker" variant="secondary">
              Check a resume first
            </ButtonLink>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-border bg-surface-sunken p-4">
          <ResumeDocument
            data={sampleResumeData()}
            settings={sampleSettings(local.settingsDefaults)}
            templateId={local.id}
            showPageBoundaries={false}
            zoom={0.72}
          />
        </div>
      </div>

      {related.length > 0 && (
        <section className="mx-auto max-w-wide px-4 pb-16 sm:px-6">
          <h2 className="text-lg font-semibold text-foreground">Related templates</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            {related.map((template) => (
              <Card key={template.id} interactive as="article">
                <h3 className="text-sm font-semibold">
                  <Link to={`/resume-template/${template.slug}`} className="link-underline">
                    {template.name}
                  </Link>
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">{template.description}</p>
              </Card>
            ))}
          </div>
          <AdSlot slot="templates" className="mt-8" />
        </section>
      )}
    </>
  );
}
