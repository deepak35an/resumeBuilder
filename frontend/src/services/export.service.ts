import { api } from '@/lib/api-client';
import type { ResumeData, ResumeSettings } from '@/types/resume';

export interface ExportPayload {
  resumeId?: string;
  data?: ResumeData;
  settings?: ResumeSettings;
  templateId?: string;
  /** Live preview HTML so PDF/DOCX match the selected template. */
  html?: string;
}

export const exportService = {
  pdf: (body: ExportPayload) => api.download('/export/pdf', body, { timeoutMs: 60_000 }),

  docx: (body: ExportPayload) => api.download('/export/docx', body, { timeoutMs: 60_000 }),
};
