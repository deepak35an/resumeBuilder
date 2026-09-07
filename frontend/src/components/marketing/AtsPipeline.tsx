import { Braces, FileText, GraduationCap, ListChecks, ScanLine, Wrench } from 'lucide-react';
import { useEffect, useState } from 'react';

import { useInView, usePrefersReducedMotion } from '@/hooks/useUiPrimitives';
import { cn } from '@/lib/utils';

const stages = [
  { id: 'resume', label: 'Resume', detail: 'PDF or DOCX', icon: FileText },
  { id: 'parser', label: 'Parser', detail: 'Text extraction', icon: ScanLine },
  { id: 'keywords', label: 'Keywords', detail: 'Skills and tools', icon: Braces },
  { id: 'experience', label: 'Experience', detail: 'Roles and impact', icon: ListChecks },
  { id: 'skills', label: 'Skills', detail: 'Coverage', icon: Wrench },
  { id: 'score', label: 'Score', detail: 'Weighted result', icon: GraduationCap },
] as const;

/**
 * Explains what an ATS actually does with a resume, one stage at a time.
 * Animates once on scroll into view and stops - no looping distraction.
 */
export function AtsPipeline({ className }: { className?: string }) {
  const [ref, inView] = useInView<HTMLOListElement>({ threshold: 0.3 });
  const reduceMotion = usePrefersReducedMotion();
  const [active, setActive] = useState(reduceMotion ? stages.length : -1);

  useEffect(() => {
    if (!inView || reduceMotion) {
      if (reduceMotion) setActive(stages.length);
      return;
    }
    let step = 0;
    const timer = setInterval(() => {
      step += 1;
      setActive(step);
      if (step >= stages.length) clearInterval(timer);
    }, 260);
    return () => clearInterval(timer);
  }, [inView, reduceMotion]);

  return (
    <ol
      ref={ref}
      className={cn(
        'grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3',
        className,
      )}
    >
      {stages.map((stage, index) => {
        const revealed = index < active;
        return (
          <li
            key={stage.id}
            className={cn(
              'flex items-center gap-3 rounded-xl border p-3.5 transition-all duration-slow ease-out',
              revealed
                ? 'border-border bg-surface opacity-100 translate-y-0'
                : 'border-dashed border-border bg-surface/40 opacity-45 translate-y-1',
            )}
          >
            <span
              aria-hidden="true"
              className={cn(
                'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors duration-slow',
                revealed ? 'bg-accent-subtle text-accent-strong' : 'bg-muted text-muted-foreground',
              )}
            >
              <stage.icon className="h-4 w-4" />
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-medium text-foreground">{stage.label}</span>
              <span className="block text-xs text-muted-foreground">{stage.detail}</span>
            </span>
            <span className="ml-auto font-mono text-2xs text-muted-foreground">
              {String(index + 1).padStart(2, '0')}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
