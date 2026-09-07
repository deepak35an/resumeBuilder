/** Blank documents and default settings, kept in sync with the backend. */

import { createId } from '@/lib/utils';
import { SECTION_DEFINITIONS, createSection } from '@/features/resume/sections';
import type { PersonalInfo, ResumeData, ResumeSettings } from '@/types/resume';

export function emptyPersonalInfo(): PersonalInfo {
  return {
    fullName: '',
    title: '',
    email: '',
    phone: '',
    location: '',
    linkedin: '',
    github: '',
    portfolio: '',
    website: '',
    links: [],
  };
}

export function defaultSettings(): ResumeSettings {
  return {
    pageSize: 'a4',
    fontFamily: 'Inter',
    fontSize: 10.5,
    headingScale: 1,
    lineHeight: 1.4,
    margin: 'normal',
    sectionSpacing: 1,
    accentColor: '#111827',
    dateFormat: 'short-month',
    showIcons: false,
    uppercaseHeadings: true,
    bulletChar: '\u2022',
  };
}

export function blankResumeData(): ResumeData {
  return {
    version: 1,
    personal: emptyPersonalInfo(),
    sections: SECTION_DEFINITIONS.filter((definition) => definition.default).map((definition) =>
      createSection(definition.type),
    ),
  };
}

/**
 * A fictional, fully populated resume. Used by template previews, the gallery
 * and example pages so cards render real components rather than screenshots.
 */
export function sampleResumeData(): ResumeData {
  return {
    version: 1,
    personal: {
      fullName: 'Avery Chen',
      title: 'Senior Product Engineer',
      email: 'avery.chen@example.com',
      phone: '(555) 014-2288',
      location: 'Seattle, WA',
      linkedin: 'linkedin.com/in/averychen',
      github: 'github.com/averychen',
      portfolio: 'averychen.dev',
      website: '',
      links: [],
    },
    sections: [
      {
        id: createId(),
        type: 'summary',
        kind: 'text',
        title: 'Professional Summary',
        visible: true,
        content:
          'Product engineer with seven years building data-heavy web applications. Led the platform team that took a checkout service from 92% to 99.98% availability, and shipped the design system now used by 40 engineers.',
      },
      {
        id: createId(),
        type: 'experience',
        kind: 'experience',
        title: 'Work Experience',
        visible: true,
        items: [
          {
            id: createId(),
            title: 'Senior Product Engineer',
            company: 'Northwind Commerce',
            location: 'Seattle, WA',
            startDate: '2022-04',
            endDate: '',
            current: true,
            description: '',
            bullets: [
              'Rebuilt the checkout pipeline in TypeScript and Go, cutting p95 latency from 1.9s to 420ms for 2.1M monthly orders.',
              'Led a team of five to ship a shared design system, reducing new-feature UI build time by 35%.',
              'Introduced contract tests across 12 services, which removed 80% of release-blocking integration failures.',
            ],
            technologies: ['TypeScript', 'React', 'Go', 'PostgreSQL'],
          },
          {
            id: createId(),
            title: 'Product Engineer',
            company: 'Cascade Analytics',
            location: 'Portland, OR',
            startDate: '2019-01',
            endDate: '2022-03',
            current: false,
            description: '',
            bullets: [
              'Built a reporting engine that replaced manual spreadsheets for 300 enterprise customers.',
              'Cut dashboard load time by 62% by moving aggregation into materialised views.',
              'Mentored three junior engineers, two of whom were promoted within a year.',
            ],
            technologies: ['Python', 'Django', 'Redis'],
          },
        ],
      },
      {
        id: createId(),
        type: 'education',
        kind: 'education',
        title: 'Education',
        visible: true,
        items: [
          {
            id: createId(),
            degree: 'B.S.',
            field: 'Computer Science',
            institution: 'University of Washington',
            location: 'Seattle, WA',
            startDate: '2014-09',
            endDate: '2018-06',
            current: false,
            gpa: '3.8/4.0',
            coursework: ['Distributed Systems', 'Databases', 'Human-Computer Interaction'],
            bullets: [],
          },
        ],
      },
      {
        id: createId(),
        type: 'technical-skills',
        kind: 'skills',
        title: 'Technical Skills',
        visible: true,
        display: 'grouped',
        groups: [
          {
            id: createId(),
            name: 'Languages',
            skills: ['TypeScript', 'Python', 'Go', 'SQL'],
          },
          {
            id: createId(),
            name: 'Frameworks',
            skills: ['React', 'Node.js', 'FastAPI', 'Django'],
          },
          {
            id: createId(),
            name: 'Infrastructure',
            skills: ['PostgreSQL', 'Redis', 'Docker', 'AWS', 'Terraform'],
          },
        ],
      },
      {
        id: createId(),
        type: 'projects',
        kind: 'projects',
        title: 'Projects',
        visible: true,
        items: [
          {
            id: createId(),
            name: 'Ledger',
            role: 'Creator',
            description:
              'Open-source double-entry accounting library with 3.4k GitHub stars and 60k monthly downloads.',
            technologies: ['TypeScript', 'SQLite'],
            url: '',
            github: 'github.com/averychen/ledger',
            startDate: '2021-02',
            endDate: '',
            bullets: [],
          },
        ],
      },
      {
        id: createId(),
        type: 'certifications',
        kind: 'certifications',
        title: 'Certifications',
        visible: true,
        items: [
          {
            id: createId(),
            name: 'AWS Certified Solutions Architect - Associate',
            issuer: 'Amazon Web Services',
            date: '2023-05',
            expiry: '2026-05',
            credentialId: '',
            credentialUrl: '',
          },
        ],
      },
    ],
  };
}
