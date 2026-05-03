'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { 
  Users, 
  ShieldAlert, 
  UserPlus, 
  Settings2, 
  UserMinus,
  LayoutDashboard
} from 'lucide-react';
import { AllUsersView } from '@/components/admin/users/AllUsersView';
import { ModerationView } from '@/components/admin/users/ModerationView';
import { RolesView } from '@/components/admin/users/RolesView';
import { BannedView } from '@/components/admin/users/BannedView';

export default function UsersHubPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const view = searchParams.get('view') || 'all';

  const tabs = [
    { id: 'all', label: 'All Users', icon: Users },
    { id: 'moderation', label: 'Moderation', icon: ShieldAlert },
    { id: 'roles', label: 'Role Management', icon: Settings2 },
    { id: 'banned', label: 'Banned & Suspended', icon: UserMinus },
  ];

  const setView = (newView: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('view', newView);
    // Reset filters when switching tabs if needed
    params.delete('page');
    params.delete('search');
    router.push(`/users?${params.toString()}`);
  };

  const renderView = () => {
    switch (view) {
      case 'moderation':
        return <ModerationView />;
      case 'roles':
        return <RolesView />;
      case 'banned':
        return <BannedView />;
      case 'all':
      default:
        return <AllUsersView />;
    }
  };

  return (
    <div className="space-y-8 pb-20 animate-in fade-in duration-700">
      {/* Header Hub */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-white/[0.02] border border-white/5 p-8 rounded-[2.5rem] backdrop-blur-md shadow-2xl">
        <div className="space-y-1">
          <div className="flex items-center gap-4">
             <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-inner">
                <LayoutDashboard className="h-7 w-7 text-primary" />
             </div>
             <div>
                <h1 className="text-3xl font-black text-white tracking-tight">
                  User <span className="text-white/40 font-light">Management</span>
                </h1>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-[0.2em] mt-1">
                  Centralized platform control
                </p>
             </div>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex flex-wrap items-center p-1.5 bg-black/40 border border-white/5 rounded-2xl">
           {tabs.map((tab) => (
             <button
               key={tab.id}
               onClick={() => setView(tab.id)}
               className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                 view === tab.id 
                   ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-105 active:scale-95' 
                   : 'text-muted-foreground hover:text-white hover:bg-white/5'
               }`}
             >
               <tab.icon className="h-4 w-4" />
               {tab.label}
             </button>
           ))}
        </div>
      </div>

      {/* Main Viewport */}
      <div className="relative min-h-[400px]">
         {renderView()}
      </div>
    </div>
  );
}
