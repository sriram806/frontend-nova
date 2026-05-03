'use client';

import { BroadcastComposer } from '@/components/notifications/BroadcastComposer';
import { NotificationCenter } from '@/components/notifications/NotificationCenter';
import { SectionHeader } from '@/components/ui/section-header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bell, Send, History } from 'lucide-react';

export default function NotificationsPage() {
  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <SectionHeader 
        title="Notification Management" 
        description="Communicate with your users and monitor system alerts in real-time."
      />

      <Tabs defaultValue="feed" className="w-full">
        <TabsList className="bg-white/5 border border-white/10 p-1 rounded-xl mb-8">
          <TabsTrigger value="feed" className="flex items-center gap-2 px-6 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Bell className="w-4 h-4" />
            Alert Feed
          </TabsTrigger>
          <TabsTrigger value="broadcast" className="flex items-center gap-2 px-6 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Send className="w-4 h-4" />
            Broadcast Center
          </TabsTrigger>
        </TabsList>

        <TabsContent value="feed" className="outline-none">
          <div className="grid grid-cols-1 gap-8">
            <NotificationCenter />
          </div>
        </TabsContent>

        <TabsContent value="broadcast" className="outline-none">
          <div className="max-w-4xl mx-auto">
            <BroadcastComposer />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
