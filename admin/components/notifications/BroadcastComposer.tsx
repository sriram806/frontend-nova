'use client';

import { useState } from 'react';
import { 
  Send, 
  Users, 
  User, 
  Mail, 
  Bell, 
  ShieldAlert, 
  Link as LinkIcon,
  Info,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Settings,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { sendNotification, type SendNotificationPayload } from '@/services/notificationsService';

const CATEGORIES = [
  { value: 'info', label: 'Information', icon: Info, color: 'text-blue-400' },
  { value: 'success', label: 'Success', icon: CheckCircle2, color: 'text-green-400' },
  { value: 'warning', label: 'Warning', icon: AlertTriangle, color: 'text-yellow-400' },
  { value: 'error', label: 'Critical Error', icon: AlertCircle, color: 'text-red-400' },
  { value: 'system', label: 'System Update', icon: Settings, color: 'text-purple-400' },
  { value: 'promotion', label: 'Promotion', icon: Sparkles, color: 'text-cyan-400' },
] as const;

export function BroadcastComposer() {
  const [loading, setLoading] = useState(false);
  const [targetType, setTargetType] = useState<'user' | 'broadcast'>('broadcast');
  const [userId, setUserId] = useState('');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [category, setCategory] = useState<typeof CATEGORIES[number]['value']>('info');
  const [actionUrl, setActionUrl] = useState('');
  const [channel, setChannel] = useState<'in_app' | 'email'>('in_app');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !message) {
      toast.error('Please fill in all fields');
      return;
    }

    if (targetType === 'user' && !userId) {
      toast.error('Please provide a User ID');
      return;
    }

    setLoading(true);
    try {
      const payload: SendNotificationPayload = {
        target: targetType === 'user' ? { type: 'user', userId } : { type: 'broadcast' },
        title,
        message,
        category,
        actionUrl: actionUrl || undefined,
        notificationType: channel,
      };

      await sendNotification(payload);
      toast.success('Notification sent successfully');
      
      // Reset form
      if (targetType === 'user') setUserId('');
      setTitle('');
      setMessage('');
      setActionUrl('');
    } catch (error: any) {
      toast.error(error.message || 'Failed to send notification');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl overflow-hidden relative group">
      {/* 🌌 Ambient Glow */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/20 rounded-full blur-[100px] pointer-events-none group-hover:bg-primary/30 transition-colors duration-500" />
      
      <CardHeader>
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
            <Bell className="w-5 h-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-xl font-bold tracking-tight">Broadcast Center</CardTitle>
            <CardDescription className="text-white/50">Send high-tier stylized alerts to your users</CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <form id="broadcast-form" onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Target Selection */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-white/70">Recipient Target</Label>
              <Select value={targetType} onValueChange={(val: any) => setTargetType(val)}>
                <SelectTrigger className="bg-white/5 border-white/10 focus:ring-primary/50">
                  <SelectValue placeholder="Select target" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-white/10">
                  <SelectItem value="broadcast">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      <span>All Active Users</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="user">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      <span>Specific User</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Category Selection */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-white/70">Alert Category</Label>
              <Select value={category} onValueChange={(val: any) => setCategory(val)}>
                <SelectTrigger className="bg-white/5 border-white/10 focus:ring-primary/50">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-white/10">
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      <div className="flex items-center gap-2">
                        <cat.icon className={`w-4 h-4 ${cat.color}`} />
                        <span>{cat.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Delivery Channel */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-white/70">Delivery Channel</Label>
              <Select value={channel} onValueChange={(val: any) => setChannel(val)}>
                <SelectTrigger className="bg-white/5 border-white/10 focus:ring-primary/50">
                  <SelectValue placeholder="Select channel" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-white/10">
                  <SelectItem value="in_app">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4" />
                      <span>In-App Notification</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="email">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      <span>Email Message</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Action URL */}
            <div className="space-y-2">
              <Label htmlFor="actionUrl" className="text-sm font-medium text-white/70">Action URL (Optional)</Label>
              <div className="relative">
                <Input
                  id="actionUrl"
                  placeholder="https://thinkai.com/dashboard/..."
                  value={actionUrl}
                  onChange={(e) => setActionUrl(e.target.value)}
                  className="bg-white/5 border-white/10 focus:ring-primary/50 pl-10"
                />
                <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
              </div>
            </div>
          </div>

          {targetType === 'user' && (
            <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
              <Label htmlFor="userId" className="text-sm font-medium text-white/70">User ID (UUID)</Label>
              <Input
                id="userId"
                placeholder="e.g. 123e4567-e89b-12d3-a456-426614174000"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                className="bg-white/5 border-white/10 focus:ring-primary/50"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-medium text-white/70">Title</Label>
            <Input
              id="title"
              placeholder="Enter notification title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-white/5 border-white/10 focus:ring-primary/50"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message" className="text-sm font-medium text-white/70">Message Body</Label>
            <Textarea
              id="message"
              placeholder="Type your message here..."
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="bg-white/5 border-white/10 focus:ring-primary/50 resize-none"
            />
          </div>
        </form>
      </CardContent>

      <CardFooter className="bg-white/5 border-t border-white/10 p-6">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2 text-xs text-white/40">
            <ShieldAlert className="w-3 h-3" />
            <span>This broadcast will be sent to {targetType === 'broadcast' ? 'all users' : 'a specific user'}.</span>
          </div>
          <Button
            type="submit"
            form="broadcast-form"
            disabled={loading}
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-8 shadow-lg shadow-primary/20 transition-all active:scale-95"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Sending...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Send className="w-4 h-4" />
                Dispatch Alert
              </span>
            )}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
