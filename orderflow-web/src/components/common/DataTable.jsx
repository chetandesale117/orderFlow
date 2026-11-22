import React from 'react';
import { Skeleton } from './Skeleton';
import { EmptyState } from './EmptyState';
import { cn } from '../../utils/cn';

export function DataTable({
  columns = [],
  data = [],
  isLoading = false,
  emptyTitle = 'No records found',
  emptyDescription = 'There are no items to display.',
  onRowClick,
  className = '',
}) {
  return (
    <div className={cn('w-full overflow-hidden rounded-2xl glass-card border border-white/10', className)}>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-text-secondary border-collapse">
          <thead className="bg-white/5 border-b border-white/10 text-xs font-semibold text-text-muted uppercase tracking-wider">
            <tr>
              {columns.map((col, idx) => (
                <th
                  key={col.key || idx}
                  style={{ width: col.width }}
                  className={cn(
                    'px-5 py-3.5 select-none',
                    col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'
                  )}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 font-normal">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, rIdx) => (
                <tr key={rIdx} className="hover:bg-white/[0.02]">
                  {columns.map((col, cIdx) => (
                    <td key={cIdx} className="px-5 py-4">
                      <Skeleton className="h-4 w-3/4" />
                    </td>
                  ))}
                </tr>
              ))
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-5 py-12 text-center">
                  <EmptyState title={emptyTitle} description={emptyDescription} />
                </td>
              </tr>
            ) : (
              data.map((row, rIdx) => (
                <tr
                  key={row.id || rIdx}
                  onClick={() => onRowClick && onRowClick(row)}
                  className={cn(
                    'transition-colors duration-150',
                    onRowClick ? 'cursor-pointer hover:bg-white/[0.04]' : 'hover:bg-white/[0.02]'
                  )}
                >
                  {columns.map((col, cIdx) => (
                    <td
                      key={col.key || cIdx}
                      className={cn(
                        'px-5 py-4 text-text-primary',
                        col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'
                      )}
                    >
                      {col.render ? col.render(row[col.key], row, rIdx) : row[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
