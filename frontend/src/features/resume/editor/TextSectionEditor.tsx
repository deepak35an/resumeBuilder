import { AlertTriangle, Info } from 'lucide-react';

import { Field, Textarea } from '@/components/ui';
import { definitionFor } from '@/features/resume/sections';
import { summaryHints, wordCount } from '@/features/resume/writing';
import { cn } from '@/lib/utils';
import type { TextSection } from '@/types/resume';

export function TextSectionEditor({
  section,
  onChange,
}: {
  section: TextSection;
  onChange: (section: TextSection) => void;
}) {
  const definition = definitionFor(section.type);
  const hints = summaryHints(section.content);
  const words = wordCount(section.content);

  return (
    <div className="space-y-3">
      <Field
        label={section.title}
        hint={definition.emptyHint}
        action={
          <span className="text-xs tabular-nums text-muted-foreground">{words} words</span>
        }
      >
        <Textarea
          value={section.content}
          autoResize
          minRows={5}
          placeholder="Product engineer with seven years building data-heavy web applications..."
          onChange={(event) => onChange({ ...section, content: event.target.value })}
        />
      </Field>

      {hints.length > 0 && (
        <ul className="space-y-1">
          {hints.map((hint) => (
            <li
              key={hint.id}
              className={cn(
                'flex items-start gap-1.5 text-xs',
                hint.tone === 'warning' ? 'text-warning-foreground' : 'text-muted-foreground',
              )}
            >
              {hint.tone === 'warning' ? (
                <AlertTriangle aria-hidden="true" className="mt-0.5 h-3 w-3 shrink-0" />
              ) : (
                <Info aria-hidden="true" className="mt-0.5 h-3 w-3 shrink-0" />
              )}
              <span>{hint.message}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
