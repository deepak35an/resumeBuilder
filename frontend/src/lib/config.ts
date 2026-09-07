const rawApiUrl = (import.meta.env.VITE_API_URL ?? 'http://localhost:8000').trim();
const rawSiteUrl = (import.meta.env.VITE_SITE_URL ?? window.location.origin).trim();

function stripTrailingSlash(value: string): string {
  return value.endsWith('/') ? value.slice(0, -1) : value;
}

export const config = {
  /** Base URL for the API, without a trailing slash. `/api` behind NGINX. */
  apiUrl: stripTrailingSlash(rawApiUrl),
  /** Public site origin, used for canonical URLs and structured data. */
  siteUrl: stripTrailingSlash(rawSiteUrl),
  appName: 'ResumeForge',
  tagline: 'Build. Check. Match. Apply.',
  supportEmail: 'hello@resumeforge.app',
  isProduction: import.meta.env.PROD,
} as const;

/** Build an absolute API URL. Accepts `/auth/login` or `auth/login`. */
export function apiUrl(path: string): string {
  const suffix = path.startsWith('/') ? path : `/${path}`;
  return config.apiUrl.endsWith('/api')
    ? `${config.apiUrl}${suffix}`
    : `${config.apiUrl}/api${suffix}`;
}

/** Absolute public URL for canonical tags, OpenGraph and the sitemap. */
export function siteUrl(path = '/'): string {
  return `${config.siteUrl}${path.startsWith('/') ? path : `/${path}`}`;
}
