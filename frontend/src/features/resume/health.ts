/**
 * Client-side resume facts and completeness, mirroring
 * `backend/app/services/resume_text.py` and `resume_service.completeness`.
 *
 * Duplicating the calculation here keeps the builder's Resume Health panel
 * responsive while typing; the backend value remains authoritative on save.
 */

import type { ResumeData, ResumeSection, SectionType } from '@/types/resume';

export interface ResumeFacts {
  hasName: boolean;
  hasEmail: boolean;
  hasPhone: boolean;
  hasLocation: boolean;
  hasLinks: boolean;
  summaryText: string;
  bullets: string[];
  skills: string[];
  experienceCount: number;
  educationCount: number;
  projectCount: number;
  certificationCount: number;
  wordCount: number;
  visibleSectionTypes: SectionType[];
}

/** Sections an ATS expects to find. */
export const ESSENTIAL_SECTIONS: SectionType[] = ['experience', 'education', 'technical-skills'];

function sectionText(section: ResumeSection): string[] {
  const parts: string[] = [section.title];
  switch (section.kind) {
    case 'text':
      parts.push(section.content);
      break;
    case 'skills':
      section.groups.forEach((group) => parts.push(group.name, ...group.skills));
      break;
    case 'tags':
      parts.push(...section.tags);
      break;
    default:
      section.items.forEach((item) => {
        Object.entries(item).forEach(([key, value]) => {
          if (key === 'id') return;
          if (typeof value === 'string') parts.push(value);
          else if (Array.isArray(value)) parts.push(...value.map(String));
        });
      });
  }
  return parts.filter(Boolean);
}

export function extractFacts(data: ResumeData): ResumeFacts {
  const { personal } = data;
  const facts: ResumeFacts = {
    hasName: Boolean(personal.fullName.trim()),
    hasEmail: Boolean(personal.email.trim()),
    hasPhone: Boolean(personal.phone.trim()),
    hasLocation: Boolean(personal.location.trim()),
    hasLinks:
      Boolean(
        personal.linkedin.trim() ||
          personal.github.trim() ||
          personal.portfolio.trim() ||
          personal.website.trim(),
      ) || personal.links.length > 0,
    summaryText: '',
    bullets: [],
    skills: [],
    experienceCount: 0,
    educationCount: 0,
    projectCount: 0,
    certificationCount: 0,
    wordCount: 0,
    visibleSectionTypes: [],
  };

  const chunks: string[] = [
    personal.fullName,
    personal.title,
    personal.email,
    personal.phone,
    personal.location,
  ].filter(Boolean);

  for (const section of data.sections) {
    if (section.visible) facts.visibleSectionTypes.push(section.type);
    chunks.push(...sectionText(section));

    if (section.kind === 'text' && (section.type === 'summary' || section.type === 'objective')) {
      facts.summaryText = section.content;
    }
    if (section.kind === 'experience') {
      if (section.type === 'experience' || section.type === 'internships') {
        facts.experienceCount += section.items.length;
      }
      section.items.forEach((item) => facts.bullets.push(...item.bullets.filter(Boolean)));
    }
    if (section.kind === 'education') {
      facts.educationCount += section.items.length;
      section.items.forEach((item) => facts.bullets.push(...item.bullets.filter(Boolean)));
    }
    if (section.kind === 'skills') {
      section.groups.forEach((group) => facts.skills.push(...group.skills));
    }
    if (section.kind === 'tags') {
      facts.skills.push(...section.tags);
    }
    if (section.kind === 'projects') {
      facts.projectCount += section.items.length;
      section.items.forEach((item) => facts.bullets.push(...item.bullets.filter(Boolean)));
    }
    if (section.kind === 'certifications') {
      facts.certificationCount += section.items.length;
    }
  }

  facts.wordCount = chunks.join(' ').split(/\s+/).filter(Boolean).length;
  return facts;
}

export function completenessScore(data: ResumeData): number {
  const facts = extractFacts(data);
  let score = 0;

  if (facts.hasName) score += 8;
  if (facts.hasEmail) score += 8;
  if (facts.hasPhone) score += 5;
  if (facts.hasLocation) score += 4;

  const summaryWords = facts.summaryText.split(/\s+/).filter(Boolean).length;
  if (summaryWords >= 25) score += 10;
  else if (summaryWords >= 10) score += 6;

  if (facts.experienceCount > 0) {
    score += 18;
    if (facts.bullets.length >= facts.experienceCount * 2) score += 12;
    else if (facts.bullets.length > 0) score += 6;
  } else if (facts.projectCount > 0) {
    score += 12;
    if (facts.bullets.length > 0) score += 6;
  }

  if (facts.educationCount > 0) score += 15;

  if (facts.skills.length >= 8) score += 15;
  else if (facts.skills.length >= 3) score += 9;
  else if (facts.skills.length > 0) score += 4;

  if (facts.hasLinks) score += 5;

  return Math.max(0, Math.min(100, score));
}

export interface HealthCheck {
  id: string;
  label: string;
  done: boolean;
  /** Section the fix lives in, so the panel can jump straight there. */
  sectionType?: SectionType;
  weight: 'critical' | 'important' | 'nice';
}

/** The builder's Resume Health checklist - always says what to do next. */
export function healthChecks(data: ResumeData): HealthCheck[] {
  const facts = extractFacts(data);
  const summaryWords = facts.summaryText.split(/\s+/).filter(Boolean).length;
  const longBullets = facts.bullets.filter(
    (bullet) => bullet.split(/\s+/).filter(Boolean).length > 32,
  ).length;
  const quantified = facts.bullets.filter((bullet) => /\d/.test(bullet)).length;

  return [
    { id: 'name', label: 'Add your full name', done: facts.hasName, weight: 'critical' },
    { id: 'email', label: 'Add an email address', done: facts.hasEmail, weight: 'critical' },
    { id: 'phone', label: 'Add a phone number', done: facts.hasPhone, weight: 'important' },
    { id: 'location', label: 'Add your location', done: facts.hasLocation, weight: 'nice' },
    {
      id: 'summary',
      label: 'Write a summary of at least 25 words',
      done: summaryWords >= 25,
      sectionType: 'summary',
      weight: 'important',
    },
    {
      id: 'experience',
      label: 'Add at least one role or project',
      done: facts.experienceCount > 0 || facts.projectCount > 0,
      sectionType: 'experience',
      weight: 'critical',
    },
    {
      id: 'bullets',
      label: 'Give each role two or more bullet points',
      done: facts.experienceCount === 0 || facts.bullets.length >= facts.experienceCount * 2,
      sectionType: 'experience',
      weight: 'important',
    },
    {
      id: 'metrics',
      label: 'Quantify at least half your bullets',
      done: facts.bullets.length > 0 && quantified >= Math.ceil(facts.bullets.length / 2),
      sectionType: 'experience',
      weight: 'important',
    },
    {
      id: 'education',
      label: 'Add your education',
      done: facts.educationCount > 0,
      sectionType: 'education',
      weight: 'important',
    },
    {
      id: 'skills',
      label: 'List eight or more skills',
      done: facts.skills.length >= 8,
      sectionType: 'technical-skills',
      weight: 'important',
    },
    {
      id: 'links',
      label: 'Add a LinkedIn or portfolio link',
      done: facts.hasLinks,
      weight: 'nice',
    },
    {
      id: 'bullet-length',
      label: 'Keep bullets under 32 words',
      done: longBullets === 0,
      sectionType: 'experience',
      weight: 'nice',
    },
  ];
}

export function missingEssentials(data: ResumeData): SectionType[] {
  const visible = new Set(extractFacts(data).visibleSectionTypes);
  return ESSENTIAL_SECTIONS.filter((type) => !visible.has(type));
}
