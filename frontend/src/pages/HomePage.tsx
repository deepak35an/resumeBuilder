import {
  ArrowRight,
  FileCheck2,
  Layers,
  PenLine,
  ScanSearch,
  ShieldCheck,
  Target,
} from 'lucide-react';
import { Link } from 'react-router-dom';

import { AtsPipeline } from '@/components/marketing/AtsPipeline';
import { HeroScoreCard } from '@/components/marketing/HeroScoreCard';
import {
  breadcrumbJsonLd,
  Seo,
  softwareApplicationJsonLd,
  webPageJsonLd,
  websiteJsonLd,
} from '@/components/seo/Seo';
import { Badge, ButtonLink, Card, SectionHeading } from '@/components/ui';

const loopSteps = [
  {
    id: 'build',
    label: 'Build',
    icon: PenLine,
    title: 'Write it with structure, not guesswork',
    detail:
      'Standard sections, plain-text skills and conservative formatting by default. Reorder, rename, hide or add any of 23 section types.',
    to: '/resume-builder',
    cta: 'Open the builder',
  },
  {
    id: 'check',
    label: 'Check',
    icon: ShieldCheck,
    title: 'See how a parser is likely to read it',
    detail:
      'Formatting, keywords, content quality and completeness, each scored with an explanation of why - not a bare number.',
    to: '/ats-resume-checker',
    cta: 'Check a resume',
  },
  {
    id: 'match',
    label: 'Match',
    icon: Target,
    title: 'Compare it against the actual posting',
    detail:
      'Paste a job description to see matched and missing terms, weighted by how much the posting emphasises them.',
    to: '/job-description-matcher',
    cta: 'Match a job',
  },
] as const;

const capabilities = [
  {
    icon: Layers,
    title: '44 working templates',
    detail:
      'Every template renders your real data with the same components used in the editor. Each one is labelled with its ATS compatibility.',
    to: '/resume-templates',
  },
  {
    icon: ScanSearch,
    title: 'Import what you already have',
    detail:
      'Upload a PDF or DOCX and we extract the sections we can detect, then ask you to review before you download anything.',
    to: '/ats-resume-checker',
  },
  {
    icon: FileCheck2,
    title: 'PDF and DOCX with real text',
    detail:
      'Exports contain selectable text and working links - never a screenshot of a resume pasted into a page.',
    to: '/resume-builder',
  },
] as const;

export default function HomePage() {
  return (
    <>
      <Seo
        title="ATS Resume Builder, Checker and Job Matcher"
        description="Build an ATS-friendly resume, check how applicant tracking systems may read it, and tailor it to any job description. 44 templates, ATS scoring with explanations, PDF and DOCX export."
        path="/"
        keywords={[
          'ats resume builder',
          'ats resume checker',
          'resume builder',
          'job description matcher',
          'ats friendly resume',
          'free resume builder',
        ]}
        jsonLd={[
          websiteJsonLd(),
          softwareApplicationJsonLd(),
          webPageJsonLd({
            name: 'ATS Resume Builder, Checker and Job Matcher',
            description:
              'Build an ATS-friendly resume, check its compatibility and tailor it to any job description.',
            path: '/',
          }),
          breadcrumbJsonLd([{ name: 'Home', path: '/' }]),
        ]}
      />

      {/* Hero: shows the product's output instead of describing it. */}
      <section className="relative overflow-hidden border-b border-border">
        <div aria-hidden="true" className="grid-dots absolute inset-0 opacity-40" />
        <div className="relative mx-auto grid max-w-wide items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:py-24">
          <div>
            <Badge tone="outline" uppercase className="tracking-[0.14em]">
              Build · Check · Match · Apply
            </Badge>
            <h1 className="mt-5 text-4xl font-semibold tracking-tight text-foreground text-balance sm:text-5xl lg:text-6xl">
              Your resume.
              <br />
              Optimised for the job.
            </h1>
            <p className="mt-5 max-w-xl text-lg text-muted-foreground text-pretty">
              Build a professional resume, check how applicant tracking systems may read it, and
              tailor it to the job you are applying for.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <ButtonLink to="/register" size="lg" trailingIcon={<ArrowRight />}>
                Build my resume
              </ButtonLink>
              <ButtonLink to="/ats-resume-checker" size="lg" variant="secondary">
                Check ATS score
              </ButtonLink>
            </div>

            <p className="mt-4 text-xs text-muted-foreground text-pretty">
              Free to start. No card required. ATS scores are estimates - different systems parse
              and rank resumes differently.
            </p>
          </div>

          <div className="flex justify-center lg:justify-end">
            <HeroScoreCard />
          </div>
        </div>
      </section>

      {/* The product loop, stated as the core journey. */}
      <section className="mx-auto max-w-wide px-4 py-16 sm:px-6 lg:py-20">
        <SectionHeading
          title="One loop, from blank page to submitted application"
          description="ResumeForge is a career workspace rather than a template gallery. Each step feeds the next."
        />

        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          {loopSteps.map((step, index) => (
            <Card key={step.id} interactive className="flex flex-col">
              <div className="flex items-center gap-3">
                <span
                  aria-hidden="true"
                  className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground"
                >
                  <step.icon className="h-4 w-4" />
                </span>
                <div>
                  <p className="font-mono text-2xs text-muted-foreground">
                    {String(index + 1).padStart(2, '0')}
                  </p>
                  <p className="text-sm font-semibold uppercase tracking-wide text-foreground">
                    {step.label}
                  </p>
                </div>
              </div>
              <h3 className="mt-4 text-base font-semibold text-foreground text-pretty">
                {step.title}
              </h3>
              <p className="mt-2 flex-1 text-sm text-muted-foreground text-pretty">{step.detail}</p>
              <Link
                to={step.to}
                className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-foreground link-underline"
              >
                {step.cta}
                <ArrowRight aria-hidden="true" className="h-3.5 w-3.5" />
              </Link>
            </Card>
          ))}
        </div>
      </section>

      {/* What an ATS actually does - the educational centrepiece. */}
      <section className="border-y border-border bg-surface">
        <div className="mx-auto grid max-w-wide items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:py-20">
          <div>
            <SectionHeading
              title="What an applicant tracking system does with your resume"
              description="Most systems extract text first. If a parser cannot read a section, a human reviewer may never see it. Our checker walks the same path."
            />
            <ul className="mt-6 space-y-2.5 text-sm text-muted-foreground">
              <li className="text-pretty">
                Text is extracted from the file - columns, tables and images all affect the result.
              </li>
              <li className="text-pretty">
                Sections are identified from headings, which is why standard headings matter.
              </li>
              <li className="text-pretty">
                Skills and titles are matched against the job requisition, often with weighting.
              </li>
            </ul>
            <ButtonLink to="/blog/how-ats-resume-screening-works" variant="secondary" className="mt-7">
              How ATS screening works
            </ButtonLink>
          </div>
          <AtsPipeline />
        </div>
      </section>

      <section className="mx-auto max-w-wide px-4 py-16 sm:px-6 lg:py-20">
        <SectionHeading
          title="Built for the parts that actually get resumes rejected"
          description="Formatting that cannot be read, keywords that were never mentioned, and claims that cannot be backed up."
        />
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {capabilities.map((item) => (
            <Card key={item.title} interactive as="article">
              <span
                aria-hidden="true"
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted text-muted-foreground"
              >
                <item.icon className="h-4 w-4" />
              </span>
              <h3 className="mt-4 text-base font-semibold text-foreground">{item.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground text-pretty">{item.detail}</p>
              <Link
                to={item.to}
                className="mt-4 inline-block text-sm font-medium text-foreground link-underline"
              >
                Learn more
              </Link>
            </Card>
          ))}
        </div>
      </section>

      <section className="border-t border-border bg-surface-sunken">
        <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6 lg:py-20">
          <h2 className="text-3xl font-semibold tracking-tight text-foreground text-balance">
            Start with an ATS-safe template
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-muted-foreground text-pretty">
            The default is Classic ATS: single column, standard headings, conservative type. Change
            anything you like - we will tell you when a choice may affect parsing.
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <ButtonLink to="/register" size="lg">
              Create my resume
            </ButtonLink>
            <ButtonLink to="/resume-templates" size="lg" variant="secondary">
              Browse templates
            </ButtonLink>
          </div>
        </div>
      </section>
    </>
  );
}
