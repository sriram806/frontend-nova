'use client';

import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { ACCESS_TOKEN_KEY, AUTH_COOKIE_NAME, REFRESH_TOKEN_KEY } from '@/utils/auth-constants';
import { toast } from '@/utils/toast';
import { useAuthStore } from '@/store/authStore';

export type ApiSuccessResponse<T> = {
  success: true;
  data: T;
  message?: string;
};

export type ApiErrorResponse = {
  success: false;
  error?: string;
  message?: string;
};

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

const API_GATEWAY_URL = process.env.NEXT_PUBLIC_API_GATEWAY_URL ?? 'http://localhost:4000';
const AUTH_BASE_URL = process.env.NEXT_PUBLIC_AUTH_API_URL ?? 'http://localhost:4001';
const USER_BASE_URL = process.env.NEXT_PUBLIC_USER_API_URL ?? 'http://localhost:4002';
const AI_BASE_URL = process.env.NEXT_PUBLIC_AI_API_URL ?? 'http://localhost:8000';
const BILLING_BASE_URL = process.env.NEXT_PUBLIC_BILLING_API_URL ?? `${API_GATEWAY_URL}/api`;

type RetryableRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
};

function readAccessToken(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const stateToken = useAuthStore.getState().accessToken;
  if (stateToken) {
    return stateToken;
  }

  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

function clearClientSession() {
  if (typeof window === 'undefined') {
    return;
  }

  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  document.cookie = `${AUTH_COOKIE_NAME}=; path=/; max-age=0; SameSite=Lax`;
}

function readRefreshToken(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }

  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

function persistRefreshToken(token: string | null) {
  if (typeof window === 'undefined') {
    return;
  }

  if (token) {
    localStorage.setItem(REFRESH_TOKEN_KEY, token);
  } else {
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  }
}

export function getApiErrorMessage(error: unknown, fallback = 'Something went wrong.'): string {
  if (axios.isAxiosError(error)) {
    const raw = error.response?.data as
      | ApiErrorResponse
      | { message?: unknown; error?: unknown }
      | undefined;

    const nested = raw?.message ?? raw?.error;
    if (typeof nested === 'string' && nested.trim()) {
      return nested;
    }

    if (error.message) {
      return error.message;
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}

export function extractApiData<T>(response: AxiosResponse<ApiResponse<T> | T>): T {
  const payload = response.data;

  if (payload && typeof payload === 'object' && 'success' in payload) {
    const typedPayload = payload as ApiResponse<T>;
    if (typedPayload.success === false) {
      throw new Error(typedPayload.message ?? typedPayload.error ?? 'Request failed.');
    }

    return typedPayload.data;
  }

  return payload as T;
}

export async function requestFirst<T>(requests: Array<() => Promise<AxiosResponse<ApiResponse<T> | T>>>): Promise<T> {
  let lastError: unknown;

  for (const request of requests) {
    try {
      const response = await request();
      return extractApiData<T>(response);
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError instanceof Error ? lastError : new Error('All request variants failed.');
}

export const api = axios.create({
  baseURL: API_GATEWAY_URL,
  timeout: 20000,
  withCredentials: true,
});

export const authApi = axios.create({
  baseURL: AUTH_BASE_URL,
  timeout: 20000,
  withCredentials: true,
});

export const userApi = axios.create({
  baseURL: USER_BASE_URL,
  timeout: 20000,
  withCredentials: true,
});

export const aiApi = axios.create({
  baseURL: AI_BASE_URL,
  timeout: 20000,
  withCredentials: true,
});

export const billingApi = axios.create({
  baseURL: BILLING_BASE_URL,
  timeout: 20000,
  withCredentials: true,
});

let refreshPromise: Promise<string> | null = null;

// ─── Proactive token refresh scheduler ───────────────────────────────────────

/** Decode a JWT and return its payload without verifying the signature. */
function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const json = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + c.charCodeAt(0).toString(16).padStart(2, '0'))
        .join('')
    );
    return JSON.parse(json) as Record<string, unknown>;
  } catch {
    return null;
  }
}

/** Return how many milliseconds until the token expires, or null if undecipherable. */
function msUntilExpiry(token: string): number | null {
  const payload = decodeJwtPayload(token);
  if (!payload || typeof payload.exp !== 'number') return null;
  return payload.exp * 1000 - Date.now();
}

const REFRESH_AHEAD_MS = 2 * 60 * 1000; // refresh 2 minutes early
let proactiveRefreshTimer: ReturnType<typeof setTimeout> | null = null;

/** Cancel any pending proactive refresh. */
export function cancelProactiveRefresh() {
  if (proactiveRefreshTimer !== null) {
    clearTimeout(proactiveRefreshTimer);
    proactiveRefreshTimer = null;
  }
}

/**
 * Schedule a silent token refresh.
 */
export function scheduleProactiveRefresh(token: string) {
  cancelProactiveRefresh();

  if (typeof window === 'undefined') return;

  const remaining = msUntilExpiry(token);
  if (remaining === null) return;

  const delay = Math.max(0, remaining - REFRESH_AHEAD_MS);

  proactiveRefreshTimer = setTimeout(async () => {
    proactiveRefreshTimer = null;
    try {
      const nextToken = await refreshAccessToken();
      scheduleProactiveRefresh(nextToken);
    } catch {
      // Failed refresh carries on to Logout/Login logic in refreshAccessToken
    }
  }, delay);
}

function isRefreshRequest(url?: string) {
  return Boolean(url && url.includes('/auth/refresh-token'));
}

function isPublicAuthRequest(url?: string) {
  if (!url) {
    return false;
  }

  return [
    '/auth/login',
    '/auth/register',
    '/auth/verify-email',
    '/auth/forgot-password',
    '/auth/reset-password',
    '/auth/logout',
  ].some((segment) => url.includes(segment));
}

function extractAccessTokenFromPayload(payload: unknown): string | null {
  if (!payload || typeof payload !== 'object') {
    return null;
  }

  const source = payload as { accessToken?: unknown; token?: unknown; data?: unknown };
  const directToken = source.accessToken ?? source.token;
  if (typeof directToken === 'string' && directToken.length > 0) {
    return directToken;
  }

  if (source.data && typeof source.data === 'object') {
    const nested = source.data as { accessToken?: unknown; token?: unknown };
    const nestedToken = nested.accessToken ?? nested.token;
    if (typeof nestedToken === 'string' && nestedToken.length > 0) {
      return nestedToken;
    }
  }

  return null;
}

function extractRefreshTokenFromPayload(payload: unknown): string | null {
  if (!payload || typeof payload !== 'object') {
    return null;
  }

  const source = payload as { refreshToken?: unknown; data?: unknown };
  if (typeof source.refreshToken === 'string' && source.refreshToken.length > 0) {
    return source.refreshToken;
  }

  if (source.data && typeof source.data === 'object') {
    const nested = source.data as { refreshToken?: unknown };
    if (typeof nested.refreshToken === 'string' && nested.refreshToken.length > 0) {
      return nested.refreshToken;
    }
  }

  return null;
}

async function refreshAccessToken(): Promise<string> {
  if (!refreshPromise) {
    const fallbackRefreshToken = readRefreshToken();
    refreshPromise = axios
      .post(`${AUTH_BASE_URL}/auth/refresh-token`, fallbackRefreshToken ? { refreshToken: fallbackRefreshToken } : undefined, {
        withCredentials: true,
        timeout: 20000,
      })
      .then((response) => {
        const nextToken = extractAccessTokenFromPayload(response.data);
        const nextRefreshToken = extractRefreshTokenFromPayload(response.data);

        if (!nextToken) {
          throw new Error('Missing access token in refresh response.');
        }

        persistRefreshToken(nextRefreshToken);
        useAuthStore.setState({ accessToken: nextToken });
        
        // Persist to localStorage
        if (typeof window !== 'undefined') {
          localStorage.setItem(ACCESS_TOKEN_KEY, nextToken);
        }
        
        // RE-ARM the proactive refresh
        scheduleProactiveRefresh(nextToken);
        
        return nextToken;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
}

function attachAuthInterceptors(client: typeof api) {
  client.interceptors.request.use((config) => {
    const token = readAccessToken();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  });

  client.interceptors.response.use(
    (response) => {
      const refreshToken = extractRefreshTokenFromPayload(response.data);
      if (refreshToken) {
        persistRefreshToken(refreshToken);
      }

      return response;
    },
    async (error: AxiosError) => {
      const originalRequest = error.config as RetryableRequestConfig | undefined;
      const status = error.response?.status;
      const requestUrl = originalRequest?.url;

      if (
        status === 401 &&
        originalRequest &&
        !originalRequest._retry &&
        !isRefreshRequest(requestUrl) &&
        !isPublicAuthRequest(requestUrl)
      ) {
        originalRequest._retry = true;

        try {
          const nextToken = await refreshAccessToken();
          originalRequest.headers.Authorization = `Bearer ${nextToken}`;
          return client.request(originalRequest);
        } catch (refreshError) {
          clearClientSession();
          useAuthStore.getState().clearSession();

          if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/auth/login')) {
            toast.error('Your session expired. Please sign in again.');
            const nextPath = encodeURIComponent(window.location.pathname);
            window.location.assign(`/login?next=${nextPath}`);
          }

          return Promise.reject(refreshError);
        }
      }

      if (status === 403) {
        toast.error('Access denied.');
      } else if ((status ?? 0) >= 500) {
        toast.error(getApiErrorMessage(error, 'Server error. Please try again.'));
      }

      return Promise.reject(error);
    }
  );
}

attachAuthInterceptors(api);
attachAuthInterceptors(authApi);
attachAuthInterceptors(userApi);
attachAuthInterceptors(aiApi);
attachAuthInterceptors(billingApi);
