'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, UserPlus, Users, Building2, Calendar, ShieldCheck, Zap } from 'lucide-react';
import { apiPost } from '@/services/examService';
import { toast } from '@/utils/toast';
import { cn } from '@/lib/utils';

interface AssignExamModalProps {
  isOpen: boolean;
  onClose: () => void;
  examId: string;
  skillName: string;
}

export const AssignExamModal = ({ isOpen, onClose, examId, skillName }: AssignExamModalProps) => {
  const [targetType, setTargetType] = useState<'USER' | 'TEAM' | 'ORG'>('USER');
  const [targetId, setTargetId] = useState('');
  const [deadline, setDeadline] = useState('');
  const [priority, setPriority] = useState('MEDIUM');
  const [loading, setLoading] = useState(false);

  const handleAssign = async () => {
    if (!targetId) {
      toast.error('Please provide a target ID');
      return;
    }

    try {
      setLoading(true);
      const payload: any = {
        examId,
        deadlineAt: deadline || undefined,
        priority
      };

      if (targetType === 'USER') payload.userId = targetId;
      if (targetType === 'TEAM') payload.teamId = targetId;
      if (targetType === 'ORG') payload.organizationId = targetId;

      await apiPost('/api/exam/admin/assign', payload);
      toast.success(`Exam assigned successfully to ${targetType.toLowerCase()}`);
      onClose();
    } catch (err) {
      console.error('Assignment failed', err);
      toast.error('Failed to assign exam');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />
      
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative w-full max-w-md bg-[#0c0d12] border border-white/10 rounded-[2.5rem] p-8 space-y-8 shadow-2xl"
      >
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="text-xl font-bold text-white tracking-tight uppercase italic">Assign Assessment</h3>
            <p className="text-white/40 text-xs font-medium">Assigning <span className="text-primary">{skillName}</span> to a team or individual.</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/5 text-white/20">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Target Type Selector */}
          <div className="grid grid-cols-3 gap-2 p-1 bg-white/5 rounded-2xl">
            {[
              { id: 'USER', label: 'User', icon: <UserPlus className="h-3.5 w-3.5" /> },
              { id: 'TEAM', label: 'Team', icon: <Users className="h-3.5 w-3.5" /> },
              { id: 'ORG', label: 'Org', icon: <Building2 className="h-3.5 w-3.5" /> }
            ].map((type) => (
              <button
                key={type.id}
                onClick={() => setTargetType(type.id as any)}
                className={cn(
                  "flex items-center justify-center gap-2 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                  targetType === type.id ? "bg-primary text-black" : "text-white/40 hover:text-white"
                )}
              >
                {type.icon}
                {type.label}
              </button>
            ))}
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-2">Target ID / Email</label>
              <input 
                type="text" 
                value={targetId}
                onChange={(e) => setTargetId(e.target.value)}
                placeholder={targetType === 'USER' ? "User ID or Email" : `${targetType} ID`}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-2">Priority</label>
                <select 
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary/40 appearance-none transition-all"
                >
                  <option value="LOW" className="bg-[#0c0d12]">Low</option>
                  <option value="MEDIUM" className="bg-[#0c0d12]">Medium</option>
                  <option value="HIGH" className="bg-[#0c0d12]">High</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-2">Deadline</label>
                <input 
                  type="date" 
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
                />
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10 flex gap-4">
            <Zap className="h-5 w-5 text-primary shrink-0" />
            <p className="text-[10px] text-white/60 font-medium leading-relaxed">
              Assigned users will receive a notification and see this exam in their "Required Assessments" section. Performance data will be visible in the Org Dashboard.
            </p>
          </div>
        </div>

        <button 
          onClick={handleAssign}
          disabled={loading}
          className="w-full py-4 bg-primary text-black rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
        >
          {loading ? 'Processing Assignment...' : 'Confirm Assignment'}
        </button>
      </motion.div>
    </div>
  );
};
