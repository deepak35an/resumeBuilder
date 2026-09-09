import { config } from '@/lib/config';

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

let loading: Promise<void> | null = null;

function installGtag(): void {
  window.dataLayer = window.dataLayer ?? [];
  window.gtag = function gtag(...args: unknown[]) {
    window.dataLayer?.push(args);
  };
}

/** Load the GA4 tag once. No-ops when no measurement ID is configured. */
export function loadAnalytics(): Promise<void> {
  const measurementId = config.gaMeasurementId;
  if (!measurementId) return Promise.resolve();
  if (loading) return loading;

  installGtag();
  window.gtag?.('js', new Date());
  window.gtag?.('config', measurementId, {
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
