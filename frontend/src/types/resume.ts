/**
 * Canonical ResumeData document - the TypeScript mirror of
 * `backend/app/schemas/resume_data.py`. Every template, the editor, the ATS
 * engine and both exporters consume this exact shape.
 *
 * Dates are partial ISO strings (`"2024-01"` or `"2024"`) and are formatted for
 * display from `ResumeSettings.dateFormat`, so switching date style never
 * rewrites stored data.
 */

export type SectionType =
  | 'summary'
  | 'objective'
  | 'experience'
  | 'internships'
  | 'education'
  | 'technical-skills'
  | 'soft-skills'
  | 'projects'
  | 'certifications'
  | 'awards'
  | 'achievements'
  | 'publications'
  | 'research'
  | 'volunteer'
  | 'leadership'
  | 'languages'
  | 'interests'
  | 'courses'
  | 'training'
  | 'conferences'
  | 'references'
  | 'memberships'
  | 'custom';

export type SectionKind =
  | 'text'
  | 'experience'
  | 'education'
  | 'skills'
  | 'projects'
  | 'certifications'
  | 'list'
  | 'publications'
  | 'languages'
  | 'tags'
  | 'references';

export interface Link {
  id: string;
  label: string;
  url: string;
}

/** All fields optional: we never require unnecessary personal information. */
export interface PersonalInfo {
  fullName: string;
  title: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  github: string;
  portfolio: string;
  website: string;
  links: Link[];
}

export interface ExperienceItem {
  id: string;
  title: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
  bullets: string[];
  technologies: string[];
}

export interface EducationItem {
  id: string;
  degree: string;
  field: string;
  institution: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  /** Optional by design - never required. */
  gpa: string;
  coursework: string[];
  bullets: string[];
}

export interface SkillGroup {
  id: string;
  name: string;
  skills: string[];
}

export interface ProjectItem {
  id: string;
  name: string;
  role: string;
  description: string;
  technologies: string[];
  url: string;
  github: string;
  startDate: string;
  endDate: string;
  bullets: string[];
}

export interface CertificationItem {
  id: string;
  name: string;
  issuer: string;
  date: string;
  expiry: string;
  credentialId: string;
  credentialUrl: string;
}

export interface ListItem {
  id: string;
  title: string;
  subtitle: string;
  date: string;
  description: string;
  bullets: string[];
}

export interface PublicationItem {
  id: string;
  title: string;
  publisher: string;
  authors: string;
  date: string;
  url: string;
  description: string;
}

export interface LanguageItem {
  id: string;
  name: string;
  /** Text proficiency only - never a bar or a percentage. */
  proficiency: string;
}

export interface ReferenceItem {
  id: string;
  name: string;
  title: string;
  company: string;
  email: string;
  phone: string;
  relationship: string;
}

interface SectionBase {
  id: string;
  type: SectionType;
  title: string;
  visible: boolean;
}

export interface TextSection extends SectionBase {
  kind: 'text';
  content: string;
}

export interface ExperienceSection extends SectionBase {
  kind: 'experience';
  items: ExperienceItem[];
}

export interface EducationSection extends SectionBase {
  kind: 'education';
  items: EducationItem[];
}

export interface SkillsSection extends SectionBase {
  kind: 'skills';
  groups: SkillGroup[];
  display: 'grouped' | 'inline';
}

export interface ProjectsSection extends SectionBase {
  kind: 'projects';
  items: ProjectItem[];
}

export interface CertificationsSection extends SectionBase {
  kind: 'certifications';
  items: CertificationItem[];
}

export interface GenericListSection extends SectionBase {
  kind: 'list';
  items: ListItem[];
}

export interface PublicationsSection extends SectionBase {
  kind: 'publications';
  items: PublicationItem[];
}

export interface LanguagesSection extends SectionBase {
  kind: 'languages';
  items: LanguageItem[];
}

export interface TagsSection extends SectionBase {
  kind: 'tags';
  tags: string[];
}

export interface ReferencesSection extends SectionBase {
  kind: 'references';
  items: ReferenceItem[];
  hideDetails: boolean;
}

export type ResumeSection =
  | TextSection
  | ExperienceSection
  | EducationSection
  | SkillsSection
  | ProjectsSection
  | CertificationsSection
  | GenericListSection
  | PublicationsSection
  | LanguagesSection
  | TagsSection
  | ReferencesSection;

/** Map a section kind to its concrete section type. */
export type SectionOfKind<K extends SectionKind> = Extract<ResumeSection, { kind: K }>;

export type DateFormat = 'short-month' | 'long-month' | 'numeric' | 'year-only';
export type PageSize = 'a4' | 'letter';
export type MarginSize = 'narrow' | 'normal' | 'wide';

export interface ResumeSettings {
  pageSize: PageSize;
  fontFamily: string;
  fontSize: number;
  headingScale: number;
  lineHeight: number;
  margin: MarginSize;
  sectionSpacing: number;
  accentColor: string;
  dateFormat: DateFormat;
  showIcons: boolean;
  uppercaseHeadings: boolean;
  bulletChar: string;
}

export interface ResumeData {
  version: number;
  personal: PersonalInfo;
  sections: ResumeSection[];
}

/** Props every template component receives. Templates are pure renderers. */
export interface TemplateProps {
  data: ResumeData;
  settings: ResumeSettings;
}
