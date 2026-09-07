import { api } from '@/lib/api-client';
import type { ResumeData, ResumeSettings } from '@/types/resume';

export interface ExportPayload {
  resumeId?: string;
  data?: ResumeData;
  settings?: ResumeSettings;
  templateId?: string;
}

export const exportService = {
  pdf: (body: ExportPayload) => api.download('/export/pdf', body),

  docx: (body: ExportPayload) => api.download('/export/docx', body),
};
