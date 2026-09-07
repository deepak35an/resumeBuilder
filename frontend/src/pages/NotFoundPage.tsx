import { Link } from 'react-router-dom';

import { Seo } from '@/components/seo/Seo';
import { ButtonLink } from '@/components/ui';

const suggestions = [
  { label: 'Resume builder', to: '/resume-builder' },
  { label: 'Resume templates', to: '/resume-templates' },
  { label: 'ATS resume checker', to: '/ats-resume-checker' },
  { label: 'Job description matcher', to: '/job-description-matcher' },
  { label: 'Resume examples', to: '/resume-examples' },
  { label: 'Blog', to: '/blog' },
];

export default function NotFoundPage() {
  return (
    <>
      <Seo
        title="Page not found"
        description="The page you were looking for does not exist. Browse the resume builder, templates, ATS checker or resume examples instead."
        noindex
      />
      <div className="mx-auto max-w-2xl px-4 py-24 text-center sm:px-6">
        <p className="font-mono text-sm text-muted-foreground">404</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground text-balance sm:text-4xl">
          We could not find that page
        </h1>
        <p className="mx-auto mt-3 max-w-md text-muted-foreground text-pretty">
          The link may be out of date. Here is where most people are heading.
        </p>

        <div className="mt-7 flex flex-wrap justify-center gap-2">
          <ButtonLink to="/">Back to home</ButtonLink>
          <ButtonLink to="/resume-builder" variant="secondary">
            Build a resume
          </ButtonLink>
        </div>

        <ul className="mt-10 flex flex-wrap justify-center gap-x-5 gap-y-2">
          {suggestions.map((item) => (
            <li key={item.to}>
              <Link to={item.to} className="text-sm text-muted-foreground link-underline">
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
