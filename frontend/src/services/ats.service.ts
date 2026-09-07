import { api } from '@/lib/api-client';
import type { ATSReport, JobMatchReport, Page } from '@/types/api';
import type { ResumeData, ResumeSettings } from '@/types/resume';

export interface AnalyzePayload {
  resumeId?: string;
  data?: ResumeData;
  settings?: ResumeSettings;
  templateId?: string;
  text?: string;
  jobTitle?: string;
  company?: string;
  jobDescription?: string;
}

export interface JobMatchPayload {
  resumeId?: string;
  data?: ResumeData;
  jobDescriptionId?: string;
  jobTitle?: string;
  company?: string;
  jobDescription: string;
}

export const atsService = {
  analyze: (payload: AnalyzePayload) => api.post<ATSReport>('/ats/analyze', payload),

  jobMatch: (payload: JobMatchPayload) => api.post<JobMatchReport>('/ats/job-match', payload),

  listReports: (params?: { page?: number; pageSize?: number }) =>
    api.get<Page<ATSReport>>('/ats/reports', { query: params }),

  getReport: (id: string) => api.get<ATSReport>(`/ats/reports/${id}`),
};
