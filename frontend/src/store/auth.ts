import { create } from 'zustand';

import { onUnauthorized } from '@/lib/api-client';
import { clearTokens, getRefreshToken, setTokens } from '@/lib/tokens';
import { authService, type LoginPayload, type RegisterPayload } from '@/services/auth.service';
import type { ExperienceLevel, User } from '@/types/api';

export type AuthStatus = 'idle' | 'restoring' | 'authenticated' | 'anonymous';

interface AuthState {
  user: User | null;
  status: AuthStatus;
  login: (payload: LoginPayload) => Promise<User>;
  register: (payload: RegisterPayload) => Promise<User>;
  logout: () => Promise<void>;
  restore: () => Promise<void>;
  setUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  status: 'idle',

  login: async (payload) => {
    const result = await authService.login(payload);
    setTokens({ accessToken: result.accessToken, refreshToken: result.refreshToken });
    set({ user: result.user, status: 'authenticated' });
    return result.user;
  },

  register: async (payload) => {
    const result = await authService.register(payload);
    setTokens({ accessToken: result.accessToken, refreshToken: result.refreshToken });
    set({ user: result.user, status: 'authenticated' });
    return result.user;
  },

  logout: async () => {
    const refreshToken = getRefreshToken();
    try {
      await authService.logout(refreshToken);
    } catch {
      // Signing out locally matters more than the server acknowledging it.
    }
    clearTokens();
    set({ user: null, status: 'anonymous' });
  },

  /**
   * Restore a session on page load. The access token only lives in memory, so
   * we exchange the stored refresh token (or the httpOnly cookie) for a new one.
   */
  restore: async () => {
    set({ status: 'restoring' });
    const storedRefresh = getRefreshToken();
    if (!storedRefresh) {
      set({ user: null, status: 'anonymous' });
      return;
    }
    try {
      const tokens = await authService.refresh(storedRefresh);
      setTokens({ accessToken: tokens.accessToken, refreshToken: tokens.refreshToken });
      const user = await authService.me();
      set({ user, status: 'authenticated' });
    } catch {
      clearTokens();
      set({ user: null, status: 'anonymous' });
    }
  },

  setUser: (user) => set({ user, status: 'authenticated' }),
}));

/** Drop local state when the API reports the session is gone. */
onUnauthorized(() => {
  if (useAuthStore.getState().status === 'authenticated') {
    useAuthStore.setState({ user: null, status: 'anonymous' });
  }
});

export function useCurrentUser(): User | null {
  return useAuthStore((state) => state.user);
}

export function useIsAuthenticated(): boolean {
  return useAuthStore((state) => state.status === 'authenticated');
}

export function useOnboardingProfile(): {
  targetRole?: string;
  experienceLevel?: ExperienceLevel;
  completed: boolean;
} {
  const onboarding = useAuthStore((state) => state.user?.onboarding);
  return {
    targetRole: onboarding?.targetRole,
    experienceLevel: onboarding?.experienceLevel,
    completed: Boolean(onboarding?.completed),
  };
}
