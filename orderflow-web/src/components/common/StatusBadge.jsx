import React from 'react';
import {
  Clock,
  Loader2,
  CheckCircle2,
  Truck,
  PackageCheck,
  XCircle,
  AlertOctagon,
  RefreshCw,
  Boxes,
} from 'lucide-react';
import { Badge } from './Badge';

const STATUS_CONFIGS = {
  PENDING: {
    label: 'Pending',
    variant: 'warning',
    icon: Clock,
  },
  STOCK_RESERVING: {
    label: 'Reserving Stock',
    variant: 'info',
    icon: Loader2,
    pulse: true,
  },
  STOCK_RESERVED: {
    label: 'Stock Reserved',
    variant: 'info',
    icon: Boxes,
  },
  PAYMENT_PROCESSING: {
    label: 'Processing Payment',
    variant: 'primary',
    icon: Loader2,
    pulse: true,
  },
  PAYMENT_COMPLETED: {
    label: 'Payment Confirmed',
    variant: 'success',
    icon: CheckCircle2,
  },
  CONFIRMED: {
    label: 'Confirmed',
    variant: 'success',
    icon: CheckCircle2,
  },
  SHIPPED: {
    label: 'Shipped',
    variant: 'info',
    icon: Truck,
  },
  DELIVERED: {
    label: 'Delivered',
    variant: 'success',
    icon: PackageCheck,
  },
  CANCELLED: {
    label: 'Cancelled',
    variant: 'danger',
    icon: XCircle,
  },
  FAILED: {
    label: 'Failed',
    variant: 'danger',
    icon: AlertOctagon,
  },
  REFUNDED: {
    label: 'Refunded',
    variant: 'warning',
    icon: RefreshCw,
  },
  IN_STOCK: {
    label: 'In Stock',
    variant: 'success',
    icon: CheckCircle2,
  },
  LOW_STOCK: {
    label: 'Low Stock',
    variant: 'warning',
    icon: Clock,
  },
  OUT_OF_STOCK: {
    label: 'Out of Stock',
    variant: 'danger',
    icon: XCircle,
  },
};

export function StatusBadge({ status, size = 'md', className = '' }) {
  if (!status) return null;

  const normalized = String(status).toUpperCase();
  const cfg = STATUS_CONFIGS[normalized] || {
    label: status,
    variant: 'default',
    icon: null,
  };

  const Icon = cfg.icon;

  return (
    <Badge
      variant={cfg.variant}
      size={size}
      className={`${cfg.pulse ? 'animate-pulse' : ''} ${className}`}
    >
      {Icon && (
        <Icon className={`w-3 h-3 ${cfg.pulse ? 'animate-spin' : ''}`} />
      )}
      {cfg.label}
    </Badge>
  );
}
