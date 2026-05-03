'use client';

import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import {
  Lock, KeyRound, Eye, EyeOff, Loader2, X, AlertCircle, ShieldCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from '@/utils/toast';
import * as adminApi from '@/services/adminService';
import { Button } from '@/components/ui/button';

export function PasswordResetModal({
  user,
  isOpen,
  onClose,
}: {
  user: any;
  isOpen: boolean;
  onClose: () => void;
}) {
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const resetMut = useMutation({
    mutationFn: () => adminApi.updateUser(user.id, { password: newPassword }),
    onSuccess: () => {
      toast.success('Password updated successfully');
      setNewPassword('');
      onClose();
    },
    onError: () => toast.error('Failed to update password'),
  });

  const handleGenerate = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()';
    const pass = Array.from({ length: 12 }, () => chars.charAt(Math.floor(Math.random() * chars.length))).join('');
    setNewPassword(pass);
    setShowPassword(true);
  };

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
              <div className="h-14 w-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 mb-4">
                <KeyRound className="h-7 w-7" />
              </div>
              <h3 className="text-2xl font-black text-white tracking-tight">Force <span className="text-rose-400">Password</span> Reset</h3>
              <p className="text-sm text-muted-foreground">
                You are changing the password for <span className="text-white font-bold">{user.email}</span>
              </p>
            </div>

            <div className="space-y-4">
                <div className="space-y-2">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest ml-1">New Password</label>
                    <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <input
                            type={showPassword ? 'text' : 'password'}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="Min. 8 characters"
                            className="w-full h-12 pl-12 pr-12 rounded-2xl bg-white/5 border border-white/10 text-white placeholder:text-muted-foreground focus:outline-none focus:border-rose-500/50 focus:ring-4 focus:ring-rose-500/10 transition-all font-mono"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white transition-colors"
                        >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                    </div>
                </div>

                <Button 
                    variant="ghost" 
                    onClick={handleGenerate}
                    className="w-full rounded-xl text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary hover:bg-primary/5 h-8"
                >
                    Generate Strong Password
                </Button>
            </div>

            <div className="bg-amber-500/5 border border-amber-500/10 rounded-2xl p-4 flex gap-3">
                <AlertCircle className="h-5 w-5 text-amber-500 flex-shrink-0" />
                <p className="text-[11px] text-amber-500/80 leading-relaxed">
                    <strong>Security Warning:</strong> Changing a user's password manually is a high-risk action. The user will be logged out of all active sessions immediately.
                </p>
            </div>

            <div className="flex gap-4 pt-2">
              <Button variant="outline" onClick={onClose} className="flex-1 rounded-2xl border-white/10 h-12 font-bold text-muted-foreground">
                Cancel
              </Button>
              <Button
                onClick={() => resetMut.mutate()}
                disabled={resetMut.isPending || newPassword.length < 8}
                className="flex-1 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white border-none h-12 font-black shadow-xl shadow-rose-600/20"
              >
                {resetMut.isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Reset Password'}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
