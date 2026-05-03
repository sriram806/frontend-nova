'use client';

import { useMemo } from 'react';
import { Input } from '@/components/core/input';
import { Modal } from '@/components/core/modal';

export type CommandAction = {
  id: string;
  title: string;
  description: string;
  shortcut?: string;
  onTrigger: () => void;
};

type CommandPaletteProps = {
  open: boolean;
  query: string;
  actions: CommandAction[];
  onClose: () => void;
  onQueryChange: (value: string) => void;
};

export function CommandPalette({ open, query, actions, onClose, onQueryChange }: CommandPaletteProps) {
  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) {
      return actions;
    }

    return actions.filter((action) => {
      return action.title.toLowerCase().includes(normalized) || action.description.toLowerCase().includes(normalized);
    });
  }, [actions, query]);

  return (
    <Modal open={open} onClose={onClose} title="Command Palette">
      <div className="space-y-4">
        <Input
          autoFocus
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="Search actions, routes, and tools..."
        />

        <div className="max-h-[320px] space-y-1 overflow-y-auto pr-1">
          {filtered.map((action) => (
            <button
              key={action.id}
              type="button"
              onClick={() => {
                action.onTrigger();
                onClose();
              }}
              className="group flex w-full items-center justify-between rounded-xl border border-transparent px-3 py-2 text-left transition hover:border-cyan-300/30 hover:bg-white/5"
            >
              <span>
                <span className="block text-sm font-medium text-white">{action.title}</span>
                <span className="block text-xs text-white/50">{action.description}</span>
              </span>
              {action.shortcut ? <span className="text-[11px] uppercase tracking-[0.12em] text-white/45">{action.shortcut}</span> : null}
            </button>
          ))}

          {filtered.length === 0 ? (
            <div className="rounded-xl border border-dashed border-white/20 p-4 text-center text-sm text-white/55">No matching actions.</div>
          ) : null}
        </div>
      </div>
    </Modal>
  );
}
