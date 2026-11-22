import React from 'react';
import { cn } from '../../utils/cn';
import { Spinner } from './Spinner';

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  icon: Icon,
  iconPosition = 'left',
  className = '',
  type = 'button',
  onClick,
  ...props
}) {
  const baseStyles =
    'relative inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 select-none cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 active:scale-[0.98] outline-none focus-visible:ring-2 focus-visible:ring-primary/50';

  const variants = {
    primary:
      'bg-gradient-to-r from-primary to-accent text-white shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:brightness-110',
    secondary:
      'glass hover:bg-white/10 text-text-primary border border-white/10 shadow-sm',
    ghost:
      'bg-transparent text-text-secondary hover:text-text-primary hover:bg-white/5',
    danger:
      'bg-status-error/20 text-status-error border border-status-error/30 hover:bg-status-error/30 hover:shadow-lg hover:shadow-status-error/20',
    outline:
      'bg-transparent border border-primary/40 text-primary hover:bg-primary/10',
  };

  const sizes = {
    sm: 'text-xs px-3 py-1.5 gap-1.5',
    md: 'text-sm px-4 py-2.5 gap-2',
    lg: 'text-base px-6 py-3.5 gap-2.5',
  };

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      onClick={onClick}
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      {...props}
    >
      {isLoading ? (
        <Spinner size="sm" className="border-current border-t-transparent" />
      ) : (
        <>
          {Icon && iconPosition === 'left' && <Icon className="w-4 h-4 shrink-0" />}
          {children}
          {Icon && iconPosition === 'right' && <Icon className="w-4 h-4 shrink-0" />}
        </>
      )}
    </button>
  );
}
