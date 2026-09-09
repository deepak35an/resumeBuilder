/**
 * Fictional preview resume used by the template gallery and public examples.
 * Not a real person.
 */

import { createId } from '@/lib/utils';
import { defaultSettings } from '@/features/resume/defaults';
import { initialsAvatarDataUrl } from '@/lib/resume-photo';
import type { ResumeData, ResumeSettings } from '@/types/resume';

export const SAMPLE_PERSON_NAME = 'Jordan Hale';

export function sampleSettings(overrides: Partial<ResumeSettings> = {}): ResumeSettings {
  return { ...defaultSettings(), ...overrides };
}

export function sampleResumeData(): ResumeData {
  return {
    version: 1,
    personal: {
      fullName: 'Jordan Hale',
      title: 'Software Engineer',
      email: 'jordan.hale@example.com',
      phone: '(555) 014-8831',
      location: 'Austin, TX',
      linkedin: 'linkedin.com/in/jordanhale',
      github: 'github.com/jordanhale',
      portfolio: 'jordanhale.dev',
      website: '',
      links: [],
      photo: initialsAvatarDataUrl(SAMPLE_PERSON_NAME, '#1e3a5f'),
    },
    sections: [
      {
        id: createId(),
        type: 'summary',
        kind: 'text',
        title: 'Professional Summary',
        visible: true,
        content:
          'Software engineer with six years building reliable product APIs and web clients. Led the payments platform that cut failed checkouts by 41% and mentors a squad of four engineers.',
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
            title: 'Software Engineer',
            company: 'Harborline Systems',
            location: 'Austin, TX',
            startDate: '2022-03',
            endDate: '',
            current: true,
            description: '',
            bullets: [
              'Owned the TypeScript checkout service used by 1.4M monthly buyers, reducing payment failures from 3.8% to 2.2%.',
              'Designed a feature-flag rollout that shipped weekly without weekend incidents for 11 consecutive months.',
              'Mentored four engineers; two were promoted after shipping independently owned services.',
            ],
            technologies: ['TypeScript', 'React', 'Node.js', 'PostgreSQL'],
          },
          {
            id: createId(),
            title: 'Software Engineer',
            company: 'Cedar & Pine',
            location: 'Remote',
            startDate: '2019-06',
            endDate: '2022-02',
            current: false,
            description: '',
            bullets: [
              'Rebuilt the inventory sync job in Python, cutting nightly runtime from 4 hours to 38 minutes.',
              'Added contract tests across eight services, removing the majority of release-blocking integration bugs.',
              'Partnered with support to write runbooks that halved median incident recovery time.',
            ],
            technologies: ['Python', 'Django', 'Redis', 'AWS'],
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
            institution: 'University of Texas at Austin',
            location: 'Austin, TX',
            startDate: '2015-08',
            endDate: '2019-05',
            current: false,
            gpa: '',
            coursework: ['Algorithms', 'Distributed Systems', 'Databases'],
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
            skills: ['TypeScript', 'Python', 'SQL', 'Go'],
          },
          {
            id: createId(),
            name: 'Frameworks',
            skills: ['React', 'Node.js', 'Django', 'FastAPI'],
          },
          {
            id: createId(),
            name: 'Infrastructure',
            skills: ['PostgreSQL', 'Redis', 'Docker', 'AWS'],
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
            name: 'Signalboard',
            role: 'Creator',
            description:
              'Open-source incident dashboard used by student engineering clubs to track on-call rotations.',
            technologies: ['TypeScript', 'SQLite'],
            url: '',
            github: 'github.com/jordanhale/signalboard',
            startDate: '2021-04',
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
            name: 'AWS Certified Developer – Associate',
            issuer: 'Amazon Web Services',
            date: '2023-08',
            expiry: '2026-08',
            credentialId: '',
            credentialUrl: '',
          },
        ],
      },
      {
        id: createId(),
        type: 'languages',
        kind: 'languages',
        title: 'Languages',
        visible: true,
        items: [
          { id: createId(), name: 'English', proficiency: 'Native' },
          { id: createId(), name: 'Spanish', proficiency: 'Conversational' },
        ],
      },
    ],
  };
}

/** Alias used by gallery cards and marketing previews. */
export const sampleResume = sampleResumeData;
