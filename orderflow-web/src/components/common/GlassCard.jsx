import React from 'react';
import { cn } from '../../utils/cn';

export function GlassCard({
  children,
  className = '',
  hoverEffect = false,
  glowEffect = false,
  onClick,
  ...props
}) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'glass-card p-6 rounded-2xl relative overflow-hidden transition-all duration-300',
        hoverEffect && 'hover:-translate-y-1 hover:border-white/20 hover:shadow-2xl hover:shadow-primary/5 cursor-pointer',
        glowEffect && 'glow-border',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
