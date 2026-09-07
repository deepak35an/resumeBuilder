/**
 * Inline writing hints for bullet points.
 *
 * These are deliberately conservative: they point at a weakness, they never
 * rewrite the user's words and they never invent a number. The full content
 * analysis lives in the backend ATS engine.
 */

const WEAK_OPENERS = [
  'responsible for',
  'worked on',
  'helped with',
  'assisted with',
  'involved in',
  'tasked with',
  'duties included',
  'participated in',
  'in charge of',
  'handled',
];

const STRONG_VERBS = [
  'Led',
  'Built',
  'Shipped',
  'Designed',
  'Reduced',
  'Increased',
  'Automated',
  'Migrated',
  'Launched',
  'Owned',
  'Negotiated',
  'Mentored',
  'Streamlined',
  'Delivered',
];

const PASSIVE_PATTERN = /\b(was|were|been|being|is|are)\s+\w+(ed|en)\b/i;
const FIRST_PERSON_PATTERN = /\b(I|me|my|myself)\b/;

export type HintTone = 'warning' | 'info';

export interface WritingHint {
  id: string;
  message: string;
  tone: HintTone;
}

export const MAX_BULLET_WORDS = 32;
export const MIN_BULLET_WORDS = 6;

export function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

/** Hints for a single bullet. Returns an empty array for a strong bullet. */
export function bulletHints(text: string): WritingHint[] {
  const trimmed = text.trim();
  if (!trimmed) return [];

  const hints: WritingHint[] = [];
  const words = wordCount(trimmed);
  const lower = trimmed.toLowerCase();

  const weak = WEAK_OPENERS.find((opener) => lower.startsWith(opener));
  if (weak) {
    hints.push({
      id: 'weak-opener',
      tone: 'warning',
      message: `Starts with "${weak}". Lead with an action verb such as ${STRONG_VERBS.slice(0, 3).join(', ')}.`,
    });
  }

  if (!/\d/.test(trimmed)) {
    hints.push({
      id: 'no-metric',
      tone: 'info',
      message: 'No number here. Add scale, time saved or percentage if you have one.',
    });
  }

  if (words > MAX_BULLET_WORDS) {
    hints.push({
      id: 'too-long',
      tone: 'warning',
      message: `${words} words. Recruiters skim - aim for under ${MAX_BULLET_WORDS}.`,
    });
  } else if (words < MIN_BULLET_WORDS) {
    hints.push({
      id: 'too-short',
      tone: 'info',
      message: 'Very short. Say what you did and what changed as a result.',
    });
  }

  if (PASSIVE_PATTERN.test(trimmed)) {
    hints.push({
      id: 'passive',
      tone: 'info',
      message: 'Reads as passive voice. Put yourself in the driving seat of the sentence.',
    });
  }

  if (FIRST_PERSON_PATTERN.test(trimmed)) {
    hints.push({
      id: 'first-person',
      tone: 'info',
      message: 'Resumes normally drop "I" and "my".',
    });
  }

  if (trimmed.endsWith('.') && words < 4) {
    hints.push({ id: 'fragment', tone: 'info', message: 'This looks like a fragment.' });
  }

  return hints;
}

/** Suggested openers shown when a bullet is empty. */
export function suggestedVerbs(count = 6): string[] {
  return STRONG_VERBS.slice(0, count);
}

export interface SummaryHint extends WritingHint {}

export function summaryHints(text: string): SummaryHint[] {
  const words = wordCount(text);
  if (words === 0) return [];
  const hints: SummaryHint[] = [];

  if (words < 25) {
    hints.push({
      id: 'short',
      tone: 'info',
      message: `${words} words. Two to four lines (about 40-60 words) reads best.`,
    });
  }
  if (words > 90) {
    hints.push({
      id: 'long',
      tone: 'warning',
      message: `${words} words. Trim to the two or three things you most want read.`,
    });
  }
  if (FIRST_PERSON_PATTERN.test(text)) {
    hints.push({
      id: 'first-person',
      tone: 'info',
      message: 'Summaries usually read better without "I".',
    });
  }
  if (!/\d/.test(text)) {
    hints.push({
      id: 'no-metric',
      tone: 'info',
      message: 'Adding one concrete number makes a summary far more credible.',
    });
  }
  return hints;
}
