import React from 'react';
import { Search, X } from 'lucide-react';
import { cn } from '../../utils/cn';

export function SearchInput({
  value,
  onChange,
  placeholder = 'Search...',
  onClear,
  className = '',
  ...props
}) {
  return (
    <div className={cn('relative flex items-center', className)}>
      <div className="absolute left-3.5 pointer-events-none text-text-muted">
        <Search className="w-4 h-4" />
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl bg-surface-secondary/70 border border-white/10 pl-10 pr-9 py-2 text-sm text-text-primary placeholder:text-text-muted transition-all duration-200 outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/20 focus:bg-surface-secondary"
        {...props}
      />
      {value && (
        <button
          type="button"
          onClick={() => {
            if (onClear) onClear();
            else onChange('');
          }}
          className="absolute right-3 p-1 rounded-md text-text-muted hover:text-text-primary hover:bg-white/10"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}
