import { describe, expect, it } from 'vitest';

import { TEMPLATES, templateById, templateBySlug } from './registry';

describe('template registry', () => {
  it('exports 44 templates', () => {
    expect(TEMPLATES).toHaveLength(44);
  });

  it('has unique ids and slugs', () => {
    const ids = TEMPLATES.map((template) => template.id);
    const slugs = TEMPLATES.map((template) => template.slug);
    expect(new Set(ids).size).toBe(44);
    expect(new Set(slugs).size).toBe(44);
  });

  it('covers the five categories with the specified counts', () => {
    const counts = TEMPLATES.reduce<Record<string, number>>((acc, template) => {
      acc[template.category] = (acc[template.category] ?? 0) + 1;
      return acc;
    }, {});
    expect(counts).toEqual({
      ats: 10,
      tech: 12,
      business: 8,
      student: 7,
      creative: 7,
    });
  });

  it('resolves Classic ATS as the default', () => {
    expect(templateById('missing').slug).toBe('classic-ats');
    expect(templateBySlug('classic-ats')?.name).toBe('Classic ATS');
    expect(templateBySlug('bold-header')?.name).toBe('Bold Header');
  });
});
