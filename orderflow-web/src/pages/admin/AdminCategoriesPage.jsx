import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Edit, FolderTree } from 'lucide-react';
import { DataTable } from '../../components/common/DataTable';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Textarea } from '../../components/common/Textarea';
import { Modal } from '../../components/common/Modal';
import {
  useCategories,
  useAdminCreateCategory,
  useAdminUpdateCategory,
} from '../../hooks/api/useProducts';

const categorySchema = z.object({
  name: z.string().min(2, 'Name is required'),
  slug: z.string().min(2, 'Slug is required'),
  description: z.string().optional(),
});

export function AdminCategoriesPage() {
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editCategory, setEditCategory] = useState(null);

  const { data: categoriesData, isLoading } = useCategories();
  const createMutation = useAdminCreateCategory();
  const updateMutation = useAdminUpdateCategory();

  const categories = categoriesData || [];

  const {
    register: regCreate,
    handleSubmit: handleCreateSubmit,
    reset: resetCreate,
    formState: { errors: createErrors },
  } = useForm({
    resolver: zodResolver(categorySchema),
  });

  const {
    register: regEdit,
    handleSubmit: handleEditSubmit,
    reset: resetEdit,
    formState: { errors: editErrors },
  } = useForm({
    resolver: zodResolver(categorySchema),
    values: editCategory
      ? {
          name: editCategory.name,
          slug: editCategory.slug,
          description: editCategory.description || '',
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
    if (!editCategory) return;
    updateMutation.mutate(
      { id: editCategory.id, data },
      {
        onSuccess: () => {
          setEditCategory(null);
          resetEdit();
        },
      }
    );
  };

  const columns = [
    {
      key: 'name',
      header: 'Category Name',
      render: (val) => (
        <div className="flex items-center gap-2.5">
          <FolderTree className="w-4 h-4 text-primary" />
          <span className="font-semibold text-text-primary">{val}</span>
        </div>
      ),
    },
    {
      key: 'slug',
      header: 'Slug',
      render: (val) => <span className="font-mono text-xs text-text-muted">{val}</span>,
    },
    {
      key: 'description',
      header: 'Description',
      render: (val) => <span className="text-xs text-text-secondary">{val || '—'}</span>,
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (_, row) => (
        <button
          onClick={() => setEditCategory(row)}
          className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-white/10"
          aria-label="Edit category"
        >
          <Edit className="w-4 h-4" />
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <h1 className="text-3xl font-bold text-text-primary tracking-tight">Categories</h1>
          <p className="text-xs text-text-muted mt-1">Organize catalog hierarchy and taxonomy</p>
        </div>

        <Button
          variant="primary"
          size="sm"
          icon={Plus}
          onClick={() => setCreateModalOpen(true)}
        >
          Add Category
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={categories}
        isLoading={isLoading}
        emptyTitle="No categories found"
        emptyDescription="Create your first catalog category using the Add Category button."
      />

      {/* Create Modal */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Create Category"
        description="Add a new catalog category"
        size="sm"
      >
        <form onSubmit={handleCreateSubmit(onCreateSubmit)} className="space-y-3 pt-2">
          <Input
            label="Name"
            placeholder="e.g. Audio & Sound"
            error={createErrors.name?.message}
            {...regCreate('name')}
          />
          <Input
            label="Slug"
            placeholder="e.g. audio-sound"
            error={createErrors.slug?.message}
            {...regCreate('slug')}
          />
          <Textarea
            label="Description (Optional)"
            rows={2}
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
              Create
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={!!editCategory}
        onClose={() => setEditCategory(null)}
        title="Edit Category"
        description="Update category name and slug"
        size="sm"
      >
        <form onSubmit={handleEditSubmit(onEditSubmit)} className="space-y-3 pt-2">
          <Input
            label="Name"
            error={editErrors.name?.message}
            {...regEdit('name')}
          />
          <Input
            label="Slug"
            error={editErrors.slug?.message}
            {...regEdit('slug')}
          />
          <Textarea
            label="Description"
            rows={2}
            error={editErrors.description?.message}
            {...regEdit('description')}
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-white/10 mt-4">
            <Button variant="ghost" size="sm" onClick={() => setEditCategory(null)}>
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
    </div>
  );
}
