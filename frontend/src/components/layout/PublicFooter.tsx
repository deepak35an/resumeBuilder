import { Link } from 'react-router-dom';

import { Logo } from '@/components/brand/Logo';

import { footerColumns } from './navigation';

export function PublicFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="app-footer border-t border-border bg-surface">
      <div className="mx-auto max-w-wide px-4 py-12 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_3fr]">
          <div>
            <Logo />
            <p className="mt-3 max-w-xs text-sm text-muted-foreground text-pretty">
              Build a resume, check how applicant tracking systems may read it, and tailor it to the
              job you are applying for.
            </p>
            <p className="mt-4 max-w-xs text-xs text-muted-foreground text-pretty">
              ATS scores are estimates. Different applicant tracking systems use different parsing
              and ranking methods.
            </p>
          </div>

          <nav aria-label="Footer" className="grid gap-8 sm:grid-cols-3 lg:grid-cols-5">
            {footerColumns.map((column) => (
              <div key={column.title}>
                <h2 className="text-2xs font-semibold uppercase tracking-wide text-foreground">
                  {column.title}
                </h2>
                <ul className="mt-3 space-y-2">
                  {column.links.map((link) => (
                    <li key={link.to}>
                      <Link
                        to={link.to}
                        className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted-foreground">
            © {year} ResumeForge. Designed with ATS-friendly formatting.
          </p>
          <p className="text-xs text-muted-foreground">
            Your resumes stay private. We never sell resume content.
          </p>
        </div>
      </div>
    </footer>
  );
}
