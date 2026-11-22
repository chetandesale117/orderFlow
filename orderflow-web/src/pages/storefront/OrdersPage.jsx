import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Package, ArrowRight, Eye, Calendar, DollarSign } from 'lucide-react';
import { StatusBadge } from '../../components/common/StatusBadge';
import { PriceDisplay } from '../../components/common/PriceDisplay';
import { Button } from '../../components/common/Button';
import { Pagination } from '../../components/common/Pagination';
import { Skeleton } from '../../components/common/Skeleton';
import { EmptyState } from '../../components/common/EmptyState';
import { useOrders } from '../../hooks/api/useOrders';
import { formatDate } from '../../utils/formatDate';
import { formatOrderNumber } from '../../utils/formatOrderNumber';
import { ROUTES } from '../../config/routes';

export function OrdersPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(0);

  const { data: ordersData, isLoading } = useOrders({ page, size: 10 });
  const orders = ordersData?.content || [];
  const totalPages = ordersData?.totalPages || 1;

  return (
    <div className="space-y-8 pb-12">
      <div>
        <h1 className="text-3xl font-bold text-text-primary tracking-tight">Order History</h1>
        <p className="text-xs text-text-muted mt-1">
          Track the status of your microservice Saga transactions
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div key={idx} className="p-6 rounded-2xl glass-card border border-white/5 space-y-3">
              <Skeleton className="h-5 w-1/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      ) : orders.length === 0 ? (
        <EmptyState
          icon={Package}
          title="No orders found"
          description="You haven't placed any orders yet. Explore our catalog to place your first order."
          actionLabel="Explore Catalog"
          onAction={() => navigate(ROUTES.PRODUCTS)}
        />
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="p-5 sm:p-6 rounded-2xl glass-card border border-white/10 hover:border-white/20 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              <div className="space-y-1.5">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-sm font-bold text-text-primary">
                    {formatOrderNumber(order.orderNumber || order.id)}
                  </span>
                  <StatusBadge status={order.status || order.orderStatus} size="sm" />
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs text-text-muted">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    {formatDate(order.createdAt)}
                  </span>
                  <span>&bull;</span>
                  <span>{order.items?.length || 1} items</span>
                  <span>&bull;</span>
                  <PriceDisplay amount={order.totalAmount || order.total} size="sm" />
                </div>
              </div>

              <div className="w-full sm:w-auto flex items-center justify-end">
                <Link to={`/orders/${order.id}`}>
                  <Button variant="secondary" size="sm" icon={Eye} iconPosition="left">
                    View Saga Status
                  </Button>
                </Link>
              </div>
            </div>
          ))}

          <div className="pt-4">
            <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        </div>
      )}
    </div>
  );
}
