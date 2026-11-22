import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Boxes, Edit, RefreshCw, AlertCircle } from 'lucide-react';
import { DataTable } from '../../components/common/DataTable';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Modal } from '../../components/common/Modal';
import { Pagination } from '../../components/common/Pagination';
import { useProducts } from '../../hooks/api/useProducts';
import { useAdminUpdateStock } from '../../hooks/api/useInventory';

const stockSchema = z.object({
  quantity: z.coerce.number().min(0, 'Quantity cannot be negative'),
});

export function AdminInventoryPage() {
  const [page, setPage] = useState(0);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const { data: productsData, isLoading } = useProducts({ page, size: 10 });
  const updateStockMutation = useAdminUpdateStock();

  const products = productsData?.content || [];
  const totalPages = productsData?.totalPages || 1;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(stockSchema),
    values: selectedProduct
      ? {
          quantity: selectedProduct.availableStock ?? 100,
        }
      : undefined,
  });

  const onSubmit = (data) => {
    if (!selectedProduct) return;
    updateStockMutation.mutate(
      {
        productId: selectedProduct.id,
        data: {
          availableQuantity: data.quantity,
          totalQuantity: data.quantity,
        },
      },
      {
        onSuccess: () => {
          setSelectedProduct(null);
          reset();
        },
      }
    );
  };

  const columns = [
    {
      key: 'id',
      header: 'Product ID',
      width: '120px',
      render: (val) => <span className="font-mono text-xs text-text-muted">{val?.substring(0, 8)}...</span>,
    },
    {
      key: 'name',
      header: 'Product Name',
      render: (val, row) => (
        <div>
          <span className="font-semibold text-text-primary">{val}</span>
          <p className="text-[11px] font-mono text-text-muted">SKU: {row.sku}</p>
        </div>
      ),
    },
    {
      key: 'availableStock',
      header: 'Available Stock',
      align: 'right',
      render: (val) => (
        <span className="font-mono font-bold text-sm text-text-primary">
          {val ?? 100} units
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      align: 'center',
      render: (_, row) => {
        const qty = row.availableStock ?? 100;
        const status = qty <= 0 ? 'OUT_OF_STOCK' : qty < 10 ? 'LOW_STOCK' : 'IN_STOCK';
        return <StatusBadge status={status} size="sm" />;
      },
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (_, row) => (
        <Button
          variant="secondary"
          size="sm"
          icon={Edit}
          onClick={() => setSelectedProduct(row)}
        >
          Adjust Stock
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <h1 className="text-3xl font-bold text-text-primary tracking-tight">Inventory Management</h1>
          <p className="text-xs text-text-muted mt-1">
            Real-time stock reservation and optimistic locking control (:8084)
          </p>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={products}
        isLoading={isLoading}
        emptyTitle="No inventory records found"
      />

      <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />

      {/* Adjust Stock Modal */}
      <Modal
        isOpen={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
        title="Adjust Inventory Stock"
        description={`Update available inventory for ${selectedProduct?.name}`}
        size="sm"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
          <Input
            label="Total Available Quantity"
            type="number"
            error={errors.quantity?.message}
            {...register('quantity')}
          />

          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 text-xs text-text-muted flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            <p>
              Modifications increment the version entity attribute for concurrency control.
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-white/10 mt-4">
            <Button variant="ghost" size="sm" onClick={() => setSelectedProduct(null)}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={updateStockMutation.isPending}
            >
              Update Stock
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
