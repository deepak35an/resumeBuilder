import { breadcrumbJsonLd, Seo, webPageJsonLd } from '@/components/seo/Seo';

export default function CookiesPage() {
  return (
    <>
      <Seo
        title="Cookie Policy"
        description="How ResumeForge uses essential and optional cookies. Optional cookies wait for consent."
        path="/cookies"
        jsonLd={[
          webPageJsonLd({
            name: 'Cookie Policy',
            description: 'ResumeForge cookie policy.',
            path: '/cookies',
          }),
          breadcrumbJsonLd([
            { name: 'Home', path: '/' },
            { name: 'Cookies', path: '/cookies' },
          ]),
        ]}
      />
      <article className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">Cookie Policy</h1>
        <p className="mt-2 text-sm text-muted-foreground">Last updated 7 September 2026</p>

        <h2 className="mt-10 text-xl font-semibold text-foreground">Essential cookies</h2>
        <p className="mt-3 text-sm text-muted-foreground text-pretty">
          We use essential cookies or similar storage to keep you signed in, remember theme and
          language, and store your cookie choice. These are required for the site to work.
        </p>

        <h2 className="mt-8 text-xl font-semibold text-foreground">Optional cookies</h2>
        <p className="mt-3 text-sm text-muted-foreground text-pretty">
          Advertising slots on blog, examples and template pages do not load third-party tracking
          until you accept optional cookies. If you refuse, the slots stay empty placeholders.
        </p>

        <h2 className="mt-8 text-xl font-semibold text-foreground">Change your mind</h2>
        <p className="mt-3 text-sm text-muted-foreground text-pretty">
          Clear the ResumeForge cookie preference in your browser, or use the cookie banner if it is
          still visible. Signing out does not by itself delete optional cookies from your device.
        </p>
      </article>
    </>
  );
}
