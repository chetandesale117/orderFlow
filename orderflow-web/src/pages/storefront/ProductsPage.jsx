import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ProductCard } from '../../components/features/products/ProductCard';
import { ProductFilters } from '../../components/features/products/ProductFilters';
import { Pagination } from '../../components/common/Pagination';
import { Skeleton } from '../../components/common/Skeleton';
import { EmptyState } from '../../components/common/EmptyState';
import { useProducts, useCategories } from '../../hooks/api/useProducts';
import { useDebounce } from '../../hooks/useDebounce';

export function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [page, setPage] = useState(0);
  const [search, setSearch] = useState(searchParams.get('q') || '');
  const [categoryId, setCategoryId] = useState(searchParams.get('category') || '');
  const [sort, setSort] = useState(searchParams.get('sort') || 'createdAt,desc');

  const debouncedSearch = useDebounce(search, 350);

  const { data: categoriesData } = useCategories();
  const categories = categoriesData || [];

  const queryParams = {
    page,
    size: 12,
    sort,
    ...(debouncedSearch ? { search: debouncedSearch } : {}),
    ...(categoryId ? { categoryId } : {}),
  };

  const { data: productsData, isLoading } = useProducts(queryParams);

  const products = productsData?.content || [];
  const totalPages = productsData?.totalPages || 1;

  const handleFilterChange = (key, val) => {
    setPage(0);
    if (key === 'search') setSearch(val);
    if (key === 'categoryId') setCategoryId(val);
    if (key === 'sort') setSort(val);
  };

  const handleReset = () => {
    setSearch('');
    setCategoryId('');
    setSort('createdAt,desc');
    setPage(0);
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-text-primary tracking-tight">Products Catalog</h1>
        <p className="text-xs text-text-muted mt-1.5">
          Browse through high-throughput inventory managed across isolated microservices
        </p>
      </div>

      {/* Filters */}
      <ProductFilters
        filters={{ search, categoryId, sort }}
        onFilterChange={handleFilterChange}
        categories={categories}
        onReset={handleReset}
      />

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, idx) => (
            <div key={idx} className="space-y-3 p-4 rounded-2xl glass border border-white/5">
              <Skeleton className="aspect-square w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <EmptyState
          title="No products matched your criteria"
          description="Try adjusting your search terms, removing filters, or resetting your selection."
          actionLabel="Reset Filters"
          onAction={handleReset}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      {/* Pagination */}
      <div className="pt-6">
        <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
      </div>
    </div>
  );
}
