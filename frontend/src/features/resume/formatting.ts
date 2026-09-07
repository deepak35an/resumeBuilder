/**
 * Display helpers for resume content.
 *
 * Dates are stored as partial ISO strings, so changing the display format never
 * rewrites stored data - and an unparseable value is shown verbatim rather than
 * silently dropped.
 */

import type { DateFormat, PersonalInfo } from '@/types/resume';

const SHORT_MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

const LONG_MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export function formatResumeDate(value: string, format: DateFormat = 'short-month'): string {
  const raw = value.trim();
  if (!raw) return '';

  const match = /^(\d{4})(?:-(\d{1,2}))?(?:-(\d{1,2}))?$/.exec(raw);
  if (!match) return raw;

  const year = match[1];
  const monthIndex = match[2] ? Number(match[2]) - 1 : null;

  if (format === 'year-only' || monthIndex === null) return year;
  if (monthIndex < 0 || monthIndex > 11) return year;

  switch (format) {
    case 'numeric':
      return `${String(monthIndex + 1).padStart(2, '0')}/${year}`;
    case 'long-month':
      return `${LONG_MONTHS[monthIndex]} ${year}`;
    case 'short-month':
    default:
      return `${SHORT_MONTHS[monthIndex]} ${year}`;
  }
}

export function formatDateRange(
  start: string,
  end: string,
  current: boolean,
  format: DateFormat = 'short-month',
): string {
  const from = formatResumeDate(start, format);
  const to = current ? 'Present' : formatResumeDate(end, format);
  if (from && to) return `${from} \u2013 ${to}`;
  return from || to;
}

/** Everything in the header that sits under the name, in a stable order. */
export function contactLine(personal: PersonalInfo): string[] {
  return [
    personal.email,
    personal.phone,
    personal.location,
    personal.linkedin,
    personal.github,
    personal.portfolio,
    personal.website,
    ...personal.links.map((link) => link.url),
  ]
    .map((entry) => entry.trim())
    .filter(Boolean);
}

/** Strip a scheme so links print as `linkedin.com/in/name`, not a raw URL. */
export function displayUrl(url: string): string {
  return url.trim().replace(/^https?:\/\//i, '').replace(/\/$/, '');
}

export function ensureHref(url: string): string {
  const raw = url.trim();
  if (!raw) return '';
  if (/^(https?:|mailto:|tel:)/i.test(raw)) return raw;
  if (raw.includes('@')) return `mailto:${raw}`;
  return `https://${raw}`;
}

/** `FirstName_LastName_Resume` - the export filename stem. */
export function resumeFileStem(personal: PersonalInfo): string {
  const parts = personal.fullName.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return 'Resume';
  const cleaned = parts
    .map((part) => part.replace(/[^\p{L}\p{N}-]/gu, ''))
    .filter(Boolean)
    .slice(0, 3);
  return cleaned.length ? `${cleaned.join('_')}_Resume` : 'Resume';
}
