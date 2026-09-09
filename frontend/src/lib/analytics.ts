import { config } from '@/lib/config';

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

let loading: Promise<void> | null = null;

function installGtag(): (...args: unknown[]) => void {
  window.dataLayer = window.dataLayer ?? [];
  const gtag = (...args: unknown[]) => {
    window.dataLayer?.push(args);
  };
  window.gtag = gtag;
  return gtag;
}

/** Load the GA4 tag once. The snippet in index.html already does this in production. */
export function loadAnalytics(): Promise<void> {
  const measurementId = config.gaMeasurementId;
  if (!measurementId) return Promise.resolve();
  if (window.gtag || document.querySelector('script[src*="googletagmanager.com/gtag/js"]')) {
    return Promise.resolve();
  }
  if (loading) return loading;

  const gtag = installGtag();
  gtag('js', new Date());
  gtag('config', measurementId, {
    anonymize_ip: true,
    send_page_view: false,
  });

  loading = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
    script.onload = () => resolve();
    script.onerror = () => {
      loading = null;
      reject(new Error('Failed to load Google Analytics'));
    };
    document.head.appendChild(script);
  });

  return loading;
}

/** SPA page view. Call after the tag is loaded. */
export function trackPageView(path: string): void {
  const measurementId = config.gaMeasurementId;
  if (!measurementId || !window.gtag) return;

  window.gtag('event', 'page_view', {
    page_path: path,
    page_location: `${window.location.origin}${path}`,
    page_title: document.title,
  });
}
