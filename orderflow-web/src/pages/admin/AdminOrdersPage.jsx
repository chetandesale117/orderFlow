import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Eye, Edit, Truck, CheckCircle2 } from 'lucide-react';
import { DataTable } from '../../components/common/DataTable';
import { StatusBadge } from '../../components/common/StatusBadge';
import { PriceDisplay } from '../../components/common/PriceDisplay';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { Select } from '../../components/common/Select';
import { Pagination } from '../../components/common/Pagination';
import { useAdminOrders, useAdminUpdateOrderStatus } from '../../hooks/api/useOrders';
import { formatDate } from '../../utils/formatDate';
import { formatOrderNumber } from '../../utils/formatOrderNumber';
import { ROUTES } from '../../config/routes';

export function AdminOrdersPage() {
  const [page, setPage] = useState(0);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [newStatus, setNewStatus] = useState('');

  const { data: ordersData, isLoading } = useAdminOrders({ page, size: 10 });
  const updateStatusMutation = useAdminUpdateOrderStatus();

  const orders = ordersData?.content || [];
  const totalPages = ordersData?.totalPages || 1;

  const statusOptions = [
    { value: 'CONFIRMED', label: 'CONFIRMED' },
    { value: 'SHIPPED', label: 'SHIPPED' },
    { value: 'DELIVERED', label: 'DELIVERED' },
    { value: 'CANCELLED', label: 'CANCELLED' },
  ];

  const handleUpdateStatus = () => {
    if (!selectedOrder || !newStatus) return;
    updateStatusMutation.mutate(
      {
        id: selectedOrder.id,
        data: { status: newStatus },
      },
      {
        onSuccess: () => {
          setSelectedOrder(null);
          setNewStatus('');
        },
      }
    );
  };

  const columns = [
    {
      key: 'orderNumber',
      header: 'Order Number',
      render: (val, row) => (
        <span className="font-mono font-bold text-xs text-text-primary">
          {formatOrderNumber(val || row.id)}
        </span>
      ),
    },
    {
      key: 'createdAt',
      header: 'Placed At',
      render: (val) => <span className="text-xs text-text-muted">{formatDate(val)}</span>,
    },
    {
      key: 'userId',
      header: 'Customer ID',
      render: (val) => <span className="font-mono text-xs text-text-muted">{val?.substring(0, 8)}...</span>,
    },
    {
      key: 'totalAmount',
      header: 'Total',
      align: 'right',
      render: (val, row) => <PriceDisplay amount={val || row.total} size="sm" />,
    },
    {
      key: 'status',
      header: 'Saga State',
      align: 'center',
      render: (val, row) => <StatusBadge status={val || row.orderStatus} size="sm" />,
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (_, row) => (
        <div className="flex items-center justify-end gap-2">
          <Link to={`/admin/orders/${row.id}`}>
            <Button variant="ghost" size="sm" icon={Eye}>
              Inspect
            </Button>
          </Link>
          <Button
            variant="secondary"
            size="sm"
            icon={Edit}
            onClick={() => {
              setSelectedOrder(row);
              setNewStatus(row.status || 'CONFIRMED');
            }}
          >
            Status
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <h1 className="text-3xl font-bold text-text-primary tracking-tight">Order Audit &amp; Fulfillment</h1>
          <p className="text-xs text-text-muted mt-1">
            Global view across all transactions and Saga states
          </p>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={orders}
        isLoading={isLoading}
        emptyTitle="No orders found"
      />

      <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />

      {/* Status Modal */}
      <Modal
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        title="Update Order Status"
        description={`Modify state for order ${formatOrderNumber(selectedOrder?.orderNumber || selectedOrder?.id)}`}
        size="sm"
      >
        <div className="space-y-4 pt-2">
          <Select
            label="Target State"
            options={statusOptions}
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value)}
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-white/10 mt-4">
            <Button variant="ghost" size="sm" onClick={() => setSelectedOrder(null)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              isLoading={updateStatusMutation.isPending}
              onClick={handleUpdateStatus}
            >
              Update State
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
