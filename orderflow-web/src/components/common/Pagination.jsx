import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../../utils/cn';

export function Pagination({
  currentPage = 0,
  totalPages = 1,
  onPageChange,
  className = '',
}) {
  if (totalPages <= 1) return null;

  const pages = [];
  const startPage = Math.max(0, currentPage - 2);
  const endPage = Math.min(totalPages - 1, currentPage + 2);

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  return (
    <div className={cn('flex items-center justify-center gap-1 select-none', className)}>
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 0}
        className="p-2 rounded-xl text-text-muted hover:text-text-primary hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none transition-colors"
        aria-label="Previous page"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {startPage > 0 && (
        <>
          <button
            onClick={() => onPageChange(0)}
            className="w-8 h-8 rounded-xl text-xs font-mono font-medium text-text-muted hover:text-text-primary hover:bg-white/10"
          >
            1
          </button>
          {startPage > 1 && <span className="text-text-muted px-1">...</span>}
        </>
      )}

      {pages.map((p) => {
        const isActive = p === currentPage;
        return (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={cn(
              'w-8 h-8 rounded-xl text-xs font-mono font-medium transition-all duration-200',
              isActive
                ? 'bg-primary text-white shadow-md shadow-primary/30'
                : 'text-text-muted hover:text-text-primary hover:bg-white/10'
            )}
          >
            {p + 1}
          </button>
        );
      })}

      {endPage < totalPages - 1 && (
        <>
          {endPage < totalPages - 2 && <span className="text-text-muted px-1">...</span>}
          <button
            onClick={() => onPageChange(totalPages - 1)}
            className="w-8 h-8 rounded-xl text-xs font-mono font-medium text-text-muted hover:text-text-primary hover:bg-white/10"
          >
            {totalPages}
          </button>
        </>
      )}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages - 1}
        className="p-2 rounded-xl text-text-muted hover:text-text-primary hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none transition-colors"
        aria-label="Next page"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}
