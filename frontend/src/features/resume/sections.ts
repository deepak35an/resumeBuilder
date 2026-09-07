/**
 * Section registry - the frontend mirror of
 * `backend/app/services/resume_defaults.py`.
 *
 * Everything the editor needs to add, render and validate a section is derived
 * from these definitions, so adding a section type is a one-file change.
 */

import { createId } from '@/lib/utils';
import type {
  CertificationItem,
  EducationItem,
  ExperienceItem,
  LanguageItem,
  ListItem,
  ProjectItem,
  PublicationItem,
  ReferenceItem,
  ResumeSection,
  SectionKind,
  SectionType,
  SkillGroup,
} from '@/types/resume';

export type SectionGroup = 'core' | 'additional' | 'achievements' | 'academic' | 'learning';

export interface SectionDefinition {
  type: SectionType;
  kind: SectionKind;
  title: string;
  description: string;
  group: SectionGroup;
  /** Included when a blank resume is created. */
  default: boolean;
  /** Custom and list-style sections may appear more than once. */
  repeatable: boolean;
  suggestedFor: string[];
  /** Guidance shown in the editor's empty state. */
  emptyHint: string;
}

export const SECTION_DEFINITIONS: SectionDefinition[] = [
  {
    type: 'summary',
    kind: 'text',
    title: 'Professional Summary',
    description: 'Two to four lines describing what you do and the value you bring.',
    group: 'core',
    default: true,
    repeatable: false,
    suggestedFor: [],
    emptyHint: 'Lead with your role, years of experience and the kind of work you do best.',
  },
  {
    type: 'objective',
    kind: 'text',
    title: 'Career Objective',
    description: 'A short statement of the role you are targeting.',
    group: 'core',
    default: false,
    repeatable: false,
    suggestedFor: ['student', 'fresher'],
    emptyHint: 'Name the role you want and what you bring to it. Keep it to two lines.',
  },
  {
    type: 'experience',
    kind: 'experience',
    title: 'Work Experience',
    description: 'Roles, companies, dates and what you achieved in each.',
    group: 'core',
    default: true,
    repeatable: false,
    suggestedFor: [],
    emptyHint: 'Start with your most recent role. Each bullet should show an outcome.',
  },
  {
    type: 'internships',
    kind: 'experience',
    title: 'Internships',
    description: 'Internships listed separately from full-time roles.',
    group: 'core',
    default: false,
    repeatable: false,
    suggestedFor: ['student', 'fresher'],
    emptyHint: 'Treat an internship like a job: what you worked on and what changed.',
  },
  {
    type: 'education',
    kind: 'education',
    title: 'Education',
    description: 'Degrees, institutions and dates.',
    group: 'core',
    default: true,
    repeatable: false,
    suggestedFor: [],
    emptyHint: 'Add your highest qualification first. GPA is optional.',
  },
  {
    type: 'technical-skills',
    kind: 'skills',
    title: 'Technical Skills',
    description: 'Tools, languages and platforms, grouped by category as plain text.',
    group: 'core',
    default: true,
    repeatable: false,
    suggestedFor: [],
    emptyHint: 'Group related skills, for example "Languages: Python, TypeScript, SQL".',
  },
  {
    type: 'soft-skills',
    kind: 'skills',
    title: 'Soft Skills',
    description: 'Communication, leadership and collaboration strengths.',
    group: 'additional',
    default: false,
    repeatable: false,
    suggestedFor: [],
    emptyHint: 'Only list soft skills you can back up with an example elsewhere.',
  },
  {
    type: 'projects',
    kind: 'projects',
    title: 'Projects',
    description: 'Work you have built, with the technologies used and the outcome.',
    group: 'core',
    default: true,
    repeatable: false,
    suggestedFor: [],
    emptyHint: 'Say what the project does, what you built and which tools you used.',
  },
  {
    type: 'certifications',
    kind: 'certifications',
    title: 'Certifications',
    description: 'Professional certifications with the issuing body and date.',
    group: 'core',
    default: false,
    repeatable: false,
    suggestedFor: [],
    emptyHint: 'Include the issuing organisation - parsers often look for it.',
  },
  {
    type: 'awards',
    kind: 'list',
    title: 'Awards',
    description: 'Recognition you have received.',
    group: 'achievements',
    default: false,
    repeatable: false,
    suggestedFor: [],
    emptyHint: 'Name the award, who gave it and when.',
  },
  {
    type: 'achievements',
    kind: 'list',
    title: 'Achievements',
    description: 'Measurable accomplishments that do not belong to a single role.',
    group: 'achievements',
    default: false,
    repeatable: false,
    suggestedFor: [],
    emptyHint: 'Anything with a number attached belongs here.',
  },
  {
    type: 'publications',
    kind: 'publications',
    title: 'Publications',
    description: 'Papers, articles and books you have authored.',
    group: 'academic',
    default: false,
    repeatable: false,
    suggestedFor: ['academic', 'research'],
    emptyHint: 'Include co-authors, the venue and the year.',
  },
  {
    type: 'research',
    kind: 'publications',
    title: 'Research',
    description: 'Research projects, labs and areas of focus.',
    group: 'academic',
    default: false,
    repeatable: false,
    suggestedFor: ['academic', 'research'],
    emptyHint: 'Describe the question you worked on and the method you used.',
  },
  {
    type: 'volunteer',
    kind: 'experience',
    title: 'Volunteer Experience',
    description: 'Unpaid work and community roles.',
    group: 'additional',
    default: false,
    repeatable: false,
    suggestedFor: [],
    emptyHint: 'Volunteer work counts as experience when it shows relevant skills.',
  },
  {
    type: 'leadership',
    kind: 'experience',
    title: 'Leadership',
    description: 'Positions of responsibility in clubs, societies or teams.',
    group: 'additional',
    default: false,
    repeatable: false,
    suggestedFor: ['student', 'fresher'],
    emptyHint: 'Mention the size of the group and what you were responsible for.',
  },
  {
    type: 'languages',
    kind: 'languages',
    title: 'Languages',
    description: 'Languages you speak, with a written proficiency level.',
    group: 'additional',
    default: false,
    repeatable: false,
    suggestedFor: [],
    emptyHint: 'Use words such as Native, Fluent or Professional - never a bar or a rating.',
  },
  {
    type: 'interests',
    kind: 'tags',
    title: 'Interests',
    description: 'A short line of relevant interests.',
    group: 'additional',
    default: false,
    repeatable: false,
    suggestedFor: [],
    emptyHint: 'Keep it to a handful, and prefer interests that say something useful.',
  },
  {
    type: 'courses',
    kind: 'list',
    title: 'Courses',
    description: 'Relevant courses you have completed.',
    group: 'learning',
    default: false,
    repeatable: false,
    suggestedFor: [],
    emptyHint: 'Add the provider and the year alongside the course name.',
  },
  {
    type: 'training',
    kind: 'list',
    title: 'Training',
    description: 'Workshops, bootcamps and professional training.',
    group: 'learning',
    default: false,
    repeatable: false,
    suggestedFor: [],
    emptyHint: 'Focus on training that maps to the roles you are applying for.',
  },
  {
    type: 'conferences',
    kind: 'list',
    title: 'Conferences',
    description: 'Conferences and events you attended or spoke at.',
    group: 'learning',
    default: false,
    repeatable: false,
    suggestedFor: [],
    emptyHint: 'Note whether you attended, presented or organised.',
  },
  {
    type: 'memberships',
    kind: 'list',
    title: 'Professional Memberships',
    description: 'Professional bodies you belong to.',
    group: 'additional',
    default: false,
    repeatable: false,
    suggestedFor: [],
    emptyHint: 'Include the organisation and the years of membership.',
  },
  {
    type: 'references',
    kind: 'references',
    title: 'References',
    description: 'Referees, or a line stating they are available on request.',
    group: 'additional',
    default: false,
    repeatable: false,
    suggestedFor: [],
    emptyHint: 'Most resumes do not need this. Ask a referee before listing them.',
  },
  {
    type: 'custom',
    kind: 'list',
    title: 'Custom Section',
    description: 'Anything the standard sections do not cover.',
    group: 'additional',
    default: false,
    repeatable: true,
    suggestedFor: [],
    emptyHint: 'Rename this section to whatever it needs to be.',
  },
];

export const SECTION_BY_TYPE = new Map<SectionType, SectionDefinition>(
  SECTION_DEFINITIONS.map((definition) => [definition.type, definition]),
);

export const SECTION_GROUP_LABELS: Record<SectionGroup, string> = {
  core: 'Core sections',
  additional: 'Additional',
  achievements: 'Achievements',
  academic: 'Academic',
  learning: 'Learning',
};

export function definitionFor(type: SectionType): SectionDefinition {
  const definition = SECTION_BY_TYPE.get(type);
  if (!definition) throw new Error(`Unknown section type: ${type}`);
  return definition;
}

// --- Item factories ---------------------------------------------------------

export function newExperienceItem(): ExperienceItem {
  return {
    id: createId(),
    title: '',
    company: '',
    location: '',
    startDate: '',
    endDate: '',
    current: false,
    description: '',
    bullets: [''],
    technologies: [],
  };
}

export function newEducationItem(): EducationItem {
  return {
    id: createId(),
    degree: '',
    field: '',
    institution: '',
    location: '',
    startDate: '',
    endDate: '',
    current: false,
    gpa: '',
    coursework: [],
    bullets: [],
  };
}

export function newSkillGroup(name = ''): SkillGroup {
  return { id: createId(), name, skills: [] };
}

export function newProjectItem(): ProjectItem {
  return {
    id: createId(),
    name: '',
    role: '',
    description: '',
    technologies: [],
    url: '',
    github: '',
    startDate: '',
    endDate: '',
    bullets: [''],
  };
}

export function newCertificationItem(): CertificationItem {
  return {
    id: createId(),
    name: '',
    issuer: '',
    date: '',
    expiry: '',
    credentialId: '',
    credentialUrl: '',
  };
}

export function newListItem(): ListItem {
  return { id: createId(), title: '', subtitle: '', date: '', description: '', bullets: [] };
}

export function newPublicationItem(): PublicationItem {
  return { id: createId(), title: '', publisher: '', authors: '', date: '', url: '', description: '' };
}

export function newLanguageItem(): LanguageItem {
  return { id: createId(), name: '', proficiency: '' };
}

export function newReferenceItem(): ReferenceItem {
  return { id: createId(), name: '', title: '', company: '', email: '', phone: '', relationship: '' };
}

/** Build an empty section of the given type, ready to drop into the document. */
export function createSection(type: SectionType, title?: string): ResumeSection {
  const definition = definitionFor(type);
  const base = {
    id: createId(),
    type,
    title: title ?? definition.title,
    visible: true,
  };

  switch (definition.kind) {
    case 'text':
      return { ...base, kind: 'text', content: '' };
    case 'experience':
      return { ...base, kind: 'experience', items: [newExperienceItem()] };
    case 'education':
      return { ...base, kind: 'education', items: [newEducationItem()] };
    case 'skills':
      return {
        ...base,
        kind: 'skills',
        display: 'grouped',
        groups: [newSkillGroup(type === 'soft-skills' ? 'Strengths' : 'Languages')],
      };
    case 'projects':
      return { ...base, kind: 'projects', items: [newProjectItem()] };
    case 'certifications':
      return { ...base, kind: 'certifications', items: [newCertificationItem()] };
    case 'publications':
      return { ...base, kind: 'publications', items: [newPublicationItem()] };
    case 'languages':
      return { ...base, kind: 'languages', items: [newLanguageItem()] };
    case 'tags':
      return { ...base, kind: 'tags', tags: [] };
    case 'references':
      return { ...base, kind: 'references', items: [newReferenceItem()], hideDetails: false };
    case 'list':
    default:
      return { ...base, kind: 'list', items: [newListItem()] };
  }
}

/** How many entries a section holds - shown as a count in the section list. */
export function sectionItemCount(section: ResumeSection): number {
  switch (section.kind) {
    case 'text':
      return section.content.trim() ? 1 : 0;
    case 'skills':
      return section.groups.reduce((total, group) => total + group.skills.length, 0);
    case 'tags':
      return section.tags.length;
    default:
      return section.items.length;
  }
}

/** True when a section has no meaningful content yet. */
export function isSectionEmpty(section: ResumeSection): boolean {
  return sectionItemCount(section) === 0;
}
