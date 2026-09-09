import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

import { config } from '@/lib/config';
import { loadAnalytics, trackPageView } from '@/lib/analytics';

/**
 * Loads GA4 for every visitor and records route changes.
 * Used only for first-party page-view counts (traffic by page).
 */
export function GoogleAnalytics() {
  const { pathname, search } = useLocation();
  const path = `${pathname}${search}`;

  useEffect(() => {
    if (!config.gaMeasurementId) return;

    let cancelled = false;

    void loadAnalytics()
      .then(() => {
        if (!cancelled) trackPageView(path);
      })
      .catch(() => {
        // Analytics must never block the app.
      });

    return () => {
      cancelled = true;
    };
  }, [path]);

  return null;
}
