import axios, { AxiosResponse } from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? process.env.NEXT_PUBLIC_API_GATEWAY_URL ?? 'http://localhost:4000';
const ACCESS_TOKEN_STORAGE_KEY = 'think-ai-access-token';

type ApiEnvelope<T> = {
  data: T;
  message?: string;
};

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 20_000,
  withCredentials: true,
});

apiClient.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = window.localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

function unwrapResponse<T>(response: AxiosResponse<T | ApiEnvelope<T>>): T {
  const payload = response.data;
  if (payload && typeof payload === 'object' && 'data' in payload) {
    return (payload as ApiEnvelope<T>).data;
  }
  return payload as T;
}

export async function apiGet<T>(path: string): Promise<T> {
  const response = await apiClient.get<T | ApiEnvelope<T>>(path);
  return unwrapResponse(response);
}

export async function apiPost<TPayload, TResponse>(path: string, payload: TPayload): Promise<TResponse> {
  const response = await apiClient.post<TResponse | ApiEnvelope<TResponse>>(path, payload);
  return unwrapResponse(response);
}

export async function apiPatch<TPayload, TResponse>(path: string, payload: TPayload): Promise<TResponse> {
  const response = await apiClient.patch<TResponse | ApiEnvelope<TResponse>>(path, payload);
  return unwrapResponse(response);
}

export async function apiDelete<TResponse>(path: string): Promise<TResponse> {
  const response = await apiClient.delete<TResponse | ApiEnvelope<TResponse>>(path);
  return unwrapResponse(response);
}
