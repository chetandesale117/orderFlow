import React, { forwardRef } from 'react';
import { cn } from '../../utils/cn';

export const Input = forwardRef(function Input(
  {
    label,
    error,
    helperText,
    icon: Icon,
    rightElement,
    className = '',
    id,
    disabled,
    ...props
  },
  ref
) {
  const inputId = id || props.name;

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label htmlFor={inputId} className="block text-xs font-medium text-text-secondary">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {Icon && (
          <div className="absolute left-3.5 pointer-events-none text-text-muted">
            <Icon className="w-4 h-4" />
          </div>
        )}
        <input
          ref={ref}
          id={inputId}
          disabled={disabled}
          className={cn(
            'w-full rounded-xl bg-surface-secondary/70 border border-white/10 px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-muted transition-all duration-200 outline-none',
            'focus:border-primary/60 focus:ring-2 focus:ring-primary/20 focus:bg-surface-secondary',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            Icon && 'pl-10',
            rightElement && 'pr-10',
            error && 'border-status-error/60 focus:border-status-error focus:ring-status-error/20',
            className
          )}
          {...props}
        />
        {rightElement && (
          <div className="absolute right-3 flex items-center">
            {rightElement}
          </div>
        )}
      </div>
      {error && <p className="text-xs text-status-error">{error}</p>}
      {!error && helperText && <p className="text-xs text-text-muted">{helperText}</p>}
    </div>
  );
});
