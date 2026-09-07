import { Check } from 'lucide-react';
import { Link, Outlet } from 'react-router-dom';

import { Logo } from '@/components/brand/Logo';

const proofPoints = [
  'ATS-first templates with conservative, parseable formatting',
  'Score breakdown that explains every number',
  'Job description matching with keyword placement guidance',
  'PDF and DOCX exports with real, selectable text',
];

export function AuthLayout() {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="flex flex-col px-5 py-8 sm:px-10">
        <Logo />
        <div className="flex flex-1 items-center justify-center py-10">
          <div className="w-full max-w-sm">
            <Outlet />
          </div>
        </div>
        <p className="text-center text-xs text-muted-foreground">
          <Link to="/privacy" className="link-underline">
            Privacy
          </Link>
          <span className="mx-2">·</span>
          <Link to="/terms" className="link-underline">
            Terms
          </Link>
        </p>
      </div>

      {/* Value panel: explains the product loop rather than showing decoration. */}
      <aside className="relative hidden overflow-hidden border-l border-border bg-surface-sunken lg:block">
        <div className="grid-dots absolute inset-0 opacity-60" aria-hidden="true" />
        <div className="relative flex h-full flex-col justify-center px-12">
          <p className="text-2xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Build · Check · Match · Apply
          </p>
          <h2 className="mt-4 max-w-md text-3xl font-semibold tracking-tight text-foreground text-balance">
            Your career workspace, not another template gallery.
          </h2>
          <ul className="mt-8 space-y-3.5">
            {proofPoints.map((point) => (
              <li key={point} className="flex items-start gap-3 text-sm text-muted-foreground">
                <span
                  aria-hidden="true"
                  className="mt-0.5 flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full bg-success-subtle text-success"
                >
                  <Check className="h-3 w-3" strokeWidth={3} />
                </span>
                <span className="text-pretty">{point}</span>
              </li>
            ))}
          </ul>
          <p className="mt-10 max-w-md text-xs text-muted-foreground text-pretty">
            ATS scores are estimates. Different applicant tracking systems use different parsing and
            ranking methods, so we surface likely problems rather than promising an outcome.
          </p>
        </div>
      </aside>
    </div>
  );
}
