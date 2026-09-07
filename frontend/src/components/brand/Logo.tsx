import { Link } from 'react-router-dom';

import { cn } from '@/lib/utils';

export function LogoMark({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'relative flex h-7 w-7 shrink-0 items-center justify-center rounded-[9px] bg-primary',
        className,
      )}
    >
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none">
        {/* Stylised "F" forge mark: a document edge with an ascending bar. */}
        <path
          d="M6 4.5h11.5M6 4.5v15M6 11.5h8"
          stroke="var(--color-primary-foreground)"
          strokeWidth="2.4"
          strokeLinecap="round"
        />
      </svg>
      <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-accent ring-2 ring-background" />
    </span>
  );
}

export function Logo({
  className,
  to = '/',
  showWordmark = true,
}: {
  className?: string;
  to?: string;
  showWordmark?: boolean;
}) {
  return (
    <Link
      to={to}
      className={cn('inline-flex items-center gap-2.5 rounded-lg', className)}
      aria-label="ResumeForge home"
    >
      <LogoMark />
      {showWordmark && (
        <span className="text-[0.95rem] font-semibold tracking-tight text-foreground">
          Resume<span className="text-muted-foreground">Forge</span>
        </span>
      )}
    </Link>
  );
}
