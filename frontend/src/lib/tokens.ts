/**
 * Token storage.
 *
 * The access token lives in memory only. The refresh token is persisted so a
 * page reload keeps the session, and the API additionally sets an httpOnly
 * cookie when the frontend and API share an origin (production behind NGINX).
 */

const REFRESH_KEY = 'resumeforge.refresh';

let accessToken: string | null = null;
const listeners = new Set<(token: string | null) => void>();

export function getAccessToken(): string | null {
  return accessToken;
}

export function getRefreshToken(): string | null {
  try {
    return localStorage.getItem(REFRESH_KEY);
  } catch {
    return null;
  }
}

export function setTokens(next: { accessToken: string; refreshToken?: string }): void {
  accessToken = next.accessToken;
  if (next.refreshToken) {
    try {
      localStorage.setItem(REFRESH_KEY, next.refreshToken);
    } catch {
      // Private browsing: the session simply will not survive a reload.
    }
  }
  listeners.forEach((listener) => listener(accessToken));
}

export function clearTokens(): void {
  accessToken = null;
  try {
    localStorage.removeItem(REFRESH_KEY);
  } catch {
    // ignore
  }
  listeners.forEach((listener) => listener(null));
}

export function onTokenChange(listener: (token: string | null) => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
