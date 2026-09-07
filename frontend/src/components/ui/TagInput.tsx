import { X } from 'lucide-react';
import { useRef, useState } from 'react';

import { cn } from '@/lib/utils';

import { useFieldContext } from './Field';

export interface TagInputProps {
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  /** Comma, Enter and Tab all commit the current entry. */
  suggestions?: string[];
  className?: string;
  maxTags?: number;
  ariaLabel?: string;
}

/**
 * Comma-separated list editor used for skills, technologies and coursework.
 * Renders plain text on the resume - never bars or ratings.
 */
export function TagInput({
  value,
  onChange,
  placeholder = 'Type and press Enter',
  suggestions = [],
  className,
  maxTags = 60,
  ariaLabel,
}: TagInputProps) {
  const field = useFieldContext();
  const [draft, setDraft] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const commit = (raw: string) => {
    const additions = raw
      .split(',')
      .map((part) => part.trim())
      .filter(Boolean)
      .filter((part) => !value.some((existing) => existing.toLowerCase() === part.toLowerCase()));
    if (additions.length > 0) onChange([...value, ...additions].slice(0, maxTags));
    setDraft('');
  };

  const remove = (index: number) => onChange(value.filter((_, position) => position !== index));

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' || event.key === ',' || event.key === 'Tab') {
      if (!draft.trim()) return;
      event.preventDefault();
      commit(draft);
    } else if (event.key === 'Backspace' && !draft && value.length > 0) {
      remove(value.length - 1);
    }
  };

  const available = suggestions.filter(
    (suggestion) => !value.some((existing) => existing.toLowerCase() === suggestion.toLowerCase()),
  );

  return (
    <div className={className}>
      <div
        onClick={() => inputRef.current?.focus()}
        className={cn(
          'flex min-h-9.5 flex-wrap items-center gap-1.5 rounded-lg border border-border bg-surface px-2 py-1.5',
          'shadow-xs transition-colors duration-fast focus-within:ring-2 focus-within:ring-ring',
          'focus-within:ring-offset-1 focus-within:ring-offset-background hover:border-border-strong',
        )}
      >
        {value.map((tag, index) => (
          <span
            key={`${tag}-${index}`}
            className="inline-flex items-center gap-1 rounded-md bg-muted px-1.5 py-0.5 text-xs text-foreground"
          >
            {tag}
            <button
              type="button"
              aria-label={`Remove ${tag}`}
              onClick={(event) => {
                event.stopPropagation();
                remove(index);
              }}
              className="rounded p-0.5 text-muted-foreground transition-colors hover:text-danger"
            >
              <X aria-hidden="true" className="h-3 w-3" />
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          id={field?.id}
          aria-label={ariaLabel ?? 'Add an item'}
          aria-describedby={field?.describedBy}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={onKeyDown}
          onBlur={() => draft.trim() && commit(draft)}
          placeholder={value.length === 0 ? placeholder : ''}
          className="min-w-[8rem] flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground/70"
        />
      </div>

      {available.length > 0 && (
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          <span className="text-xs text-muted-foreground">Suggestions:</span>
          {available.slice(0, 8).map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => commit(suggestion)}
              className="rounded-md border border-dashed border-border px-1.5 py-0.5 text-xs
                text-muted-foreground transition-colors hover:border-accent hover:text-accent-strong"
            >
              + {suggestion}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
