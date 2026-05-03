'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Sparkles, 
  Search, 
  Plus, 
  Filter, 
  LayoutGrid, 
  List,
  RefreshCcw,
  ShieldCheck,
  BrainCircuit,
  Settings2
} from 'lucide-react';
import { listTemplates, upsertTemplate } from '@/services/examService';
import { ExamSkillCard } from '@/components/exams/exam-skill-card';
import { CreateExamModal } from '@/components/exams/create-exam-modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { ExamTemplateSummary, UpsertExamTemplatePayload } from '@/types/exam';
import { toast } from '@/utils/toast';

export default function ExamsCatalogPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
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

  const filteredTemplates = templates?.filter(t => 
    t.title.toLowerCase().includes(search.toLowerCase()) || 
    t.skillName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 pb-12">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-black text-white flex items-center gap-3">
            <BrainCircuit className="h-10 w-10 text-primary" />
            Exam Management
          </h1>
          <p className="text-muted-foreground flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            Advanced Skill Certification System & Bank Health
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => refetch()}
            className="rounded-2xl border-white/10 hover:bg-white/5 h-12 w-12"
          >
            <RefreshCcw className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
          <Button 
            onClick={() => {
              setEditingTemplate(null);
              setIsModalOpen(true);
            }}
            className="gradient-primary border-none rounded-[1.2rem] h-12 px-6 shadow-xl shadow-primary/20 flex items-center gap-2 text-sm font-bold"
          >
            <Plus className="h-5 w-5" />
            Create Skill Exam
          </Button>
        </div>
      </div>

      {/* Control Bar */}
      <div className="flex flex-col md:flex-row items-center gap-4 bg-white/[0.02] border border-white/5 p-4 rounded-[2rem] backdrop-blur-sm">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search exams by title or skill ID..."
            className="w-full bg-white/5 border-none h-12 pl-12 rounded-2xl text-sm"
          />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Button variant="ghost" className="flex-1 md:flex-none gap-2 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10">
            <Filter className="h-4 w-4" /> Filters
          </Button>
          <div className="flex items-center gap-1 bg-black/40 p-1 rounded-2xl border border-white/5">
            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl bg-white/10">
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl">
              <List className="h-4 w-4 opacity-50" />
            </Button>
          </div>
        </div>
      </div>

      {/* Catalog Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-4 p-6 rounded-[2rem] border border-white/5 bg-white/[0.01]">
              <div className="flex justify-between">
                <Skeleton className="h-8 w-48 rounded-xl" />
                <Skeleton className="h-8 w-12 rounded-xl" />
              </div>
              <Skeleton className="h-20 w-full rounded-2xl" />
              <div className="grid grid-cols-3 gap-3">
                <Skeleton className="h-12 rounded-xl" />
                <Skeleton className="h-12 rounded-xl" />
                <Skeleton className="h-12 rounded-xl" />
              </div>
              <Skeleton className="h-12 w-full rounded-xl" />
            </div>
          ))
        ) : filteredTemplates?.length === 0 ? (
          <div className="col-span-full py-24 flex flex-col items-center text-center space-y-4">
            <div className="h-24 w-24 rounded-[2.5rem] bg-white/[0.02] border border-white/5 flex items-center justify-center">
              <Settings2 className="h-12 w-12 text-muted-foreground opacity-20" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-bold text-white">No Exams Found</h3>
              <p className="text-muted-foreground max-w-sm">
                Start by creating a new exam template or adjust your search filters.
              </p>
            </div>
            <Button 
              onClick={() => setIsModalOpen(true)}
              variant="outline"
              className="rounded-2xl border-white/10"
            >
              <Plus className="h-4 w-4 mr-2" /> Add Your First Exam
            </Button>
          </div>
        ) : (
          filteredTemplates?.map((template) => (
            <ExamSkillCard 
              key={template.id} 
              template={template} 
              onEdit={handleEdit}
              onTogglePublish={handleTogglePublish}
            />
          ))
        )}
      </div>

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
