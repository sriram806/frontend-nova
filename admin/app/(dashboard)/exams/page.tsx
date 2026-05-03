'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Plus, 
  RefreshCcw,
  ShieldCheck,
  BrainCircuit,
  LayoutGrid,
  Activity
} from 'lucide-react';
import { listTemplates, upsertTemplate } from '@/services/examService';
import { ExamSkillCard } from '@/components/exams/exam-skill-card';
import { CreateExamModal } from '@/components/exams/create-exam-modal';
import { ModerationCenter } from '@/components/exams/ModerationCenter';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ExamTemplateSummary, UpsertExamTemplatePayload } from '@/types/exam';
import { toast } from '@/utils/toast';

export default function ExamsCatalogPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<ExamTemplateSummary | null>(null);

  const { data: templates, isLoading, refetch } = useQuery({
    queryKey: ['exam-templates'],
    queryFn: listTemplates
  });

  const upsertMutation = useMutation({
    mutationFn: (payload: UpsertExamTemplatePayload) => upsertTemplate(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exam-templates'] });
      toast.success('Exam template saved successfully');
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to save template');
    }
  });

  const handleEdit = (template: ExamTemplateSummary) => {
    router.push(`/exams/manage?examname=${template.skillName}&view=settings`);
  };

  const handleTogglePublish = async (template: ExamTemplateSummary) => {
    await upsertMutation.mutateAsync({
      skillName: template.skillName,
      isPublished: !template.isPublished
    });
  };

  return (
    <div className="space-y-10 pb-12">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-black text-white tracking-tighter flex items-center gap-3">
            <BrainCircuit className="h-10 w-10 text-primary" />
            Exam Management
          </h1>
          <p className="text-white/40 font-medium flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-primary" />
            Skill Certification & Platform Assessment Health
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => refetch()}
            className="rounded-2xl bg-white/5 border border-white/5 h-12 w-12 hover:bg-white/10 transition-all"
          >
            <RefreshCcw className={`h-5 w-5 text-white/60 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
          <Button 
            onClick={() => {
              setEditingTemplate(null);
              setIsModalOpen(true);
            }}
            className="bg-white text-black rounded-2xl h-12 px-8 font-black text-xs uppercase tracking-[0.2em] transition-all hover:scale-[1.02] active:scale-95 shadow-[0_0_40px_rgba(255,255,255,0.1)]"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Exam
          </Button>
        </div>
      </div>

      <Tabs defaultValue="catalog" className="space-y-8">
        <TabsList className="bg-white/[0.03] border border-white/5 p-1 rounded-2xl">
          <TabsTrigger value="catalog" className="rounded-xl px-8 py-2.5 data-[state=active]:bg-primary data-[state=active]:text-white flex items-center gap-2 font-bold text-xs uppercase tracking-widest transition-all">
            <LayoutGrid className="h-4 w-4" />
            Catalog
          </TabsTrigger>
          <TabsTrigger value="moderation" className="rounded-xl px-8 py-2.5 data-[state=active]:bg-primary data-[state=active]:text-white flex items-center gap-2 font-bold text-xs uppercase tracking-widest transition-all">
            <Activity className="h-4 w-4" />
            Moderation
          </TabsTrigger>
        </TabsList>

        <TabsContent value="catalog" className="space-y-8 animate-in fade-in duration-500">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {isLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-[300px] rounded-[2rem] border border-white/5 bg-white/[0.01] animate-pulse" />
              ))
            ) : (
              templates?.map((template) => (
                <ExamSkillCard 
                  key={template.id} 
                  template={template} 
                  onEdit={handleEdit}
                  onTogglePublish={handleTogglePublish}
                />
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="moderation" className="animate-in fade-in duration-500">
          <ModerationCenter />
        </TabsContent>
      </Tabs>

      <CreateExamModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={async (payload) => {
          await upsertMutation.mutateAsync(payload);
        }}
        editingTemplate={editingTemplate}
      />
    </div>
  );
}
