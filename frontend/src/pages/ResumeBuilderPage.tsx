import { ArrowRight, Check, PenLine, ShieldCheck, Target } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { breadcrumbJsonLd, faqJsonLd, Seo, webPageJsonLd } from '@/components/seo/Seo';
import { Badge, ButtonLink, Card, SectionHeading } from '@/components/ui';
import { useIsAuthenticated } from '@/store/auth';

const steps = [
  {
    title: 'Write in structured sections',
    detail:
      'Contact, experience, education and skills are first-class. Hide, rename or add any of 23 section types without leaving the builder.',
  },
  {
    title: 'See the page as you type',
    detail:
      'The live preview uses the same template that will export to PDF. What you see is selectable text, not a picture of a resume.',
  },
  {
    title: 'Check, then tailor',
    detail:
      'Run an ATS check, paste a job description, and duplicate a version named for that role before you download.',
  },
];

const faqs = [
  {
    question: 'Is the resume builder free?',
    answer:
      'Yes. You can create a resume on Classic ATS, export a PDF, and run a limited number of ATS checks on the Free plan. Pro unlocks more templates, DOCX, job match and AI.',
  },
  {
    question: 'Will this work with applicant tracking systems?',
    answer:
      'Classic ATS is a single column with standard headings. We label every template with its ATS compatibility. Scores are estimates — systems differ.',
  },
  {
    question: 'Can I import an existing resume?',
    answer:
      'Yes. Upload a PDF or DOCX, review what we extracted, then edit before you download anything.',
  },
];

export default function ResumeBuilderPage() {
  const { t } = useTranslation();
  const signedIn = useIsAuthenticated();
  const primaryTo = signedIn ? '/resume-templates' : '/register';

  return (
    <>
      <Seo
        title="Free ATS Resume Builder"
        description="Write a professional, ATS-friendly resume with a live preview, structured sections and export to PDF. Free to start."
        path="/resume-builder"
        keywords={['resume builder', 'free resume builder', 'ats resume builder']}
        jsonLd={[
          webPageJsonLd({
            name: 'Free ATS Resume Builder',
            description: 'Build an ATS-friendly resume with a live preview and structured sections.',
            path: '/resume-builder',
          }),
          breadcrumbJsonLd([
            { name: 'Home', path: '/' },
            { name: 'Resume Builder', path: '/resume-builder' },
          ]),
          faqJsonLd(faqs),
        ]}
      />

      <section className="border-b border-border">
        <div className="mx-auto max-w-wide px-4 py-16 sm:px-6 lg:py-20">
          <Badge tone="outline" uppercase>
            {t('loop.build')} · {t('loop.check')} · {t('loop.export')}
          </Badge>
          <h1 className="mt-5 max-w-3xl text-4xl font-semibold tracking-tight text-foreground text-balance sm:text-5xl">
            A resume builder that starts with how parsers read.
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-muted-foreground text-pretty">
            Structured sections, a live A4 preview, and conservative defaults. Change anything — we
            will tell you when a choice may affect parsing.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonLink to={primaryTo} size="lg" trailingIcon={<ArrowRight />}>
              {signedIn ? 'Choose a template' : t('common.createAccount')}
            </ButtonLink>
            <ButtonLink to="/resume-templates" size="lg" variant="secondary">
              Browse 44 templates
            </ButtonLink>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-wide px-4 py-16 sm:px-6">
        <SectionHeading title="How the builder works" />
        <ol className="mt-8 grid gap-4 md:grid-cols-3">
          {steps.map((step, index) => (
            <Card key={step.title} as="li">
              <p className="font-mono text-2xs text-muted-foreground">
                {String(index + 1).padStart(2, '0')}
              </p>
              <h2 className="mt-2 text-base font-semibold text-foreground">{step.title}</h2>
              <p className="mt-2 text-sm text-muted-foreground text-pretty">{step.detail}</p>
            </Card>
          ))}
        </ol>
      </section>

      <section className="border-y border-border bg-surface">
        <div className="mx-auto grid max-w-wide gap-6 px-4 py-16 sm:px-6 md:grid-cols-3">
          {[
            { icon: PenLine, title: '23 section types', detail: 'From internships to publications — hide what you do not need.' },
            { icon: ShieldCheck, title: 'ATS-aware defaults', detail: 'Classic ATS is single column, standard headings, conservative type.' },
            { icon: Target, title: 'Built for a specific job', detail: 'Duplicate a tailored version once you have a posting to match.' },
          ].map((item) => (
            <Card key={item.title}>
              <item.icon aria-hidden="true" className="h-5 w-5 text-muted-foreground" />
              <h2 className="mt-3 text-base font-semibold text-foreground">{item.title}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{item.detail}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <SectionHeading title="Questions" />
        <ul className="mt-6 space-y-4">
          {faqs.map((faq) => (
            <li key={faq.question} className="border-b border-border pb-4">
              <h2 className="flex items-start gap-2 text-sm font-semibold text-foreground">
                <Check aria-hidden="true" className="mt-0.5 h-4 w-4 text-muted-foreground" />
                {faq.question}
              </h2>
              <p className="mt-2 pl-6 text-sm text-muted-foreground text-pretty">{faq.answer}</p>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
