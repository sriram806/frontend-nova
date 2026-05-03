'use client';

import { Lock, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';

interface BulkActionsBarProps {
  selectedCount: number;
  onSuspend: () => void;
  onDelete: () => void;
  onDeselect: () => void;
}

export function BulkActionsBar({ selectedCount, onSuspend, onDelete, onDeselect }: BulkActionsBarProps) {
  return (
    <AnimatePresence>
      {selectedCount > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4 px-6 py-4
            rounded-2xl bg-popover border border-primary/30 shadow-2xl shadow-primary/10 backdrop-blur-xl"
        >
          <span className="text-sm font-bold text-foreground pr-4 border-r border-border">
            {selectedCount} selected
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost" size="sm"
              onClick={onSuspend}
              className="text-orange-500 hover:bg-orange-500/10 rounded-lg"
            >
              <Lock className="h-4 w-4 mr-2" /> Suspend
            </Button>
            <Button
              variant="ghost" size="sm"
              onClick={onDelete}
              className="text-destructive hover:bg-destructive/10 rounded-lg"
            >
              <Trash2 className="h-4 w-4 mr-2" /> Delete
            </Button>
            <Button
              variant="ghost" size="sm"
              onClick={onDeselect}
              className="text-muted-foreground hover:bg-accent rounded-lg ml-2"
            >
              Deselect
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
