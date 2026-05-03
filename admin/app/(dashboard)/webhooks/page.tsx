'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, Webhook, Activity, AlertCircle, RefreshCw } from 'lucide-react';
import { toast } from '@/utils/toast';
import * as adminApi from '@/services/adminService';
import type { WebhookEndpoint } from '@/types/admin';

export default function WebhooksPage() {
  const qc = useQueryClient();
  const [isCreating, setIsCreating] = useState(false);
  const [newUrl, setNewUrl] = useState('');
  const [newSecret, setNewSecret] = useState('');
  const [newEvents, setNewEvents] = useState<string[]>(['user.created', 'user.login']);

  const { data: webhooks, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin-webhooks'],
    queryFn: () => adminApi.getWebhooks(),
  });

  const createMut = useMutation({
    mutationFn: (payload: { url: string; secret: string; eventTypes: string[] }) =>
      adminApi.createWebhook(payload),
    onSuccess: () => {
      toast.success('Webhook created successfully');
      setIsCreating(false);
      setNewUrl('');
      setNewSecret('');
      qc.invalidateQueries({ queryKey: ['admin-webhooks'] });
    },
    onError: () => toast.error('Failed to create webhook'),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => adminApi.deleteWebhook(id),
    onSuccess: () => {
      toast.success('Webhook deleted');
      qc.invalidateQueries({ queryKey: ['admin-webhooks'] });
    },
    onError: () => toast.error('Failed to delete webhook'),
  });

  const toggleStatusMut = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      adminApi.updateWebhook(id, { isActive }),
    onSuccess: () => {
      toast.success('Webhook status updated');
      qc.invalidateQueries({ queryKey: ['admin-webhooks'] });
    },
    onError: () => toast.error('Failed to update status'),
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Webhook Management</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Configure endpoints to receive realtime event streams.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => refetch()}
            className="flex items-center gap-1.5 rounded-xl border border-white/10 px-3 py-2 text-sm text-muted-foreground hover:bg-white/5 hover:text-white transition-colors"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh
          </button>
          <button
            onClick={() => setIsCreating(true)}
            className="flex items-center gap-1.5 rounded-xl bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add Webhook
          </button>
        </div>
      </div>

      {isCreating && (
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
          <h3 className="text-lg font-semibold text-white mb-4">New Webhook Endpoint</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1.5">
                Endpoint URL
              </label>
              <input
                type="url"
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                placeholder="https://api.example.com/webhook"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none focus:border-primary/50 transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1.5">
                Signing Secret
              </label>
              <input
                type="text"
                value={newSecret}
                onChange={(e) => setNewSecret(e.target.value)}
                placeholder="super_secret_key"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none focus:border-primary/50 transition-colors"
              />
            </div>
          </div>
          <div className="mt-4 flex gap-3 justify-end">
            <button
              onClick={() => setIsCreating(false)}
              className="rounded-xl border border-white/10 px-4 py-2 text-sm text-muted-foreground hover:bg-white/5 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => createMut.mutate({ url: newUrl, secret: newSecret, eventTypes: newEvents })}
              disabled={createMut.isPending || !newUrl || !newSecret}
              className="rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
            >
              {createMut.isPending ? 'Saving...' : 'Save Endpoint'}
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="rounded-2xl border border-white/10 overflow-hidden bg-white/[0.02]">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-muted-foreground">
            <AlertCircle className="h-8 w-8 text-red-400" />
            <p>Failed to load webhooks</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">URL</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Events</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Created</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {webhooks?.map((webhook) => (
                  <tr key={webhook.id} className="hover:bg-white/[0.03] transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Webhook className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium text-white">{webhook.url}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {webhook.eventTypes.map((et) => (
                          <span key={et} className="rounded bg-white/10 px-1.5 py-0.5 text-xs text-muted-foreground">
                            {et}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => toggleStatusMut.mutate({ id: webhook.id, isActive: !webhook.isActive })}
                        disabled={toggleStatusMut.isPending}
                        className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-medium transition-colors ${
                          webhook.isActive
                            ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                            : 'border-slate-500/30 bg-slate-500/10 text-slate-400 hover:bg-slate-500/20'
                        }`}
                      >
                        <Activity className="h-3 w-3" />
                        {webhook.isActive ? 'Active' : 'Disabled'}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">
                      {new Date(webhook.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => {
                          if (confirm('Delete this webhook?')) deleteMut.mutate(webhook.id);
                        }}
                        disabled={deleteMut.isPending}
                        className="rounded-lg p-1.5 text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
                {webhooks?.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-16 text-center text-muted-foreground">
                      No webhook endpoints configured.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
