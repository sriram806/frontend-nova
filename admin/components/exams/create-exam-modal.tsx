'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, AlertCircle, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { ExamTemplateSummary, UpsertExamTemplatePayload } from '@/types/exam';

interface CreateExamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (payload: UpsertExamTemplatePayload) => Promise<void>;
  editingTemplate?: ExamTemplateSummary | null;
}

export function CreateExamModal({ isOpen, onClose, onSave, editingTemplate }: CreateExamModalProps) {
  const [formData, setFormData] = useState<UpsertExamTemplatePayload>({
    skillName: '',
    title: '',
    description: '',
    skillType: 'STANDARD',
    difficultyLevel: 1,
    passPercentage: 60,
    mcqCount: 10,
    fillBlankCount: 5,
    codingCount: 2,
    isPublished: false,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (editingTemplate) {
      setFormData({
        skillName: editingTemplate.skillName,
        title: editingTemplate.title,
        description: editingTemplate.description,
        skillType: editingTemplate.skillType,
        difficultyLevel: editingTemplate.difficultyLevel,
        passPercentage: editingTemplate.passPercentage,
        mcqCount: editingTemplate.mcqCount,
        fillBlankCount: editingTemplate.fillBlankCount,
        codingCount: editingTemplate.codingCount,
        isPublished: editingTemplate.isPublished,
      });
    } else {
      setFormData({
        skillName: '',
        title: '',
        description: '',
        skillType: 'STANDARD',
        difficultyLevel: 1,
        passPercentage: 60,
        mcqCount: 10,
        fillBlankCount: 5,
        codingCount: 2,
        isPublished: false,
      });
    }
  }, [editingTemplate, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.skillName || !formData.title) return;
    
    setIsSubmitting(true);
    try {
      await onSave(formData);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-[2.5rem] bg-[#0c0d12] border border-white/10 shadow-2xl flex flex-col"
        >
          {/* Header */}
          <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <Sparkles className="h-6 w-6 text-primary" />
                {editingTemplate ? 'Edit Exam Template' : 'Create New Skill Exam'}
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Define the requirements and metadata for the skill test.
              </p>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} className="rounded-2xl hover:bg-white/5">
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-6">
            <div className="grid grid-cols-2 gap-6">
              {/* Basic Info */}
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Skill Identifier (unique)</Label>
                <Input 
                  value={formData.skillName}
                  onChange={(e) => setFormData({ ...formData, skillName: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                  placeholder="e.g. python-advanced"
                  className="rounded-2xl bg-white/5 border-white/10 h-12"
                  disabled={!!editingTemplate}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Display Title</Label>
                <Input 
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Python Language Skill Test"
                  className="rounded-2xl bg-white/5 border-white/10 h-12"
                  required
                />
              </div>

              <div className="space-y-2 col-span-2">
                <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Description</Label>
                <Textarea 
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="What will this exam evaluate?"
                  className="rounded-2xl bg-white/5 border-white/10 min-h-[80px]"
                />
              </div>

              {/* Targets & Quotas */}
              <div className="space-y-4 col-span-2">
                <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-white/5 pb-2">
                  <AlertCircle className="h-4 w-4 text-orange-400" />
                  Target Quotas & Pass Criteria
                </h3>
                
                <div className="grid grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase text-muted-foreground">MCQ Target</Label>
                    <Input 
                      type="number"
                      value={formData.mcqCount}
                      onChange={(e) => setFormData({ ...formData, mcqCount: parseInt(e.target.value) || 0 })}
                      className="rounded-xl bg-white/5 border-white/10"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase text-muted-foreground">Fill Target</Label>
                    <Input 
                      type="number"
                      value={formData.fillBlankCount}
                      onChange={(e) => setFormData({ ...formData, fillBlankCount: parseInt(e.target.value) || 0 })}
                      className="rounded-xl bg-white/5 border-white/10"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase text-muted-foreground">Code Target</Label>
                    <Input 
                      type="number"
                      value={formData.codingCount}
                      onChange={(e) => setFormData({ ...formData, codingCount: parseInt(e.target.value) || 0 })}
                      className="rounded-xl bg-white/5 border-white/10"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase text-muted-foreground">Pass %</Label>
                    <Input 
                      type="number"
                      value={formData.passPercentage}
                      onChange={(e) => setFormData({ ...formData, passPercentage: parseInt(e.target.value) || 0 })}
                      className="rounded-xl bg-white/5 border-white/10"
                    />
                  </div>
                </div>
              </div>

              {/* Other settings */}
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Skill Type</Label>
                <Select 
                  value={formData.skillType} 
                  onValueChange={(v: any) => setFormData({ ...formData, skillType: v })}
                >
                  <SelectTrigger className="rounded-2xl bg-white/5 border-white/10 h-12">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#12141c] border-white/10">
                    <SelectItem value="STANDARD">General Skill</SelectItem>
                    <SelectItem value="PROGRAMMING_LANGUAGE">Programming Language</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Difficulty Level (1-5)</Label>
                <Input 
                  type="number"
                  min="1"
                  max="5"
                  value={formData.difficultyLevel}
                  onChange={(e) => setFormData({ ...formData, difficultyLevel: parseInt(e.target.value) || 1 })}
                  className="rounded-2xl bg-white/5 border-white/10 h-12"
                />
              </div>

              <div className="col-span-2 flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                <div className="space-y-1">
                  <p className="text-sm font-bold text-white">Publish Immediately</p>
                  <p className="text-xs text-muted-foreground">Visible in the platform catalog once active.</p>
                </div>
                <Switch 
                  checked={formData.isPublished} 
                  onCheckedChange={(v) => setFormData({ ...formData, isPublished: v })}
                />
              </div>
            </div>

            <div className="pt-4 flex gap-3">
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="flex-1 rounded-2xl h-12 gradient-primary border-none shadow-xl text-sm font-bold gap-2"
              >
                <Save className="h-4 w-4" />
                {isSubmitting ? 'Saving...' : editingTemplate ? 'Update Template' : 'Create Exam Template'}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose}
                className="px-8 rounded-2xl h-12 border-white/10 text-sm font-bold"
              >
                Cancel
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
