import React from 'react';
import { Minus, Plus } from 'lucide-react';
import { cn } from '../../utils/cn';

export function QuantitySelector({
  value = 1,
  onChange,
  min = 1,
  max = 99,
  disabled = false,
  size = 'md',
  className = '',
}) {
  const handleDecrement = () => {
    if (value > min) {
      onChange(value - 1);
    }
  };

  const handleIncrement = () => {
    if (value < max) {
      onChange(value + 1);
    }
  };

  const handleInputChange = (e) => {
    const val = parseInt(e.target.value, 10);
    if (isNaN(val)) return;
    if (val < min) onChange(min);
    else if (val > max) onChange(max);
    else onChange(val);
  };

  const sizes = {
    sm: 'h-8 text-xs',
    md: 'h-10 text-sm',
  };

  const btnSizes = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
  };

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-xl border border-white/10 bg-surface-secondary/70 p-1 select-none',
        sizes[size] || sizes.md,
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
    >
      <button
        type="button"
        onClick={handleDecrement}
        disabled={disabled || value <= min}
        className={cn(
          'flex items-center justify-center rounded-lg text-text-muted hover:text-text-primary hover:bg-white/10 transition-colors disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer disabled:cursor-not-allowed',
          btnSizes[size] || btnSizes.md
        )}
        aria-label="Decrease quantity"
      >
        <Minus className="w-3.5 h-3.5" />
      </button>

      <input
        type="number"
        value={value}
        onChange={handleInputChange}
        disabled={disabled}
        min={min}
        max={max}
        className="w-10 text-center bg-transparent text-text-primary font-mono text-sm font-semibold outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
      />

      <button
        type="button"
        onClick={handleIncrement}
        disabled={disabled || value >= max}
        className={cn(
          'flex items-center justify-center rounded-lg text-text-muted hover:text-text-primary hover:bg-white/10 transition-colors disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer disabled:cursor-not-allowed',
          btnSizes[size] || btnSizes.md
        )}
        aria-label="Increase quantity"
      >
        <Plus className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
