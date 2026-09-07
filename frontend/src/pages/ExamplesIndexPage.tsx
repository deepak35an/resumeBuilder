import { Link } from 'react-router-dom';

import { AdSlot } from '@/components/ads/AdSlot';
import { breadcrumbJsonLd, Seo, webPageJsonLd } from '@/components/seo/Seo';
import { Card } from '@/components/ui';
import { EXAMPLE_ROLES } from '@/features/examples/roles';

export default function ExamplesIndexPage() {
  return (
    <>
      <Seo
        title="Resume Examples by Role"
        description="Fictional resume examples for 24 roles, with ATS tips and recommended templates. No real personal data."
        path="/resume-examples"
        keywords={['resume examples', 'software engineer resume', 'fresher resume']}
        jsonLd={[
          webPageJsonLd({
            name: 'Resume Examples by Role',
            description: 'Sample resumes by role, with ATS tips and recommended templates.',
            path: '/resume-examples',
          }),
          breadcrumbJsonLd([
            { name: 'Home', path: '/' },
            { name: 'Resume Examples', path: '/resume-examples' },
          ]),
        ]}
      />

      <section className="border-b border-border">
        <div className="mx-auto max-w-wide px-4 py-12 sm:px-6">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Resume examples, written as examples
          </h1>
          <p className="mt-3 max-w-2xl text-muted-foreground text-pretty">
            Every sample uses fictional people and employers. Use them for structure and wording —
            not as something to copy into an application.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-wide px-4 py-10 sm:px-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {EXAMPLE_ROLES.map((role) => (
            <Card key={role.slug} interactive as="article">
              <h2 className="text-base font-semibold text-foreground">
                <Link to={`/resume-examples/${role.slug}`} className="link-underline">
                  {role.title}
                </Link>
              </h2>
              <p className="mt-2 text-sm text-muted-foreground text-pretty">{role.excerpt}</p>
            </Card>
          ))}
        </div>
        <AdSlot slot="examples" className="mt-10" />
      </div>
    </>
  );
}
