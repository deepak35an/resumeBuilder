import { api } from '@/lib/api-client';
import type { Template, TemplateCategory } from '@/types/api';

export const templatesService = {
  list: (params?: { category?: TemplateCategory; search?: string }) =>
    api.get<Template[]>('/templates', { query: params }),

  get: (slug: string) => api.get<Template>(`/templates/${slug}`),
};
