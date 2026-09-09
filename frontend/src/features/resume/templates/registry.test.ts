import { describe, expect, it } from 'vitest';

import { TEMPLATES, templateById, templateBySlug } from './registry';

describe('template registry', () => {
  it('exports 53 templates', () => {
    expect(TEMPLATES).toHaveLength(53);
  });

  it('has unique ids and slugs', () => {
    const ids = TEMPLATES.map((template) => template.id);
    const slugs = TEMPLATES.map((template) => template.slug);
    expect(new Set(ids).size).toBe(53);
    expect(new Set(slugs).size).toBe(53);
  });

  it('covers the five categories with the specified counts', () => {
    const counts = TEMPLATES.reduce<Record<string, number>>((acc, template) => {
      acc[template.category] = (acc[template.category] ?? 0) + 1;
      return acc;
    }, {});
    expect(counts).toEqual({
      ats: 10,
      tech: 13,
      business: 9,
      student: 7,
      creative: 14,
    });
  });

  it('resolves Classic ATS as the default', () => {
    expect(templateById('missing').slug).toBe('classic-ats');
    expect(templateBySlug('classic-ats')?.name).toBe('Classic ATS');
    expect(templateBySlug('bold-header')?.name).toBe('Bold Header');
  });

  it('opts photo templates in and keeps ATS templates photo-free', () => {
    const photoIds = [
      'portrait-sidebar',
      'header-portrait',
      'photo-split',
      'portrait-right',
      'centered-portrait',
    ];
    for (const id of photoIds) {
      expect(templateById(id).supportsPhoto).toBe(true);
    }
    expect(TEMPLATES.filter((template) => template.supportsPhoto)).toHaveLength(5);
    expect(TEMPLATES.filter((template) => template.category === 'ats').every((template) => !template.supportsPhoto)).toBe(
      true,
    );
  });
});
