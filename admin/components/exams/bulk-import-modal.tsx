'use client';

import React, { useState, useRef } from 'react';
import Papa from 'papaparse';
import { 
  Upload, 
  FileJson, 
  FileSpreadsheet, 
  X, 
  AlertCircle, 
  CheckCircle2, 
  Download,
  Info,
  ChevronRight,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { toast } from '@/utils/toast';
import { bulkUploadQuestions } from '@/services/examService';

interface BulkImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  skillName: string;
  onSuccess?: () => void;
}

export const BulkImportModal = ({ isOpen, onClose, skillName, onSuccess }: BulkImportModalProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<any[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    setFile(null);
    setPreview([]);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.name.endsWith('.csv') && !selectedFile.name.endsWith('.json')) {
      toast.error('Please upload a .csv or .json file');
      return;
    }

    setFile(selectedFile);
    parseFile(selectedFile);
  };

  const parseFile = (file: File) => {
    setIsProcessing(true);
    setError(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      
      if (file.name.endsWith('.json')) {
        try {
          const data = JSON.parse(content);
          const questions = Array.isArray(data) ? data : data.questions || [];
          setPreview(questions.slice(0, 5));
          setIsProcessing(false);
        } catch (err) {
          setError('Invalid JSON format');
          setIsProcessing(false);
        }
      } else {
        Papa.parse(content, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            setPreview(results.data.slice(0, 5));
            setIsProcessing(false);
          },
          error: (err) => {
            setError('Failed to parse CSV');
            setIsProcessing(false);
          }
        });
      }
    };
    reader.readAsText(file);
  };

  const handleUpload = async () => {
    if (!file) return;
    setIsProcessing(true);

    const reader = new FileReader();
    reader.onload = async (e) => {
      const content = e.target?.result as string;
      let questions: any[] = [];

      try {
        if (file.name.endsWith('.json')) {
          const data = JSON.parse(content);
          questions = Array.isArray(data) ? data : data.questions || [];
        } else {
          const results = Papa.parse(content, { header: true, skipEmptyLines: true });
          questions = results.data;
        }

        // Map fields to match API expectation if necessary
        const mappedQuestions = questions.map(q => ({
          type: (q.type || 'MCQ').toUpperCase(),
          question: q.question || q.prompt,
          options: q.options ? (typeof q.options === 'string' ? q.options.split('|') : q.options) : null,
          answer: String(q.answer || q.correct_answer || ''),
          explanation: q.explanation || null,
          difficulty: parseInt(q.difficulty || '1'),
          marks: parseInt(q.marks || '1'),
          language: q.language || null,
          starterCode: q.starterCode || q.starter_code || null,
          placeholder: q.placeholder || null
        }));

        await bulkUploadQuestions(skillName, {
          replaceExisting: false,
          questions: mappedQuestions
        });

        toast.success(`Successfully imported ${mappedQuestions.length} questions!`);
        onSuccess?.();
        onClose();
        reset();
      } catch (err: any) {
        toast.error(err.message || 'Upload failed');
      } finally {
        setIsProcessing(false);
      }
    };
    reader.readAsText(file);
  };

  const downloadTemplate = () => {
    const headers = ['type', 'question', 'options', 'answer', 'explanation', 'difficulty', 'marks'];
    const sampleRows = [
      ['MCQ', 'What is React?', 'A Library|A Framework|A Database', 'A Library', 'React is a UI library', '1', '1'],
      ['FILL', 'React uses a ____ DOM.', '', 'Virtual', 'React uses Virtual DOM for perf', '1', '1']
    ];
    
    const csvContent = [headers.join(','), ...sampleRows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'skill_exam_template.csv';
    a.click();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px] bg-slate-950 border-white/10 text-white rounded-[2rem] overflow-hidden">
        <DialogHeader className="p-8 pb-0">
          <div className="flex items-center gap-4 mb-4">
            <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
              <Upload className="h-6 w-6" />
            </div>
            <div>
              <DialogTitle className="text-2xl font-black tracking-tight">Bulk Import Questions</DialogTitle>
              <DialogDescription className="text-white/40">
                Upload a CSV or JSON file to populate <span className="text-primary font-bold">{skillName}</span> question bank.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="p-8 space-y-6">
          {!file ? (
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="group cursor-pointer border-2 border-dashed border-white/5 hover:border-primary/40 bg-white/[0.02] hover:bg-primary/[0.02] rounded-[2rem] p-12 transition-all text-center space-y-4"
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                className="hidden" 
                accept=".csv,.json"
              />
              <div className="h-16 w-16 mx-auto rounded-2xl bg-white/5 flex items-center justify-center text-white/20 group-hover:bg-primary/10 group-hover:text-primary transition-all">
                <FileSpreadsheet className="h-8 w-8" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-bold text-white/90">Click or drag file to upload</p>
                <p className="text-xs text-white/20 font-medium">Supports .csv and .json files</p>
              </div>
              <Button 
                variant="ghost" 
                onClick={(e) => { e.stopPropagation(); downloadTemplate(); }}
                className="text-[10px] font-black uppercase tracking-widest text-primary/60 hover:text-primary hover:bg-primary/10"
              >
                <Download className="h-3 w-3 mr-2" /> Download Template
              </Button>
            </div>
          ) : (
            <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
              <div className="flex items-center justify-between p-4 bg-white/[0.03] border border-white/5 rounded-2xl">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    {file.name.endsWith('.json') ? <FileJson className="h-5 w-5" /> : <FileSpreadsheet className="h-5 w-5" />}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white truncate max-w-[200px]">{file.name}</p>
                    <p className="text-[10px] font-medium text-white/30">{(file.size / 1024).toFixed(1)} KB</p>
                  </div>
                </div>
                <button onClick={reset} className="p-2 text-white/20 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all">
                  <X className="h-4 w-4" />
                </button>
              </div>

              {preview.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-black uppercase tracking-widest text-white/30">Preview (First 5 questions)</p>
                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" /> Validated
                    </span>
                  </div>
                  <div className="bg-black/40 border border-white/5 rounded-2xl divide-y divide-white/5">
                    {preview.map((q, i) => (
                      <div key={i} className="p-4 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3 overflow-hidden">
                          <div className="h-6 w-6 rounded bg-white/5 flex-shrink-0 flex items-center justify-center text-[10px] font-black text-white/20">
                            {i + 1}
                          </div>
                          <p className="text-xs font-medium text-white/60 truncate">{q.question || q.prompt}</p>
                        </div>
                        <span className="text-[9px] font-black uppercase tracking-widest text-primary/40">{q.type || 'MCQ'}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {error && (
                <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400">
                  <AlertCircle className="h-5 w-5 flex-shrink-0" />
                  <p className="text-xs font-bold">{error}</p>
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="p-8 pt-0 flex-col sm:flex-row gap-3">
          <Button 
            variant="ghost" 
            onClick={onClose}
            className="flex-1 rounded-2xl border border-white/5 hover:bg-white/5 text-white/40 font-black text-xs uppercase tracking-widest"
          >
            Cancel
          </Button>
          <Button 
            disabled={!file || isProcessing || !!error}
            onClick={handleUpload}
            className="flex-1 gradient-primary rounded-2xl font-black text-xs uppercase tracking-widest h-12 shadow-xl shadow-primary/20"
          >
            {isProcessing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <span className="flex items-center gap-2">
                <ChevronRight className="h-4 w-4" /> Import {preview.length > 0 ? preview.length : ''} Questions
              </span>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
