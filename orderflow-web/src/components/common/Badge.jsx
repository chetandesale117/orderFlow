import React from 'react';
import { cn } from '../../utils/cn';

export function Badge({
  children,
  variant = 'default',
  size = 'md',
  className = '',
  icon: Icon,
}) {
  const variants = {
    default: 'bg-white/10 text-text-primary border-white/15',
    primary: 'bg-primary/15 text-primary-light border-primary/30',
    secondary: 'bg-surface-secondary text-text-secondary border-white/10',
    success: 'bg-status-success/15 text-status-success border-status-success/30',
    warning: 'bg-status-warning/15 text-status-warning border-status-warning/30',
    danger: 'bg-status-error/15 text-status-error border-status-error/30',
    info: 'bg-status-info/15 text-status-info border-status-info/30',
  };

  const sizes = {
    sm: 'text-[10px] px-2 py-0.5 font-medium gap-1',
    md: 'text-xs px-2.5 py-1 font-medium gap-1.5',
    lg: 'text-sm px-3 py-1.5 font-semibold gap-2',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border leading-none tracking-wide select-none',
        variants[variant] || variants.default,
        sizes[size] || sizes.md,
        className
      )}
    >
      {Icon && <Icon className="w-3 h-3 shrink-0" />}
      {children}
    </span>
  );
}
