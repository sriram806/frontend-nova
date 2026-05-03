'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Download, 
  Share2, 
  ShieldCheck, 
  Award, 
  CheckCircle2, 
  Calendar,
  User,
  Copy,
  ExternalLink,
  Printer
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { apiGet } from '@/lib/api/client';
import { toast } from 'sonner';

interface CertificateViewerProps {
  isOpen: boolean;
  onClose: () => void;
  attemptId: string;
  skillName: string;
}

export function CertificateViewer({ isOpen, onClose, attemptId, skillName }: CertificateViewerProps) {
  const [certData, setCertData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && attemptId) {
      const fetchCert = async () => {
        try {
          setLoading(true);
          const data = await apiGet<any>(`/api/exam/certificate/${attemptId}`);
          setCertData(data);
        } catch (error) {
          console.error('Fetch cert error:', error);
          toast.error('Could not load certificate metadata');
        } finally {
          setLoading(false);
        }
      };
      fetchCert();
    }
  }, [isOpen, attemptId]);

  if (!isOpen) return null;

  const copyVerificationLink = () => {
    const link = `${window.location.origin}/verify/${certData?.certificateHash}`;
    navigator.clipboard.writeText(link);
    toast.success('Verification link copied to clipboard');
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/80 backdrop-blur-md" 
        onClick={onClose} 
      />
      
      <motion.div 
        initial={{ scale: 0.9, y: 20, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        className="relative w-full max-w-5xl bg-[#0c0d12] border border-white/10 rounded-[3rem] overflow-hidden shadow-2xl flex flex-col lg:flex-row h-[90vh] lg:h-auto max-h-[900px]"
      >
        {/* LEFT: THE CERTIFICATE (PREVIEW) */}
        <div className="flex-1 bg-[#050608] p-8 lg:p-12 flex items-center justify-center overflow-auto">
          {loading ? (
            <div className="flex flex-col items-center gap-4">
               <div className="h-12 w-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
               <p className="text-xs font-black uppercase tracking-widest text-white/40">Securing Credential...</p>
            </div>
          ) : certData ? (
            <div id="certificate-render" className="relative w-full max-w-[800px] aspect-[1.414/1] bg-[#0c0d12] rounded-xl border border-white/5 overflow-hidden shadow-2xl">
               {/* Background Design */}
               <div className="absolute inset-0 opacity-20">
                  <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2" />
                  <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-primary/5 blur-[120px] rounded-full translate-y-1/2 -translate-x-1/2" />
               </div>
               
               {/* Border Decoration */}
               <div className="absolute inset-4 border border-white/5 rounded-lg" />
               <div className="absolute inset-8 border border-white/[0.02] rounded-md" />

               {/* Content */}
               <div className="relative h-full flex flex-col items-center justify-between py-16 px-20 text-center">
                  <div className="space-y-4">
                     <div className="flex items-center justify-center gap-3 mb-8">
                        <div className="h-12 w-12 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                           <Award className="h-7 w-7 text-black" />
                        </div>
                        <span className="text-2xl font-black text-white tracking-tighter italic">THINK AI</span>
                     </div>
                     <h4 className="text-sm font-black text-primary uppercase tracking-[0.4em] mb-2">Certificate of Achievement</h4>
                     <p className="text-white/40 text-xs font-medium">This is to certify that</p>
                     <h2 className="text-4xl font-black text-white italic tracking-tight">{certData.metadata?.userName || 'Candidate'}</h2>
                  </div>

                  <div className="space-y-4 max-w-lg">
                     <p className="text-white/60 text-sm leading-relaxed">
                        Has successfully demonstrated advanced proficiency and met all rigorous assessment standards for the professional skill:
                     </p>
                     <h3 className="text-3xl font-black text-white tracking-tight uppercase underline decoration-primary decoration-4 underline-offset-8">
                        {certData.skillName}
                     </h3>
                  </div>

                  <div className="w-full flex items-end justify-between pt-8">
                     <div className="text-left space-y-1">
                        <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">Date of Issue</p>
                        <p className="text-sm font-bold text-white">{new Date(certData.issuedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                     </div>

                     {/* Seal */}
                     <div className="relative h-24 w-24">
                        <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl" />
                        <div className="relative h-24 w-24 rounded-full border-2 border-primary/40 flex flex-col items-center justify-center p-2 text-center bg-[#0c0d12]/80 backdrop-blur-md">
                           <ShieldCheck className="h-8 w-8 text-primary mb-1" />
                           <span className="text-[8px] font-black text-primary leading-tight">VERIFIED CREDENTIAL</span>
                        </div>
                     </div>

                     <div className="text-right space-y-1">
                        <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">Certificate ID</p>
                        <p className="text-[10px] font-mono text-white/60">{certData.certificateHash.substring(0, 16).toUpperCase()}</p>
                     </div>
                  </div>
               </div>
            </div>
          ) : (
            <div className="text-center space-y-4">
               <X className="h-12 w-12 text-rose-500 mx-auto" />
               <p className="text-white/60">Failed to load certificate.</p>
            </div>
          )}
        </div>

        {/* RIGHT: ACTIONS & DETAILS */}
        <div className="w-full lg:w-[380px] bg-[#0c0d12] p-8 lg:p-12 border-l border-white/10 flex flex-col justify-between">
          <div className="space-y-8">
             <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white">Credential</h3>
                <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/5 text-white/40">
                   <X className="h-5 w-5" />
                </button>
             </div>

             <div className="space-y-4">
                <div className="p-5 rounded-3xl bg-white/[0.02] border border-white/5 space-y-4">
                   <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                         <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                      </div>
                      <span className="text-xs font-bold text-white uppercase tracking-widest">Status: Verified</span>
                   </div>
                   <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                         <Calendar className="h-4 w-4 text-primary" />
                      </div>
                      <span className="text-xs font-bold text-white/60">Issued {certData ? new Date(certData.issuedAt).toLocaleDateString() : '...'}</span>
                   </div>
                </div>

                <div className="p-5 rounded-3xl bg-white/[0.02] border border-white/5 space-y-3">
                   <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">Verification URL</p>
                   <div className="flex items-center gap-2">
                      <input 
                        type="text" 
                        readOnly 
                        value={certData ? `${window.location.origin}/verify/${certData.certificateHash.substring(0, 8)}...` : ''}
                        className="flex-1 h-10 bg-black/40 border border-white/5 rounded-xl px-3 text-[10px] font-mono text-white/40"
                      />
                      <Button size="icon" variant="ghost" onClick={copyVerificationLink} className="h-10 w-10 rounded-xl hover:bg-white/5">
                         <Copy className="h-3.5 w-3.5" />
                      </Button>
                   </div>
                </div>
             </div>
          </div>

          <div className="space-y-3">
             <Button className="w-full h-14 rounded-2xl bg-white text-black font-black uppercase tracking-widest hover:bg-white/90 shadow-xl shadow-white/5">
                <Download className="h-4 w-4 mr-2" /> Download PDF
             </Button>
             <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" className="h-12 rounded-2xl bg-white/5 border-white/10 text-white font-bold text-xs uppercase">
                   <Share2 className="h-3.5 w-3.5 mr-2" /> LinkedIn
                </Button>
                <Button variant="outline" className="h-12 rounded-2xl bg-white/5 border-white/10 text-white font-bold text-xs uppercase">
                   <Printer className="h-3.5 w-3.5 mr-2" /> Print
                </Button>
             </div>
             <p className="text-[10px] text-center text-white/20 font-medium px-4">
                By downloading, you agree to the credential verification terms. This document is cryptographically signed.
             </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
