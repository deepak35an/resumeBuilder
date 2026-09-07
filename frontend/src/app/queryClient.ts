import { QueryClient } from '@tanstack/react-query';

import { ApiError } from '@/lib/api-client';

/**
 * Server-state defaults.
 *
 * Client errors are never retried (a 404 or a plan limit will not fix itself),
 * while transient network and server failures get two attempts.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      gcTime: 5 * 60_000,
      refetchOnWindowFocus: false,
      retry: (failureCount, error) => {
        if (error instanceof ApiError && error.status >= 400 && error.status < 500) return false;
        return failureCount < 2;
      },
    },
    mutations: {
      retry: false,
    },
  },
});

export const queryKeys = {
  entitlements: ['entitlements'] as const,
  dashboard: ['dashboard'] as const,
  resumes: (params?: Record<string, unknown>) => ['resumes', params ?? {}] as const,
  resume: (id: string) => ['resume', id] as const,
  resumeVersions: (id: string) => ['resume', id, 'versions'] as const,
  templates: (params?: Record<string, unknown>) => ['templates', params ?? {}] as const,
  template: (slug: string) => ['template', slug] as const,
  atsReports: (params?: Record<string, unknown>) => ['ats-reports', params ?? {}] as const,
  atsReport: (id: string) => ['ats-report', id] as const,
  jobs: (params?: Record<string, unknown>) => ['jobs', params ?? {}] as const,
  job: (id: string) => ['job', id] as const,
  applications: ['applications'] as const,
  subscription: ['subscription'] as const,
  pricing: ['pricing'] as const,
  blogPosts: (params?: Record<string, unknown>) => ['blog', params ?? {}] as const,
  blogPost: (slug: string) => ['blog', slug] as const,
  examples: ['examples'] as const,
  example: (slug: string) => ['example', slug] as const,
  analytics: ['analytics'] as const,
  adminStats: ['admin', 'stats'] as const,
  adminUsers: (params?: Record<string, unknown>) => ['admin', 'users', params ?? {}] as const,
  adminTemplates: ['admin', 'templates'] as const,
  adminBlog: ['admin', 'blog'] as const,
  adminErrors: ['admin', 'errors'] as const,
};
