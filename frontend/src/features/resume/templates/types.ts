import type { ComponentType } from 'react';

import type { ResumeData, ResumeSettings } from '@/types/resume';

export type TemplateCategory = 'ats' | 'tech' | 'business' | 'student' | 'creative';

/**
 * Layout family. Single-column layouts parse most reliably; sidebar and
 * two-column layouts are labelled "Good" rather than "Excellent" because some
 * older parsers read them in the wrong order.
 */
export type TemplateLayout =
  | 'single-column'
  | 'two-column'
  | 'sidebar-left'
  | 'sidebar-right'
  | 'banner'
  | 'split-header';

export type AtsRating = 'excellent' | 'good';

export interface TemplateComponentProps {
  data: ResumeData;
  settings: ResumeSettings;
  /** Preview mode skips print-only tweaks that would confuse the editor. */
  preview?: boolean;
}

export type TemplateComponent = ComponentType<TemplateComponentProps>;

export interface TemplateDefinition {
  id: string;
  name: string;
  slug: string;
  category: TemplateCategory;
  layout: TemplateLayout;
  atsRating: AtsRating;
  isPremium: boolean;
  /** One sentence, written for a candidate rather than a designer. */
  description: string;
  bestFor: string[];
  /** Applied when a resume first switches to this template. */
  settingsDefaults?: Partial<ResumeSettings>;
  /** Photo templates only. ATS-first layouts never set this. */
  supportsPhoto?: boolean;
  component: TemplateComponent;
}

export const ATS_RATING_LABELS: Record<AtsRating, string> = {
  excellent: 'ATS Compatibility: Excellent',
  good: 'ATS Compatibility: Good',
};

export const LAYOUT_LABELS: Record<TemplateLayout, string> = {
  'single-column': 'Single column',
  'two-column': 'Two column',
  'sidebar-left': 'Left sidebar',
  'sidebar-right': 'Right sidebar',
  banner: 'Banner header',
  'split-header': 'Split header',
};

export const CATEGORY_LABELS: Record<TemplateCategory, string> = {
  ats: 'ATS-first',
  tech: 'Technology',
  business: 'Business & executive',
  student: 'Student & early career',
  creative: 'Modern & creative',
};
