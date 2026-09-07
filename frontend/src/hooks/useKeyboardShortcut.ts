import { useEffect } from 'react';

export interface ShortcutOptions {
  /** Require Ctrl on Windows/Linux and Cmd on macOS. */
  meta?: boolean;
  shift?: boolean;
  alt?: boolean;
  /** Fire even while a text field has focus (needed for Cmd+S). */
  allowInInput?: boolean;
  enabled?: boolean;
  preventDefault?: boolean;
}

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return (
    target.isContentEditable ||
    ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName) ||
    target.getAttribute('role') === 'textbox'
  );
}

/**
 * Register a global keyboard shortcut.
 *
 * `key` is compared case-insensitively against `event.key`, so pass `'k'`,
 * `'s'`, `'Escape'` and so on.
 */
export function useKeyboardShortcut(
  key: string,
  handler: (event: KeyboardEvent) => void,
  options: ShortcutOptions = {},
): void {
  const {
    meta = false,
    shift = false,
    alt = false,
    allowInInput = false,
    enabled = true,
    preventDefault = true,
  } = options;

  useEffect(() => {
    if (!enabled) return;

    const listener = (event: KeyboardEvent) => {
      if ((event.key ?? '').toLowerCase() !== key.toLowerCase()) return;
      const metaPressed = event.metaKey || event.ctrlKey;
      if (meta !== metaPressed) return;
      if (shift !== event.shiftKey) return;
      if (alt !== event.altKey) return;
      if (!allowInInput && isEditableTarget(event.target)) return;

      if (preventDefault) event.preventDefault();
      handler(event);
    };

    window.addEventListener('keydown', listener);
    return () => window.removeEventListener('keydown', listener);
  }, [key, handler, meta, shift, alt, allowInInput, enabled, preventDefault]);
}

/** Canonical shortcut list, rendered by the in-app help panel. */
export const SHORTCUTS = [
  { keys: ['mod', 'K'], label: 'Open the command palette', scope: 'Global' },
  { keys: ['mod', 'S'], label: 'Save the resume now', scope: 'Editor' },
  { keys: ['mod', 'Z'], label: 'Undo', scope: 'Editor' },
  { keys: ['mod', 'Shift', 'Z'], label: 'Redo', scope: 'Editor' },
  { keys: ['mod', 'P'], label: 'Open the export panel', scope: 'Editor' },
  { keys: ['mod', 'B'], label: 'Toggle the section list', scope: 'Editor' },
  { keys: ['Esc'], label: 'Close a dialog, panel or menu', scope: 'Global' },
  { keys: ['?'], label: 'Show keyboard shortcuts', scope: 'Global' },
] as const;
