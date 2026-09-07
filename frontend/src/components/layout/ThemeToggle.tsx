import { Monitor, Moon, Sun } from 'lucide-react';

import { SegmentedControl } from '@/components/ui';
import { IconButton } from '@/components/ui/IconButton';
import { useThemeStore, type ThemePreference } from '@/store/theme';

/** Compact icon toggle for headers. */
export function ThemeToggle() {
  const resolved = useThemeStore((state) => state.resolved);
  const toggle = useThemeStore((state) => state.toggle);

  return (
    <IconButton
      label={resolved === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
      icon={resolved === 'dark' ? <Sun /> : <Moon />}
      onClick={toggle}
    />
  );
}

/** Explicit three-way control used in Settings. */
export function ThemePreferenceControl() {
  const preference = useThemeStore((state) => state.preference);
  const setPreference = useThemeStore((state) => state.setPreference);

  return (
    <SegmentedControl<ThemePreference>
      label="Theme"
      value={preference}
      onChange={setPreference}
      size="md"
      options={[
        { value: 'light', label: 'Light', icon: <Sun /> },
        { value: 'dark', label: 'Dark', icon: <Moon /> },
        { value: 'system', label: 'System', icon: <Monitor /> },
      ]}
    />
  );
}
