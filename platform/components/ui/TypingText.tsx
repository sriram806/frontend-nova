'use client';

import { useEffect, useState } from 'react';

const phrases = [
  'Learn smarter with AI',
  'Build faster with intelligence',
  'Personalized education for India',
  'Your AI study companion',
];

interface TypingTextProps {
  text?: string;
  speed?: number;
  className?: string;
}

export function TypingText({ text, speed = 70, className = "text-primary" }: TypingTextProps) {
  const [displayText, setDisplayText] = useState('');
  const [index, setIndex] = useState(0);
  const [subIndex, setSubIndex] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    // Single text mode
    if (text) {
      if (subIndex < text.length) {
        const timeout = setTimeout(() => {
          setSubIndex((prev) => prev + 1);
          setDisplayText(text.substring(0, subIndex + 1));
        }, speed);
        return () => clearTimeout(timeout);
      }
      return;
    }

    // Phrases mode
    if (index === phrases.length) setIndex(0);

    if (!deleting && subIndex === phrases[index].length) {
      setTimeout(() => setDeleting(true), 1200);
      return;
    }

    if (deleting && subIndex === 0) {
      setDeleting(false);
      setIndex((prev) => prev + 1);
      return;
    }

    const timeout = setTimeout(() => {
      setSubIndex((prev) => prev + (deleting ? -1 : 1));
      setDisplayText(phrases[index].substring(0, subIndex + (deleting ? -1 : 1)));
    }, deleting ? 40 : speed);

    return () => clearTimeout(timeout);
  }, [subIndex, index, deleting, text, speed]);

  return (
    <span className={className}>
      {displayText}
      <span className="animate-pulse ml-1">|</span>
    </span>
  );
}