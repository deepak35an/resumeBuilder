import { api } from '@/lib/api-client';
import type { BlogPost, BlogPostSummary, MessageResponse, Page } from '@/types/api';

export interface ExampleRoleContent {
  slug: string;
  title: string;
  headline: string;
  excerpt: string;
  body: string;
  recommendedTemplates: string[];
  faqs: Array<{ question: string; answer: string }>;
  atsTips: string[];
}

export interface ContactPayload {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export const contentService = {
  listBlog: (params?: { search?: string; page?: number; pageSize?: number }) =>
    api.get<Page<BlogPostSummary>>('/content/blog', { query: params }),

  getBlog: (slug: string) => api.get<BlogPost>(`/content/blog/${slug}`),

  listExamples: () => api.get<ExampleRoleContent[]>('/content/examples'),

  getExample: (slug: string) => api.get<ExampleRoleContent>(`/content/examples/${slug}`),

  contact: (payload: ContactPayload) => api.post<MessageResponse>('/content/contact', payload),
};
