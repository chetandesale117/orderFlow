import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Package,
  Calendar,
  MapPin,
  CreditCard,
  XCircle,
  ArrowLeft,
  ShoppingBag,
} from 'lucide-react';
import { Breadcrumb } from '../../components/common/Breadcrumb';
import { StatusBadge } from '../../components/common/StatusBadge';
import { PriceDisplay } from '../../components/common/PriceDisplay';
import { Button } from '../../components/common/Button';
import { GlassCard } from '../../components/common/GlassCard';
import { Skeleton } from '../../components/common/Skeleton';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { SagaTimeline } from '../../components/features/saga/SagaTimeline';
import { useOrder, useCancelOrder } from '../../hooks/api/useOrders';
import { usePaymentForOrder } from '../../hooks/api/usePayments';
import { formatDate } from '../../utils/formatDate';
import { formatOrderNumber } from '../../utils/formatOrderNumber';
import { ROUTES } from '../../config/routes';

export function OrderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [cancelModalOpen, setCancelModalOpen] = useState(false);

  const { data: order, isLoading } = useOrder(id);
  const { data: paymentData } = usePaymentForOrder(id);
  const cancelOrderMutation = useCancelOrder();

  if (isLoading) {
    return (
      <div className="space-y-6 pb-12">
        <Skeleton className="h-5 w-48" />
        <Skeleton className="h-40 w-full rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-60 md:col-span-2 rounded-2xl" />
          <Skeleton className="h-60 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="p-12 text-center rounded-2xl glass-card border border-white/10">
        <Package className="w-12 h-12 text-text-muted mx-auto mb-3" />
        <h2 className="text-lg font-bold text-text-primary">Order Not Found</h2>
        <p className="text-xs text-text-muted mt-1 mb-4">The order ID could not be located in Order Service.</p>
        <Button variant="secondary" size="sm" onClick={() => navigate(ROUTES.ORDERS)}>
          Back to Orders
        </Button>
      </div>
    );
  }

  const status = order.status || order.orderStatus || 'PENDING';
  const canCancel = ['PENDING', 'STOCK_RESERVED', 'CONFIRMED'].includes(status);

  const breadcrumbs = [
    { label: 'Orders', to: ROUTES.ORDERS },
    { label: formatOrderNumber(order.orderNumber || order.id) },
  ];

  return (
    <div className="space-y-8 pb-12">
      <Breadcrumb items={breadcrumbs} />

      {/* Header bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold font-mono text-text-primary tracking-tight">
              {formatOrderNumber(order.orderNumber || order.id)}
            </h1>
            <StatusBadge status={status} size="md" />
          </div>
          <p className="text-xs text-text-muted flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5" />
            Placed on {formatDate(order.createdAt)}
          </p>
        </div>

        {canCancel && (
          <Button
            variant="danger"
            size="sm"
            icon={XCircle}
            onClick={() => setCancelModalOpen(true)}
          >
            Cancel Order
          </Button>
        )}
      </div>

      {/* Real-time Saga Orchestration Timeline */}
      <SagaTimeline status={status} failureReason={order.failureReason} />

      {/* Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Ordered items */}
        <div className="lg:col-span-2 space-y-4">
          <GlassCard className="p-6 border-white/10">
            <h3 className="text-base font-semibold text-text-primary pb-3 border-b border-white/10 flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-primary" />
              <span>Order Items ({order.items?.length || 0})</span>
            </h3>

            <div className="divide-y divide-white/5">
              {(order.items || []).map((item, idx) => (
                <div key={idx} className="py-4 flex items-center justify-between gap-4">
                  <div>
                    <h4 className="text-sm font-semibold text-text-primary">
                      {item.productName || item.name || `Item ${idx + 1}`}
                    </h4>
                    <p className="text-xs text-text-muted mt-0.5">
                      Quantity: <span className="font-mono">{item.quantity}</span> &bull; Unit:{' '}
                      <PriceDisplay amount={item.price || item.unitPrice} size="sm" />
                    </p>
                  </div>
                  <PriceDisplay
                    amount={(item.price || item.unitPrice || 0) * (item.quantity || 1)}
                    size="md"
                  />
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-white/10 space-y-2 text-xs">
              <div className="flex justify-between text-text-secondary">
                <span>Total Items</span>
                <span>{order.items?.length || 0}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-text-primary pt-2 border-t border-white/5">
                <span>Grand Total</span>
                <PriceDisplay amount={order.totalAmount || order.total} size="md" />
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Shipping & Payment summary */}
        <div className="space-y-6">
          {/* Shipping address */}
          <GlassCard className="p-6 border-white/10 space-y-3">
            <h3 className="text-sm font-semibold text-text-primary flex items-center gap-2 pb-2 border-b border-white/10">
              <MapPin className="w-4 h-4 text-primary" />
              <span>Shipping Address</span>
            </h3>

            {order.shippingAddress ? (
              <div className="text-xs text-text-muted space-y-1">
                <p className="font-semibold text-text-primary">
                  {order.shippingAddress.fullName}
                </p>
                <p>{order.shippingAddress.streetLine1}</p>
                {order.shippingAddress.streetLine2 && (
                  <p>{order.shippingAddress.streetLine2}</p>
                )}
                <p>
                  {order.shippingAddress.city}, {order.shippingAddress.state}{' '}
                  {order.shippingAddress.postalCode}
                </p>
                <p>{order.shippingAddress.country}</p>
                <p className="font-mono pt-1 text-text-secondary">
                  {order.shippingAddress.phone}
                </p>
              </div>
            ) : (
              <p className="text-xs text-text-muted">Standard Delivery Address</p>
            )}
          </GlassCard>

          {/* Payment Info */}
          <GlassCard className="p-6 border-white/10 space-y-3">
            <h3 className="text-sm font-semibold text-text-primary flex items-center gap-2 pb-2 border-b border-white/10">
              <CreditCard className="w-4 h-4 text-primary" />
              <span>Payment Details</span>
            </h3>

            <div className="text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-text-muted">Method:</span>
                <span className="font-mono text-text-primary">
                  {paymentData?.paymentMethod || order.paymentMethod || 'SANDBOX'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Payment Status:</span>
                <StatusBadge
                  status={paymentData?.status || (status === 'COMPLETED' ? 'CONFIRMED' : status)}
                  size="sm"
                />
              </div>
              {paymentData?.transactionId && (
                <div className="flex justify-between text-[11px]">
                  <span className="text-text-muted">Tx ID:</span>
                  <span className="font-mono text-text-secondary truncate max-w-[140px]">
                    {paymentData.transactionId}
                  </span>
                </div>
              )}
            </div>
          </GlassCard>
        </div>
      </div>

      {/* Cancel Confirmation Dialog */}
      <ConfirmDialog
        isOpen={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        onConfirm={() => {
          cancelOrderMutation.mutate(
            { id: order.id, reason: 'Customer requested cancellation via UI' },
            {
              onSuccess: () => setCancelModalOpen(false),
            }
          );
        }}
        title="Cancel Order"
        message="Are you sure you want to cancel this order? This will invoke the Saga compensation workflow across all microservices."
        confirmText="Cancel Order"
        isDestructive={true}
        isLoading={cancelOrderMutation.isPending}
      />
    </div>
  );
}
