'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { 
  History, 
  Search, 
  Filter, 
  ArrowLeft,
  Calendar,
  User,
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
  ExternalLink,
  RefreshCcw,
  MoreHorizontal
} from 'lucide-react';
import { listAttempts } from '@/services/examService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Link from 'next/link';

export default function ExamAttemptsPage() {
  const params = useParams();
  const skillName = params.skill as string;
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['exam-attempts', skillName, page],
    queryFn: () => listAttempts(skillName, { page, limit: 20 })
  });

  const attempts = data?.attempts || [];
  const pagination = data?.pagination;

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
            <History className="h-10 w-10 text-primary" />
            Attempt History
          </h1>
          <p className="text-muted-foreground flex items-center gap-2 uppercase text-[10px] font-bold tracking-[0.2em]">
            Skill ID: {skillName}
          </p>
        </div>

        <div className="flex items-center gap-3">
           <Button variant="outline" size="icon" onClick={() => refetch()} className="rounded-2xl border-white/10 h-12 w-12">
             <RefreshCcw className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} />
           </Button>
           <Button asChild className="rounded-2xl h-12 px-6 bg-white/5 border border-white/10 hover:bg-white/10 text-sm font-bold">
              <Link href={`/exams/${skillName}/analytics`}>View Analytics</Link>
           </Button>
        </div>
      </div>

      {/* Stats Quick Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Attempts', value: pagination?.total || 0, color: 'text-white' },
          { label: 'Pass Rate', value: '68%', color: 'text-emerald-400' },
          { label: 'Violations', value: '12', color: 'text-red-400' },
          { label: 'Avg Time', value: '42m', color: 'text-cyan-400' },
        ].map((stat, i) => (
          <div key={i} className="p-4 rounded-3xl bg-white/[0.02] border border-white/5 space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{stat.label}</p>
            <p className={`text-2xl font-black ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Control Bar */}
      <div className="flex flex-col md:flex-row items-center gap-4 bg-white/[0.02] border border-white/5 p-4 rounded-[2rem]">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search by user email or ID..."
            className="w-full bg-white/5 border-none h-12 pl-12 rounded-2xl text-sm"
          />
        </div>
        <Button variant="ghost" className="gap-2 rounded-2xl bg-white/5 border border-white/5 h-12 px-6 font-bold text-xs">
          <Filter className="h-4 w-4" /> Filters
        </Button>
      </div>

      {/* Table Content */}
      <div className="rounded-[2.5rem] border border-white/5 bg-white/[0.01] overflow-hidden">
        <Table>
          <TableHeader className="bg-white/[0.02]">
            <TableRow className="border-white/5 hover:bg-transparent">
              <TableHead className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">User</TableHead>
              <TableHead className="py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Score</TableHead>
              <TableHead className="py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Status</TableHead>
              <TableHead className="py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Time Taken</TableHead>
              <TableHead className="py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Date</TableHead>
              <TableHead className="px-8 py-5 text-right text-[10px] font-black uppercase tracking-widest text-muted-foreground">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 10 }).map((_, i) => (
                <TableRow key={i} className="border-white/5">
                   <TableCell className="px-8"><Skeleton className="h-4 w-48 rounded" /></TableCell>
                   <TableCell><Skeleton className="h-4 w-12 rounded" /></TableCell>
                   <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                   <TableCell><Skeleton className="h-4 w-16 rounded" /></TableCell>
                   <TableCell><Skeleton className="h-4 w-32 rounded" /></TableCell>
                   <TableCell className="px-8"><Skeleton className="h-8 w-8 ml-auto rounded-lg" /></TableCell>
                </TableRow>
              ))
            ) : attempts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-64 text-center">
                   <div className="flex flex-col items-center gap-3 text-muted-foreground">
                      <History className="h-12 w-12 opacity-10" />
                      <p className="text-sm font-bold">No attempts recorded for this exam.</p>
                   </div>
                </TableCell>
              </TableRow>
            ) : attempts.map((attempt) => (
              <TableRow key={attempt.id} className="border-white/5 hover:bg-white/[0.02] transition-colors group">
                <TableCell className="px-8 py-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/5 group-hover:border-primary/20 transition-all">
                      <User className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-white group-hover:text-primary transition-colors">{attempt.userName || 'Anonymous'}</span>
                      <span className="text-xs text-muted-foreground">{attempt.userEmail}</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                   <span className="text-sm font-black text-white">{attempt.score}%</span>
                </TableCell>
                <TableCell>
                  <Badge className={`rounded-lg px-2.5 py-0.5 text-[10px] font-black tracking-widest border-none
                    ${attempt.passed ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                    {attempt.passed ? <ShieldCheck className="h-3 w-3 mr-1" /> : <ShieldAlert className="h-3 w-3 mr-1" />}
                    {attempt.passed ? 'PASSED' : 'FAILED'}
                  </Badge>
                </TableCell>
                <TableCell>
                   <span className="text-xs text-muted-foreground font-mono">
                     {attempt.timeTakenSeconds ? `${Math.floor(attempt.timeTakenSeconds / 60)}m ${attempt.timeTakenSeconds % 60}s` : 'N/A'}
                   </span>
                </TableCell>
                <TableCell>
                   <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
                      <Calendar className="h-3.5 w-3.5" />
                      {new Date(attempt.startedAt).toLocaleDateString()}
                   </div>
                </TableCell>
                <TableCell className="px-8 text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-white/5">
                         <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-[#0f1117] border-white/10 rounded-2xl p-2 w-48 shadow-2xl">
                       <DropdownMenuItem className="rounded-xl flex items-center justify-between text-xs font-bold py-2.5 cursor-pointer">
                          View Answers <ExternalLink className="h-3.5 w-3.5 opacity-50" />
                       </DropdownMenuItem>
                       <DropdownMenuItem className="rounded-xl flex items-center justify-between text-xs font-bold py-2.5 cursor-pointer text-red-400 focus:text-red-400 focus:bg-red-500/10">
                          Invalidate Attempt <ShieldAlert className="h-3.5 w-3.5" />
                       </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Placeholder */}
      <div className="flex items-center justify-between bg-white/[0.02] border border-white/5 p-4 rounded-[2rem]">
         <p className="text-xs text-muted-foreground font-medium">Showing {attempts.length} of {pagination?.total || 0} attempts</p>
         <div className="flex items-center gap-2">
            <Button variant="outline" disabled className="rounded-xl border-white/10 h-10 px-4 text-xs font-bold">Previous</Button>
            <Button variant="outline" disabled className="rounded-xl border-white/10 h-10 px-4 text-xs font-bold">Next</Button>
         </div>
      </div>
    </div>
  );
}
