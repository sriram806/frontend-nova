'use client';

import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import {
  ShieldCheck, Crown, Zap, Users, UserIcon,
  CheckCircle2, Loader2, X, LifeBuoy
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from '@/utils/toast';
import * as adminApi from '@/services/adminService';
import type { AdminUser, UserRole } from '@/types/admin';
import { Button } from '@/components/ui/button';

const ROLES: Array<{
  role: UserRole;
  label: string;
  icon: any;
  color: string;
  bg: string;
  border: string;
}> = [
  { role: 'admin', label: 'Administrator', icon: Crown, color: 'text-rose-400', bg: 'bg-rose-400/10', border: 'border-rose-400/20' },
  { role: 'moderator', label: 'Moderator', icon: ShieldCheck, color: 'text-amber-400', bg: 'bg-amber-400/10', border: 'border-amber-400/20' },
  { role: 'support', label: 'Support Agent', icon: LifeBuoy, color: 'text-cyan-400', bg: 'bg-cyan-400/10', border: 'border-cyan-400/20' },
  { role: 'user', label: 'Standard User', icon: Users, color: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-400/20' },
  { role: 'guest', label: 'Guest (Full Access)', icon: UserIcon, color: 'text-slate-400', bg: 'bg-slate-400/10', border: 'border-slate-400/20' },
];

export function RoleChangeModal({
  user,
  isOpen,
  onClose,
  onSuccess,
}: {
  user: any;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [selectedRole, setSelectedRole] = useState<UserRole>(user?.role || 'user');

  const updateMut = useMutation({
    mutationFn: () => adminApi.updateUser(user.id, { role: selectedRole }),
    onSuccess: () => {
      toast.success(`Role updated to ${selectedRole}`);
      onSuccess();
      onClose();
    },
    onError: () => toast.error('Failed to update role'),
  });

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative z-10 w-full max-w-md rounded-[2.5rem] bg-[#0f1117] border border-white/10 p-8 shadow-2xl space-y-6 overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-6">
              <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/5 text-muted-foreground transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-1">
              <h3 className="text-2xl font-black text-white tracking-tight">Change User <span className="text-primary">Role</span></h3>
              <p className="text-sm text-muted-foreground">
                Current role: <span className="text-white font-bold uppercase tracking-widest text-[10px] bg-white/5 px-2 py-0.5 rounded-lg ml-1">{user.role}</span>
              </p>
            </div>

            <div className="grid gap-2">
              {ROLES.map(({ role, label, icon: Icon, color, bg, border }) => (
                <button
                  key={role}
                  onClick={() => setSelectedRole(role)}
                  className={`w-full flex items-center gap-4 p-4 rounded-2xl border transition-all text-left group
                    ${selectedRole === role ? `${bg} ${border} ${color}` : 'border-white/5 hover:bg-white/5 text-muted-foreground'}`}
                >
                  <div className={`p-2.5 rounded-xl transition-transform group-hover:scale-110 ${selectedRole === role ? bg : 'bg-white/5'}`}>
                    <Icon className={`h-5 w-5 ${selectedRole === role ? color : 'text-muted-foreground'}`} />
                  </div>
                  <div className="flex-1">
                    <span className="font-bold text-sm block">{label}</span>
                    <span className="text-[10px] uppercase tracking-tighter opacity-50 font-bold">Permissions level {ROLES.length - ROLES.findIndex(r => r.role === role)}</span>
                  </div>
                  {selectedRole === role && <CheckCircle2 className="h-5 w-5 ml-auto" />}
                </button>
              ))}
            </div>

            <div className="flex gap-4 pt-2">
              <Button variant="outline" onClick={onClose} className="flex-1 rounded-2xl border-white/10 h-12 font-bold text-muted-foreground hover:text-white">
                Cancel
              </Button>
              <Button
                onClick={() => updateMut.mutate()}
                disabled={updateMut.isPending || selectedRole === user.role}
                className="flex-1 rounded-2xl gradient-primary border-none h-12 font-black shadow-xl shadow-primary/20"
              >
                {updateMut.isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Confirm Change'}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
