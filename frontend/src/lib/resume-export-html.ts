/**
 * Snapshot the live resume preview as a standalone HTML document.
 *
 * PDF (Playwright) and DOCX both consume this markup so the download matches
 * Academic Simple and every other template, rather than a generic text dump.
 */

export const RESUME_PRINT_ROOT_ID = 'resume-print-root';

const CSS_KEEP = /resume-|pdf-render|@page|@font-face|\.text-center\b/;

export interface SerializeResumeHtmlOptions {
  pageSize?: 'a4' | 'letter';
  root?: ParentNode | null;
}

function collectResumeCss(root: ParentNode = document): string {
  const chunks: string[] = [];
  const sheets =
    'styleSheets' in root
      ? Array.from((root as Document).styleSheets)
      : Array.from(document.styleSheets);

  for (const sheet of sheets) {
    let rules: CSSRuleList;
    try {
      rules = sheet.cssRules;
    } catch {
      continue;
    }
    for (const rule of Array.from(rules)) {
      if (CSS_KEEP.test(rule.cssText)) {
        chunks.push(rule.cssText);
      }
    }
  }
  return chunks.join('\n');
}

function pageCss(pageSize: 'a4' | 'letter'): string {
  const size = pageSize === 'letter' ? 'Letter' : 'A4';
  return `
@page { size: ${size}; margin: 0; }
html, body {
  margin: 0;
  padding: 0;
  background: #ffffff;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}
h1, h2, h3, h4, p, ul, ol, hr {
  margin: 0;
  padding: 0;
  font-size: inherit;
  font-weight: inherit;
  color: inherit;
  letter-spacing: inherit;
  text-transform: inherit;
}
.text-center { text-align: center; }
.resume-page {
  transform: none !important;
  overflow: visible !important;
  box-shadow: none !important;
  min-height: 0 !important;
  height: auto !important;
}
.resume-page__boundary,
.resume-page__number { display: none !important; }
`.trim();
}

function findPrintRoot(scope: ParentNode): HTMLElement | null {
  const byId =
    scope instanceof Document
      ? scope.getElementById(RESUME_PRINT_ROOT_ID)
      : scope.querySelector(`#${RESUME_PRINT_ROOT_ID}`);
  if (byId instanceof HTMLElement) return byId;
  const page = scope.querySelector('.resume-page');
  return page instanceof HTMLElement ? page : null;
}

/**
 * Returns a full HTML document, or an empty string when the preview is not mounted.
 */
export function serializeResumeForExport(options: SerializeResumeHtmlOptions = {}): string {
  const scope = options.root ?? document;
  const page = findPrintRoot(scope);
  if (!page) return '';

  const documentEl = page.closest('.resume-document') ?? page;
  const clone = documentEl.cloneNode(true) as HTMLElement;
  clone.querySelectorAll('.resume-page__boundary, .resume-page__number').forEach((node) => node.remove());

  const clonedPage = clone.classList.contains('resume-page')
    ? clone
    : clone.querySelector('.resume-page');
  if (clonedPage instanceof HTMLElement) {
    clonedPage.style.transform = 'none';
    clonedPage.style.height = 'auto';
    clonedPage.style.minHeight = '0';
    clonedPage.style.overflow = 'visible';
    clonedPage.style.boxShadow = 'none';
  }

  if (clone instanceof HTMLElement && clone.classList.contains('resume-document')) {
    const innerPage = clone.querySelector('.resume-page');
    if (innerPage) {
      clone.replaceChildren(innerPage);
    }
  }

  const pageSize = options.pageSize === 'letter' ? 'letter' : 'a4';
  const css = collectResumeCss(scope instanceof Document ? scope : document);

  return `<!doctype html>
<html class="pdf-render" lang="en">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>Resume</title>
<style>
${pageCss(pageSize)}
${css}
</style>
</head>
<body>
${clone.outerHTML}
</body>
</html>`;
}

/** Open the captured template in a print dialog so Save as PDF matches the preview. */
export function printResumeHtml(html: string): void {
  const frame = document.createElement('iframe');
  frame.title = 'Resume print preview';
  frame.setAttribute('aria-hidden', 'true');
  frame.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0;';
  document.body.append(frame);

  const doc = frame.contentDocument;
  const win = frame.contentWindow;
  if (!doc || !win) {
    frame.remove();
    throw new Error('Could not open a print preview.');
  }

  doc.open();
  doc.write(html);
  doc.close();

  const cleanup = () => {
    window.setTimeout(() => frame.remove(), 1500);
  };

  const trigger = () => {
    win.focus();
    win.addEventListener('afterprint', cleanup, { once: true });
    win.print();
    window.setTimeout(cleanup, 60_000);
  };

  const images = Array.from(doc.images);
  const ready = images.length === 0 || images.every((image) => image.complete);
  if (ready) {
    window.setTimeout(trigger, 50);
    return;
  }

  void Promise.all(
    images.map(
      (image) =>
        new Promise<void>((resolve) => {
          image.addEventListener('load', () => resolve(), { once: true });
          image.addEventListener('error', () => resolve(), { once: true });
        }),
    ),
  ).then(() => window.setTimeout(trigger, 50));
}
