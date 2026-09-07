import { api } from '@/lib/api-client';
import type { AIAction, AISuggestion, CopilotInsight, SummarySuggestion } from '@/types/api';
import type { ResumeData } from '@/types/resume';

export interface RewritePayload {
  text: string;
  action: AIAction;
  context?: string;
  resumeId?: string;
}

export interface SummaryPayload {
  data: ResumeData;
  tone?: string;
  resumeId?: string;
}

export interface CopilotPayload {
  resumeId?: string;
  data?: ResumeData;
  jobDescription?: string;
}

export const aiService = {
  rewrite: (payload: RewritePayload) => api.post<AISuggestion>('/ai/rewrite', payload),

  summary: (payload: SummaryPayload) => api.post<SummarySuggestion>('/ai/summary', payload),

  copilot: (payload: CopilotPayload) =>
    api.post<{ insights: CopilotInsight[]; notice: string }>('/ai/copilot', payload),
};
