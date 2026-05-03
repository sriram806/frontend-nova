'use client';

import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import {
  Trophy,
  ArrowLeft,
  Medal,
  Crown,
  Search,
  Filter,
  User,
  Zap,
  ArrowRight,
  TrendingUp,
  RefreshCcw,
  Sparkles
} from 'lucide-react';
import { listAttempts } from '@/services/examService';
import { Button } from '@/components/ui/button';
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
import Link from 'next/link';
import { Input } from '@/components/core/input';

export default function ExamLeaderboardPage() {
  const params = useParams();
  const skillName = params.skill as string;

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['exam-leaderboard', skillName],
    queryFn: () => listAttempts(skillName, { page: 1, limit: 50, sort: 'score', order: 'desc' })
  });

  const leaders = data?.attempts || [];

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
            <Trophy className="h-10 w-10 text-orange-400" />
            Skill Leaderboard
          </h1>
          <p className="text-muted-foreground flex items-center gap-2 uppercase text-[10px] font-bold tracking-[0.2em]">
            Top Performers in {skillName}
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

      {/* Podium Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end pt-10">
        {/* Rank 2 */}
        <div className="order-2 md:order-1 h-64 rounded-[3rem] bg-white/[0.02] border border-white/5 p-8 flex flex-col items-center justify-center space-y-4 relative">
          <div className="absolute -top-6 h-12 w-12 rounded-2xl bg-slate-400 flex items-center justify-center text-black font-black shadow-xl shadow-slate-400/20">2</div>
          <div className="h-20 w-20 rounded-full border-2 border-slate-400/40 p-1">
            <div className="h-full w-full rounded-full bg-white/5 flex items-center justify-center text-3xl">🥈</div>
          </div>
          <div className="text-center">
            <p className="text-lg font-black text-white">{leaders[1]?.userName || '---'}</p>
            <p className="text-sm font-black text-slate-400">{leaders[1]?.score || 0}%</p>
          </div>
        </div>

        {/* Rank 1 */}
        <div className="order-1 md:order-2 h-80 rounded-[3rem] bg-gradient-to-b from-orange-400/20 to-transparent border border-orange-400/30 p-8 flex flex-col items-center justify-center space-y-4 relative shadow-2xl shadow-orange-400/10 scale-110 z-10">
          <Crown className="absolute -top-12 h-16 w-16 text-orange-400 drop-shadow-2xl" />
          <div className="absolute -top-6 h-14 w-14 rounded-2xl bg-orange-400 flex items-center justify-center text-black font-black shadow-xl shadow-orange-400/40 text-xl">1</div>
          <div className="h-28 w-28 rounded-full border-4 border-orange-400 p-1">
            <div className="h-full w-full rounded-full bg-white/10 flex items-center justify-center text-5xl">🥇</div>
          </div>
          <div className="text-center">
            <p className="text-2xl font-black text-white tracking-tight">{leaders[0]?.userName || '---'}</p>
            <p className="text-lg font-black text-orange-400 uppercase tracking-widest">{leaders[0]?.score || 0}%</p>
          </div>
          <div className="absolute inset-x-0 bottom-6 flex justify-center">
            <Badge className="bg-orange-400 text-black font-black italic rounded-lg">WORLD CLASS</Badge>
          </div>
        </div>

        {/* Rank 3 */}
        <div className="order-3 h-64 rounded-[3rem] bg-white/[0.02] border border-white/5 p-8 flex flex-col items-center justify-center space-y-4 relative">
          <div className="absolute -top-6 h-12 w-12 rounded-2xl bg-amber-700 flex items-center justify-center text-white font-black shadow-xl shadow-amber-700/20">3</div>
          <div className="h-20 w-20 rounded-full border-2 border-amber-700/40 p-1">
            <div className="h-full w-full rounded-full bg-white/5 flex items-center justify-center text-3xl">🥉</div>
          </div>
          <div className="text-center">
            <p className="text-lg font-black text-white">{leaders[2]?.userName || '---'}</p>
            <p className="text-sm font-black text-amber-700">{leaders[2]?.score || 0}%</p>
          </div>
        </div>
      </div>

      {/* Control Bar */}
      <div className="flex flex-col md:flex-row items-center gap-4 bg-white/[0.02] border border-white/5 p-4 rounded-[2rem] mt-12">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search leaderboard..."
            className="w-full bg-white/5 border-none h-12 pl-12 rounded-2xl text-sm"
          />
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="h-10 px-4 rounded-xl border-white/5 bg-white/5 text-[10px] font-black uppercase tracking-widest">Global Ranking</Badge>
          <Badge variant="outline" className="h-10 px-4 rounded-xl border-white/5 bg-white/5 text-[10px] font-black uppercase tracking-widest">Season 1</Badge>
        </div>
      </div>

      {/* List Content */}
      <div className="rounded-[2.5rem] border border-white/5 bg-white/[0.01] overflow-hidden">
        <Table>
          <TableHeader className="bg-white/[0.02]">
            <TableRow className="border-white/5 hover:bg-transparent">
              <TableHead className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Rank</TableHead>
              <TableHead className="py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">User</TableHead>
              <TableHead className="py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Score</TableHead>
              <TableHead className="py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Time Taken</TableHead>
              <TableHead className="py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Date Achieved</TableHead>
              <TableHead className="px-8 py-5 text-right text-[10px] font-black uppercase tracking-widest text-muted-foreground">Profile</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 10 }).map((_, i) => (
                <TableRow key={i} className="border-white/5">
                  <TableCell className="px-8"><Skeleton className="h-4 w-8 rounded" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-48 rounded" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-12 rounded" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-16 rounded" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-32 rounded" /></TableCell>
                  <TableCell className="px-8"><Skeleton className="h-8 w-8 ml-auto rounded-lg" /></TableCell>
                </TableRow>
              ))
            ) : leaders.slice(3).map((attempt, index) => (
              <TableRow key={attempt.id} className="border-white/5 hover:bg-white/[0.02] transition-colors group">
                <TableCell className="px-8 py-4">
                  <span className="text-sm font-black text-white/40">#{index + 4}</span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/5 group-hover:border-primary/20 transition-all">
                      <User className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-white group-hover:text-primary transition-colors">{attempt.userName || 'Anonymous'}</span>
                      <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-black flex items-center gap-1">
                        <Zap className="h-3 w-3 text-primary" /> Pro User
                      </span>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-sm font-black text-white">{attempt.score}%</span>
                </TableCell>
                <TableCell>
                  <span className="text-xs text-white/60 font-mono">
                    {attempt.timeTakenSeconds ? `${Math.floor(attempt.timeTakenSeconds / 60)}m ${attempt.timeTakenSeconds % 60}s` : 'N/A'}
                  </span>
                </TableCell>
                <TableCell>
                  <span className="text-xs text-muted-foreground font-medium">
                    {new Date(attempt.startedAt).toLocaleDateString()}
                  </span>
                </TableCell>
                <TableCell className="px-8 text-right">
                  <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-white/5">
                    <ArrowRight className="h-4 w-4 opacity-50 group-hover:opacity-100 group-hover:text-primary transition-all" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Top Performers Info */}
      <div className="p-10 rounded-[3rem] bg-gradient-to-r from-orange-400/10 via-transparent to-transparent border border-orange-400/20 flex items-center gap-8">
        <div className="h-20 w-20 rounded-[2rem] bg-orange-400 flex items-center justify-center shadow-2xl shadow-orange-400/20">
          <Medal className="h-10 w-10 text-black" />
        </div>
        <div className="flex-1 space-y-1">
          <h4 className="text-xl font-black text-white italic">Hall of Fame Recognition</h4>
          <p className="text-sm text-muted-foreground max-w-2xl">
            The top 1% of performers in each skill receive exclusive platform badges and priority visibility in recruitment searches.
          </p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className="text-[10px] font-black text-orange-400 uppercase tracking-[0.2em]">Platform Rank</span>
          <span className="text-3xl font-black text-white tracking-tighter italic">GLOBAL #1</span>
        </div>
      </div>
    </div>
  );
}
