'use client';

import { useState, useRef } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { X, FileUp, Loader2, CheckCircle2, AlertCircle, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from '@/utils/toast';
import * as adminApi from '@/services/adminService';
import { Button } from '@/components/ui/button';

type BulkImportModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function BulkImportModal({ isOpen, onClose }: BulkImportModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const importMut = useMutation({
    mutationFn: (file: File) => adminApi.importCsv(file),
    onSuccess: (data) => {
      setJobId(data.jobId);
      toast.success('Import started');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Upload failed');
    }
  });

  const { data: statusData } = useQuery({
    queryKey: ['import-status', jobId],
    queryFn: () => adminApi.getImportStatus(jobId!),
    enabled: !!jobId,
    refetchInterval: (query) => {
      const data = query.state.data as any;
      if (data?.status === 'completed' || data?.status === 'failed') return false;
      return 2000;
    }
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === 'text/csv') {
      setFile(selectedFile);
    } else {
      toast.error('Please select a valid CSV file');
    }
  };

  const handleUpload = () => {
    if (file) importMut.mutate(file);
  };

  const reset = () => {
    setFile(null);
    setJobId(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const isCompleted = statusData?.status === 'completed';
  const isFailed = statusData?.status === 'failed';
  const isProcessing = statusData?.status === 'processing' || statusData?.status === 'pending';

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-lg overflow-hidden rounded-[2.5rem] border border-white/10 bg-[#0f1117] shadow-2xl"
          >
            {/* Header */}
            <div className="bg-gradient-to-br from-blue-500/20 via-transparent to-transparent p-8 pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-2xl bg-blue-500/20 flex items-center justify-center text-blue-400">
                    <FileUp className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">Bulk Import</h2>
                    <p className="text-sm text-muted-foreground">Upload users via CSV file.</p>
                  </div>
                </div>
                <button onClick={onClose} className="h-10 w-10 rounded-xl hover:bg-white/5 flex items-center justify-center text-muted-foreground transition-colors">
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="p-8 pt-4 space-y-6">
              {!jobId ? (
                <div className="space-y-6">
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className={`group relative flex flex-col items-center justify-center py-12 px-6 rounded-[2rem] border-2 border-dashed transition-all cursor-pointer
                    ${file ? 'border-primary/50 bg-primary/5' : 'border-white/10 hover:border-white/20 bg-white/[0.02]'}`}
                  >
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={handleFileChange} 
                      accept=".csv" 
                      className="hidden" 
                    />
                    <div className="mb-4 rounded-full bg-white/5 p-4 group-hover:scale-110 transition-transform">
                      <Download className={`h-8 w-8 ${file ? 'text-primary' : 'text-muted-foreground'}`} />
                    </div>
                    {file ? (
                      <div className="text-center">
                        <p className="text-sm font-bold text-white">{file.name}</p>
                        <p className="text-xs text-muted-foreground mt-1">{(file.size / 1024).toFixed(2)} KB</p>
                      </div>
                    ) : (
                      <div className="text-center">
                        <p className="text-sm font-bold text-white">Click to upload CSV</p>
                        <p className="text-xs text-muted-foreground mt-1">Maximum file size 5MB</p>
                      </div>
                    )}
                  </div>

                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">CSV Requirements</h4>
                    <ul className="text-xs text-muted-foreground space-y-1.5 list-disc ml-4">
                      <li>Required columns: <code className="text-primary">email</code></li>
                      <li>Optional: <code className="text-primary">fullName</code>, <code className="text-primary">role</code>, <code className="text-primary">password</code></li>
                      <li>Valid roles: guest, free, lite, pro, moderator, admin</li>
                    </ul>
                  </div>

                  <div className="flex gap-3">
                    <Button 
                      variant="outline" 
                      onClick={reset} 
                      disabled={!file || importMut.isPending}
                      className="flex-1 rounded-2xl border-white/10 h-12 font-bold"
                    >
                      Clear
                    </Button>
                    <Button 
                      onClick={handleUpload} 
                      disabled={!file || importMut.isPending}
                      className="flex-1 rounded-2xl h-12 font-bold gradient-primary shadow-lg shadow-primary/20"
                    >
                      {importMut.isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Start Import'}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="py-8 space-y-6 flex flex-col items-center">
                  <div className="relative">
                    {isProcessing && <Loader2 className="h-20 w-20 text-primary animate-spin" />}
                    {isCompleted && <CheckCircle2 className="h-20 w-20 text-emerald-400" />}
                    {isFailed && <AlertCircle className="h-20 w-20 text-red-400" />}
                  </div>
                  
                  <div className="text-center space-y-2">
                    <h3 className="text-xl font-bold text-white">
                      {isProcessing ? 'Processing Data...' : isCompleted ? 'Import Successful' : 'Import Failed'}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {isProcessing ? `Job ID: ${jobId}` : isCompleted ? `Successfully imported ${statusData?.processedCount ?? 0} users.` : statusData?.errorMessage ?? 'An error occurred during import.'}
                    </p>
                  </div>

                  {isCompleted && (
                    <Button onClick={onClose} className="w-full rounded-2xl h-12 font-bold gradient-primary">
                      Done
                    </Button>
                  )}
                  {isFailed && (
                    <Button onClick={reset} className="w-full rounded-2xl h-12 font-bold bg-white/10 hover:bg-white/20">
                      Try Again
                    </Button>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
