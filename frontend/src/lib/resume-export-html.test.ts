import { afterEach, describe, expect, it } from 'vitest';

import { serializeResumeForExport } from './resume-export-html';

describe('serializeResumeForExport', () => {
  afterEach(() => {
    document.head.innerHTML = '';
    document.body.innerHTML = '';
  });

  it('captures the live template markup and drops editor page guides', () => {
    const style = document.createElement('style');
    style.textContent = '.resume-name { font-weight: 700; color: var(--resume-accent); }';
    document.head.append(style);

    document.body.innerHTML = `
      <div class="resume-document" style="--resume-accent:#1e3a5f; --resume-font-size:10.5pt">
        <div style="height: 400px">
          <div id="resume-print-root" class="resume-page" style="transform: scale(0.5)">
            <header class="resume-header" style="border-bottom: 1pt solid var(--resume-rule)">
              <div class="resume-name">Ada Lovelace</div>
              <div class="resume-role">Mathematician</div>
            </header>
            <section class="resume-section">
              <h2 class="resume-section__title resume-section__title--uppercase">Education</h2>
              <hr class="resume-section__rule" />
            </section>
            <div class="resume-page__boundary"><span class="resume-page__number">Page 1 ends</span></div>
          </div>
        </div>
      </div>
    `;

    const html = serializeResumeForExport({ pageSize: 'a4' });

    expect(html).toContain('<!doctype html>');
    expect(html).toContain('class="pdf-render"');
    expect(html).toContain('size: A4');
    expect(html.toLowerCase()).toContain('transform: none');

    const body = html.split('<body>')[1] ?? html;
    expect(body).toContain('Ada Lovelace');
    expect(body).toContain('Education');
    expect(body).toContain('--resume-accent:#1e3a5f');
    expect(body).not.toContain('Page 1 ends');
    expect(body).not.toContain('resume-page__boundary');
  });

  it('returns an empty string when the preview is not mounted', () => {
    document.body.innerHTML = '<p>No resume</p>';
    expect(serializeResumeForExport()).toBe('');
  });
});
