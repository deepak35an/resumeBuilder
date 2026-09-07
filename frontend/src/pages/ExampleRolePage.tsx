import { Link, useParams } from 'react-router-dom';

import { AdSlot } from '@/components/ads/AdSlot';
import { breadcrumbJsonLd, faqJsonLd, Seo, webPageJsonLd } from '@/components/seo/Seo';
import { Accordion, Badge, ButtonLink, Card } from '@/components/ui';
import { exampleResumeForRole, exampleRoleBySlug } from '@/features/examples/roles';
import { ResumeDocument } from '@/features/resume/render/ResumeDocument';
import { sampleSettings } from '@/features/resume/sampleData';
import { templateById } from '@/features/resume/templates/registry';

export default function ExampleRolePage() {
  const { slug = '' } = useParams();
  const role = exampleRoleBySlug(slug);

  if (!role) {
    return (
      <div className="mx-auto max-w-wide px-4 py-16 sm:px-6">
        <Seo title="Example not found" description="That role example does not exist." noindex />
        <h1 className="text-2xl font-semibold">We do not have that example yet</h1>
        <ButtonLink to="/resume-examples" className="mt-4">
          All examples
        </ButtonLink>
      </div>
    );
  }

  const sample = exampleResumeForRole(role);
  const templateId = role.recommendedTemplates[0] ?? 'classic-ats';

  return (
    <>
      <Seo
        title={`${role.title} resume example`}
        description={role.headline}
        path={`/resume-examples/${role.slug}`}
        keywords={[`${role.title} resume`, 'resume example', 'ats resume']}
        jsonLd={[
          webPageJsonLd({
            name: `${role.title} resume example`,
            description: role.headline,
            path: `/resume-examples/${role.slug}`,
          }),
          breadcrumbJsonLd([
            { name: 'Home', path: '/' },
            { name: 'Resume Examples', path: '/resume-examples' },
            { name: role.title, path: `/resume-examples/${role.slug}` },
          ]),
          faqJsonLd(role.faqs),
        ]}
      />

      <div className="mx-auto max-w-wide px-4 py-12 sm:px-6">
        <p className="text-xs text-muted-foreground">
          <Link to="/resume-examples" className="link-underline">
            Examples
          </Link>{' '}
          / {role.title}
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground">
          {role.title} resume example
        </h1>
        <p className="mt-3 max-w-2xl text-muted-foreground text-pretty">{role.headline}</p>
        <Badge tone="outline" className="mt-4">
          Fictional sample — Jordan Hale is not a real person
        </Badge>

        <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_0.9fr]">
          <div className="overflow-hidden rounded-xl border border-border bg-surface-sunken p-4">
            <ResumeDocument
              data={sample}
              settings={sampleSettings()}
              templateId={templateId}
              showPageBoundaries={false}
              zoom={0.68}
            />
          </div>

          <div className="space-y-8">
            <section>
              <h2 className="text-lg font-semibold text-foreground">ATS tips</h2>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-muted-foreground">
                {role.atsTips.map((tip) => (
                  <li key={tip} className="text-pretty">
                    {tip}
                  </li>
                ))}
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground">Recommended templates</h2>
              <div className="mt-3 space-y-3">
                {role.recommendedTemplates.map((id) => {
                  const template = templateById(id);
                  return (
                    <Card key={id} interactive>
                      <h3 className="text-sm font-semibold">
                        <Link to={`/resume-template/${template.slug}`} className="link-underline">
                          {template.name}
                        </Link>
                      </h3>
                      <p className="mt-1 text-sm text-muted-foreground">{template.description}</p>
                    </Card>
                  );
                })}
              </div>
            </section>

            <ButtonLink to="/resume-builder">Build your own</ButtonLink>
          </div>
        </div>

        <section className="mt-12 max-w-3xl">
          <h2 className="text-lg font-semibold text-foreground">Questions</h2>
          <Accordion
            className="mt-4"
            items={role.faqs.map((faq, index) => ({
              id: `faq-${index}`,
              title: faq.question,
              content: <p className="text-sm text-muted-foreground text-pretty">{faq.answer}</p>,
            }))}
          />
        </section>

        <AdSlot slot="examples" className="mt-10" />
      </div>
    </>
  );
}
