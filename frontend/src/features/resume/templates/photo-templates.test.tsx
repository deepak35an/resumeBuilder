import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { sampleResumeData, sampleSettings } from '../sampleData';
import { TEMPLATES, templateById } from '../templates/registry';

describe('photo template rendering', () => {
  const data = sampleResumeData();
  const photoIds = [
    'portrait-sidebar',
    'header-portrait',
    'photo-split',
    'portrait-right',
    'centered-portrait',
  ] as const;

  it.each(photoIds)('renders a photo on %s', (id) => {
    const template = templateById(id);
    const { container } = render(
      <template.component data={data} settings={sampleSettings(template.settingsDefaults)} />,
    );
    expect(container.querySelector('.resume-photo')).not.toBeNull();
  });

  it('hides the photo on Classic ATS even when personal.photo is set', () => {
    const template = templateById('classic-ats');
    const { container } = render(
      <template.component data={data} settings={sampleSettings()} />,
    );
    expect(container.querySelector('.resume-photo')).toBeNull();
    expect(container.textContent).toContain(data.personal.fullName);
  });

  it('honours showPhoto=false on a photo template', () => {
    const template = templateById('portrait-sidebar');
    const { container } = render(
      <template.component
        data={data}
        settings={sampleSettings({ ...template.settingsDefaults, showPhoto: false })}
      />,
    );
    expect(container.querySelector('.resume-photo')).toBeNull();
  });

  it('keeps unique ids after adding photo templates', () => {
    expect(new Set(TEMPLATES.map((template) => template.id)).size).toBe(TEMPLATES.length);
  });
});
