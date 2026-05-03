// ─── Role & Status ────────────────────────────────────────────────────────────

export type UserRole = 'guest' | 'user' | 'support' | 'moderator' | 'admin';
export type UserStatus = 'active' | 'suspended' | 'deleted';
export type GdprRequestType = 'export' | 'delete';
export type GdprRequestStatus = 'pending' | 'processing' | 'completed' | 'failed';
export type AdminAction =
  | 'create_user' | 'update_user' | 'suspend_user' | 'unlock_user' | 'delete_user'
  | 'impersonate_user' | 'export_data' | 'delete_data' | 'revoke_session' | 'revoke_all_sessions'
  | 'update_role' | 'update_subscription' | 'create_gdpr_request' | 'manage_api_key'
  | 'manage_custom_field' | 'manage_mfa' | 'update_feature_flag' | 'manage_webhook'
  | 'bulk_import' | 'bulk_export' | 'view_audit_log';

// ─── Pagination ────────────────────────────────────────────────────────────────

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages?: number;
}

// ─── Users ────────────────────────────────────────────────────────────────────

export interface AdminUser {
  id: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  plan: string | null;
  emailVerified: boolean;
  isOnboarded: boolean;
  createdAt: string;
  fullName: string | null;
  failedLoginAttempts: number;
  lockUntil: string | null;
  mutedUntil: string | null;
  lastLogin: string | null;
}

export interface AdminUserDetail extends AdminUser {
  profile: {
    fullName: string | null;
    preferences: Record<string, unknown>;
  } | null;
  customFields: Array<{ id: string; key: string; value: string }>;
}

export interface ListUsersResponse {
  users: AdminUser[];
  pagination: Pagination;
}

// ─── Sessions ─────────────────────────────────────────────────────────────────

export interface UserSession {
  id: string;
  userId: string;
  deviceInfo: string | null;
  ipAddress: string | null;
  expiresAt: string;
}

// ─── Login History ────────────────────────────────────────────────────────────

export interface LoginHistoryEntry {
  id: string;
  userId: string;
  ipAddress: string | null;
  userAgent: string | null;
  location: string | null;
  success: boolean;
  failureReason: string | null;
  createdAt: string;
}

// ─── Audit Logs ───────────────────────────────────────────────────────────────

export interface AuditLogEntry {
  id: string;
  actorId: string | null;
  actorEmail: string | null;
  actorRole: string | null;
  action: AdminAction;
  targetUserId: string | null;
  targetEmail: string | null;
  resourceType: string | null;
  resourceId: string | null;
  metadata: Record<string, unknown>;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
}

export interface AuditLogsResponse {
  logs: AuditLogEntry[];
  pagination: Pagination;
}

// ─── GDPR ─────────────────────────────────────────────────────────────────────

export interface GdprRequest {
  id: string;
  userId: string;
  requestedBy: string | null;
  type: GdprRequestType;
  status: GdprRequestStatus;
  downloadUrl: string | null;
  expiresAt: string | null;
  processedAt: string | null;
  notes: string | null;
  createdAt: string;
}

// ─── Impersonation ────────────────────────────────────────────────────────────

export interface ImpersonationResult {
  token: string;
  expiresIn: string;
  targetUser: { id: string; email: string; role: UserRole };
}

// ─── Webhooks ─────────────────────────────────────────────────────────────────

export interface WebhookEndpoint {
  id: string;
  url: string;
  secret: string;
  eventTypes: string[];
  isActive: boolean;
  retryCount: number;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
}

// ─── Realtime Dashboard ───────────────────────────────────────────────────────

export interface RealtimeDashboard {
  activeSessions: number;
  loginsLast24h: number;
  pendingModerationReports: number;
  recentAdminActions: Array<{
    id: string;
    action: string;
    actorId: string | null;
    createdAt: string;
  }>;
}
