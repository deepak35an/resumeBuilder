import { describe, expect, it } from 'vitest';

import { completenessScore } from './health';
import { sampleResumeData } from './sampleData';

describe('completenessScore', () => {
  it('scores a filled fictional resume above an empty one', () => {
    const filled = completenessScore(sampleResumeData());
    expect(filled).toBeGreaterThan(40);
  });
});
