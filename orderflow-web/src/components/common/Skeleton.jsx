import React from 'react';
import { cn } from '../../utils/cn';

export function Skeleton({ className = '', variant = 'rect' }) {
  const variants = {
    rect: 'rounded-xl',
    circle: 'rounded-full',
    text: 'rounded h-4 w-full',
  };

  return (
    <div
      className={cn(
        'animate-pulse bg-white/5 border border-white/5',
        variants[variant] || variants.rect,
        className
      )}
    />
  );
}
