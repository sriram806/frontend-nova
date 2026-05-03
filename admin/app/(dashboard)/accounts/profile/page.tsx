'use client';

import { motion } from 'framer-motion';
import { 
  User, 
  Mail, 
  ShieldCheck, 
  Calendar, 
  MapPin, 
  Globe, 
  PencilLine,
  ArrowUpRight,
  Fingerprint
} from 'lucide-react';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';

export default function ProfilePage() {
  const user = useAuthStore((state) => state.user);

  if (!user) return null;

  const initials = user.displayName
    ? user.displayName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : user.email?.charAt(0).toUpperCase() || 'AD';

  return (
    <div className="space-y-8 pb-12">
      {/* Header Section */}
      <div className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-muted/20 p-8 md:p-12">
        <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-primary/10 blur-[100px]" />
        <div className="absolute -left-24 -bottom-24 h-72 w-72 rounded-full bg-blue-500/10 blur-[80px]" />
        
        <div className="relative flex flex-col md:flex-row items-center gap-8 md:gap-12">
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            className="h-32 w-32 md:h-40 md:w-40 rounded-[2.5rem] bg-gradient-to-br from-primary via-indigo-600 to-blue-500 flex items-center justify-center text-4xl md:text-5xl font-black text-white shadow-2xl shadow-primary/40 ring-4 ring-white/10"
          >
            {initials}
          </motion.div>

          <div className="flex-1 text-center md:text-left">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-3"
            >
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20">
                <ShieldCheck className="h-4 w-4 text-primary" />
                <span className="text-xs font-bold uppercase tracking-widest text-primary">{user.role || 'Admin'} Account</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white">
                {user.displayName || 'Administrator'}
              </h1>
              <p className="text-lg text-muted-foreground font-medium">{user.email}</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mt-8 flex flex-wrap justify-center md:justify-start gap-4"
            >
              <Link href="/accounts/profile/edit">
                <Button className="rounded-2xl h-12 px-8 font-bold gradient-primary shadow-lg shadow-primary/20">
                  <PencilLine className="mr-2 h-5 w-5" />
                  Edit Profile
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <ProfileCard 
          icon={User} 
          label="Full Name" 
          value={user.displayName || 'Not Set'} 
          delay={0.1}
        />
        <ProfileCard 
          icon={Mail} 
          label="Email Address" 
          value={user.email} 
          delay={0.2}
        />
        <ProfileCard 
          icon={Fingerprint} 
          label="Account ID" 
          value={user.id} 
          delay={0.3}
          isMono
        />
        <ProfileCard 
          icon={ShieldCheck} 
          label="Access Level" 
          value={user.role || 'Admin'} 
          delay={0.4}
        />
        <ProfileCard 
          icon={Calendar} 
          label="Member Since" 
          value={new Date(user.createdAt || '').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} 
          delay={0.5}
        />
        <ProfileCard 
          icon={Globe} 
          label="Status" 
          value={user.status || 'Active'} 
          delay={0.6}
          statusColor={user.status === 'suspended' ? 'text-red-400' : 'text-emerald-400'}
        />
      </div>

      {/* Security Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="premium-card rounded-[2.5rem] p-8 border border-white/10 bg-white/[0.02]"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-primary" />
            Security & Login
          </h2>
        </div>
        <div className="grid gap-4">
          <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5">
            <div className="space-y-1">
              <p className="text-sm font-bold text-white">Two-Factor Authentication</p>
              <p className="text-xs text-muted-foreground">Keep your account secure by enabling 2FA.</p>
            </div>
            <Button variant="outline" size="sm" className="rounded-xl border-white/10">Configure</Button>
          </div>
          <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5">
            <div className="space-y-1">
              <p className="text-sm font-bold text-white">Last Login Activity</p>
              <p className="text-xs text-muted-foreground">Today at 10:45 AM from Hyderabad, India</p>
            </div>
            <Link href="/audit-log" className="text-primary hover:underline text-xs font-bold flex items-center gap-1">
              View Log <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function ProfileCard({ icon: Icon, label, value, delay, isMono, statusColor }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="premium-card rounded-[2rem] p-6 border border-white/10 bg-white/[0.02] hover:bg-white/[0.04] transition-all"
    >
      <div className="flex items-center gap-4">
        <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
          <Icon className="h-6 w-6" />
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{label}</p>
          <p className={cn(
            "text-lg font-bold text-white truncate max-w-[200px]",
            isMono && "font-mono text-sm tracking-tight",
            statusColor
          )}>
            {value}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}
