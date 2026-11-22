import React from 'react';
import { Filter, RotateCcw } from 'lucide-react';
import { SearchInput } from '../../common/SearchInput';
import { Select } from '../../common/Select';
import { Button } from '../../common/Button';

export function ProductFilters({
  filters,
  onFilterChange,
  categories = [],
  onReset,
}) {
  const sortOptions = [
    { value: 'createdAt,desc', label: 'Newest Arrivals' },
    { value: 'price,asc', label: 'Price: Low to High' },
    { value: 'price,desc', label: 'Price: High to Low' },
    { value: 'name,asc', label: 'Name: A to Z' },
  ];

  const categoryOptions = categories.map((cat) => ({
    value: cat.id,
    label: cat.name,
  }));

  return (
    <div className="glass-card p-4 rounded-2xl border border-white/10 space-y-4">
      <div className="flex flex-col md:flex-row items-center gap-3">
        {/* Search */}
        <div className="flex-1 w-full">
          <SearchInput
            value={filters.search || ''}
            onChange={(val) => onFilterChange('search', val)}
            placeholder="Search products by title or description..."
          />
        </div>

        {/* Category selector */}
        <div className="w-full md:w-56">
          <Select
            placeholder="All Categories"
            options={categoryOptions}
            value={filters.categoryId || ''}
            onChange={(e) => onFilterChange('categoryId', e.target.value)}
          />
        </div>

        {/* Sort selector */}
        <div className="w-full md:w-52">
          <Select
            placeholder="Sort by"
            options={sortOptions}
            value={filters.sort || 'createdAt,desc'}
            onChange={(e) => onFilterChange('sort', e.target.value)}
          />
        </div>

        {/* Reset button */}
        {(filters.search || filters.categoryId || filters.minPrice || filters.maxPrice) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onReset}
            icon={RotateCcw}
            className="w-full md:w-auto text-text-muted hover:text-text-primary"
          >
            Reset
          </Button>
        )}
      </div>
    </div>
  );
}
