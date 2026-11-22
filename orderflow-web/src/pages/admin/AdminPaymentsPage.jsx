import React, { useState } from 'react';
import { CreditCard, RefreshCw, AlertTriangle } from 'lucide-react';
import { DataTable } from '../../components/common/DataTable';
import { StatusBadge } from '../../components/common/StatusBadge';
import { PriceDisplay } from '../../components/common/PriceDisplay';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { Input } from '../../components/common/Input';
import { Pagination } from '../../components/common/Pagination';
import { useAdminPayments, useAdminRefund } from '../../hooks/api/usePayments';
import { formatDate } from '../../utils/formatDate';

export function AdminPaymentsPage() {
  const [page, setPage] = useState(0);
  const [refundPayment, setRefundPayment] = useState(null);
  const [reason, setReason] = useState('Customer requested return');

  const { data: paymentsData, isLoading } = useAdminPayments({ page, size: 10 });
  const refundMutation = useAdminRefund();

  const payments = paymentsData?.content || [];
  const totalPages = paymentsData?.totalPages || 1;

  const handleRefundSubmit = () => {
    if (!refundPayment) return;
    refundMutation.mutate(
      {
        id: refundPayment.id,
        data: { reason },
      },
      {
        onSuccess: () => {
          setRefundPayment(null);
          setReason('Customer requested return');
        },
      }
    );
  };

  const columns = [
    {
      key: 'id',
      header: 'Payment ID',
      width: '120px',
      render: (val) => <span className="font-mono text-xs text-text-muted">{val?.substring(0, 8)}...</span>,
    },
    {
      key: 'orderId',
      header: 'Order ID',
      render: (val) => <span className="font-mono text-xs text-text-primary">{val?.substring(0, 8)}...</span>,
    },
    {
      key: 'amount',
      header: 'Amount',
      align: 'right',
      render: (val) => <PriceDisplay amount={val} size="sm" />,
    },
    {
      key: 'paymentMethod',
      header: 'Method',
      render: (val) => <span className="font-mono text-xs text-text-secondary">{val || 'SANDBOX'}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      align: 'center',
      render: (val) => <StatusBadge status={val} size="sm" />,
    },
    {
      key: 'createdAt',
      header: 'Timestamp',
      render: (val) => <span className="text-xs text-text-muted">{formatDate(val)}</span>,
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (_, row) => (
        <Button
          variant="secondary"
          size="sm"
          icon={RefreshCw}
          disabled={row.status === 'REFUNDED'}
          onClick={() => setRefundPayment(row)}
        >
          {row.status === 'REFUNDED' ? 'Refunded' : 'Refund'}
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <h1 className="text-3xl font-bold text-text-primary tracking-tight">Payments &amp; Transactions</h1>
          <p className="text-xs text-text-muted mt-1">
            Sandbox payment provider integration and refund processing (:8086)
          </p>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={payments}
        isLoading={isLoading}
        emptyTitle="No payment records found"
      />

      <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />

      {/* Refund Modal */}
      <Modal
        isOpen={!!refundPayment}
        onClose={() => setRefundPayment(null)}
        title="Process Payment Refund"
        description={`Refund transaction of amount for order ${refundPayment?.orderId?.substring(0, 8)}`}
        size="sm"
      >
        <div className="space-y-4 pt-2">
          <Input
            label="Refund Reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-white/10 mt-4">
            <Button variant="ghost" size="sm" onClick={() => setRefundPayment(null)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              isLoading={refundMutation.isPending}
              onClick={handleRefundSubmit}
            >
              Confirm Refund
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
