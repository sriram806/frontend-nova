'use client';

import Link from 'next/link';
import { 
  Activity, Sparkles, Target, Server, Users, FileText, 
  Briefcase, Bell, BookOpen, CreditCard, BarChart3, 
  UserCheck, Zap, Shield, ArrowUpRight, TrendingUp, Clock,
  MoreHorizontal, ChevronRight
} from 'lucide-react';
import { motion } from 'framer-motion';
import { PageTransition } from '@/components/common/page-transition';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthStore } from '@/store/authStore';
import { useQuery } from '@tanstack/react-query';
import * as adminApi from '@/services/adminService';

export default function DashboardPage() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin-dashboard-realtime'],
    queryFn: () => adminApi.getRealtimeDashboard(),
    refetchInterval: 5000,
  });
  const user = useAuthStore((state) => state.user);

  if (isLoading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-10 w-48 bg-white/5 rounded-xl" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-40 rounded-[2rem] bg-white/5 border border-white/10" />
          ))}
        </div>
        <div className="h-96 rounded-[2.5rem] bg-white/5 border border-white/10" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="p-4 rounded-full bg-red-500/10 text-red-500">
           <Server className="h-10 w-10" />
        </div>
        <h2 className="text-2xl font-bold text-white">System Sync Failed</h2>
        <p className="text-muted-foreground text-center max-w-sm">Unable to connect to the operational dashboard. Please check your administrative privileges.</p>
        <Button className="gradient-primary rounded-2xl h-12 px-8 mt-4" onClick={() => refetch()}>
          Retry Connection
        </Button>
      </div>
    );
  }

  const stats = [
    { label: 'Active Sessions', value: data.activeSessions, icon: Zap, color: 'text-emerald-400', bg: 'bg-emerald-400/10', trend: '+12%', sub: 'Currently online' },
    { label: '24h Logins', value: data.loginsLast24h, icon: Users, color: 'text-blue-400', bg: 'bg-blue-400/10', trend: '+5.4%', sub: 'Verified entries' },
    { label: 'Pending Reports', value: data.pendingModerationReports, icon: Shield, color: 'text-amber-400', bg: 'bg-amber-400/10', trend: '-2', sub: 'Awaiting review' },
    { label: 'System Load', value: '0.82', icon: Server, color: 'text-violet-400', bg: 'bg-violet-400/10', trend: 'Stable', sub: 'Global instances' },
  ];

  return (
    <PageTransition>
      <div className="space-y-10 pb-20">
        {/* Welcome Section */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white">Platform Command</h1>
            <p className="mt-1 text-[15px] text-muted-foreground">
              Hello, <span className="text-primary font-bold">{user?.displayName || 'Admin'}</span>. Here is what's happening today.
            </p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/5 border border-white/10">
            <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">System Operational</span>
          </div>
        </div>

        {/* Dynamic Stats Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="premium-card p-6 rounded-[2rem] group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color} transition-transform group-hover:scale-110`}>
                  <stat.icon className="h-6 w-6" />
                </div>
                <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full">
                  <TrendingUp className="h-3 w-3" /> {stat.trend}
                </div>
              </div>
              <div>
                <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">{stat.label}</p>
                <div className="flex items-end gap-2 mt-1">
                   <h3 className="text-3xl font-bold text-white">{stat.value}</h3>
                   <span className="text-[10px] text-muted-foreground mb-1 font-medium">{stat.sub}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Action Feed */}
          <Card className="lg:col-span-2 premium-card rounded-[2.5rem] border-none overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between p-8 pb-4">
              <div className="space-y-1">
                <CardTitle className="text-xl font-bold flex items-center gap-2">
                  <Activity className="h-5 w-5 text-primary" />
                  Live Operations Feed
                </CardTitle>
                <CardDescription>Real-time administrative and security ledger.</CardDescription>
              </div>
              <Button variant="ghost" size="icon" className="rounded-xl hover:bg-white/5">
                <MoreHorizontal className="h-5 w-5" />
              </Button>
            </CardHeader>
            <CardContent className="p-8 pt-4 space-y-4">
              {data.recentAdminActions?.length === 0 ? (
                <div className="py-20 text-center opacity-30">
                  <Clock className="h-12 w-12 mx-auto mb-4" />
                  <p className="text-lg font-bold">No recent activities</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {data.recentAdminActions?.map((action, i) => (
                    <motion.div
                      key={action.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-primary/20 transition-all hover:bg-white/[0.04]"
                    >
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                          <Target className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-bold text-sm text-white capitalize">{action.action.replace('_', ' ')}</p>
                          <p className="text-xs text-muted-foreground flex items-center gap-2">
                             By {action.actorId?.slice(0, 8) ?? 'System'} <span className="opacity-30">•</span> {new Date(action.createdAt).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" className="rounded-lg h-8 text-primary hover:bg-primary/10 group">
                        Details <ChevronRight className="h-3 w-3 ml-1 group-hover:translate-x-0.5 transition-transform" />
                      </Button>
                    </motion.div>
                  ))}
                </div>
              )}
              <Button variant="outline" className="w-full rounded-2xl border-white/10 mt-4 h-12 font-bold hover:bg-white/5">
                View All Activity Logs
              </Button>
            </CardContent>
          </Card>

          {/* Quick Actions / Info */}
          <div className="space-y-8">
            <Card className="premium-card rounded-[2.5rem] border-none bg-gradient-to-br from-primary/20 to-transparent">
              <CardHeader className="p-8 pb-4">
                <CardTitle className="text-lg font-bold">Command Center</CardTitle>
                <CardDescription>Direct access to critical tools.</CardDescription>
              </CardHeader>
              <CardContent className="p-8 pt-4 space-y-3">
                <Link href="/dashboard/users" className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all">
                  <div className="flex items-center gap-3 font-bold text-sm">
                     <Users className="h-5 w-5 text-blue-400" /> User Directory
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
                </Link>
                <Link href="/dashboard/moderation" className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all">
                  <div className="flex items-center gap-3 font-bold text-sm">
                     <Shield className="h-5 w-5 text-amber-400" /> Moderation Queue
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
                </Link>
                <Link href="/dashboard/audit-log" className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all">
                  <div className="flex items-center gap-3 font-bold text-sm">
                     <FileText className="h-5 w-5 text-violet-400" /> Compliance Audit
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
                </Link>
              </CardContent>
            </Card>

            <Card className="premium-card rounded-[2.5rem] border-none bg-[#0f1117]">
               <CardHeader className="p-8 pb-4">
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" /> System Health
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 pt-4 space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    <span>CPU Utilization</span>
                    <span className="text-white">12%</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full w-[12%] bg-primary rounded-full" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    <span>Memory Usage</span>
                    <span className="text-white">4.2GB / 16GB</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full w-[26%] bg-blue-400 rounded-full" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

      </div>
    </PageTransition>
  );
}
