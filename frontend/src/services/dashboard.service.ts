import { api } from '@/lib/api-client';
import type { DashboardOverview } from '@/types/api';

export const dashboardService = {
  get: () => api.get<DashboardOverview>('/dashboard'),
};
