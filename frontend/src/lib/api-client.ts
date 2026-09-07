/**
 * Typed API client.
 *
 * Handles JSON and file responses, converts the backend's structured error
 * envelope into `ApiError`, and transparently refreshes an expired access token
 * once per request (concurrent 401s share a single refresh).
 */

import { apiUrl } from './config';
import { clearTokens, getAccessToken, getRefreshToken, setTokens } from './tokens';

export interface FieldError {
  field: string;
  message: string;
}

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details?: unknown;

  constructor(status: number, code: string, message: string, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }

  /** Field-level messages, for wiring server validation back into a form. */
  get fieldErrors(): FieldError[] {
    return Array.isArray(this.details)
      ? (this.details as FieldError[]).filter(
          (entry) => typeof entry?.field === 'string' && typeof entry?.message === 'string',
        )
      : [];
  }

  get isNetworkError(): boolean {
    return this.status === 0;
  }

  get isAuthError(): boolean {
    return this.status === 401;
  }

  get requiresUpgrade(): boolean {
    return this.status === 402 || this.code === 'plan_limit' || this.code === 'quota_exceeded';
  }

  get isRateLimited(): boolean {
    return this.status === 429;
  }
}

type Query = Record<string, string | number | boolean | undefined | null>;

interface RequestOptions extends Omit<RequestInit, 'body' | 'method'> {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  query?: Query;
  /** Skip the Authorization header and refresh retry (public endpoints). */
  anonymous?: boolean;
  /** Return the raw Response so callers can read a blob. */
  raw?: boolean;
  timeoutMs?: number;
}

const DEFAULT_TIMEOUT = 30_000;
let refreshPromise: Promise<boolean> | null = null;
const unauthorizedHandlers = new Set<() => void>();

export function onUnauthorized(handler: () => void): () => void {
  unauthorizedHandlers.add(handler);
  return () => unauthorizedHandlers.delete(handler);
}

function buildUrl(path: string, query?: Query): string {
  const url = new URL(apiUrl(path), window.location.origin);
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.set(key, String(value));
      }
    }
  }
  return url.toString();
}

async function toApiError(response: Response): Promise<ApiError> {
  let code = 'server_error';
  let message = 'Something went wrong. Please try again.';
  let details: unknown;

  try {
    const body = await response.json();
    if (body?.error) {
      code = body.error.code ?? code;
      message = body.error.message ?? message;
      details = body.error.details;
    } else if (typeof body?.detail === 'string') {
      message = body.detail;
    }
  } catch {
    if (response.status === 413) message = 'That file is too large.';
    if (response.status === 404) message = 'We could not find what you were looking for.';
  }

  return new ApiError(response.status, code, message, details);
}

/** Refresh the access token. Concurrent callers await the same request. */
async function refreshAccessToken(): Promise<boolean> {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    const refreshToken = getRefreshToken();
    if (!refreshToken) return false;
    try {
      const response = await fetch(buildUrl('/auth/refresh'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ refreshToken }),
      });
      if (!response.ok) return false;
      const data = (await response.json()) as { accessToken: string; refreshToken: string };
      setTokens({ accessToken: data.accessToken, refreshToken: data.refreshToken });
      return true;
    } catch {
      return false;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

async function execute(path: string, options: RequestOptions, isRetry = false): Promise<Response> {
  const { method = 'GET', body, query, anonymous, timeoutMs = DEFAULT_TIMEOUT, ...rest } = options;

  const headers = new Headers(rest.headers);
  const isFormData = body instanceof FormData;
  if (body !== undefined && !isFormData) headers.set('Content-Type', 'application/json');

  const token = getAccessToken();
  if (!anonymous && token) headers.set('Authorization', `Bearer ${token}`);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  let response: Response;
  try {
    response = await fetch(buildUrl(path, query), {
      ...rest,
      method,
      headers,
      credentials: 'include',
      signal: rest.signal ?? controller.signal,
      body: body === undefined ? undefined : isFormData ? body : JSON.stringify(body),
    });
  } catch (error) {
    clearTimeout(timeout);
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new ApiError(0, 'timeout', 'That request took too long. Please try again.');
    }
    throw new ApiError(
      0,
      'network_error',
      'We could not reach the server. Check your connection and try again.',
    );
  }
  clearTimeout(timeout);

  if (response.status === 401 && !anonymous && !isRetry) {
    if (await refreshAccessToken()) return execute(path, options, true);
    clearTokens();
    unauthorizedHandlers.forEach((handler) => handler());
  }

  if (!response.ok) throw await toApiError(response);
  return response;
}

export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const response = await execute(path, options);
  if (options.raw) return response as unknown as T;
  if (response.status === 204) return undefined as T;

  const contentType = response.headers.get('content-type') ?? '';
  if (contentType.includes('application/json')) return (await response.json()) as T;
  return (await response.text()) as unknown as T;
}

export const api = {
  get: <T>(path: string, options?: Omit<RequestOptions, 'method' | 'body'>) =>
    request<T>(path, { ...options, method: 'GET' }),
  post: <T>(path: string, body?: unknown, options?: Omit<RequestOptions, 'method' | 'body'>) =>
    request<T>(path, { ...options, method: 'POST', body }),
  put: <T>(path: string, body?: unknown, options?: Omit<RequestOptions, 'method' | 'body'>) =>
    request<T>(path, { ...options, method: 'PUT', body }),
  patch: <T>(path: string, body?: unknown, options?: Omit<RequestOptions, 'method' | 'body'>) =>
    request<T>(path, { ...options, method: 'PATCH', body }),
  delete: <T>(path: string, body?: unknown, options?: Omit<RequestOptions, 'method' | 'body'>) =>
    request<T>(path, { ...options, method: 'DELETE', body }),

  /** Download a generated file, honouring Content-Disposition when present. */
  async download(
    path: string,
    body?: unknown,
    options?: Omit<RequestOptions, 'method' | 'body' | 'raw'>,
  ): Promise<{ blob: Blob; filename: string | null }> {
    const response = await execute(path, { ...options, method: 'POST', body });
    const disposition = response.headers.get('content-disposition') ?? '';
    const match = /filename\*?=(?:UTF-8'')?"?([^";]+)"?/i.exec(disposition);
    return {
      blob: await response.blob(),
      filename: match ? decodeURIComponent(match[1]) : null,
    };
  },
};

export function errorMessage(error: unknown, fallback = 'Something went wrong.'): string {
  if (error instanceof ApiError) return error.message;
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}
