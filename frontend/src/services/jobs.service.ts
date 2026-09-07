import { api } from '@/lib/api-client';
import type { Application, ApplicationStatus, JobDescription, MessageResponse } from '@/types/api';

export interface JobPayload {
  title: string;
  company?: string | null;
  location?: string | null;
  url?: string | null;
  content: string;
}

export interface ApplicationPayload {
  jobTitle: string;
  company?: string | null;
  status?: ApplicationStatus;
  resumeId?: string | null;
  jobDescriptionId?: string | null;
  atsReportId?: string | null;
  notes?: string | null;
  appliedAt?: string | null;
}

export const jobsService = {
  list: () => api.get<JobDescription[]>('/jobs'),

  get: (id: string) => api.get<JobDescription>(`/jobs/${id}`),

  create: (payload: JobPayload) => api.post<JobDescription>('/jobs', payload),

  update: (id: string, payload: Partial<JobPayload>) =>
    api.patch<JobDescription>(`/jobs/${id}`, payload),

  remove: (id: string) => api.delete<MessageResponse>(`/jobs/${id}`),

  listApplications: () => api.get<Application[]>('/applications'),

  createApplication: (payload: ApplicationPayload) =>
    api.post<Application>('/applications', payload),

  updateApplication: (id: string, payload: Partial<ApplicationPayload>) =>
    api.patch<Application>(`/applications/${id}`, payload),

  removeApplication: (id: string) => api.delete<MessageResponse>(`/applications/${id}`),
};
