import { api } from '@/lib/api-client';
import type {
  AdminErrorRow,
  AdminStats,
  AdminUserRow,
  BlogPost,
  BlogPostSummary,
  MessageResponse,
  Page,
  Plan,
  Template,
} from '@/types/api';

export interface AdminUserPatch {
  plan?: Plan;
  role?: 'user' | 'admin';
  isActive?: boolean;
}

export interface AdminTemplatePatch {
  isPremium?: boolean;
  isRecommended?: boolean;
  templateConfig?: Record<string, unknown>;
}

export interface AdminBlogPayload {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  author?: string;
  category?: string;
  tags?: string[];
  publishedAt?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
}

export const adminService = {
  stats: () => api.get<AdminStats>('/admin/stats'),

  users: (params?: { search?: string; page?: number; pageSize?: number }) =>
    api.get<Page<AdminUserRow>>('/admin/users', { query: params }),

  patchUser: (id: string, payload: AdminUserPatch) =>
    api.patch<AdminUserRow>(`/admin/users/${id}`, payload),

  templates: () => api.get<Template[]>('/admin/templates'),

  patchTemplate: (id: string, payload: AdminTemplatePatch) =>
    api.patch<Template>(`/admin/templates/${id}`, payload),

  listBlog: () => api.get<BlogPostSummary[]>('/admin/blog'),

  createBlog: (payload: AdminBlogPayload) => api.post<BlogPost>('/admin/blog', payload),

  updateBlog: (id: string, payload: Partial<AdminBlogPayload>) =>
    api.patch<BlogPost>(`/admin/blog/${id}`, payload),

  deleteBlog: (id: string) => api.delete<MessageResponse>(`/admin/blog/${id}`),

  errors: (params?: { page?: number; pageSize?: number }) =>
    api.get<Page<AdminErrorRow>>('/admin/errors', { query: params }),
};
