import { breadcrumbJsonLd, Seo, webPageJsonLd } from '@/components/seo/Seo';
import { config } from '@/lib/config';

export default function TermsPage() {
  return (
    <>
      <Seo
        title="Terms of Use"
        description="Terms for using ResumeForge, including accounts, acceptable use and paid plans."
        path="/terms"
        jsonLd={[
          webPageJsonLd({
            name: 'Terms of Use',
            description: 'ResumeForge terms of use.',
            path: '/terms',
          }),
          breadcrumbJsonLd([
            { name: 'Home', path: '/' },
            { name: 'Terms', path: '/terms' },
          ]),
        ]}
      />
      <article className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">Terms of Use</h1>
        <p className="mt-2 text-sm text-muted-foreground">Last updated 7 September 2026</p>

        <h2 className="mt-10 text-xl font-semibold text-foreground">The service</h2>
        <p className="mt-3 text-sm text-muted-foreground text-pretty">
          ResumeForge provides tools to write, check, match and export resumes. ATS scores and AI
          suggestions are estimates and assistance. You remain responsible for the accuracy of
          anything you submit to an employer.
        </p>

        <h2 className="mt-8 text-xl font-semibold text-foreground">Your account</h2>
        <p className="mt-3 text-sm text-muted-foreground text-pretty">
          You must provide a real email address and keep your password secret. You may not upload
          malware, scrape the service, or use another person’s content without permission. We may
          suspend accounts that abuse quotas or attack the service.
        </p>

        <h2 className="mt-8 text-xl font-semibold text-foreground">Your content</h2>
        <p className="mt-3 text-sm text-muted-foreground text-pretty">
          You own the resumes you write. You grant us a limited licence to store and process that
          content so the product can function (preview, score, export, backup). We do not claim
          ownership of your work history.
        </p>

        <h2 className="mt-8 text-xl font-semibold text-foreground">Paid plans</h2>
        <p className="mt-3 text-sm text-muted-foreground text-pretty">
          Pro features are described on the pricing page. Local and development environments may use
          a no-charge provider that applies Pro without a card. Refunds, if any, are handled by the
          payment provider shown at checkout.
        </p>

        <h2 className="mt-8 text-xl font-semibold text-foreground">Contact</h2>
        <p className="mt-3 text-sm text-muted-foreground">
          <a className="link-underline" href={`mailto:${config.supportEmail}`}>
            {config.supportEmail}
          </a>
        </p>
      </article>
    </>
  );
}
