import React from 'react';
import { PackageOpen } from 'lucide-react';
import { Button } from './Button';
import { cn } from '../../utils/cn';

export function EmptyState({
  icon: Icon = PackageOpen,
  title = 'No items found',
  description = 'There are no items to display at this time.',
  actionLabel,
  onAction,
  className = '',
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center p-12 text-center rounded-2xl glass-card border border-white/10',
        className
      )}
    >
      <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-text-muted mb-4 shadow-inner">
        <Icon className="w-8 h-8" />
      </div>
      <h3 className="text-lg font-semibold text-text-primary mb-1">{title}</h3>
      <p className="text-sm text-text-muted max-w-sm mb-6">{description}</p>
      {actionLabel && onAction && (
        <Button onClick={onAction} size="sm" variant="secondary">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
