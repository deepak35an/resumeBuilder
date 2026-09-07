import { api } from '@/lib/api-client';
import type { AuthResponse, MessageResponse, TokenPair, User } from '@/types/api';

export interface RegisterPayload {
  email: string;
  password: string;
  fullName: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export const authService = {
  register: (payload: RegisterPayload) =>
    api.post<AuthResponse>('/auth/register', payload, { anonymous: true }),

  login: (payload: LoginPayload) =>
    api.post<AuthResponse>('/auth/login', payload, { anonymous: true }),

  refresh: (refreshToken: string | null) =>
    api.post<TokenPair>('/auth/refresh', { refreshToken }, { anonymous: true }),

  logout: (refreshToken: string | null) =>
    api.post<MessageResponse>('/auth/logout', { refreshToken }),

  me: () => api.get<User>('/auth/me'),

  forgotPassword: (email: string) =>
    api.post<MessageResponse>('/auth/forgot-password', { email }, { anonymous: true }),

  resetPassword: (token: string, password: string) =>
    api.post<MessageResponse>('/auth/reset-password', { token, password }, { anonymous: true }),

  verifyEmail: (token: string) => api.post<User>('/auth/verify-email', { token }, { anonymous: true }),

  resendVerification: () => api.post<MessageResponse>('/auth/resend-verification'),

  changePassword: (currentPassword: string, newPassword: string) =>
    api.post<MessageResponse>('/auth/change-password', { currentPassword, newPassword }),
};
