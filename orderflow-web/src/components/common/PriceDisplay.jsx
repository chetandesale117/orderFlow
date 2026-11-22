import React from 'react';
import { formatCurrency } from '../../utils/formatCurrency';
import { cn } from '../../utils/cn';

export function PriceDisplay({
  amount,
  currency = 'USD',
  originalAmount,
  size = 'md',
  className = '',
}) {
  const sizes = {
    sm: 'text-sm font-medium',
    md: 'text-base font-semibold',
    lg: 'text-xl font-bold',
    xl: 'text-2xl font-extrabold',
  };

  const hasDiscount = originalAmount != null && Number(originalAmount) > Number(amount);

  return (
    <div className={cn('inline-flex items-baseline gap-2', className)}>
      <span className={cn('font-mono text-text-primary tracking-tight', sizes[size] || sizes.md)}>
        {formatCurrency(amount, currency)}
      </span>
      {hasDiscount && (
        <span className="text-xs font-mono text-text-muted line-through">
          {formatCurrency(originalAmount, currency)}
        </span>
      )}
    </div>
  );
}
