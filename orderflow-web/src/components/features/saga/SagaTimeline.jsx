import React from 'react';
import { motion } from 'framer-motion';
import {
  FileText,
  Boxes,
  CreditCard,
  CheckCircle,
  Truck,
  PackageCheck,
  AlertOctagon,
  XCircle,
  Loader2,
} from 'lucide-react';
import { cn } from '../../../utils/cn';

const SAGA_STEPS = [
  {
    key: 'ORDER_CREATED',
    label: 'Order Initiated',
    description: 'Order placed & event emitted to Kafka',
    icon: FileText,
  },
  {
    key: 'INVENTORY_RESERVED',
    label: 'Stock Reservation',
    description: 'Inventory verified & reserved via optimistic locking',
    icon: Boxes,
  },
  {
    key: 'PAYMENT_PROCESSED',
    label: 'Payment Capture',
    description: 'Transaction authorized via payment sandbox',
    icon: CreditCard,
  },
  {
    key: 'FULFILLMENT',
    label: 'Order Confirmed',
    description: 'Saga completed; order ready for shipment',
    icon: CheckCircle,
  },
];

export function SagaTimeline({ status, failureReason, className = '' }) {
  const currentStatus = String(status || 'PENDING').toUpperCase();

  const isFailed = currentStatus === 'FAILED';
  const isCancelled = currentStatus === 'CANCELLED';
  const isTerminated = isFailed || isCancelled;

  // Determine which step index is active or completed
  let activeStepIndex = 0;
  if (currentStatus === 'PENDING') {
    activeStepIndex = 0;
  } else if (currentStatus === 'STOCK_RESERVING') {
    activeStepIndex = 1;
  } else if (currentStatus === 'STOCK_RESERVED') {
    activeStepIndex = 1;
  } else if (currentStatus === 'PAYMENT_PROCESSING') {
    activeStepIndex = 2;
  } else if (
    currentStatus === 'PAYMENT_COMPLETED' ||
    currentStatus === 'CONFIRMED' ||
    currentStatus === 'PROCESSING'
  ) {
    activeStepIndex = 3;
  } else if (currentStatus === 'SHIPPED') {
    activeStepIndex = 4;
  } else if (currentStatus === 'DELIVERED') {
    activeStepIndex = 4;
  }

  return (
    <div className={cn('p-6 rounded-2xl glass-card border border-white/10 space-y-6', className)}>
      <div className="flex items-center justify-between pb-4 border-b border-white/10">
        <div>
          <h3 className="text-base font-semibold text-text-primary flex items-center gap-2">
            <span>Saga Orchestration State Machine</span>
            {!isTerminated && activeStepIndex < 3 && (
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
              </span>
            )}
          </h3>
          <p className="text-xs text-text-muted mt-0.5">
            Real-time event choreography across Order, Inventory, Payment & Notification services
          </p>
        </div>

        <div className="text-right">
          <span className="text-[11px] font-mono uppercase tracking-wider text-text-muted">
            Status: <span className="text-text-primary font-bold">{currentStatus}</span>
          </span>
        </div>
      </div>

      {/* Compensation failure notice */}
      {isTerminated && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-xl border border-status-error/30 bg-status-error/10 flex items-start gap-3"
        >
          {isFailed ? (
            <AlertOctagon className="w-5 h-5 text-status-error shrink-0 mt-0.5" />
          ) : (
            <XCircle className="w-5 h-5 text-status-warning shrink-0 mt-0.5" />
          )}
          <div className="text-xs">
            <h4 className="font-semibold text-text-primary">
              {isFailed ? 'Saga Compensation Triggered: FAILED' : 'Order Cancelled'}
            </h4>
            <p className="text-text-secondary mt-1">
              {failureReason ||
                (isFailed
                  ? 'Compensating transactions executed: stock reservation reversed & payment voided.'
                  : 'Order was cancelled and allocated resources have been freed.')}
            </p>
          </div>
        </motion.div>
      )}

      {/* Steps visualization */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
        {SAGA_STEPS.map((step, idx) => {
          const StepIcon = step.icon;
          const isCompleted = !isTerminated && activeStepIndex > idx;
          const isCurrent = !isTerminated && activeStepIndex === idx;
          const isUpcoming = !isTerminated && activeStepIndex < idx;

          return (
            <div
              key={step.key}
              className={cn(
                'relative p-4 rounded-xl border transition-all duration-300 flex flex-col justify-between',
                isCompleted && 'glass bg-status-success/5 border-status-success/30',
                isCurrent && 'glass bg-primary/10 border-primary shadow-lg shadow-primary/10',
                isUpcoming && 'glass bg-white/[0.02] border-white/5 opacity-60',
                isTerminated && idx >= activeStepIndex && 'opacity-40 border-dashed border-white/10'
              )}
            >
              {/* Step indicator header */}
              <div className="flex items-center justify-between mb-3">
                <div
                  className={cn(
                    'w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs transition-transform',
                    isCompleted && 'bg-status-success/20 text-status-success',
                    isCurrent && 'bg-primary text-white scale-110 shadow-md shadow-primary/30',
                    isUpcoming && 'bg-white/5 text-text-muted',
                    isTerminated && idx >= activeStepIndex && 'bg-white/5 text-text-muted'
                  )}
                >
                  {isCompleted ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : isCurrent ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <StepIcon className="w-4 h-4" />
                  )}
                </div>

                <span className="text-[10px] font-mono font-medium text-text-muted">
                  STEP 0{idx + 1}
                </span>
              </div>

              {/* Step descriptions */}
              <div>
                <h4
                  className={cn(
                    'text-sm font-semibold mb-1',
                    isCurrent ? 'text-primary-light' : 'text-text-primary'
                  )}
                >
                  {step.label}
                </h4>
                <p className="text-xs text-text-muted leading-relaxed">
                  {step.description}
                </p>
              </div>

              {/* Status footer pill */}
              <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] font-mono">
                <span className="text-text-muted">State:</span>
                <span
                  className={cn(
                    'font-medium',
                    isCompleted && 'text-status-success',
                    isCurrent && 'text-primary-light animate-pulse',
                    isUpcoming && 'text-text-muted'
                  )}
                >
                  {isCompleted ? 'COMPLETED' : isCurrent ? 'RUNNING' : 'PENDING'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
