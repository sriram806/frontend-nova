'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useMemo, useEffect } from 'react';
import { 
  BarChart3, 
  Settings, 
  HelpCircle, 
  Trophy, 
  PlusCircle, 
  List,
  ArrowLeft,
  LayoutDashboard
} from 'lucide-react';
import { AdminExamDetailPage } from '@/components/exams/admin-exam-detail-page';
import ExamAnalyticsPage from '../[skill]/analytics/page';
import ExamLeaderboardPage from '../[skill]/leaderboard/page';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { listTemplates, upsertTemplate } from '@/services/examService';
import { toast } from '@/utils/toast';
import Link from 'next/link';
import { useState } from 'react';
import { ExamTemplateSummary } from '@/types/exam';

// Mock/Adapter components for the hub
function QuestionsView({ skillName }: { skillName: string }) {
  return <AdminExamDetailPage skillName={skillName} initialTab="questions" />;
}

function AddQuestionView({ skillName }: { skillName: string }) {
  return <AdminExamDetailPage skillName={skillName} initialTab="editor" />;
}

function EditQuestionView({ skillName, questionId }: { skillName: string, questionId: string }) {
  return <AdminExamDetailPage skillName={skillName} initialTab="editor" editQuestionId={questionId} />;
}

function SettingsView({ skillName }: { skillName: string }) {
  const queryClient = useQueryClient();
  const { data: templates } = useQuery({ queryKey: ['exam-templates'], queryFn: listTemplates });
  const template = templates?.find(t => t.skillName === skillName);

  const [formData, setFormData] = useState<Partial<ExamTemplateSummary>>(template || {});

  const mutation = useMutation({
    mutationFn: upsertTemplate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exam-templates'] });
      toast.success('Settings updated successfully');
    }
  });

  if (!template) return <div className="p-12 text-center text-muted-foreground">Loading settings...</div>;

  return (
    <Card className="rounded-[2.5rem] border-white/5 bg-white/[0.01] p-8 max-w-4xl mx-auto">
      <CardHeader className="p-0 mb-8 space-y-1">
         <CardTitle className="text-2xl font-black">Exam Configuration</CardTitle>
         <CardDescription>Adjust the fundamental rules, thresholds, and quotas for this skill assessment.</CardDescription>
      </CardHeader>
      <CardContent className="p-0 space-y-8">
         <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
               <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Title</Label>
               <Input 
                 defaultValue={template.title} 
                 onChange={(e) => setFormData({...formData, title: e.target.value})}
                 className="bg-white/5 border-white/10 rounded-xl h-12" 
               />
            </div>
            <div className="space-y-2">
               <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Pass Percentage</Label>
               <Input 
                 type="number" 
                 defaultValue={template.passPercentage} 
                 onChange={(e) => setFormData({...formData, passPercentage: parseInt(e.target.value)})}
                 className="bg-white/5 border-white/10 rounded-xl h-12" 
               />
            </div>
         </div>
         
         <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Description</Label>
            <Textarea 
              defaultValue={template.description} 
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="bg-white/5 border-white/10 rounded-xl min-h-[100px]" 
            />
         </div>

         <div className="grid grid-cols-3 gap-6">
            <div className="space-y-2">
               <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">MCQ Target</Label>
               <Input 
                 type="number" 
                 defaultValue={template.mcqCount} 
                 onChange={(e) => setFormData({...formData, mcqCount: parseInt(e.target.value)})}
                 className="bg-white/5 border-white/10 rounded-xl h-12" 
               />
            </div>
            <div className="space-y-2">
               <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Fill Target</Label>
               <Input 
                 type="number" 
                 defaultValue={template.fillBlankCount} 
                 onChange={(e) => setFormData({...formData, fillBlankCount: parseInt(e.target.value)})}
                 className="bg-white/5 border-white/10 rounded-xl h-12" 
               />
            </div>
            <div className="space-y-2">
               <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Code Target</Label>
               <Input 
                 type="number" 
                 defaultValue={template.codingCount} 
                 onChange={(e) => setFormData({...formData, codingCount: parseInt(e.target.value)})}
                 className="bg-white/5 border-white/10 rounded-xl h-12" 
               />
            </div>
         </div>

         <div className="pt-4">
            <Button 
              onClick={() => mutation.mutate({ skillName, ...formData })}
              className="w-full h-14 rounded-2xl bg-primary text-primary-foreground font-black tracking-widest uppercase shadow-xl shadow-primary/20"
              disabled={mutation.isPending}
            >
              {mutation.isPending ? 'SAVING...' : 'SAVE CONFIGURATION'}
            </Button>
         </div>
      </CardContent>
    </Card>
  );
}

export default function ExamManagementHub() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const skillName = searchParams.get('examname');
  const view = searchParams.get('view') || 'questions';
  const questionId = searchParams.get('id');

  useEffect(() => {
    if (!skillName) {
      router.replace('/exams');
    }
  }, [skillName, router]);

  if (!skillName) return null;

  const tabs = [
    { id: 'questions', label: 'Questions', icon: List },
    { id: 'add', label: 'Add Question', icon: PlusCircle },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'leaderboard', label: 'Leaderboard', icon: Trophy },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const renderView = () => {
    switch (view) {
      case 'analytics':
        return <div className="animate-in fade-in slide-in-from-bottom-4 duration-500"><ExamAnalyticsPage /></div>;
      case 'leaderboard':
        return <div className="animate-in fade-in slide-in-from-bottom-4 duration-500"><ExamLeaderboardPage /></div>;
      case 'add':
        return <AddQuestionView skillName={skillName} />;
      case 'edit':
        return <EditQuestionView skillName={skillName} questionId={questionId || ''} />;
      case 'settings':
        return <div className="animate-in fade-in slide-in-from-bottom-4 duration-500"><SettingsView skillName={skillName} /></div>;
      case 'questions':
      default:
        return <QuestionsView skillName={skillName} />;
    }
  };

  const setView = (newView: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('view', newView);
    if (newView !== 'edit') params.delete('id');
    router.push(`/exams/manage?${params.toString()}`);
  };

  return (
    <div className="space-y-8 pb-20">
      {/* Dynamic Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white/[0.02] border border-white/5 p-8 rounded-[2.5rem]">
        <div className="space-y-1">
          <Link 
            href="/exams" 
            className="flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-primary transition-colors uppercase tracking-widest mb-2"
          >
            <ArrowLeft className="h-3 w-3" /> Catalog
          </Link>
          <div className="flex items-center gap-4">
             <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
                <LayoutDashboard className="h-7 w-7 text-primary" />
             </div>
             <div>
                <h1 className="text-3xl font-black text-white tracking-tight">
                  {skillName.charAt(0).toUpperCase() + skillName.slice(1)} <span className="text-white/40 font-light">Management</span>
                </h1>
                <div className="flex items-center gap-2 mt-1">
                   <Badge variant="outline" className="rounded-lg border-white/10 bg-white/5 text-[10px] font-black uppercase tracking-widest">
                      v1.2 Stable
                   </Badge>
                   <Badge variant="outline" className="rounded-lg border-emerald-500/20 bg-emerald-500/10 text-emerald-400 text-[10px] font-black uppercase tracking-widest">
                      Active
                   </Badge>
                </div>
             </div>
          </div>
        </div>

        {/* Unified Tab Switcher */}
        <div className="flex items-center p-1.5 bg-black/40 border border-white/5 rounded-2xl">
           {tabs.map((tab) => (
             <button
               key={tab.id}
               onClick={() => setView(tab.id)}
               className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                 view === tab.id 
                   ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-105' 
                   : 'text-muted-foreground hover:text-white hover:bg-white/5'
               }`}
             >
               <tab.icon className="h-3.5 w-3.5" />
               {tab.label}
             </button>
           ))}
        </div>
      </div>

      {/* Main Viewport */}
      <div className="relative">
         {renderView()}
      </div>
    </div>
  );
}
