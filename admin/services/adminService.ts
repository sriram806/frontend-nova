import { userApi, extractApiData } from '@/lib/api';
import type {
  AdminUser,
  AdminUserDetail,
  AuditLogEntry,
  AuditLogsResponse,
  GdprRequest,
  ImpersonationResult,
  ListUsersResponse,
  LoginHistoryEntry,
  Pagination,
  UserSession
} from '@/types/admin';

const BASE = '/admin';

// ─── Users ────────────────────────────────────────────────────────────────────

export const listUsers = async (params: Record<string, string | number | undefined> = {}) => {
  const query = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== '') query.set(k, String(v));
  }
  const res = await userApi.get<{ success: true; data: ListUsersResponse }>(
    `${BASE}/users?${query.toString()}`
  );
  return extractApiData(res);
};

export const getUser = async (id: string) => {
  const res = await userApi.get<{ success: true; data: AdminUserDetail }>(`${BASE}/users/${id}`);
  return extractApiData(res);
};

export const updateUser = async (
  id: string,
  patch: { role?: string; status?: string; password?: string; customFields?: Array<{ key: string; value: string }> }
) => {
  const res = await userApi.patch<{ success: true; data: AdminUserDetail }>(`${BASE}/users/${id}`, patch);
  return extractApiData(res);
};

export const lockUser = async (id: string) => {
  const res = await userApi.post(`${BASE}/users/${id}/lock`);
  return extractApiData(res);
};

export const unlockUser = async (id: string) => {
  const res = await userApi.post(`${BASE}/users/${id}/unlock`);
  return extractApiData(res);
};

export const muteUser = async (id: string, durationMinutes: number) => {
  const res = await userApi.post(`${BASE}/users/${id}/mute`, { durationMinutes });
  return extractApiData(res);
};

export const unmuteUser = async (id: string) => {
  const res = await userApi.post(`${BASE}/users/${id}/unmute`);
  return extractApiData(res);
};

export const deleteUser = async (id: string) => {
  const res = await userApi.delete(`${BASE}/users/${id}`);
  return extractApiData(res);
};

export const impersonateUser = async (id: string) => {
  const res = await userApi.post<{ success: true; data: ImpersonationResult }>(
    `${BASE}/users/${id}/impersonate`
  );
  return extractApiData(res);
};

export const exportUsers = async (filters: Record<string, string> = {}) => {
  const query = new URLSearchParams(filters).toString();
  const res = await userApi.get(`${BASE}/users/export?${query}`, { responseType: 'blob' });
  // Trigger download
  const url = URL.createObjectURL(new Blob([res.data as BlobPart]));
  const a = document.createElement('a');
  a.href = url;
  a.download = 'users.csv';
  a.click();
  URL.revokeObjectURL(url);
};

export const createUser = async (payload: {
  email: string;
  password?: string;
  fullName?: string;
  role: string;
  status: string;
}) => {
  const res = await userApi.post<{ success: true; data: AdminUserDetail }>(`${BASE}/users`, payload);
  return extractApiData(res);
};

export const importCsv = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  const res = await userApi.post<{ success: true; data: { jobId: string } }>(`${BASE}/users/import`, formData);
  return extractApiData(res);
};

export const getImportStatus = async (jobId: string) => {
  const res = await userApi.get<{ success: true; data: any }>(`${BASE}/users/import/${jobId}/status`);
  return extractApiData(res);
};

// ─── Sessions ─────────────────────────────────────────────────────────────────

export const getUserSessions = async (userId: string) => {
  const res = await userApi.get<{ success: true; data: UserSession[] }>(
    `${BASE}/users/${userId}/sessions`
  );
  return extractApiData(res);
};

export const revokeSession = async (userId: string, sessionId: string) => {
  const res = await userApi.delete(`${BASE}/users/${userId}/sessions/${sessionId}`);
  return extractApiData(res);
};

export const revokeAllSessions = async (userId: string) => {
  const res = await userApi.delete(`${BASE}/users/${userId}/sessions`);
  return extractApiData(res);
};

// ─── Login History ────────────────────────────────────────────────────────────

export const getLoginHistory = async (userId: string, page = 1, limit = 20) => {
  const res = await userApi.get<{ success: true; data: { history: LoginHistoryEntry[]; pagination: Pagination } }>(
    `${BASE}/users/${userId}/login-history?page=${page}&limit=${limit}`
  );
  return extractApiData(res);
};

// ─── Audit Logs ───────────────────────────────────────────────────────────────

export const getAuditLogs = async (params: Record<string, string | number | undefined> = {}) => {
  const query = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== '') query.set(k, String(v));
  }
  const res = await userApi.get<{ success: true; data: AuditLogsResponse }>(
    `${BASE}/audit-log?${query.toString()}`
  );
  return extractApiData(res);
};

export const getUserAuditLog = async (userId: string, page = 1, limit = 25) => {
  const res = await userApi.get<{ success: true; data: AuditLogsResponse }>(
    `${BASE}/users/${userId}/audit-log?page=${page}&limit=${limit}`
  );
  return extractApiData(res);
};

// ─── GDPR ─────────────────────────────────────────────────────────────────────

export const createGdprExport = async (userId: string) => {
  const res = await userApi.post<{ success: true; data: GdprRequest }>(
    `${BASE}/users/${userId}/gdpr/export`
  );
  return extractApiData(res);
};

export const createGdprDelete = async (userId: string) => {
  const res = await userApi.post<{ success: true; data: GdprRequest }>(
    `${BASE}/users/${userId}/gdpr/delete`
  );
  return extractApiData(res);
};

export const listGdprRequests = async (page = 1, limit = 25, status?: string) => {
  const q = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (status) q.set('status', status);
  const res = await userApi.get<{ success: true; data: { requests: GdprRequest[]; pagination: Pagination } }>(
    `${BASE}/gdpr-requests?${q.toString()}`
  );
  return extractApiData(res);
};

// ─── Moderation ───────────────────────────────────────────────────────────────

export const listModerationReports = async (page = 1, limit = 25, status?: string) => {
  const q = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (status) q.set('status', status);
  const res = await userApi.get<{ success: true; data: { reports: any[]; pagination: Pagination } }>(
    `${BASE}/moderation/reports?${q.toString()}`
  );
  return extractApiData(res);
};

export const resolveModerationReport = async (reportId: string, resolution: string, action?: string) => {
  const res = await userApi.patch(`${BASE}/moderation/reports/${reportId}/resolve`, { resolution, action });
  return extractApiData(res);
};

export const flagUser = async (userId: string, reason: string, evidence?: string) => {
  const res = await userApi.post(`${BASE}/moderation/flag/${userId}`, { reason, evidence });
  return extractApiData(res);
};

// ─── API Keys ─────────────────────────────────────────────────────────────────

export const listApiKeys = async () => {
  const res = await userApi.get<{ success: true; data: any[] }>(`${BASE}/api-keys`);
  return extractApiData(res);
};

export const createApiKey = async (payload: { name: string; scopes: string[] }) => {
  const res = await userApi.post<{ success: true; data: any }>(`${BASE}/api-keys`, payload);
  return extractApiData(res);
};

export const revokeApiKey = async (id: string) => {
  const res = await userApi.delete(`${BASE}/api-keys/${id}`);
  return extractApiData(res);
};

// ─── Realtime Dashboard ───────────────────────────────────────────────────────

export const getRealtimeDashboard = async () => {
  const res = await userApi.get<{ success: true; data: import('@/types/admin').RealtimeDashboard }>(
    `${BASE}/dashboard/realtime`
  );
  return extractApiData(res);
};

// ─── Webhooks ─────────────────────────────────────────────────────────────────

export const getWebhooks = async () => {
  const res = await userApi.get<{ success: true; data: import('@/types/admin').WebhookEndpoint[] }>(
    `${BASE}/webhooks`
  );
  return extractApiData(res);
};

export const createWebhook = async (payload: { url: string; secret: string; eventTypes: string[] }) => {
  const res = await userApi.post<{ success: true; data: import('@/types/admin').WebhookEndpoint }>(
    `${BASE}/webhooks`,
    payload
  );
  return extractApiData(res);
};

export const updateWebhook = async (id: string, payload: Partial<{ url: string; secret: string; eventTypes: string[]; isActive: boolean }>) => {
  const res = await userApi.patch<{ success: true; data: import('@/types/admin').WebhookEndpoint }>(
    `${BASE}/webhooks/${id}`,
    payload
  );
  return extractApiData(res);
};

export const deleteWebhook = async (id: string) => {
  const res = await userApi.delete(`${BASE}/webhooks/${id}`);
  return extractApiData(res);
};
