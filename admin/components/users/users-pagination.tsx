'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Pagination } from '@/types/admin';

interface UsersPaginationProps {
  page: number;
  pagination: Pagination;
  onPageChange: (p: number) => void;
}

export function UsersPagination({ page, pagination, onPageChange }: UsersPaginationProps) {
  const { total, totalPages = 1 } = pagination;
  if (totalPages <= 1) return null;

  const start = (page - 1) * 25 + 1;
  const end   = Math.min(page * 25, total);

  // Show up to 5 page buttons
  const pages = Array.from({ length: Math.min(5, totalPages) }, (_, i) => i + 1);

  return (
    <div className="flex flex-col md:flex-row items-center justify-between px-6 py-4 premium-card rounded-[1.5rem] gap-4">
      <p className="text-sm font-medium text-muted-foreground">
        Showing{' '}
        <span className="text-foreground font-semibold">{start}–{end}</span>
        {' '}of{' '}
        <span className="text-foreground font-semibold">{total}</span> entries
      </p>

      <div className="flex items-center gap-2">
        <Button
          variant="outline" size="sm"
          onClick={() => onPageChange(Math.max(1, page - 1))}
          disabled={page === 1}
          className="rounded-xl h-9 w-9 p-0"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <div className="flex items-center gap-1 px-1">
          {pages.map((num) => (
            <button
              key={num}
              onClick={() => onPageChange(num)}
              className={`h-9 w-9 rounded-xl text-sm font-bold transition-all
                ${page === num
                  ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                  : 'text-muted-foreground hover:bg-accent'}`}
            >
              {num}
            </button>
          ))}
          {totalPages > 5 && <span className="text-muted-foreground px-1 text-sm">…</span>}
        </div>

        <Button
          variant="outline" size="sm"
          onClick={() => onPageChange(Math.min(totalPages, page + 1))}
          disabled={page === totalPages}
          className="rounded-xl h-9 w-9 p-0"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
