/**
 * Renders a resume as real, selectable HTML at physical page dimensions.
 *
 * Pagination is shown rather than simulated: content flows continuously and
 * dashed boundaries mark where a printed page would end. The browser's own
 * `break-inside` rules (see `styles/print.css`) do the real splitting for print
 * and for the Playwright PDF, so what you see is where the page actually breaks.
 */

import { useEffect, useLayoutEffect, useRef, useState } from 'react';

import { templateById } from '@/features/resume/templates/registry';
import { buildResumeStyle, mmToPx, pagePaddingMm, pageSizePx } from '@/lib/resume-style';
import { cn } from '@/lib/utils';
import type { ResumeData, ResumeSettings } from '@/types/resume';

export interface ResumeDocumentProps {
  data: ResumeData;
  settings: ResumeSettings;
  templateId: string;
  zoom?: number;
  /** Dashed page-break guides. Off for thumbnails and for print. */
  showPageBoundaries?: boolean;
  onPageCountChange?: (pages: number) => void;
  className?: string;
  /** Element id used by the PDF renderer to find the document root. */
  id?: string;
}

export function ResumeDocument({
  data,
  settings,
  templateId,
  zoom = 1,
  showPageBoundaries = true,
  onPageCountChange,
  className,
  id,
}: ResumeDocumentProps) {
  const template = templateById(templateId);
  const Template = template.component;
  const pageRef = useRef<HTMLDivElement>(null);
  const [contentHeight, setContentHeight] = useState(0);

  const page = pageSizePx(settings.pageSize);
  const paddingPx = mmToPx(pagePaddingMm(settings.margin));
  const usableHeight = page.height - paddingPx * 2;
  const pageCount = Math.max(1, Math.ceil((contentHeight - 1) / usableHeight) || 1);

  useLayoutEffect(() => {
    const element = pageRef.current;
    if (!element) return;

    const measure = () => setContentHeight(element.scrollHeight - paddingPx * 2);
    measure();

    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, [paddingPx, data, settings, templateId]);

  useEffect(() => {
    onPageCountChange?.(pageCount);
  }, [pageCount, onPageCountChange]);

  const boundaries = Array.from({ length: Math.max(0, pageCount - 1) }, (_, index) => index + 1);

  return (
    <div
      className={cn('resume-document', className)}
      style={buildResumeStyle(settings, { zoom })}
      // The document is a faithful visual copy of the export; announce it as one.
      role="document"
      aria-label={`${data.personal.fullName || 'Untitled'} resume preview`}
    >
      <div
        style={{
          width: page.width * zoom,
          height: Math.max(page.height, contentHeight + paddingPx * 2) * zoom,
        }}
      >
        <div
          id={id}
          ref={pageRef}
          className="resume-page"
          style={{
            transform: zoom === 1 ? undefined : `scale(${zoom})`,
            transformOrigin: 'top left',
          }}
        >
          <Template data={data} settings={settings} preview />

          {showPageBoundaries &&
            boundaries.map((index) => (
              <div
                key={index}
                className="resume-page__boundary"
                style={{ top: paddingPx + usableHeight * index }}
                aria-hidden="true"
              >
                <span
                  className="resume-page__number"
                  style={{ position: 'absolute', right: 0, top: -14 }}
                >
                  Page {index} ends
                </span>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
