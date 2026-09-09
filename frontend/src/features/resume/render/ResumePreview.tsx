/** Preview panel: the live document plus zoom, fit and page-count controls. */

import { Maximize2, Minus, Plus, RotateCcw } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

import { Badge, IconButton, Tooltip } from '@/components/ui';
import { ResumeDocument } from '@/features/resume/render/ResumeDocument';
import { RESUME_PRINT_ROOT_ID } from '@/lib/resume-export-html';
import { pageSizePx } from '@/lib/resume-style';
import { clamp, cn } from '@/lib/utils';
import type { ResumeData, ResumeSettings } from '@/types/resume';

const MIN_ZOOM = 0.4;
const MAX_ZOOM = 1.6;
const ZOOM_STEP = 0.1;

export interface ResumePreviewProps {
  data: ResumeData;
  settings: ResumeSettings;
  templateId: string;
  className?: string;
  toolbarExtra?: React.ReactNode;
}

export function ResumePreview({
  data,
  settings,
  templateId,
  className,
  toolbarExtra,
}: ResumePreviewProps) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  const [fitToWidth, setFitToWidth] = useState(true);
  const [pageCount, setPageCount] = useState(1);

  /** Fit the page to the panel, but never below a readable size. */
  const fit = useCallback(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const available = viewport.clientWidth - 48;
    const pageWidth = pageSizePx(settings.pageSize).width;
    if (available <= 0) return;
    setZoom(clamp(Number((available / pageWidth).toFixed(3)), MIN_ZOOM, 1.15));
  }, [settings.pageSize]);

  useEffect(() => {
    if (!fitToWidth) return;
    fit();
    const viewport = viewportRef.current;
    if (!viewport) return;
    const observer = new ResizeObserver(fit);
    observer.observe(viewport);
    return () => observer.disconnect();
  }, [fit, fitToWidth]);

  const changeZoom = (delta: number) => {
    setFitToWidth(false);
    setZoom((current) => clamp(Number((current + delta).toFixed(2)), MIN_ZOOM, MAX_ZOOM));
  };

  return (
    <div className={cn('flex h-full min-h-0 flex-col bg-surface-sunken', className)}>
      <div className="flex items-center gap-2 border-b border-border bg-surface px-3 py-2">
        <Badge tone="neutral" size="xs">
          {settings.pageSize === 'a4' ? 'A4' : 'Letter'}
        </Badge>
        <span className="text-xs text-muted-foreground">
          {pageCount} {pageCount === 1 ? 'page' : 'pages'}
        </span>
        {pageCount > 2 && (
          <Tooltip content="Most recruiters expect one page early in a career, two at most later on.">
            <span className="cursor-help text-xs text-warning-foreground underline decoration-dotted">
              Long
            </span>
          </Tooltip>
        )}

        <div className="ml-auto flex items-center gap-1">
          {toolbarExtra}
          <IconButton
            size="sm"
            variant="ghost"
            label="Zoom out"
            icon={<Minus />}
            disabled={zoom <= MIN_ZOOM}
            onClick={() => changeZoom(-ZOOM_STEP)}
          />
          <span className="w-10 text-center text-xs tabular-nums text-muted-foreground">
            {Math.round(zoom * 100)}%
          </span>
          <IconButton
            size="sm"
            variant="ghost"
            label="Zoom in"
            icon={<Plus />}
            disabled={zoom >= MAX_ZOOM}
            onClick={() => changeZoom(ZOOM_STEP)}
          />
          <Tooltip content="Fit to panel width">
            <IconButton
              size="sm"
              variant={fitToWidth ? 'subtle' : 'ghost'}
              label="Fit to width"
              icon={<Maximize2 />}
              onClick={() => setFitToWidth(true)}
            />
          </Tooltip>
          <Tooltip content="Reset to 100%">
            <IconButton
              size="sm"
              variant="ghost"
              label="Reset zoom"
              icon={<RotateCcw />}
              onClick={() => {
                setFitToWidth(false);
                setZoom(1);
              }}
            />
          </Tooltip>
        </div>
      </div>

      <div ref={viewportRef} className="min-h-0 flex-1 overflow-auto">
        <div className="resume-viewport">
          <ResumeDocument
            data={data}
            settings={settings}
            templateId={templateId}
            zoom={zoom}
            onPageCountChange={setPageCount}
            id={RESUME_PRINT_ROOT_ID}
          />
        </div>
      </div>
    </div>
  );
}
