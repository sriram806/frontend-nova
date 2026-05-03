'use client';

import React, { useEffect, useState } from 'react';
import { 
  ShieldCheck, 
  TrendingUp, 
  Clock, 
  Plus, 
  CheckCircle2, 
  XCircle, 
  MoreVertical,
  Activity,
  Layers,
  Sparkles,
  Search,
  ArrowRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  getModerationOverview, 
  listSkillRequests, 
  updateRequestStatus 
} from '@/services/examService';
import { toast } from '@/utils/toast';
import { BulkImportModal } from './bulk-import-modal';

export const ModerationCenter = () => {
  const [overview, setOverview] = useState<any>(null);
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSkillForImport, setSelectedSkillForImport] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const [ov, reqs] = await Promise.all([
        getModerationOverview(),
        listSkillRequests()
      ]);
      setOverview(ov);
      setRequests(reqs);
    } catch (err) {
      console.error('Failed to fetch moderation data', err);
      toast.error('Failed to load moderation center');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      await updateRequestStatus(id, status);
      toast.success(`Request marked as ${status}`);
      fetchData();
    } catch (err) {
      toast.error('Action failed');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="relative">
          <div className="h-12 w-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          <ShieldCheck className="absolute inset-0 m-auto h-5 w-5 text-primary/50" />
        </div>
      </div>
    );
  }

  const filteredRequests = requests.filter(r => 
    r.skillName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      {/* Header & Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-2 space-y-2">
          <h2 className="text-4xl font-black tracking-tighter text-white">Moderation Center</h2>
          <p className="text-white/40 text-sm font-medium">Manage user skill requests and monitor content fulfillment.</p>
        </div>
        
        <StatCard 
          icon={<Activity className="h-4 w-4" />} 
          label="Pending Requests" 
          value={overview?.requests?.pending ?? 0}
          color="bg-orange-500"
        />
        <StatCard 
          icon={<Layers className="h-4 w-4" />} 
          label="Draft Exams" 
          value={overview?.content?.draft ?? 0}
          color="bg-blue-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content: Skill Requests */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white/[0.03] border border-white/5 rounded-[2rem] overflow-hidden backdrop-blur-xl">
            <div className="p-8 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                  <TrendingUp className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Skill Requests</h3>
                  <p className="text-white/30 text-xs font-medium">Prioritized by user demand frequency.</p>
                </div>
              </div>

              <div className="relative flex-1 max-w-xs">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20" />
                <input 
                  type="text" 
                  placeholder="Filter skills..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-sm text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-white/20">Skill Name</th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-white/20">Requests</th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-white/20">Status</th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-white/20">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredRequests.map((req) => (
                    <tr key={req.id} className="group hover:bg-white/[0.02] transition-colors">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-lg bg-white/5 flex items-center justify-center text-white/40 group-hover:text-primary transition-colors">
                            <Sparkles className="h-4 w-4" />
                          </div>
                          <span className="font-bold text-white">{req.skillName}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-black text-white/90">{req.requestCount}</span>
                          <TrendingUp className="h-3 w-3 text-green-400 opacity-50" />
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <StatusBadge status={req.status} />
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          {req.status === 'pending' && (
                            <>
                              <button 
                                onClick={() => handleUpdateStatus(req.id, 'approved')}
                                className="p-2 bg-green-500/10 text-green-400 hover:bg-green-500/20 rounded-lg transition-all"
                                title="Approve"
                              >
                                <CheckCircle2 className="h-4 w-4" />
                              </button>
                              <button 
                                onClick={() => handleUpdateStatus(req.id, 'rejected')}
                                className="p-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg transition-all"
                                title="Reject"
                              >
                                <XCircle className="h-4 w-4" />
                              </button>
                            </>
                          )}
                          <button 
                            onClick={() => setSelectedSkillForImport(req.skillName)}
                            className="p-2 bg-primary/10 text-primary hover:bg-primary/20 rounded-lg transition-all"
                            title="Import Content"
                          >
                            <Upload className="h-4 w-4" />
                          </button>
                          <button className="p-2 bg-white/5 text-white/40 hover:bg-white/10 hover:text-white rounded-lg transition-all">
                            <ArrowRight className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Sidebar: Recent Activity / Guides */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-primary/20 to-purple-500/20 border border-primary/20 rounded-[2rem] p-8 space-y-6 backdrop-blur-xl">
            <div className="h-12 w-12 rounded-2xl bg-white/10 flex items-center justify-center text-white">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div className="space-y-2">
              <h4 className="text-xl font-bold text-white tracking-tight">Moderation Guide</h4>
              <p className="text-white/60 text-sm leading-relaxed">
                Review skill requests based on popularity. Once approved, create an exam template and assign it to a content moderator to fill the question bank.
              </p>
            </div>
            <button className="w-full py-4 bg-white text-black rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all hover:scale-[1.02] active:scale-95">
              Review Guidelines
            </button>
          </div>

          <div className="bg-white/[0.03] border border-white/5 rounded-[2rem] p-8 space-y-6">
            <h4 className="text-sm font-black uppercase tracking-widest text-white/40">Quick Actions</h4>
            <div className="space-y-3">
              <QuickAction icon={<Plus className="h-4 w-4" />} label="New Exam Template" />
              <QuickAction icon={<Clock className="h-4 w-4" />} label="Review Drafts" />
            </div>
          </div>
        </div>
      </div>

      <BulkImportModal 
        isOpen={!!selectedSkillForImport}
        onClose={() => setSelectedSkillForImport(null)}
        skillName={selectedSkillForImport || ''}
        onSuccess={fetchData}
      />
    </div>
  );
};

const StatCard = ({ icon, label, value, color }: any) => (
  <div className="bg-white/[0.03] border border-white/5 rounded-[2rem] p-6 space-y-4 backdrop-blur-xl group hover:border-white/10 transition-all">
    <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center text-white", color)}>
      {icon}
    </div>
    <div>
      <p className="text-[10px] font-black uppercase tracking-widest text-white/30">{label}</p>
      <p className="text-3xl font-black text-white group-hover:scale-110 transition-transform origin-left">{value}</p>
    </div>
  </div>
);

const StatusBadge = ({ status }: { status: string }) => {
  const styles = {
    pending: "bg-orange-500/10 text-orange-400 border-orange-500/20",
    approved: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    rejected: "bg-red-500/10 text-red-400 border-red-500/20",
    implemented: "bg-green-500/10 text-green-400 border-green-500/20"
  }[status] || "bg-white/5 text-white/40 border-white/10";

  return (
    <span className={cn(
      "px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-widest",
      styles
    )}>
      {status}
    </span>
  );
};

const QuickAction = ({ icon, label }: any) => (
  <button className="w-full flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-2xl group hover:bg-white/[0.08] hover:border-white/10 transition-all text-left">
    <div className="flex items-center gap-3">
      <div className="h-8 w-8 rounded-xl bg-white/5 flex items-center justify-center text-white/40 group-hover:text-primary transition-all">
        {icon}
      </div>
      <span className="text-xs font-bold text-white/60 group-hover:text-white transition-colors">{label}</span>
    </div>
    <ArrowRight className="h-4 w-4 text-white/10 group-hover:text-primary group-hover:translate-x-1 transition-all" />
  </button>
);
