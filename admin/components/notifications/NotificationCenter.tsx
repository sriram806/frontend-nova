'use client';

import { useEffect, useState } from 'react';
import { 
  Bell, 
  CheckCircle2, 
  Clock, 
  Filter, 
  MoreVertical, 
  Trash2, 
  Inbox,
  AlertCircle,
  Info,
  Zap,
  AlertTriangle,
  Settings,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { fetchNotifications, markNotificationsRead } from '@/services/notificationsService';
import type { NotificationItem } from '@/services/userService';
import { toast } from 'sonner';

export function NotificationCenter() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const loadNotifications = async () => {
    try {
      const data = await fetchNotifications(1, 50);
      setNotifications(data.notifications);
    } catch (error) {
      console.error('Failed to load notifications', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleMarkRead = async (id?: string) => {
    try {
      await markNotificationsRead(id ? [id] : undefined);
      toast.success(id ? 'Marked as read' : 'All marked as read');
      loadNotifications();
    } catch (error) {
      toast.error('Failed to update notifications');
    }
  };

  const filtered = notifications.filter(n => filter === 'all' || !n.read);

  const getCategoryStyles = (category: string) => {
    switch (category) {
      case 'success':
        return { icon: <CheckCircle2 className="w-4 h-4 text-green-400" />, bg: 'bg-green-500/10', border: 'border-green-500/20' };
      case 'warning':
        return { icon: <AlertTriangle className="w-4 h-4 text-yellow-400" />, bg: 'bg-yellow-500/10', border: 'border-yellow-500/20' };
      case 'error':
        return { icon: <AlertCircle className="w-4 h-4 text-red-400" />, bg: 'bg-red-500/10', border: 'border-red-500/20' };
      case 'system':
        return { icon: <Settings className="w-4 h-4 text-purple-400" />, bg: 'bg-purple-500/10', border: 'border-purple-500/20' };
      case 'promotion':
        return { icon: <Sparkles className="w-4 h-4 text-cyan-400" />, bg: 'bg-cyan-500/10', border: 'border-cyan-500/20' };
      default:
        return { icon: <Info className="w-4 h-4 text-blue-400" />, bg: 'bg-blue-500/10', border: 'border-blue-500/20' };
    }
  };

  return (
    <Card className="border-white/10 bg-white/5 backdrop-blur-xl shadow-xl h-[600px] flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between border-b border-white/10 pb-4">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-primary" />
          <CardTitle className="text-lg font-semibold">Notification Feed</CardTitle>
          <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
            {notifications.filter(n => !n.read).length} Unread
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setFilter(filter === 'all' ? 'unread' : 'all')}
            className={filter === 'unread' ? 'bg-primary/10 text-primary' : 'text-white/40'}
          >
            <Filter className="w-4 h-4 mr-2" />
            {filter === 'all' ? 'All' : 'Unread'}
          </Button>
          <Button variant="ghost" size="sm" onClick={() => handleMarkRead()} className="text-white/40 hover:text-white">
            <CheckCircle2 className="w-4 h-4 mr-2" />
            Mark all read
          </Button>
        </div>
      </CardHeader>

      <CardContent className="flex-1 p-0 overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 opacity-40">
            <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            <p className="text-sm">Fetching alerts...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-white/20 gap-4">
            <Inbox className="w-12 h-12" />
            <p className="text-sm font-medium">No notifications found</p>
          </div>
        ) : (
          <ScrollArea className="h-full">
            <div className="divide-y divide-white/5">
              {filtered.map((notification) => {
                const style = getCategoryStyles(notification.category);
                return (
                  <div 
                    key={notification.id} 
                    className={`group relative p-4 transition-colors hover:bg-white/[0.02] ${!notification.read ? 'bg-primary/[0.03]' : ''}`}
                  >
                    {!notification.read && (
                      <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-primary" />
                    )}
                    
                    <div className="flex gap-4">
                      <div className={`mt-1 p-2 rounded-lg border transition-colors ${style.bg} ${style.border}`}>
                        {style.icon}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h4 className={`text-sm font-semibold truncate ${!notification.read ? 'text-white' : 'text-white/60'}`}>
                            {notification.title}
                          </h4>
                          <span className="text-[10px] text-white/30 flex items-center gap-1 shrink-0">
                            <Clock className="w-3 h-3" />
                            {notification.createdAt ? formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true }) : 'just now'}
                          </span>
                        </div>
                        <p className="text-xs text-white/50 line-clamp-2 leading-relaxed mb-2">
                          {notification.message}
                        </p>

                        {notification.actionUrl && (
                          <a 
                            href={notification.actionUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-[10px] font-medium text-primary hover:text-primary/80 transition-colors"
                          >
                            <ExternalLink className="w-3 h-3" />
                            View Details
                          </a>
                        )}
                      </div>

                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-white/40">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-slate-900 border-white/10">
                            {!notification.read && (
                              <DropdownMenuItem onClick={() => handleMarkRead(notification.id)}>
                                <CheckCircle2 className="w-4 h-4 mr-2" />
                                Mark as read
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem className="text-red-400 focus:text-red-400">
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
