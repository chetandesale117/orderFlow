import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '../../utils/cn';

export function Breadcrumb({ items = [], className = '' }) {
  return (
    <nav aria-label="Breadcrumb" className={cn('flex items-center text-xs text-text-muted', className)}>
      <ol className="flex items-center space-x-2">
        <li>
          <Link
            to="/"
            className="flex items-center text-text-muted hover:text-text-primary transition-colors"
          >
            <Home className="w-3.5 h-3.5" />
          </Link>
        </li>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={index} className="flex items-center space-x-2">
              <ChevronRight className="w-3 h-3 text-text-muted/60 shrink-0" />
              {isLast || !item.to ? (
                <span className="font-medium text-text-primary truncate max-w-[200px]">
                  {item.label}
                </span>
              ) : (
                <Link
                  to={item.to}
                  className="hover:text-text-primary transition-colors truncate max-w-[150px]"
                >
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
