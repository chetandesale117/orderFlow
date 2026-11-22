import React, { forwardRef } from 'react';
import { Check } from 'lucide-react';
import { cn } from '../../utils/cn';

export const Checkbox = forwardRef(function Checkbox(
  { label, error, helperText, className = '', id, ...props },
  ref
) {
  const checkboxId = id || props.name;

  return (
    <div className="space-y-1">
      <label htmlFor={checkboxId} className="flex items-start gap-3 cursor-pointer select-none">
        <div className="relative flex items-center justify-center mt-0.5">
          <input
            ref={ref}
            type="checkbox"
            id={checkboxId}
            className="peer sr-only"
            {...props}
          />
          <div
            className={cn(
              'w-5 h-5 rounded-lg border border-white/20 bg-surface-secondary/70 transition-all duration-200',
              'peer-checked:bg-primary peer-checked:border-primary',
              'peer-focus-visible:ring-2 peer-focus-visible:ring-primary/40',
              'peer-disabled:opacity-50 peer-disabled:cursor-not-allowed',
              className
            )}
          />
          <Check className="absolute w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100 transition-opacity duration-150 pointer-events-none" />
        </div>
        {label && <span className="text-sm text-text-primary leading-tight">{label}</span>}
      </label>
      {error && <p className="text-xs text-status-error ml-8">{error}</p>}
      {!error && helperText && <p className="text-xs text-text-muted ml-8">{helperText}</p>}
    </div>
  );
});
