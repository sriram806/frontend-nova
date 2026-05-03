'use client';

import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { 
  Key, Shield, Plus, Trash2, Copy, CheckCircle2, 
  Terminal, Globe, Lock, AlertCircle, Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from '@/utils/toast';
import * as adminApi from '@/services/adminService';
import { Button } from '@/components/ui/button';

export default function ApiKeysPage() {
  const { data: keys, isLoading, refetch } = useQuery({
    queryKey: ['admin-api-keys'],
    queryFn: () => adminApi.listApiKeys(),
  });

  const createMut = useMutation({
    mutationFn: (payload: { name: string; scopes: string[] }) => adminApi.createApiKey(payload),
    onSuccess: (data) => {
      toast.success('API Key generated');
      refetch();
      // In a real app, we'd show the key once here
      console.log('New Key:', data.key);
    }
  });

  const revokeMut = useMutation({
    mutationFn: (id: string) => adminApi.revokeApiKey(id),
    onSuccess: () => {
      toast.success('API Key revoked');
      refetch();
    }
  });

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('ID copied to clipboard');
  };

  return (
    <div className="space-y-10 pb-20">
      {/* Header */}
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            Developer Access
            <span className="text-sm font-medium px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-400 border border-violet-500/20">
              API Keys
            </span>
          </h1>
          <p className="text-muted-foreground text-[15px]">
            Manage programmatic access to platform services. Generate keys for automated workflows.
          </p>
        </div>
        
        <Button onClick={() => createMut.mutate({ name: 'System Integration', scopes: ['read:users', 'write:moderation'] })} className="rounded-xl gradient-primary border-none shadow-xl">
           <Plus className="h-4 w-4 mr-2" /> Generate New Key
        </Button>
      </div>

      {/* Info Card */}
      <div className="premium-card p-8 rounded-[2.5rem] bg-gradient-to-br from-violet-500/10 to-transparent border-violet-500/20">
        <div className="flex items-start gap-6">
          <div className="h-14 w-14 rounded-2xl bg-violet-500/20 flex items-center justify-center text-violet-400 shrink-0">
            <Terminal className="h-7 w-7" />
          </div>
          <div className="space-y-3">
            <h3 className="text-xl font-bold text-white">System Architecture Note</h3>
            <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed">
              API keys provide full access to administrative endpoints. Ensure keys are stored securely and never exposed in client-side code. Use scopes to limit exposure in case of compromise.
            </p>
          </div>
        </div>
      </div>

      {/* API Keys List */}
      <div className="grid gap-6 lg:grid-cols-2">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-48 rounded-[2.5rem] bg-white/5 border border-white/10 animate-pulse" />
          ))
        ) : (
          keys?.map((key: any) => (
            <motion.div
              key={key.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="premium-card p-8 rounded-[2.5rem] space-y-6 group hover:border-violet-500/30 transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-violet-400">
                    <Key className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-lg">{key.name}</h4>
                    <p className="text-xs text-muted-foreground">Created on {new Date(key.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => revokeMut.mutate(key.id)}
                  className="rounded-xl text-red-400 hover:bg-red-400/10 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-between">
                  <code className="text-xs font-mono text-white/60">
                    {key.id.slice(0, 12)}••••••••••••••••••••
                  </code>
                  <button onClick={() => copyToClipboard(key.id)} className="p-2 hover:bg-white/10 rounded-lg text-muted-foreground hover:text-white transition-colors">
                    <Copy className="h-4 w-4" />
                  </button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {key.scopes?.map((scope: string) => (
                    <span key={scope} className="px-2 py-0.5 rounded-lg bg-white/5 border border-white/10 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                      {scope}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-white/5">
                <div className="flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full ${key.isActive ? 'bg-emerald-400' : 'bg-red-400'}`} />
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                    {key.isActive ? 'Active & Healthy' : 'Revoked / Inactive'}
                  </span>
                </div>
                <div className="text-[10px] font-bold text-muted-foreground uppercase">
                   Last Used: {key.lastUsedAt ? new Date(key.lastUsedAt).toLocaleDateString() : 'Never'}
                </div>
              </div>
            </motion.div>
          ))
        )}

        {keys?.length === 0 && (
          <div className="lg:col-span-2 py-32 text-center opacity-30">
            <Key className="h-12 w-12 mx-auto mb-4" />
            <p className="text-lg font-bold uppercase tracking-[0.2em]">No API Keys Generated</p>
            <p className="text-sm">Generate a key to start integrating platform services.</p>
          </div>
        )}
      </div>
    </div>
  );
}
