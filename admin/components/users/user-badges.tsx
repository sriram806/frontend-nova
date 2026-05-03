import type { AdminUser, UserRole } from '@/types/admin';

export const ROLE_STYLES: Record<UserRole, string> = {
  guest: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
  user: 'bg-blue-500/10  text-blue-400  border-blue-500/20',
  support: 'bg-cyan-500/10  text-cyan-400  border-cyan-500/20',
  moderator: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  admin: 'bg-rose-500/10  text-rose-400  border-rose-500/20',
};

export const STATUS_STYLES: Record<string, string> = {
  active: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  suspended: 'bg-orange-500/10 text-orange-400  border-orange-500/20',
  deleted: 'bg-red-500/10    text-red-400     border-red-500/20',
  locked: 'bg-rose-500/10   text-rose-400    border-rose-500/20',
  muted: 'bg-amber-500/10  text-amber-400   border-amber-500/20',
};

export function RoleBadge({ role }: { role: UserRole }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider
        ${ROLE_STYLES[role] ?? 'bg-slate-500/10 text-slate-400 border-slate-500/20'}`}
    >
      {role}
    </span>
  );
}

export function StatusBadge({ user }: { user: AdminUser }) {
  let statusStr = user.status as string;
  if (user.lockUntil && new Date(user.lockUntil) > new Date()) statusStr = 'locked';
  else if (user.mutedUntil && new Date(user.mutedUntil) > new Date()) statusStr = 'muted';

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider
        ${STATUS_STYLES[statusStr] ?? 'bg-slate-500/10 text-slate-400 border-slate-500/20'}`}
    >
      <span className={`h-1 w-1 rounded-full ${statusStr === 'active' ? 'bg-emerald-400 animate-pulse' : 'bg-current'}`} />
      {statusStr}
    </span>
  );
}

export const PLAN_STYLES: Record<string, string> = {
  LITE: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  PRO: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
  ENTERPRISE: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  NONE: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
};

export function PlanBadge({ plan }: { plan: string | null }) {
  const p = plan ?? 'NONE';
  return (
    <span
      className={`inline-flex items-center rounded-lg border px-2 py-1 text-[10px] font-black uppercase tracking-[0.2em] shadow-sm
        ${PLAN_STYLES[p] ?? PLAN_STYLES.NONE}`}
    >
      {p}
    </span>
  );
}
