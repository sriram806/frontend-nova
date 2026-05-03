'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useQuery, useMutation } from '@tanstack/react-query';
import {
  ArrowLeft, Shield, ShieldOff, Trash2, UserCog, MonitorX,
  Clock, Globe, Lock, Unlock, FileDown, FileX, 
  Mail, Calendar, Fingerprint, Activity, CheckCircle2, Loader2,
  LayoutDashboard, ShieldCheck, KeyRound
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from '@/utils/toast';
import * as adminApi from '@/services/adminService';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { RoleChangeModal } from '@/components/admin/users/modals/RoleChangeModal';
import { PasswordResetModal } from '@/components/admin/users/modals/PasswordResetModal';

// ─── Sub-Views ────────────────────────────────────────────────────────────────

function OverviewTab({ user, refetch }: { user: any; refetch: () => void }) {
  const { user: currentUser } = useAuthStore();
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  const lockMut = useMutation({
    mutationFn: () => adminApi.lockUser(user.id),
    onSuccess: () => { toast.success('User suspended'); refetch(); }
  });
  const unlockMut = useMutation({
    mutationFn: () => adminApi.unlockUser(user.id),
    onSuccess: () => { toast.success('User reactivated'); refetch(); }
  });
  const impersonateMut = useMutation({
    mutationFn: () => adminApi.impersonateUser(user.id),
    onSuccess: (data) => {
      navigator.clipboard.writeText(data.token);
      toast.success(`Impersonation token copied!`);
    },
    onError: () => toast.error('Failed to create token')
  });
  const deleteMut = useMutation({
    mutationFn: () => adminApi.deleteUser(user.id),
    onSuccess: () => { toast.success('User permanently deleted'); window.location.href = '/users'; }
  });

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid gap-6 md:grid-cols-2">
        {/* Info Card */}
        <div className="premium-card p-6 rounded-[2rem] space-y-6">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Fingerprint className="h-5 w-5 text-primary" /> Core Identity
          </h3>
          <div className="space-y-4">
            {[
              { label: 'User ID', value: user.id, icon: Fingerprint },
              { label: 'Email Address', value: user.email, icon: Mail },
              { label: 'Full Name', value: user.profile?.fullName ?? 'Not provided', icon: UserCog },
              { label: 'Joined Platform', value: new Date(user.createdAt).toLocaleDateString(), icon: Calendar },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                <div className="flex items-center gap-3">
                  <item.icon className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">{item.label}</span>
                </div>
                <span className="text-sm font-semibold text-white truncate max-w-[200px]">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Status Card */}
        <div className="premium-card p-6 rounded-[2rem] space-y-6">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Activity className="h-5 w-5 text-emerald-400" /> Account Status
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
              <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider font-bold">Role</p>
              <p className="text-lg font-bold text-primary capitalize">{user.role}</p>
            </div>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
              <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider font-bold">Status</p>
              <div className="flex items-center gap-2">
                <span className={`h-2 w-2 rounded-full ${user.status === 'active' ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`} />
                <p className="text-lg font-bold text-white capitalize">{user.status}</p>
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
              <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider font-bold">Verified</p>
              <p className="text-lg font-bold text-white">{user.emailVerified ? 'Yes' : 'No'}</p>
            </div>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
              <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider font-bold">Plan</p>
              <p className="text-lg font-bold text-white uppercase">{user.plan || 'NONE'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Control Actions */}
      <div className="premium-card p-6 rounded-[2rem] space-y-6 bg-gradient-to-br from-primary/5 to-transparent">
        <h3 className="text-lg font-bold text-white">Administrative Actions</h3>
        <div className="flex flex-wrap gap-4">
          {user.status === 'active' ? (
            <Button 
              onClick={() => lockMut.mutate()} 
              disabled={lockMut.isPending}
              className="rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20"
            >
              <Lock className="h-4 w-4 mr-2" /> Suspend Account
            </Button>
          ) : (
            <Button 
              onClick={() => unlockMut.mutate()} 
              disabled={unlockMut.isPending}
              className="rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20"
            >
              <Unlock className="h-4 w-4 mr-2" /> Reactivate Account
            </Button>
          )}

          <Button 
            onClick={() => setIsRoleModalOpen(true)}
            className="rounded-xl bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20"
          >
            <ShieldCheck className="h-4 w-4 mr-2" /> Change Role
          </Button>

          <Button 
            onClick={() => setIsPasswordModalOpen(true)}
            className="rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20"
          >
            <KeyRound className="h-4 w-4 mr-2" /> Reset Password
          </Button>

          {currentUser?.role === 'admin' && (
            <Button 
              onClick={() => impersonateMut.mutate()} 
              disabled={impersonateMut.isPending}
              className="rounded-xl bg-violet-500/10 text-violet-400 border border-violet-500/20 hover:bg-violet-500/20"
            >
              <UserCog className="h-4 w-4 mr-2" /> Impersonate User
            </Button>
          )}

          <Button 
            variant="destructive" 
            onClick={() => { if (confirm(`Delete ${user.email}? This is irreversible.`)) deleteMut.mutate(); }}
            disabled={deleteMut.isPending}
            className="rounded-xl"
          >
            <Trash2 className="h-4 w-4 mr-2" /> Permanently Delete
          </Button>
        </div>

        <RoleChangeModal 
            user={user} 
            isOpen={isRoleModalOpen} 
            onClose={() => setIsRoleModalOpen(false)} 
            onSuccess={() => refetch()} 
        />

        <PasswordResetModal 
            user={user} 
            isOpen={isPasswordModalOpen} 
            onClose={() => setIsPasswordModalOpen(false)} 
        />
      </div>
    </div>
  );
}

function SessionsTab({ userId }: { userId: string }) {
  const { data: sessions, isLoading, refetch } = useQuery({
    queryKey: ['admin-user-sessions', userId],
    queryFn: () => adminApi.getUserSessions(userId)
  });
  const revokeMut = useMutation({
    mutationFn: (sessionId: string) => adminApi.revokeSession(userId, sessionId),
    onSuccess: () => { toast.success('Session revoked'); refetch(); }
  });
  const revokeAllMut = useMutation({
    mutationFn: () => adminApi.revokeAllSessions(userId),
    onSuccess: () => { toast.success('All sessions revoked'); refetch(); }
  });

  if (isLoading) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between px-2">
        <div>
          <h3 className="text-lg font-bold text-white">Active Sessions</h3>
          <p className="text-sm text-muted-foreground">{sessions?.length ?? 0} devices currently logged in</p>
        </div>
        {(sessions?.length ?? 0) > 0 && (
          <Button variant="destructive" size="sm" onClick={() => revokeAllMut.mutate()} className="rounded-xl">
            <ShieldOff className="h-4 w-4 mr-2" /> Revoke All
          </Button>
        )}
      </div>

      <div className="grid gap-4">
        {sessions?.map((s: any) => (
          <div key={s.id} className="premium-card p-5 rounded-2xl flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 text-muted-foreground">
                <Globe className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white">{s.ipAddress ?? 'Unknown IP'}</span>
                  {s.id === 'current' && <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase">Current</span>}
                </div>
                <p className="text-xs text-muted-foreground max-w-md truncate">{s.deviceInfo ?? 'Standard Web Browser'}</p>
                <div className="flex items-center gap-2 text-[10px] text-muted-foreground uppercase tracking-wider font-bold">
                  <Clock className="h-3 w-3" /> Expires: {new Date(s.expiresAt).toLocaleString()}
                </div>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => revokeMut.mutate(s.id)}
              className="text-orange-400 hover:bg-orange-400/10 rounded-xl"
            >
              Revoke Access
            </Button>
          </div>
        ))}
        {sessions?.length === 0 && (
          <div className="py-20 text-center opacity-40">
            <MonitorX className="h-12 w-12 mx-auto mb-4" />
            <p className="text-lg font-bold">No active sessions found</p>
          </div>
        )}
      </div>
    </div>
  );
}

function GdprTab({ userId }: { userId: string }) {
  const exportMut = useMutation({
    mutationFn: () => adminApi.createGdprExport(userId),
    onSuccess: () => toast.success('Privacy export initiated')
  });
  const deleteMut = useMutation({
    mutationFn: () => adminApi.createGdprDelete(userId),
    onSuccess: () => toast.success('Data deletion queued')
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="max-w-2xl">
        <h3 className="text-lg font-bold text-white mb-2">Privacy & Compliance</h3>
        <p className="text-sm text-muted-foreground">
          Tools for managing data portability and the "Right to be Forgotten" under GDPR/CCPA regulations.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="premium-card p-8 rounded-[2rem] space-y-4 border-blue-500/20 bg-blue-500/5">
          <div className="h-14 w-14 rounded-2xl bg-blue-500/20 flex items-center justify-center text-blue-400 mb-2">
            <FileDown className="h-7 w-7" />
          </div>
          <h4 className="text-xl font-bold text-white">Export Archive</h4>
          <p className="text-sm text-muted-foreground">
            Generate a full ZIP archive containing all user profile data, activity logs, and system metadata.
          </p>
          <Button 
            onClick={() => exportMut.mutate()} 
            disabled={exportMut.isPending}
            className="w-full rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-bold"
          >
            {exportMut.isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Start Export Process'}
          </Button>
        </div>

        <div className="premium-card p-8 rounded-[2rem] space-y-4 border-red-500/20 bg-red-500/5">
          <div className="h-14 w-14 rounded-2xl bg-red-500/20 flex items-center justify-center text-red-400 mb-2">
            <FileX className="h-7 w-7" />
          </div>
          <h4 className="text-xl font-bold text-white">Permanent Wipe</h4>
          <p className="text-sm text-muted-foreground">
            Irreversibly delete all records associated with this identity across all platform services.
          </p>
          <Button 
            onClick={() => {
              if (confirm('This action cannot be undone. All user data will be purged. Proceed?')) deleteMut.mutate();
            }} 
            disabled={deleteMut.isPending}
            className="w-full rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold"
          >
            {deleteMut.isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Queue Data Purge'}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Hub Page ────────────────────────────────────────────────────────────

export default function UserManagementPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const userId = searchParams.get('userid');
  const view = searchParams.get('view') || 'overview';

  const { data: user, isLoading, refetch } = useQuery({
    queryKey: ['admin-user', userId],
    queryFn: () => adminApi.getUser(userId!),
    enabled: !!userId
  });

  useEffect(() => {
    if (!userId) {
      router.replace('/users');
    }
  }, [userId, router]);

  if (!userId) return null;

  const tabs = [
    { id: 'overview', label: 'Overview', icon: UserCog },
    { id: 'sessions', label: 'Sessions', icon: MonitorX },
    { id: 'history', label: 'Login History', icon: Clock },
    { id: 'audit', label: 'Audit Logs', icon: Shield },
    { id: 'gdpr', label: 'Privacy', icon: FileX },
  ];

  const setView = (newView: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('view', newView);
    router.push(`/users/manage?${params.toString()}`);
  };

  const renderView = () => {
    if (isLoading) return <div className="flex items-center justify-center min-h-[40vh]"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div>;
    if (!user) return <div className="text-center py-20"><p className="text-xl font-bold">User not found</p></div>;

    switch (view) {
      case 'sessions':
        return <SessionsTab userId={userId} />;
      case 'gdpr':
        return <GdprTab userId={userId} />;
      case 'history':
      case 'audit':
        return (
          <div className="py-20 text-center opacity-40">
             <Activity className="h-12 w-12 mx-auto mb-4" />
             <p className="text-lg font-bold">Refining log interface...</p>
             <p className="text-sm">This section is currently being optimized for speed.</p>
          </div>
        );
      case 'overview':
      default:
        return <OverviewTab user={user} refetch={refetch} />;
    }
  };

  return (
    <div className="space-y-8 pb-20 animate-in fade-in duration-700">
      {/* Dynamic Header */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 bg-white/[0.02] border border-white/5 p-8 rounded-[2.5rem] backdrop-blur-md shadow-2xl">
        <div className="space-y-1">
          <Link 
            href="/users" 
            className="flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-primary transition-colors uppercase tracking-widest mb-3 group w-fit"
          >
            <ArrowLeft className="h-3 w-3 group-hover:-translate-x-1 transition-transform" /> Back to Users
          </Link>
          <div className="flex items-center gap-4">
             <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-inner">
                <LayoutDashboard className="h-7 w-7 text-primary" />
             </div>
             <div>
                <h1 className="text-3xl font-black text-white tracking-tight">
                  {user?.profile?.fullName || 'Identity'} <span className="text-white/40 font-light">Management</span>
                </h1>
                <div className="flex items-center gap-2 mt-1">
                   <Badge variant="outline" className="rounded-lg border-white/10 bg-white/5 text-[10px] font-black uppercase tracking-widest">
                      ID: {userId}
                   </Badge>
                   {user && (
                     <Badge variant="outline" className={`rounded-lg text-[10px] font-black uppercase tracking-widest ${user.status === 'active' ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400' : 'border-rose-500/20 bg-rose-500/10 text-rose-400'}`}>
                        {user.status}
                     </Badge>
                   )}
                </div>
             </div>
          </div>
        </div>

        {/* Unified Tab Switcher */}
        <div className="flex flex-wrap items-center p-1.5 bg-black/40 border border-white/5 rounded-2xl overflow-x-auto no-scrollbar">
           {tabs.map((tab) => (
             <button
               key={tab.id}
               onClick={() => setView(tab.id)}
               className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                 view === tab.id 
                   ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-105 active:scale-95' 
                   : 'text-muted-foreground hover:text-white hover:bg-white/5'
               }`}
             >
               <tab.icon className="h-4 w-4" />
               {tab.label}
             </button>
           ))}
        </div>
      </div>

      {/* Main Viewport */}
      <div className="relative">
         {renderView()}
      </div>
    </div>
  );
}
