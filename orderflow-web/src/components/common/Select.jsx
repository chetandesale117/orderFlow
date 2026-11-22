import React, { forwardRef } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '../../utils/cn';

export const Select = forwardRef(function Select(
  {
    label,
    error,
    helperText,
    options = [],
    placeholder = 'Select an option',
    className = '',
    id,
    disabled,
    ...props
  },
  ref
) {
  const selectId = id || props.name;

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label htmlFor={selectId} className="block text-xs font-medium text-text-secondary">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        <select
          ref={ref}
          id={selectId}
          disabled={disabled}
          className={cn(
            'w-full appearance-none rounded-xl bg-surface-secondary/70 border border-white/10 px-3.5 py-2.5 pr-10 text-sm text-text-primary transition-all duration-200 outline-none cursor-pointer',
            'focus:border-primary/60 focus:ring-2 focus:ring-primary/20 focus:bg-surface-secondary',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            error && 'border-status-error/60 focus:border-status-error focus:ring-status-error/20',
            className
          )}
          {...props}
        >
          {placeholder && <option value="" className="bg-surface-primary text-text-muted">{placeholder}</option>}
          {options.map((opt) => (
            <option
              key={opt.value}
              value={opt.value}
              className="bg-surface-primary text-text-primary"
            >
              {opt.label}
            </option>
          ))}
        </select>
        <div className="absolute right-3.5 pointer-events-none text-text-muted">
          <ChevronDown className="w-4 h-4" />
        </div>
      </div>
      {error && <p className="text-xs text-status-error">{error}</p>}
      {!error && helperText && <p className="text-xs text-text-muted">{helperText}</p>}
    </div>
  );
});
