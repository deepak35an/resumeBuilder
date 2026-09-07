import {
  BookOpen,
  FileText,
  LayoutGrid,
  Moon,
  Plus,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  Sun,
  Target,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';

import { useBodyScrollLock, useEscapeKey, useFocusTrap } from '@/hooks/useUiPrimitives';
import { cn, modifierKeyLabel } from '@/lib/utils';
import { useAuthStore } from '@/store/auth';
import { useCommandPalette } from '@/store/commandPalette';
import { useThemeStore } from '@/store/theme';

export interface Command {
  id: string;
  label: string;
  group: string;
  icon: ReactNode;
  keywords?: string;
  run: () => void;
}

/** Extra commands contributed by the active screen (e.g. the resume editor). */
type ContextProvider = () => Command[];
const contextProviders = new Set<ContextProvider>();

export function registerCommands(provider: ContextProvider): () => void {
  contextProviders.add(provider);
  return () => contextProviders.delete(provider);
}

export function CommandPalette() {
  const { open, setOpen, query, setQuery } = useCommandPalette();
  const navigate = useNavigate();
  const toggleTheme = useThemeStore((state) => state.toggle);
  const resolvedTheme = useThemeStore((state) => state.resolved);
  const isAuthenticated = useAuthStore((state) => state.status === 'authenticated');

  const panelRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useBodyScrollLock(open);
  useEscapeKey(open, () => setOpen(false));
  useFocusTrap(panelRef, open, { autoFocus: false });

  useEffect(() => {
    if (open) {
      setActiveIndex(0);
      // Focus after paint so the caret lands in the input.
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  const commands = useMemo<Command[]>(() => {
    const go = (path: string) => () => {
      navigate(path);
      setOpen(false);
    };

    const base: Command[] = [
      {
        id: 'create-resume',
        label: 'Create a resume',
        group: 'Actions',
        icon: <Plus />,
        keywords: 'new build start',
        run: go(isAuthenticated ? '/resume-templates?action=create' : '/register'),
      },
      {
        id: 'check-ats',
        label: 'Check ATS score',
        group: 'Actions',
        icon: <ShieldCheck />,
        keywords: 'ats analyse analyze score check',
        run: go('/ats-resume-checker'),
      },
      {
        id: 'match-job',
        label: 'Match a job description',
        group: 'Actions',
        icon: <Target />,
        keywords: 'job match tailor keywords',
        run: go('/job-description-matcher'),
      },
      {
        id: 'find-template',
        label: 'Find a template',
        group: 'Navigate',
        icon: <LayoutGrid />,
        keywords: 'templates gallery browse',
        run: go('/resume-templates'),
      },
      {
        id: 'examples',
        label: 'Browse resume examples',
        group: 'Navigate',
        icon: <BookOpen />,
        keywords: 'examples samples roles',
        run: go('/resume-examples'),
      },
      {
        id: 'blog',
        label: 'Read resume guides',
        group: 'Navigate',
        icon: <Sparkles />,
        keywords: 'blog articles advice',
        run: go('/blog'),
      },
    ];

    if (isAuthenticated) {
      base.unshift({
        id: 'dashboard',
        label: 'Open dashboard',
        group: 'Navigate',
        icon: <FileText />,
        keywords: 'home workspace career os',
        run: go('/dashboard'),
      });
      base.push({
        id: 'settings',
        label: 'Open settings',
        group: 'Navigate',
        icon: <Settings />,
        keywords: 'account profile security subscription',
        run: go('/settings'),
      });
    }

    base.push({
      id: 'theme',
      label: resolvedTheme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme',
      group: 'Preferences',
      icon: resolvedTheme === 'dark' ? <Sun /> : <Moon />,
      keywords: 'theme dark light appearance',
      run: () => {
        toggleTheme();
        setOpen(false);
      },
    });

    const contextual = Array.from(contextProviders).flatMap((provider) => provider());
    return [...contextual, ...base];
  }, [isAuthenticated, navigate, resolvedTheme, setOpen, toggleTheme]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return commands;
    return commands.filter((command) =>
      `${command.label} ${command.group} ${command.keywords ?? ''}`.toLowerCase().includes(needle),
    );
  }, [commands, query]);

  const grouped = useMemo(() => {
    const groups = new Map<string, Command[]>();
    for (const command of filtered) {
      const list = groups.get(command.group) ?? [];
      list.push(command);
      groups.set(command.group, list);
    }
    return Array.from(groups.entries());
  }, [filtered]);

  if (!open) return null;

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex((index) => (index + 1) % Math.max(1, filtered.length));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((index) => (index - 1 + filtered.length) % Math.max(1, filtered.length));
    } else if (event.key === 'Enter') {
      event.preventDefault();
      filtered[activeIndex]?.run();
    }
  };

  let runningIndex = -1;

  return createPortal(
    <div className="fixed inset-0 z-modal flex items-start justify-center p-4 pt-[12vh]">
      <div
        aria-hidden="true"
        onClick={() => setOpen(false)}
        className="absolute inset-0 animate-fade-in bg-slate-950/45 backdrop-blur-[2px]"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
        onKeyDown={onKeyDown}
        className="relative w-full max-w-xl animate-scale-in overflow-hidden rounded-2xl border
          border-border bg-surface shadow-lg"
      >
        <div className="flex items-center gap-3 border-b border-border px-4">
          <Search aria-hidden="true" className="h-4 w-4 shrink-0 text-muted-foreground" />
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setActiveIndex(0);
            }}
            role="combobox"
            aria-expanded="true"
            aria-controls="command-results"
            aria-label="Search commands"
            placeholder="Search commands, templates and pages…"
            className="h-12 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
          />
          <kbd className="rounded border border-border px-1.5 py-0.5 font-mono text-2xs text-muted-foreground">
            Esc
          </kbd>
        </div>

        <div id="command-results" role="listbox" className="scroll-area max-h-80 overflow-y-auto p-1.5">
          {filtered.length === 0 ? (
            <p className="px-3 py-8 text-center text-sm text-muted-foreground">
              No commands match “{query}”.
            </p>
          ) : (
            grouped.map(([group, items]) => (
              <div key={group} className="mb-1">
                <p className="px-2.5 py-1.5 text-2xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {group}
                </p>
                {items.map((command) => {
                  runningIndex += 1;
                  const index = runningIndex;
                  return (
                    <button
                      key={command.id}
                      type="button"
                      role="option"
                      aria-selected={index === activeIndex}
                      onMouseEnter={() => setActiveIndex(index)}
                      onClick={command.run}
                      className={cn(
                        'flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left text-sm transition-colors',
                        index === activeIndex
                          ? 'bg-muted text-foreground'
                          : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                      )}
                    >
                      <span aria-hidden="true" className="shrink-0 [&_svg]:h-4 [&_svg]:w-4">
                        {command.icon}
                      </span>
                      <span className="flex-1 truncate text-foreground">{command.label}</span>
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>

        <div className="flex items-center justify-between border-t border-border bg-surface-sunken px-4 py-2 text-2xs text-muted-foreground">
          <span>↑↓ to navigate · Enter to run</span>
          <span className="font-mono">{modifierKeyLabel()} K</span>
        </div>
      </div>
    </div>,
    document.body,
  );
}
