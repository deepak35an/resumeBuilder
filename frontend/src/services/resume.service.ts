import { api } from '@/lib/api-client';
import type {
  MessageResponse,
  ParsedResumeResponse,
  Resume,
  ResumeSummary,
  ResumeVersion,
} from '@/types/api';
import type { ResumeData, ResumeSettings } from '@/types/resume';

export interface CreateResumePayload {
  title?: string;
  templateId?: string;
  data?: ResumeData;
  settings?: ResumeSettings;
}

export interface UpdateResumePayload {
  title?: string;
  templateId?: string;
  data?: ResumeData;
  settings?: ResumeSettings;
  /** Autosaves snapshot at most once per interval; explicit saves always do. */
  autosave?: boolean;
}

export const resumeService = {
  list: (params?: { search?: string; includeDeleted?: boolean }) =>
    api.get<ResumeSummary[]>('/resumes', {
      query: { search: params?.search, includeDeleted: params?.includeDeleted },
    }),

  get: (id: string) => api.get<Resume>(`/resumes/${id}`),

  create: (payload: CreateResumePayload = {}) => api.post<Resume>('/resumes', payload),

  update: (id: string, payload: UpdateResumePayload) =>
    api.patch<Resume>(`/resumes/${id}`, payload),

  remove: (id: string) => api.delete<MessageResponse>(`/resumes/${id}`),

  restore: (id: string) => api.post<Resume>(`/resumes/${id}/restore`),

  duplicate: (id: string, title?: string) =>
    api.post<Resume>(`/resumes/${id}/duplicate`, { title }),

  listVersions: (id: string) => api.get<ResumeVersion[]>(`/resumes/${id}/versions`),

  createVersion: (id: string, name?: string) =>
    api.post<ResumeVersion>(`/resumes/${id}/versions`, { name }),

  getVersion: (id: string, versionId: string) =>
    api.get<ResumeVersion>(`/resumes/${id}/versions/${versionId}`),

  restoreVersion: (id: string, versionId: string) =>
    api.post<Resume>(`/resumes/${id}/versions/${versionId}/restore`),

  blank: () => api.get<{ data: ResumeData; settings: ResumeSettings }>('/resumes/blank'),

  exportJson: (id: string) => api.get<unknown>(`/resumes/${id}/export.json`),

  importJson: (payload: unknown) => api.post<Resume>('/resumes/import.json', payload),

  tailor: (id: string, payload: { title: string; jobTitle: string; company: string }) =>
    api.post<Resume>(`/resumes/${id}/tailor`, payload),

  importFile: (file: File) => {
    const body = new FormData();
    body.append('file', file);
    return api.post<ParsedResumeResponse>('/resumes/import', body);
  },

  importText: (text: string) =>
    api.post<ParsedResumeResponse>('/resumes/import-text', { text }),
};
