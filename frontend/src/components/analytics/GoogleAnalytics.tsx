import { useEffect, useRef } from 'react';
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
  const skipFirst = useRef(true);

  useEffect(() => {
    if (!config.gaMeasurementId) return;

    // index.html already sends the landing page view.
    if (skipFirst.current) {
      skipFirst.current = false;
      return;
    }

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
