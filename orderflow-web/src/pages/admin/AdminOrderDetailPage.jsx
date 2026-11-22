import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Terminal, Shield, Package } from 'lucide-react';
import { StatusBadge } from '../../components/common/StatusBadge';
import { PriceDisplay } from '../../components/common/PriceDisplay';
import { Button } from '../../components/common/Button';
import { GlassCard } from '../../components/common/GlassCard';
import { Skeleton } from '../../components/common/Skeleton';
import { SagaTimeline } from '../../components/features/saga/SagaTimeline';
import { useOrder } from '../../hooks/api/useOrders';
import { formatDate } from '../../utils/formatDate';
import { formatOrderNumber } from '../../utils/formatOrderNumber';
import { ROUTES } from '../../config/routes';

export function AdminOrderDetailPage() {
  const { id } = useParams();
  const { data: order, isLoading } = useOrder(id);

  if (isLoading) {
    return (
      <div className="space-y-6 pb-12">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-48 w-full rounded-2xl" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="p-12 text-center rounded-2xl glass-card border border-white/10">
        <h2 className="text-lg font-bold text-text-primary">Order Not Found</h2>
        <Link to={ROUTES.ADMIN_ORDERS} className="mt-4 inline-block">
          <Button variant="secondary" size="sm">Back to Orders</Button>
        </Link>
      </div>
    );
  }

  const status = order.status || order.orderStatus || 'PENDING';

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center justify-between pb-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <Link to={ROUTES.ADMIN_ORDERS}>
            <Button variant="ghost" size="sm" icon={ArrowLeft} />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold font-mono text-text-primary">
                {formatOrderNumber(order.orderNumber || order.id)}
              </h1>
              <StatusBadge status={status} size="md" />
            </div>
            <p className="text-xs text-text-muted mt-0.5">
              Customer ID: <span className="font-mono text-text-secondary">{order.userId}</span> &bull; {formatDate(order.createdAt)}
            </p>
          </div>
        </div>
      </div>

      <SagaTimeline status={status} failureReason={order.failureReason} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ordered items */}
        <GlassCard className="p-6 border-white/10 space-y-4">
          <h3 className="text-sm font-semibold text-text-primary pb-3 border-b border-white/10 flex items-center gap-2">
            <Package className="w-4 h-4 text-primary" />
            <span>Order Line Items</span>
          </h3>

          <div className="divide-y divide-white/5">
            {(order.items || []).map((item, idx) => (
              <div key={idx} className="py-3 flex justify-between items-center text-xs">
                <div>
                  <p className="font-semibold text-text-primary">{item.productName || item.name || `Item ${idx + 1}`}</p>
                  <p className="text-text-muted font-mono">{item.quantity} x {item.price || item.unitPrice}</p>
                </div>
                <PriceDisplay amount={(item.price || item.unitPrice || 0) * (item.quantity || 1)} size="sm" />
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-white/10 flex justify-between text-sm font-bold text-text-primary">
            <span>Total Value</span>
            <PriceDisplay amount={order.totalAmount || order.total} size="md" />
          </div>
        </GlassCard>

        {/* Technical Event Payload Debug */}
        <GlassCard className="p-6 border-white/10 space-y-3">
          <h3 className="text-sm font-semibold text-text-primary pb-2 border-b border-white/10 flex items-center gap-2">
            <Terminal className="w-4 h-4 text-primary" />
            <span>Saga Metadata &amp; State Payload</span>
          </h3>

          <div className="bg-black/40 rounded-xl p-4 border border-white/5 font-mono text-[11px] text-text-secondary overflow-x-auto max-h-72">
            <pre>{JSON.stringify(order, null, 2)}</pre>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
