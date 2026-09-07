import { describe, expect, it } from 'vitest';

import { bandForScore } from '@/components/ui';

describe('ATS quality bands', () => {
  it('maps heuristic ranges used in the product', () => {
    expect(bandForScore(95)).toBe('excellent');
    expect(bandForScore(80)).toBe('good');
    expect(bandForScore(65)).toBe('needs-improvement');
    expect(bandForScore(40)).toBe('needs-major-improvement');
  });
});
