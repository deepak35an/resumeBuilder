import { breadcrumbJsonLd, Seo, webPageJsonLd } from '@/components/seo/Seo';
import { config } from '@/lib/config';

export default function PrivacyPage() {
  return (
    <>
      <Seo
        title="Privacy Policy"
        description="How ResumeForge collects, uses and deletes account and resume data. We do not sell resume content."
        path="/privacy"
        jsonLd={[
          webPageJsonLd({
            name: 'Privacy Policy',
            description: 'ResumeForge privacy policy.',
            path: '/privacy',
          }),
          breadcrumbJsonLd([
            { name: 'Home', path: '/' },
            { name: 'Privacy', path: '/privacy' },
          ]),
        ]}
      />
      <article className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">Privacy Policy</h1>
        <p className="mt-2 text-sm text-muted-foreground">Last updated 7 September 2026</p>

        <h2 className="mt-10 text-xl font-semibold text-foreground">What we collect</h2>
        <p className="mt-3 text-sm text-muted-foreground text-pretty">
          When you create an account we store your name, email address, password hash, plan and
          optional onboarding answers. When you use the product we store the resumes, job
          descriptions, ATS reports and applications you create, plus usage counts needed for plan
          limits.
        </p>

        <h2 className="mt-8 text-xl font-semibold text-foreground">Resume content</h2>
        <p className="mt-3 text-sm text-muted-foreground text-pretty">
          We do not sell resume content. We do not share your resume, job descriptions or reports
          with advertisers, recruiters or data brokers. Content is used to provide the features you
          ask for: editing, ATS analysis, job matching, export and, if you use them, AI suggestions.
        </p>

        <h2 className="mt-8 text-xl font-semibold text-foreground">Cookies</h2>
        <p className="mt-3 text-sm text-muted-foreground text-pretty">
          Essential cookies keep you signed in. Optional analytics or advertising cookies are not
          set until you accept them in the cookie banner. See the{' '}
          <a href="/cookies" className="link-underline">
            cookie policy
          </a>
          .
        </p>

        <h2 className="mt-8 text-xl font-semibold text-foreground">Your controls</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-muted-foreground">
          <li>Export a machine-readable copy of your data from Settings → Data &amp; Privacy.</li>
          <li>Delete individual resumes from the Resumes workspace (they can be restored briefly).</li>
          <li>
            Delete your account and associated resumes, jobs and reports from Settings. Type DELETE
            and confirm your password. This cannot be undone.
          </li>
        </ul>

        <h2 className="mt-8 text-xl font-semibold text-foreground">Contact</h2>
        <p className="mt-3 text-sm text-muted-foreground">
          Privacy questions:{' '}
          <a className="link-underline" href={`mailto:${config.supportEmail}`}>
            {config.supportEmail}
          </a>
        </p>
      </article>
    </>
  );
}
