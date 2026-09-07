import { breadcrumbJsonLd, Seo, webPageJsonLd } from '@/components/seo/Seo';
import { ButtonLink } from '@/components/ui';

export default function AboutPage() {
  return (
    <>
      <Seo
        title="About ResumeForge"
        description="ResumeForge is a Career OS for building, checking and tailoring resumes for applicant tracking systems."
        path="/about"
        jsonLd={[
          webPageJsonLd({
            name: 'About ResumeForge',
            description: 'Why ResumeForge exists and how we treat resume data.',
            path: '/about',
          }),
          breadcrumbJsonLd([
            { name: 'Home', path: '/' },
            { name: 'About', path: '/about' },
          ]),
        ]}
      />
      <article className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <h1 className="text-4xl font-semibold tracking-tight text-foreground">About ResumeForge</h1>
        <p className="mt-5 text-lg text-muted-foreground text-pretty">
          ResumeForge is a Career OS: build a resume, check how a parser may read it, match it to a
          job, tailor a version, then export. It is not a template marketplace with a thin editor on
          the side.
        </p>
        <h2 className="mt-10 text-xl font-semibold text-foreground">What we will not do</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-muted-foreground">
          <li>We do not sell resume content to recruiters or data brokers.</li>
          <li>We do not invent metrics in AI suggestions. If a number is missing, we say so.</li>
          <li>We do not publish ATS scores as guarantees. They are estimates.</li>
        </ul>
        <h2 className="mt-10 text-xl font-semibold text-foreground">Who it is for</h2>
        <p className="mt-3 text-sm text-muted-foreground text-pretty">
          Students, career changers and working professionals who have to pass an applicant tracking
          system before a human reads the file. The default template is Classic ATS: single column,
          standard headings, conservative type.
        </p>
        <ButtonLink to="/contact" className="mt-8" variant="secondary">
          Contact us
        </ButtonLink>
      </article>
    </>
  );
}
