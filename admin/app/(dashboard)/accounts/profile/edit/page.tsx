'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  User, 
  Mail, 
  ShieldCheck, 
  ArrowLeft,
  Save,
  Loader2,
  Camera
} from 'lucide-react';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { userService } from '@/services/userService';
import { toast } from 'sonner';

export default function ProfileEditPage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const refreshUser = useAuthStore((state) => state.refreshUser);
  
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await userService.updateCurrentUser({ displayName });
      await refreshUser();
      toast.success('Profile updated successfully');
      router.push('/accounts/profile');
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Back Link */}
      <Link 
        href="/accounts/profile" 
        className="inline-flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-white transition-colors group"
      >
        <div className="h-8 w-8 rounded-full border border-white/10 flex items-center justify-center group-hover:border-white/20">
          <ArrowLeft className="h-4 w-4" />
        </div>
        Back to Profile
      </Link>

      <div className="premium-card rounded-[2.5rem] border border-white/10 bg-muted/20 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-br from-primary/20 via-transparent to-transparent p-8 md:p-12 border-b border-white/5">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="relative group">
              <div className="h-32 w-32 rounded-[2.5rem] bg-gradient-to-br from-primary to-indigo-600 flex items-center justify-center text-4xl font-black text-white shadow-2xl shadow-primary/20 ring-4 ring-white/10 transition-all group-hover:scale-105">
                {displayName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'AD'}
              </div>
              <button className="absolute -bottom-2 -right-2 h-10 w-10 rounded-2xl bg-[#0f1117] border border-white/10 flex items-center justify-center text-muted-foreground hover:text-white hover:border-white/20 transition-all shadow-xl">
                <Camera className="h-5 w-5" />
              </button>
            </div>
            <div className="text-center md:text-left">
              <h1 className="text-3xl font-black tracking-tight text-white">Edit Profile</h1>
              <p className="text-muted-foreground mt-1 font-medium">Update your administrative identity and preferences.</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-8 md:p-12 space-y-8">
          <div className="grid gap-8">
            <div className="space-y-3">
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Display Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Enter your full name"
                  className="w-full h-14 pl-12 pr-4 rounded-2xl bg-white/5 border border-white/10 text-white placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all font-medium"
                  required
                />
              </div>
            </div>

            <div className="space-y-3 opacity-60">
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1 flex items-center gap-2">
                Email Address
                <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded text-white lowercase tracking-normal">Immutable</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <input
                  type="email"
                  value={user.email}
                  disabled
                  className="w-full h-14 pl-12 pr-4 rounded-2xl bg-white/5 border border-white/10 text-muted-foreground cursor-not-allowed font-medium"
                />
              </div>
            </div>

            <div className="space-y-3 opacity-60">
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1 flex items-center gap-2">
                Administrative Role
                <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded text-white lowercase tracking-normal">Immutable</span>
              </label>
              <div className="relative">
                <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <input
                  type="text"
                  value={user.role || 'Admin'}
                  disabled
                  className="w-full h-14 pl-12 pr-4 rounded-2xl bg-white/5 border border-white/10 text-muted-foreground cursor-not-allowed font-medium"
                />
              </div>
            </div>
          </div>

          <div className="pt-8 flex flex-col md:flex-row gap-4 border-t border-white/5">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 rounded-[1.25rem] h-14 font-bold gradient-primary shadow-lg shadow-primary/20 text-lg"
            >
              {isSubmitting ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                <>
                  <Save className="mr-2 h-5 w-5" />
                  Save Changes
                </>
              )}
            </Button>
            <Link href="/accounts/profile" className="flex-1">
              <Button
                type="button"
                variant="outline"
                className="w-full rounded-[1.25rem] h-14 font-bold border-white/10 text-white hover:bg-white/5 text-lg"
              >
                Cancel
              </Button>
            </Link>
          </div>
        </form>
      </div>

      {/* Danger Zone */}
      <div className="premium-card rounded-[2.5rem] p-8 border border-red-500/20 bg-red-500/[0.02]">
        <h3 className="text-lg font-bold text-red-400 mb-2">Account Security</h3>
        <p className="text-sm text-muted-foreground mb-6">Need to change your password or secure your account?</p>
        <Link href="/forgot-password">
          <Button variant="outline" className="rounded-xl border-red-500/20 text-red-400 hover:bg-red-500/10 hover:text-red-300">
            Request Password Reset
          </Button>
        </Link>
      </div>
    </div>
  );
}
