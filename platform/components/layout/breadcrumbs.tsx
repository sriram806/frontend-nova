'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, Home } from 'lucide-react';
import { motion } from 'framer-motion';

export function Breadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split('/').filter(Boolean);

  if (segments.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" className="mb-6 flex">
      <ol className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest">
        <li>
          <Link
            href="/dashboard"
            className="flex items-center gap-1 text-white/40 transition-colors hover:text-white"
          >
            <Home className="h-3 w-3" />
            <span className="sr-only">Home</span>
          </Link>
        </li>

        {segments.map((segment, index) => {
          const href = `/${segments.slice(0, index + 1).join('/')}`;
          const isLast = index === segments.length - 1;
          const label = segment.replace(/-/g, ' ');

          return (
            <motion.li
              key={href}
              initial={{ opacity: 0, x: -5 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-center gap-1.5"
            >
              <ChevronRight className="h-3 w-3 text-white/20" />
              {isLast ? (
                <span className="text-indigo-400">{label}</span>
              ) : (
                <Link
                  href={href}
                  className="text-white/40 transition-colors hover:text-white"
                >
                  {label}
                </Link>
              )}
            </motion.li>
          );
        })}
      </ol>
    </nav>
  );
}
