import React, { forwardRef } from 'react';
import { cn } from '../../utils/cn';

export const Textarea = forwardRef(function Textarea(
  {
    label,
    error,
    helperText,
    className = '',
    rows = 4,
    id,
    disabled,
    ...props
  },
  ref
) {
  const textareaId = id || props.name;

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label htmlFor={textareaId} className="block text-xs font-medium text-text-secondary">
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        id={textareaId}
        rows={rows}
        disabled={disabled}
        className={cn(
          'w-full rounded-xl bg-surface-secondary/70 border border-white/10 px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-muted transition-all duration-200 outline-none resize-y',
          'focus:border-primary/60 focus:ring-2 focus:ring-primary/20 focus:bg-surface-secondary',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          error && 'border-status-error/60 focus:border-status-error focus:ring-status-error/20',
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-status-error">{error}</p>}
      {!error && helperText && <p className="text-xs text-text-muted">{helperText}</p>}
    </div>
  );
});
