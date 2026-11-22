import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Edit, Trash2, Package } from 'lucide-react';
import { DataTable } from '../../components/common/DataTable';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Textarea } from '../../components/common/Textarea';
import { Select } from '../../components/common/Select';
import { PriceDisplay } from '../../components/common/PriceDisplay';
import { Modal } from '../../components/common/Modal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { Pagination } from '../../components/common/Pagination';
import {
  useProducts,
  useCategories,
  useAdminCreateProduct,
  useAdminUpdateProduct,
  useAdminDeleteProduct,
} from '../../hooks/api/useProducts';

const productSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  sku: z.string().min(2, 'SKU is required'),
  description: z.string().optional(),
  price: z.coerce.number().min(0.01, 'Price must be greater than 0'),
  categoryId: z.string().min(1, 'Category is required'),
  imageUrl: z.string().optional(),
});

export function AdminProductsPage() {
  const [page, setPage] = useState(0);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [deleteProduct, setDeleteProduct] = useState(null);

  const { data: productsData, isLoading } = useProducts({ page, size: 10 });
  const { data: categoriesData } = useCategories();

  const createMutation = useAdminCreateProduct();
  const updateMutation = useAdminUpdateProduct();
  const deleteMutation = useAdminDeleteProduct();

  const products = productsData?.content || [];
  const totalPages = productsData?.totalPages || 1;
  const categories = categoriesData || [];

  const categoryOptions = categories.map((c) => ({
    value: c.id,
    label: c.name,
  }));

  const {
    register: regCreate,
    handleSubmit: handleCreateSubmit,
    reset: resetCreate,
    formState: { errors: createErrors },
  } = useForm({
    resolver: zodResolver(productSchema),
  });

  const {
    register: regEdit,
    handleSubmit: handleEditSubmit,
    reset: resetEdit,
    formState: { errors: editErrors },
  } = useForm({
    resolver: zodResolver(productSchema),
    values: editProduct
      ? {
          name: editProduct.name,
          sku: editProduct.sku,
          description: editProduct.description || '',
          price: editProduct.price,
          categoryId: editProduct.categoryId || '',
          imageUrl: editProduct.imageUrl || '',
        }
      : undefined,
  });

  const onCreateSubmit = (data) => {
    createMutation.mutate(data, {
      onSuccess: () => {
        setCreateModalOpen(false);
        resetCreate();
      },
    });
  };

  const onEditSubmit = (data) => {
    if (!editProduct) return;
    updateMutation.mutate(
      { id: editProduct.id, data },
      {
        onSuccess: () => {
          setEditProduct(null);
          resetEdit();
        },
      }
    );
  };

  const columns = [
    {
      key: 'sku',
      header: 'SKU',
      width: '120px',
      render: (val) => <span className="font-mono text-xs text-text-muted">{val}</span>,
    },
    {
      key: 'name',
      header: 'Product Name',
      render: (val, row) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-surface-secondary flex items-center justify-center shrink-0 overflow-hidden">
            {row.imageUrl ? (
              <img src={row.imageUrl} alt={val} className="w-full h-full object-cover" />
            ) : (
              <Package className="w-4 h-4 text-text-muted" />
            )}
          </div>
          <span className="font-medium text-text-primary">{val}</span>
        </div>
      ),
    },
    {
      key: 'categoryName',
      header: 'Category',
      render: (val) => <span className="text-xs text-text-secondary">{val || 'General'}</span>,
    },
    {
      key: 'price',
      header: 'Price',
      align: 'right',
      render: (val) => <PriceDisplay amount={val} size="sm" />,
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (_, row) => (
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={() => setEditProduct(row)}
            className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-white/10"
            aria-label="Edit product"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => setDeleteProduct(row)}
            className="p-1.5 rounded-lg text-text-muted hover:text-status-error hover:bg-status-error/10"
            aria-label="Delete product"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <h1 className="text-3xl font-bold text-text-primary tracking-tight">Products</h1>
          <p className="text-xs text-text-muted mt-1">Manage catalog entries, pricing, and classifications</p>
        </div>

        <Button
          variant="primary"
          size="sm"
          icon={Plus}
          onClick={() => setCreateModalOpen(true)}
        >
          Add Product
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={products}
        isLoading={isLoading}
        emptyTitle="No products found"
        emptyDescription="Create your first catalog item using the Add Product button."
      />

      <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />

      {/* Create Modal */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Create New Product"
        description="Add a new item to the product catalog and publish ProductCreated event"
        size="md"
      >
        <form onSubmit={handleCreateSubmit(onCreateSubmit)} className="space-y-3 pt-2">
          <Input
            label="Product Name"
            placeholder="e.g. Wireless Noise-Canceling Headphones"
            error={createErrors.name?.message}
            {...regCreate('name')}
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="SKU"
              placeholder="e.g. WH-1000XM5"
              error={createErrors.sku?.message}
              {...regCreate('sku')}
            />
            <Input
              label="Price ($)"
              type="number"
              step="0.01"
              placeholder="299.99"
              error={createErrors.price?.message}
              {...regCreate('price')}
            />
          </div>
          <Select
            label="Category"
            options={categoryOptions}
            error={createErrors.categoryId?.message}
            {...regCreate('categoryId')}
          />
          <Input
            label="Image URL"
            placeholder="https://images.unsplash.com/..."
            error={createErrors.imageUrl?.message}
            {...regCreate('imageUrl')}
          />
          <Textarea
            label="Description"
            rows={3}
            placeholder="Detailed description of features and specifications..."
            error={createErrors.description?.message}
            {...regCreate('description')}
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-white/10 mt-4">
            <Button variant="ghost" size="sm" onClick={() => setCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={createMutation.isPending}
            >
              Create Product
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={!!editProduct}
        onClose={() => setEditProduct(null)}
        title="Edit Product"
        description="Update pricing and information"
        size="md"
      >
        <form onSubmit={handleEditSubmit(onEditSubmit)} className="space-y-3 pt-2">
          <Input
            label="Product Name"
            error={editErrors.name?.message}
            {...regEdit('name')}
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="SKU"
              error={editErrors.sku?.message}
              {...regEdit('sku')}
            />
            <Input
              label="Price ($)"
              type="number"
              step="0.01"
              error={editErrors.price?.message}
              {...regEdit('price')}
            />
          </div>
          <Select
            label="Category"
            options={categoryOptions}
            error={editErrors.categoryId?.message}
            {...regEdit('categoryId')}
          />
          <Input
            label="Image URL"
            error={editErrors.imageUrl?.message}
            {...regEdit('imageUrl')}
          />
          <Textarea
            label="Description"
            rows={3}
            error={editErrors.description?.message}
            {...regEdit('description')}
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-white/10 mt-4">
            <Button variant="ghost" size="sm" onClick={() => setEditProduct(null)}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={updateMutation.isPending}
            >
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteProduct}
        onClose={() => setDeleteProduct(null)}
        onConfirm={() => {
          if (deleteProduct) {
            deleteMutation.mutate(deleteProduct.id, {
              onSuccess: () => setDeleteProduct(null),
            });
          }
        }}
        title="Delete Product"
        message={`Are you sure you want to remove ${deleteProduct?.name} from the catalog?`}
        confirmText="Delete"
        isDestructive={true}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
