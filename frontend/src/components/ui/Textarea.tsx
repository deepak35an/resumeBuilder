import { forwardRef, useEffect, useRef, type TextareaHTMLAttributes } from 'react';

import { cn } from '@/lib/utils';

import { useFieldContext } from './Field';
import { controlClasses } from './Input';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  invalid?: boolean;
  /** Grow with content instead of scrolling - keeps long bullets visible. */
  autoResize?: boolean;
  minRows?: number;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { className, invalid, autoResize = true, minRows = 3, onInput, ...rest },
  forwardedRef,
) {
  const field = useFieldContext();
  const isInvalid = invalid ?? field?.invalid ?? false;
  const localRef = useRef<HTMLTextAreaElement | null>(null);

  const resize = (element: HTMLTextAreaElement | null) => {
    if (!element || !autoResize) return;
    element.style.height = 'auto';
    element.style.height = `${element.scrollHeight}px`;
  };

  useEffect(() => {
    resize(localRef.current);
    // Re-measure when the controlled value changes from outside.
  }, [rest.value, autoResize]);

  return (
    <textarea
      ref={(node) => {
        localRef.current = node;
        if (typeof forwardedRef === 'function') forwardedRef(node);
        else if (forwardedRef) forwardedRef.current = node;
      }}
      id={rest.id ?? field?.id}
      rows={rest.rows ?? minRows}
      aria-invalid={isInvalid || undefined}
      aria-describedby={rest['aria-describedby'] ?? field?.describedBy}
      onInput={(event) => {
        resize(event.currentTarget);
        onInput?.(event);
      }}
      className={cn(
        controlClasses,
        'min-h-[4.5rem] resize-y px-3 py-2 text-sm leading-relaxed',
        isInvalid ? 'border-danger' : 'border-border hover:border-border-strong',
        autoResize && 'overflow-hidden',
        className,
      )}
      {...rest}
    />
  );
});
