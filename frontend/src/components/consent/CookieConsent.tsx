import { Cookie } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { Button } from '@/components/ui';

const STORAGE_KEY = 'resumeforge.consent';

export type ConsentChoice = 'essential' | 'all';

export function readConsent(): ConsentChoice | null {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    return value === 'essential' || value === 'all' ? value : null;
  } catch {
    return null;
  }
}

/** Non-essential scripts (ads, analytics) must check this before loading. */
export function hasAnalyticsConsent(): boolean {
  return readConsent() === 'all';
}

/**
 * Cookie consent banner.
 *
 * Nothing beyond strictly necessary storage runs before a choice is made: the
 * app only uses localStorage for the session, theme and this preference.
 */
export function CookieConsent() {
  const [choice, setChoice] = useState<ConsentChoice | null>(() => readConsent());
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (choice) return;
    // Delay slightly so the banner does not compete with first paint.
    const timer = setTimeout(() => setVisible(true), 900);
    return () => clearTimeout(timer);
  }, [choice]);

  const decide = (value: ConsentChoice) => {
    try {
      localStorage.setItem(STORAGE_KEY, value);
    } catch {
      // ignore
    }
    setChoice(value);
    setVisible(false);
    window.dispatchEvent(new CustomEvent('resumeforge:consent', { detail: value }));
  };

  if (choice || !visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Cookie preferences"
      className="fixed inset-x-3 bottom-3 z-toast animate-fade-up sm:inset-x-auto sm:left-4 sm:max-w-md"
    >
      <div className="flex gap-3 rounded-xl border border-border bg-surface p-4 shadow-lg">
        <span
          aria-hidden="true"
          className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground"
        >
          <Cookie className="h-4 w-4" />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-medium text-foreground">Cookies and storage</p>
          <p className="mt-1 text-sm text-muted-foreground text-pretty">
            We use essential storage to keep you signed in and remember your theme. Optional
            cookies help us measure how the public pages perform. Read our{' '}
            <Link to="/cookies" className="link-underline">
              cookie policy
            </Link>
            .
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button size="sm" onClick={() => decide('all')}>
              Accept all
            </Button>
            <Button size="sm" variant="secondary" onClick={() => decide('essential')}>
              Essential only
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
