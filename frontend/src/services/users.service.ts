import { api } from '@/lib/api-client';
import type { ExperienceLevel, MessageResponse, PlanFeatures, User } from '@/types/api';

export interface UpdateProfilePayload {
  fullName?: string;
  avatar?: string | null;
  preferences?: Record<string, unknown>;
}

export interface OnboardingPayload {
  targetRole: string;
  experienceLevel: ExperienceLevel;
  goal?: string | null;
}

export const usersService = {
  updateMe: (payload: UpdateProfilePayload) => api.patch<User>('/users/me', payload),

  saveOnboarding: (payload: OnboardingPayload) =>
    api.post<User>('/users/me/onboarding', payload),

  entitlements: () => api.get<PlanFeatures>('/users/me/entitlements'),

  exportData: () => api.get<unknown>('/users/me/export'),

  deleteAccount: (payload: { password: string; confirmation: string }) =>
    api.delete<MessageResponse>('/users/me', payload),
};
