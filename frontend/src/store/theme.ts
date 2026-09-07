import { create } from 'zustand';

export type ThemePreference = 'light' | 'dark' | 'system';
type ResolvedTheme = 'light' | 'dark';

const STORAGE_KEY = 'resumeforge.theme';

function readPreference(): ThemePreference {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'light' || stored === 'dark' || stored === 'system') return stored;
  } catch {
    // ignore
  }
  return 'system';
}

function systemTheme(): ResolvedTheme {
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function resolve(preference: ThemePreference): ResolvedTheme {
  return preference === 'system' ? systemTheme() : preference;
}

/** Only the application chrome themes. Resume output is always print-white. */
function applyTheme(resolved: ResolvedTheme): void {
  document.documentElement.setAttribute('data-theme', resolved);
  document.documentElement.classList.toggle('dark', resolved === 'dark');
}

interface ThemeState {
  preference: ThemePreference;
  resolved: ResolvedTheme;
  setPreference: (preference: ThemePreference) => void;
  toggle: () => void;
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  preference: readPreference(),
  resolved: resolve(readPreference()),
  setPreference: (preference) => {
    const resolved = resolve(preference);
    try {
      localStorage.setItem(STORAGE_KEY, preference);
    } catch {
      // ignore
    }
    applyTheme(resolved);
    set({ preference, resolved });
  },
  toggle: () => get().setPreference(get().resolved === 'dark' ? 'light' : 'dark'),
}));

/** Called once at startup; keeps "system" in sync with the OS setting. */
export function initTheme(): () => void {
  const { preference } = useThemeStore.getState();
  applyTheme(resolve(preference));

  const media = window.matchMedia?.('(prefers-color-scheme: dark)');
  if (!media) return () => undefined;

  const listener = () => {
    if (useThemeStore.getState().preference !== 'system') return;
    const resolved = systemTheme();
    applyTheme(resolved);
    useThemeStore.setState({ resolved });
  };
  media.addEventListener('change', listener);
  return () => media.removeEventListener('change', listener);
}
