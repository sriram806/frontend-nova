'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Plus, X, Trash2, ShieldAlert, Sparkles, AlertCircle, CheckCircle2, Search, Loader2 } from 'lucide-react';

import { Card, Field, FieldTextArea } from '@/components/auth/form-primitives';
import { examApi, extractApiData } from '@/services/api';
import { toast } from '@/utils/toast';

// Re-export shared components for onboarding use to maintain backward compatibility with page.tsx
export const ModernCard = Card;
export const FloatingLabelInput = Field;
export const FloatingLabelTextArea = FieldTextArea;

// --- Tag Input ---
export const TagInput = ({ 
  label, 
  tags, 
  onAdd, 
  onRemove, 
  placeholder,
  error
}: { 
  label: string; 
  tags: string[]; 
  onAdd: (tag: string) => void; 
  onRemove: (tag: string) => void;
  placeholder?: string;
  error?: string;
}) => {
  const [input, setInput] = React.useState('');

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      if (input.trim()) {
        onAdd(input.trim());
        setInput('');
      }
    }
  };

  return (
    <div className="space-y-4 relative">
      <label className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20">{label}</label>
      <div className={cn(
        "flex flex-wrap gap-2 min-h-[3.5rem] p-3 bg-white/[0.02] border rounded-2xl transition-all focus-within:bg-white/[0.05] focus-within:border-primary/30",
        error ? "border-red-500/50" : "border-white/5"
      )}>
        {tags.map((tag, idx) => (
          <span 
            key={`${tag}-${idx}`} 
            className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary border border-primary/20 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all hover:bg-primary/20"
          >
            {tag}
            <button type="button" onClick={() => onRemove(tag)} className="hover:text-white transition-colors"><X className="h-3 w-3" /></button>
          </span>
        ))}
        <Field
          label="Add Skill"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder || "Type and hit enter..."}
          className="bg-transparent border-none focus:ring-0 h-12 pt-0 pb-0 shadow-none"
        />
      </div>
      {error && <p className="absolute -bottom-5 left-2 text-[10px] text-red-400 font-bold uppercase tracking-widest">{error}</p>}
    </div>
  );
};

// --- Skill Selector ---
export type Skill = {
  name: string;
  proficiency: 'beginner' | 'intermediate' | 'advanced' | 'expert';
};

export const SkillSelector = ({ 
  label, 
  skills, 
  onAdd, 
  onRemove, 
  onUpdateProficiency,
  placeholder,
  error
}: { 
  label: string; 
  skills: Skill[]; 
  onAdd: (name: string) => void; 
  onRemove: (name: string) => void;
  onUpdateProficiency: (name: string, proficiency: Skill['proficiency']) => void;
  placeholder?: string;
  error?: string;
}) => {
  const [input, setInput] = React.useState('');
  const [suggestions, setSuggestions] = React.useState<any[]>([]);
  const [isSearching, setIsSearching] = React.useState(false);
  const [showDropdown, setShowDropdown] = React.useState(false);

  React.useEffect(() => {
    const timer = setTimeout(async () => {
      if (input.length >= 3) {
        setIsSearching(true);
        try {
          const res = await examApi.get(`/skills/suggestions?q=${encodeURIComponent(input)}`);
          const data = extractApiData<any[]>(res);
          setSuggestions(data);
          setShowDropdown(true);
        } catch (err) {
          console.error('Failed to fetch suggestions', err);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSuggestions([]);
        setShowDropdown(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [input]);

  const handleSelectSkill = (name: string) => {
    if (skills.length < 5 && !skills.some(s => s.name.toLowerCase() === name.toLowerCase())) {
      onAdd(name);
      setInput('');
      setShowDropdown(false);
    }
  };

  const handleRequestSkill = async () => {
    const skillName = input.trim();
    if (!skillName) return;

    try {
      await examApi.post('/skills/request', { skillName });
      toast.success(`Request for "${skillName}" submitted to admins!`);
      // We still add it to the user's list so they can proceed
      handleSelectSkill(skillName);
    } catch (err) {
      toast.error('Failed to submit request');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const trimmed = input.trim();
      if (trimmed) {
        handleSelectSkill(trimmed);
      }
    }
  };

  const proficiencyLevels: Skill['proficiency'][] = ['beginner', 'intermediate', 'advanced', 'expert'];

  return (
    <div className="space-y-6 relative">
      <div className="flex justify-between items-end">
        <label className="text-xs font-black uppercase tracking-[0.2em] text-white/30">{label}</label>
        <span className={cn(
          "text-[10px] font-black uppercase tracking-widest transition-colors",
          skills.length >= 5 ? "text-primary" : "text-white/20"
        )}>
          {skills.length} / 5 Slots Filled
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {skills.map((skill, index) => (
          <div 
            key={`${skill.name}-${index}`} 
            className="group flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-white/[0.02] border border-white/5 rounded-3xl transition-all hover:bg-white/[0.06] hover:border-white/10"
          >
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <span className="text-lg font-black tracking-tight text-white/90">{skill.name}</span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex bg-black/40 p-1 rounded-xl border border-white/5">
                {proficiencyLevels.map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => onUpdateProficiency(skill.name, level)}
                    className={cn(
                      "px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                      skill.proficiency === level 
                        ? "bg-primary text-white shadow-lg shadow-primary/20" 
                        : "text-white/20 hover:text-white/40"
                    )}
                  >
                    {level}
                  </button>
                ))}
              </div>
              <button 
                type="button" 
                onClick={() => onRemove(skill.name)}
                className="p-3 text-white/20 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}

        {skills.length < 5 && (
          <div className="relative">
            <div className={cn(
              "flex items-center gap-4 p-4 bg-white/[0.01] border border-dashed rounded-3xl transition-all group/add",
              error ? "border-red-500/30" : "border-white/10 focus-within:border-primary/40 focus-within:bg-white/[0.03] hover:border-white/20"
            )}>
              <div className="h-12 w-12 rounded-2xl bg-white/5 flex items-center justify-center text-white/20 group-focus-within/add:bg-primary/10 group-focus-within/add:text-primary transition-all">
                {isSearching ? <Loader2 className="h-6 w-6 animate-spin" /> : <Search className="h-6 w-6" />}
              </div>
              <Field
                label="Search Skills"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={placeholder || "Search for a skill (e.g. React, Python)..."}
                className="bg-transparent border-none focus:ring-0 h-14 pt-0 pb-0 shadow-none text-xl"
              />
            </div>

            {/* Suggestions Dropdown */}
            {showDropdown && (
              <div className="absolute z-50 left-0 right-0 top-[calc(100%+8px)] bg-slate-900/90 backdrop-blur-2xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                <div className="p-2">
                  {suggestions.length > 0 ? (
                    <>
                      <div className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-white/30">Available Exams</div>
                      {suggestions.map((s, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleSelectSkill(s.skillName)}
                          className="w-full flex items-center justify-between gap-4 p-4 rounded-2xl hover:bg-primary/10 hover:text-primary transition-all text-left"
                        >
                          <div className="flex items-center gap-3">
                            <Sparkles className="h-4 w-4 text-primary" />
                            <span className="font-bold">{s.skillName}</span>
                          </div>
                          <span className="text-[10px] font-black uppercase tracking-widest opacity-40">{s.type}</span>
                        </button>
                      ))}
                    </>
                  ) : (
                    <div className="p-6 text-center space-y-4">
                      <div className="flex flex-col items-center gap-3">
                        <AlertCircle className="h-8 w-8 text-white/10" />
                        <p className="text-sm text-white/40 font-medium">No exam found for "{input}"</p>
                      </div>
                      <button
                        type="button"
                        onClick={handleRequestSkill}
                        className="w-full py-4 bg-primary/10 text-primary rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-primary/20 transition-all border border-primary/20"
                      >
                        Request this Skill to Admins
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      
      {error && <p className="absolute -bottom-6 left-2 text-[10px] text-red-400 font-bold uppercase tracking-widest">{error}</p>}
    </div>
  );
};

// --- Dynamic Section Wrapper ---
export const DynamicSection = ({ 
  title, 
  onAdd, 
  onClear,
  children,
  description
}: { 
  title: string; 
  onAdd: () => void; 
  onClear?: () => void;
  children: React.ReactNode;
  description?: string;
}) => (
  <div className="space-y-10">
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/5 pb-10">
      <div className="space-y-2">
        <h3 className="text-4xl font-black tracking-tighter text-white/90">{title}</h3>
        {description && <p className="text-base text-white/30 font-medium max-w-xl">{description}</p>}
      </div>
      <div className="flex items-center gap-4">
        {onClear && (
          <button
            type="button"
            onClick={onClear}
            className="group/btn relative px-8 py-4 bg-white/5 text-white/40 hover:text-red-400 hover:bg-red-400/10 rounded-2xl font-black text-xs uppercase tracking-widest transition-all active:scale-95 border border-white/5 hover:border-red-400/20 overflow-hidden"
          >
            <div className="absolute inset-0 bg-red-400/0 group-hover/btn:bg-red-400/5 transition-colors" />
            <span className="relative flex items-center gap-3">
              <Trash2 className="h-4 w-4" /> Clear All
            </span>
          </button>
        )}
        <button
          type="button"
          onClick={onAdd}
          className="group/btn relative px-8 py-4 bg-white text-black rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all hover:scale-[1.02] active:scale-95 shadow-[0_0_40px_rgba(255,255,255,0.1)] hover:shadow-[0_0_60px_rgba(255,255,255,0.2)]"
        >
          <span className="relative flex items-center gap-3">
            <Plus className="h-4 w-4" /> Add Section
          </span>
        </button>
      </div>
    </div>
    <div className="space-y-8">
      {children}
    </div>
  </div>
);

// --- Bullet Points Input ---
export const BulletPointsInput = ({ 
  points, 
  onChange,
  label,
  error
}: { 
  points: string[]; 
  onChange: (points: string[]) => void;
  label?: string;
  error?: string;
}) => (
    <div className="space-y-4 relative">
      {label && <label className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20">{label}</label>}
      <div className="space-y-4">
        {points.map((point, idx) => (
          <div key={`point-${idx}`} className="flex gap-4 items-center group/bullet">
            <div className="h-10 w-10 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-center text-[10px] font-black text-white/20 group-focus-within/bullet:border-primary/40 group-focus-within/bullet:text-primary transition-all">
              0{idx + 1}
            </div>
            <Field
              label={`Bullet point ${idx + 1}`}
              value={point}
              onChange={(e) => {
                const newPoints = [...points];
                newPoints[idx] = e.target.value;
                onChange(newPoints);
              }}
              className="bg-transparent border-none focus:ring-0 h-14 pt-0 pb-0 shadow-none"
              placeholder={`Achievement or responsibility ${idx + 1}...`}
            />
          </div>
        ))}
      </div>
      {error && <p className="absolute -bottom-5 left-2 text-[10px] text-red-400 font-bold uppercase tracking-widest">{error}</p>}
    </div>
);
