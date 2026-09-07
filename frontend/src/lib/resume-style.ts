/**
 * Turns `ResumeSettings` into the CSS custom properties consumed by
 * `styles/resume.css`.
 *
 * Every template reads these variables instead of hardcoding type sizes, so one
 * settings panel restyles all 44 templates - and the PDF renderer gets exactly
 * the same values as the on-screen preview.
 */

import type { CSSProperties } from 'react';

import type { ResumeSettings } from '@/types/resume';

/** Physical page sizes in millimetres. */
export const PAGE_SIZES: Record<ResumeSettings['pageSize'], { width: number; height: number }> = {
  a4: { width: 210, height: 297 },
  letter: { width: 215.9, height: 279.4 },
};

const PAGE_PADDING_MM: Record<ResumeSettings['margin'], number> = {
  narrow: 11,
  normal: 16,
  wide: 22,
};

const MM_PER_INCH = 25.4;
/** CSS reference pixels per inch. */
export const CSS_DPI = 96;

export function mmToPx(mm: number): number {
  return (mm / MM_PER_INCH) * CSS_DPI;
}

export function pageSizePx(pageSize: ResumeSettings['pageSize']): { width: number; height: number } {
  const page = PAGE_SIZES[pageSize] ?? PAGE_SIZES.a4;
  return { width: mmToPx(page.width), height: mmToPx(page.height) };
}

export function pagePaddingMm(margin: ResumeSettings['margin']): number {
  return PAGE_PADDING_MM[margin] ?? PAGE_PADDING_MM.normal;
}

/** Font stacks are metric-compatible so the PDF matches even without the webfont. */
const FONT_STACKS: Record<string, string> = {
  Inter: "'Inter', 'Helvetica Neue', Arial, sans-serif",
  Georgia: "Georgia, 'Times New Roman', serif",
  Garamond: "'EB Garamond', Garamond, Georgia, serif",
  Calibri: "Calibri, Carlito, 'Segoe UI', sans-serif",
  Arial: "Arial, Liberation Sans, Helvetica, sans-serif",
  Helvetica: "'Helvetica Neue', Helvetica, Arial, sans-serif",
  'Times New Roman': "'Times New Roman', Liberation Serif, Times, serif",
  Cambria: "Cambria, Caladea, Georgia, serif",
  Verdana: "Verdana, DejaVu Sans, Geneva, sans-serif",
  Lato: "'Lato', 'Helvetica Neue', Arial, sans-serif",
  'Source Sans 3': "'Source Sans 3', 'Source Sans Pro', Arial, sans-serif",
  'IBM Plex Sans': "'IBM Plex Sans', 'Helvetica Neue', Arial, sans-serif",
};

export const AVAILABLE_FONTS = Object.keys(FONT_STACKS);

export function fontStack(fontFamily: string): string {
  return FONT_STACKS[fontFamily] ?? `'${fontFamily}', Arial, sans-serif`;
}

export interface ResumeStyleOptions {
  /** Preview scale. Print and PDF always render at 1. */
  zoom?: number;
}

export function buildResumeStyle(
  settings: ResumeSettings,
  options: ResumeStyleOptions = {},
): CSSProperties {
  const page = PAGE_SIZES[settings.pageSize] ?? PAGE_SIZES.a4;
  const padding = pagePaddingMm(settings.margin);

  return {
    '--resume-page-width': `${page.width}mm`,
    '--resume-page-height': `${page.height}mm`,
    '--resume-page-padding': `${padding}mm`,
    '--resume-font-family': fontStack(settings.fontFamily),
    '--resume-font-size': `${settings.fontSize}pt`,
    '--resume-line-height': String(settings.lineHeight),
    '--resume-heading-scale': String(settings.headingScale),
    '--resume-accent': settings.accentColor,
    '--resume-section-gap': `${(12 * settings.sectionSpacing).toFixed(2)}pt`,
    '--resume-entry-gap': `${(8 * settings.sectionSpacing).toFixed(2)}pt`,
    '--resume-bullet': `'${settings.bulletChar.replace(/'/g, '')}'`,
    '--resume-zoom': String(options.zoom ?? 1),
  } as CSSProperties;
}
