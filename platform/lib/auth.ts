export const AUTH_COOKIE_NAME = 'think_auth';
const AUTH_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;

const USERS_KEY = 'think_users';
const SESSION_KEY = 'think_session';
const REGISTER_PENDING_KEY = 'think_register_pending';
const RESET_PENDING_KEY = 'think_reset_pending';
const PASSWORD_RESET_MAX_REQUESTS = 3;
const PASSWORD_RESET_RESEND_DELAY_MS = 60 * 1000;

export type ThinkUser = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  isVerified: boolean;
  createdAt: string;
};

type PendingRegistration = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  referralCode?: string;
  otp: string;
  createdAt: string;
};

type PendingReset = {
  email: string;
  otp: string;
  verified: boolean;
  createdAt: string;
  attempts?: number;
  nextResendAt?: string | null;
};

function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function readJson<T>(key: string, fallback: T): T {
  if (!isBrowser()) {
    return fallback;
  }

  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      return fallback;
    }

    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, value: T): void {
  if (!isBrowser()) {
    return;
  }

  localStorage.setItem(key, JSON.stringify(value));
}

export function getUsers(): ThinkUser[] {
  return readJson<ThinkUser[]>(USERS_KEY, []);
}

function saveUsers(users: ThinkUser[]): void {
  writeJson(USERS_KEY, users);
}

export function setAuthCookie(value: string): void {
  if (!isBrowser()) {
    return;
  }

  document.cookie = `${AUTH_COOKIE_NAME}=${value}; path=/; max-age=${AUTH_COOKIE_MAX_AGE}; SameSite=Lax`;
}

export function clearAuthCookie(): void {
  if (!isBrowser()) {
    return;
  }

  document.cookie = `${AUTH_COOKIE_NAME}=; path=/; max-age=0; SameSite=Lax`;
}

export function persistSession(email: string): void {
  const normalizedEmail = normalizeEmail(email);
  writeJson(SESSION_KEY, { email: normalizedEmail, signedInAt: new Date().toISOString() });
  setAuthCookie(normalizedEmail);
}

export function clearSession(): void {
  if (!isBrowser()) {
    return;
  }

  localStorage.removeItem(SESSION_KEY);
  clearAuthCookie();
}

export function findUserByEmail(email: string): ThinkUser | undefined {
  const normalizedEmail = normalizeEmail(email);
  return getUsers().find((user) => user.email === normalizedEmail);
}

function generateOtp(): string {
  return `${Math.floor(100000 + Math.random() * 900000)}`;
}

export function createPendingRegistration(input: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  referralCode?: string;
}): { otp: string } {
  const normalizedEmail = normalizeEmail(input.email);
  const pending: PendingRegistration = {
    firstName: input.firstName.trim(),
    lastName: input.lastName.trim(),
    email: normalizedEmail,
    password: input.password,
    referralCode: input.referralCode?.trim() || undefined,
    otp: generateOtp(),
    createdAt: new Date().toISOString(),
  };

  writeJson(REGISTER_PENDING_KEY, pending);
  return { otp: pending.otp };
}

export function getPendingRegistration(): PendingRegistration | null {
  return readJson<PendingRegistration | null>(REGISTER_PENDING_KEY, null);
}

export function setPendingRegistrationFromBackend(email: string, otp?: string): void {
  const normalizedEmail = normalizeEmail(email);
  const pending: PendingRegistration = {
    firstName: 'User',
    lastName: 'Account',
    email: normalizedEmail,
    password: '',
    otp: otp || '',
    createdAt: new Date().toISOString(),
  };

  writeJson(REGISTER_PENDING_KEY, pending);
}

export function verifyRegistrationOtp(otp: string): { ok: boolean; user?: ThinkUser; error?: string } {
  const pending = getPendingRegistration();

  if (!pending) {
    return { ok: false, error: 'Registration request not found. Please register again.' };
  }

  if (pending.otp !== otp.trim()) {
    return { ok: false, error: 'Invalid OTP. Please check the code from your email.' };
  }

  const existing = findUserByEmail(pending.email);
  if (existing) {
    return { ok: false, error: 'This email is already registered. Please login.' };
  }

  const newUser: ThinkUser = {
    firstName: pending.firstName,
    lastName: pending.lastName,
    email: pending.email,
    password: pending.password,
    isVerified: true,
    createdAt: new Date().toISOString(),
  };

  const users = getUsers();
  users.push(newUser);
  saveUsers(users);
  if (isBrowser()) {
    localStorage.removeItem(REGISTER_PENDING_KEY);
  }

  return { ok: true, user: newUser };
}

export function loginWithEmail(email: string, password: string): { ok: boolean; user?: ThinkUser; error?: string } {
  const normalizedEmail = normalizeEmail(email);
  const user = findUserByEmail(normalizedEmail);

  if (!user) {
    return { ok: false, error: 'No account found for this email.' };
  }

  if (!user.isVerified) {
    return { ok: false, error: 'Email not verified. Please complete OTP verification first.' };
  }

  if (user.password !== password) {
    return { ok: false, error: 'Incorrect password.' };
  }

  return { ok: true, user };
}

export function createPasswordReset(email: string): { ok: boolean; otp?: string; error?: string } {
  const normalizedEmail = normalizeEmail(email);

  const resetRequest: PendingReset = {
    email: normalizedEmail,
    otp: generateOtp(),
    verified: false,
    createdAt: new Date().toISOString(),
  };

  writeJson(RESET_PENDING_KEY, resetRequest);
  return { ok: true, otp: resetRequest.otp };
}

export function savePasswordResetRequest(
  email: string,
  otp?: string,
  options: { incrementAttempts?: boolean } = {}
): PendingReset {
  const normalizedEmail = normalizeEmail(email);
  const existing = getPasswordResetRequest();
  const now = new Date().toISOString();
  const sameEmail = existing?.email === normalizedEmail;
  const incrementAttempts = options.incrementAttempts ?? true;
  const attempts = incrementAttempts ? (sameEmail ? Math.min((existing?.attempts ?? 0) + 1, PASSWORD_RESET_MAX_REQUESTS) : 1) : sameEmail ? existing?.attempts ?? 0 : 0;
  const nextResendAt = incrementAttempts
    ? attempts < PASSWORD_RESET_MAX_REQUESTS
      ? new Date(Date.now() + PASSWORD_RESET_RESEND_DELAY_MS).toISOString()
      : null
    : sameEmail
      ? existing?.nextResendAt ?? null
      : null;

  const pending: PendingReset = {
    email: normalizedEmail,
    otp: otp ?? existing?.otp ?? '',
    verified: false,
    createdAt: sameEmail ? existing?.createdAt ?? now : now,
    attempts,
    nextResendAt,
  };

  writeJson(RESET_PENDING_KEY, pending);
  return pending;
}

export function getPasswordResetRequest(): PendingReset | null {
  return readJson<PendingReset | null>(RESET_PENDING_KEY, null);
}

export function getPasswordResetRequestAttempts(resetRequest: PendingReset | null = getPasswordResetRequest()): number {
  return resetRequest?.attempts ?? 0;
}

export function getPasswordResetResendCooldownSeconds(resetRequest: PendingReset | null = getPasswordResetRequest()): number {
  if (!resetRequest?.nextResendAt) {
    return 0;
  }

  const remainingMilliseconds = Date.parse(resetRequest.nextResendAt) - Date.now();
  return Math.max(0, Math.ceil(remainingMilliseconds / 1000));
}

export function verifyPasswordResetOtp(otp: string): { ok: boolean; error?: string } {
  const resetRequest = getPasswordResetRequest();

  if (!resetRequest) {
    return { ok: false, error: 'Reset request not found. Please start again.' };
  }

  if (resetRequest.otp !== otp.trim()) {
    return { ok: false, error: 'Invalid OTP. Please verify your reset code.' };
  }

  writeJson(RESET_PENDING_KEY, { ...resetRequest, verified: true });
  return { ok: true };
}

export function updatePasswordFromReset(newPassword: string): { ok: boolean; error?: string; email?: string } {
  const resetRequest = getPasswordResetRequest();

  if (!resetRequest) {
    return { ok: false, error: 'Reset request not found. Please start again.' };
  }

  if (!resetRequest.verified) {
    return { ok: false, error: 'OTP verification is required before setting a new password.' };
  }

  const users = getUsers();
  const nextUsers = users.map((user) => {
    if (user.email !== resetRequest.email) {
      return user;
    }

    return {
      ...user,
      password: newPassword,
    };
  });

  saveUsers(nextUsers);
  if (isBrowser()) {
    localStorage.removeItem(RESET_PENDING_KEY);
  }

  return { ok: true, email: resetRequest.email };
}
