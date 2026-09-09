import { describe, expect, it } from 'vitest';

import { initialsAvatarDataUrl, initialsFromName } from './resume-photo';

describe('resume photo helpers', () => {
  it('builds initials from a full name', () => {
    expect(initialsFromName('Jordan Hale')).toBe('JH');
    expect(initialsFromName('Avery')).toBe('AV');
    expect(initialsFromName('')).toBe('?');
  });

  it('encodes a sample avatar as an svg data url', () => {
    const src = initialsAvatarDataUrl('Jordan Hale');
    expect(src.startsWith('data:image/svg+xml')).toBe(true);
    expect(src).toContain('JH');
  });
});
