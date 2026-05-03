'use client';

import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { 
  BarChart3, 
  ArrowLeft,
  TrendingUp,
  Users,
  Target,
  Clock,
  ChevronRight,
  Sparkles,
  Info,
  ShieldCheck,
  AlertTriangle,
  LayoutGrid
} from 'lucide-react';
import { getAnalytics } from '@/services/examService';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function ExamAnalyticsPage() {
  const params = useParams();
  const skillName = params.skill as string;

  const { data: analytics, isLoading } = useQuery({
    queryKey: ['exam-analytics', skillName],
    queryFn: () => getAnalytics(skillName)
  });

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <Link 
            href="/exams" 
            className="flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-primary transition-colors uppercase tracking-widest mb-2"
          >
            <ArrowLeft className="h-3 w-3" /> Back to Catalog
          </Link>
          <h1 className="text-4xl font-black text-white flex items-center gap-3">
            <BarChart3 className="h-10 w-10 text-primary" />
            Performance Insights
          </h1>
          <p className="text-muted-foreground flex items-center gap-2 uppercase text-[10px] font-bold tracking-[0.2em]">
            Analysis for {skillName}
          </p>
        </div>

        <div className="flex items-center gap-3">
           <Button asChild className="rounded-2xl h-12 px-6 bg-white/5 border border-white/10 hover:bg-white/10 text-sm font-bold">
              <Link href={`/exams/${skillName}/attempts`}>View Raw Attempts</Link>
           </Button>
           <Button asChild className="gradient-primary border-none rounded-2xl h-12 px-6 shadow-xl shadow-primary/20 text-sm font-bold">
              <Link href={`/exams/${skillName}`}>Edit Bank</Link>
           </Button>
        </div>
      </div>

      {/* Overview Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Pass Rate', value: '72.4%', sub: '+4.2% vs last month', icon: ShieldCheck, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
          { label: 'Avg Score', value: '64.8%', sub: 'Target: 60%', icon: Target, color: 'text-primary', bg: 'bg-primary/10' },
          { label: 'Total Candidates', value: '1,204', sub: '24 new today', icon: Users, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
          { label: 'Avg Duration', value: '48m', sub: 'Limit: 60m', icon: Clock, color: 'text-orange-400', bg: 'bg-orange-500/10' },
        ].map((stat, i) => (
          <div key={i} className="p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/5 space-y-4">
             <div className={`h-12 w-12 rounded-2xl ${stat.bg} flex items-center justify-center`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
             </div>
             <div className="space-y-1">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{stat.label}</p>
                <p className="text-3xl font-black text-white">{stat.value}</p>
                <p className="text-[10px] font-medium text-white/40">{stat.sub}</p>
             </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* Score Distribution Chart Placeholder */}
        <Card className="lg:col-span-2 rounded-[2.5rem] border-white/5 bg-white/[0.01] p-8 space-y-6">
          <CardHeader className="p-0 space-y-1">
             <CardTitle className="text-xl font-bold flex items-center gap-3">
                <TrendingUp className="h-5 w-5 text-primary" />
                Score Distribution
             </CardTitle>
             <CardDescription className="text-xs text-muted-foreground uppercase tracking-widest font-bold">Frequency of candidates by score band</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
             <div className="h-[300px] w-full flex items-end gap-2 pt-10">
                {[12, 18, 45, 67, 89, 120, 150, 200, 180, 140, 90, 60, 30].map((h, i) => (
                   <div key={i} className="flex-1 bg-primary/20 hover:bg-primary transition-all rounded-t-xl relative group cursor-pointer" style={{ height: `${(h/200)*100}%` }}>
                      <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-[#0c0d12] border border-white/10 px-2 py-1 rounded-lg text-[10px] font-black opacity-0 group-hover:opacity-100 transition-opacity">
                         {h} Users
                      </div>
                   </div>
                ))}
             </div>
             <div className="flex justify-between mt-4 text-[10px] font-bold uppercase text-white/20 tracking-widest border-t border-white/5 pt-4 px-2">
                <span>0%</span>
                <span>20%</span>
                <span>40%</span>
                <span>60% (Pass)</span>
                <span>80%</span>
                <span>100%</span>
             </div>
          </CardContent>
        </Card>

        {/* Insights & Actions */}
        <div className="space-y-6">
           
           <div className="p-8 rounded-[2.5rem] bg-primary/5 border border-primary/20 space-y-6">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                 <Sparkles className="h-4 w-4 text-primary" /> AI Assessment Insights
              </h3>
              <div className="space-y-4">
                 <div className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-2">
                    <p className="text-xs font-bold text-orange-400 flex items-center gap-2">
                       <AlertTriangle className="h-3.5 w-3.5" /> High Failure Rate
                    </p>
                    <p className="text-[11px] text-white/60 leading-relaxed">
                       Questions involving <strong>Decorators</strong> have a 65% failure rate. Consider adding more context or adjusting marks.
                    </p>
                 </div>
                 <div className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-2">
                    <p className="text-xs font-bold text-emerald-400 flex items-center gap-2">
                       <ShieldCheck className="h-3.5 w-3.5" /> Optimized Timing
                    </p>
                    <p className="text-[11px] text-white/60 leading-relaxed">
                       Candidates typically finish in <strong>42 minutes</strong>, suggesting the 60m limit is well-balanced for this complexity.
                    </p>
                 </div>
              </div>
              <Button className="w-full rounded-2xl h-12 bg-white/10 hover:bg-white/20 border-none text-[11px] font-black tracking-widest uppercase">
                 GENERATE FULL PDF REPORT
              </Button>
           </div>

           <div className="p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/5 space-y-6">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                 <LayoutGrid className="h-4 w-4 text-cyan-400" /> Topic Proficiency
              </h3>
              <div className="space-y-4">
                 {[
                   { label: 'Syntax & Types', value: 88, color: 'bg-emerald-500' },
                   { label: 'OOP / Classes', value: 42, color: 'bg-red-500' },
                   { label: 'Standard Library', value: 76, color: 'bg-primary' },
                   { label: 'Asynchronous', value: 64, color: 'bg-cyan-500' },
                 ].map((topic, i) => (
                   <div key={i} className="space-y-2">
                      <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-white/40">
                         <span>{topic.label}</span>
                         <span>{topic.value}% Avg</span>
                      </div>
                      <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                         <div className={`h-full ${topic.color}`} style={{ width: `${topic.value}%` }} />
                      </div>
                   </div>
                 ))}
              </div>
           </div>

        </div>

      </div>

    </div>
  );
}
