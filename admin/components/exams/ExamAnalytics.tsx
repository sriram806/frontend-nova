'use client';

import React, { useMemo } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line,
  Cell
} from 'recharts';
import { 
  TrendingUp, 
  Users, 
  Target, 
  Award, 
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  ArrowRight,
  History,
  ShieldAlert,
  XCircle,
  TrendingUp as BarChart3Icon
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { AttemptAuditModal } from './attempt-audit-modal';

interface ExamAnalyticsProps {
  data: any;
  loading: boolean;
}

export const ExamAnalytics = ({ data, loading }: ExamAnalyticsProps) => {
  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-32 rounded-[2rem]" />)}
        </div>
        <Skeleton className="h-[400px] rounded-[2rem]" />
      </div>
    );
  }

  if (!data || data.summary.totalAttempts === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center space-y-4 bg-white/[0.02] border border-white/5 rounded-[2rem]">
        <div className="h-20 w-20 rounded-full bg-white/5 flex items-center justify-center text-white/20">
          <Target className="h-10 w-10" />
        </div>
        <div className="space-y-1">
          <h3 className="text-xl font-bold text-white">No Data Available</h3>
          <p className="text-white/40 max-w-xs text-sm font-medium">This exam hasn't been attempted by any users yet. Analytics will appear once users start the assessment.</p>
        </div>
      </div>
    );
  }

  const { summary, distribution, questionPerformance, recentAttempts } = data;
  const [selectedAttemptId, setSelectedAttemptId] = React.useState<string | null>(null);

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <MetricCard 
          icon={<Users className="h-4 w-4" />} 
          label="Total Attempts" 
          value={summary.totalAttempts} 
          subValue="Life-time"
          color="text-blue-400"
          bg="bg-blue-500/10"
        />
        <MetricCard 
          icon={<Award className="h-4 w-4" />} 
          label="Pass Rate" 
          value={`${summary.passRate}%`} 
          subValue="Standardized"
          color="text-emerald-400"
          bg="bg-emerald-500/10"
        />
        <MetricCard 
          icon={<Target className="h-4 w-4" />} 
          label="Avg. Score" 
          value={`${summary.avgScore}%`} 
          subValue="Across all levels"
          color="text-purple-400"
          bg="bg-purple-500/10"
        />
        <MetricCard 
          icon={<TrendingUp className="h-4 w-4" />} 
          label="Recent Trend" 
          value="Stable" 
          subValue="Last 10 attempts"
          color="text-orange-400"
          bg="bg-orange-500/10"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Score Distribution */}
        <div className="bg-white/[0.03] border border-white/5 rounded-[2rem] p-8 space-y-8 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-white tracking-tight">Score Distribution</h3>
              <p className="text-white/30 text-xs font-medium">Frequency of user scores across percentage ranges.</p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center text-white/40">
              <BarChart3 className="h-5 w-5" />
            </div>
          </div>

          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={distribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                <XAxis 
                  dataKey="range" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#ffffff40', fontSize: 10 }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#ffffff40', fontSize: 10 }}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid #ffffff10', borderRadius: '12px' }}
                  itemStyle={{ color: '#fff', fontSize: '12px' }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {distribution.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.count > 0 ? '#3b82f6' : '#ffffff10'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Success Trend */}
        <div className="bg-white/[0.03] border border-white/5 rounded-[2rem] p-8 space-y-8 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-white tracking-tight">Performance Trend</h3>
              <p className="text-white/30 text-xs font-medium">Scores of the last 10 users who attempted this exam.</p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center text-white/40">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>

          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={summary.trend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                <XAxis 
                  dataKey="date" 
                  hide
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#ffffff40', fontSize: 10 }}
                  domain={[0, 100]}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid #ffffff10', borderRadius: '12px' }}
                  itemStyle={{ color: '#fff', fontSize: '12px' }}
                  labelFormatter={() => 'Attempt Result'}
                />
                <Line 
                  type="monotone" 
                  dataKey="score" 
                  stroke="#8b5cf6" 
                  strokeWidth={4} 
                  dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 4, stroke: '#000' }}
                  activeDot={{ r: 6, stroke: '#fff', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Question Performance analysis */}
      <div className="bg-white/[0.03] border border-white/5 rounded-[2rem] overflow-hidden backdrop-blur-xl">
        <div className="p-8 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-2xl bg-rose-500/10 flex items-center justify-center text-rose-400">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Item Analysis</h3>
              <p className="text-white/30 text-xs font-medium">Identifying potentially problematic or poorly worded questions.</p>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/5">
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-white/20">Question Prompt</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-white/20">Success Rate</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-white/20">Status</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-white/20">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {questionPerformance.slice(0, 5).map((q: any) => (
                <tr key={q.id} className="group hover:bg-white/[0.02] transition-colors">
                  <td className="px-8 py-6">
                    <div className="flex items-start gap-3 max-w-md">
                      <div className="h-6 w-6 mt-1 rounded bg-white/5 flex items-center justify-center text-[10px] font-black text-white/20">
                        ?
                      </div>
                      <p className="text-sm font-bold text-white/80 line-clamp-2 leading-relaxed">{q.prompt}</p>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                        <span className={cn(
                          q.successRate < 40 ? "text-rose-400" : q.successRate < 70 ? "text-orange-400" : "text-emerald-400"
                        )}>{q.successRate}%</span>
                        <span className="text-white/20">{q.totalAttempts} attempts</span>
                      </div>
                      <div className="h-1 w-32 bg-white/5 rounded-full overflow-hidden">
                        <div 
                          className={cn(
                            "h-full transition-all duration-1000",
                            q.successRate < 40 ? "bg-rose-500" : q.successRate < 70 ? "bg-orange-500" : "bg-emerald-500"
                          )} 
                          style={{ width: `${q.successRate}%` }} 
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    {q.successRate < 40 ? (
                      <span className="px-3 py-1 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center w-fit gap-1">
                        <AlertTriangle className="h-3 w-3" /> Critical
                      </span>
                    ) : (
                      <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center w-fit gap-1">
                        <CheckCircle2 className="h-3 w-3" /> Healthy
                      </span>
                    )}
                  </td>
                  <td className="px-8 py-6">
                    <button className="p-2 bg-white/5 text-white/40 hover:bg-white/10 hover:text-white rounded-lg transition-all group-hover:translate-x-1">
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const MetricCard = ({ icon, label, value, subValue, color, bg }: any) => (
  <div className="bg-white/[0.03] border border-white/5 rounded-[2rem] p-6 space-y-4 backdrop-blur-xl group hover:border-white/10 transition-all">
    <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center shadow-lg", bg, color)}>
      {icon}
    </div>
    <div>
      <p className="text-[10px] font-black uppercase tracking-widest text-white/20">{label}</p>
      <div className="flex items-baseline gap-2">
        <p className="text-3xl font-black text-white">{value}</p>
        <span className="text-[9px] font-bold text-white/20 uppercase tracking-tighter">{subValue}</span>
      </div>
    </div>
  </div>
);

const BarChart3 = ({ className }: { className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M3 3v18h18" />
    <path d="M18 17V9" />
    <path d="M13 17V5" />
    <path d="M8 17v-3" />
  </svg>
);
