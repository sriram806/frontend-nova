'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface ConfettiProps {
  fire: boolean;
  onComplete?: () => void;
}

export const ConfettiCelebration = ({ fire, onComplete }: ConfettiProps) => {
  const [pieces, setPieces] = useState<{ id: number; x: number; y: number; color: string; rotation: number }[]>([]);

  useEffect(() => {
    if (fire) {
      const colors = ['#7c3aed', '#06b6d4', '#f59e0b', '#f43f5e', '#10b981'];
      const newPieces = Array.from({ length: 50 }).map((_, i) => ({
        id: i,
        x: Math.random() * 100, // percentage vw
        y: Math.random() * -20, // start slightly above screen
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
      }));
      setPieces(newPieces);

      const timer = setTimeout(() => {
        setPieces([]);
        if (onComplete) onComplete();
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [fire, onComplete]);

  if (!fire || pieces.length === 0) return null;

  return (
    <div className="fixed inset-0 z-[100] pointer-events-none overflow-hidden">
      {pieces.map((p) => (
        <motion.div
          key={p.id}
          initial={{ top: `${p.y}vh`, left: `${p.x}vw`, rotate: 0, opacity: 1 }}
          animate={{
            top: '120vh',
            left: `${p.x + (Math.random() * 20 - 10)}vw`,
            rotate: p.rotation + 360,
            opacity: [1, 1, 0],
          }}
          transition={{ duration: 2.5 + Math.random(), ease: 'easeOut' }}
          className="absolute w-3 h-3 rounded-sm"
          style={{ backgroundColor: p.color }}
        />
      ))}
    </div>
  );
};
