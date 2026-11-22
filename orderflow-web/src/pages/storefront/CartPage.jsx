import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, ArrowRight, ShoppingBag, ArrowLeft } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { PriceDisplay } from '../../components/common/PriceDisplay';
import { QuantitySelector } from '../../components/common/QuantitySelector';
import { GlassCard } from '../../components/common/GlassCard';
import { EmptyState } from '../../components/common/EmptyState';
import { useCartStore } from '../../stores/cartStore';
import { ROUTES } from '../../config/routes';

export function CartPage() {
  const navigate = useNavigate();
  const { items, updateQuantity, removeItem, clearCart, getSubtotal } = useCartStore();

  const subtotal = getSubtotal();
  const shipping = subtotal > 100 || subtotal === 0 ? 0 : 9.99;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  if (items.length === 0) {
    return (
      <div className="py-12">
        <EmptyState
          icon={ShoppingBag}
          title="Your shopping cart is empty"
          description="Browse our microservices catalog and add items to your cart."
          actionLabel="Explore Catalog"
          onAction={() => navigate(ROUTES.PRODUCTS)}
        />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      <div className="flex items-center justify-between pb-4 border-b border-white/10">
        <div>
          <h1 className="text-3xl font-bold text-text-primary tracking-tight">Shopping Cart</h1>
          <p className="text-xs text-text-muted mt-1">Review your items before proceeding to checkout</p>
        </div>
        <Button variant="ghost" size="sm" onClick={clearCart} className="text-status-error hover:bg-status-error/10">
          Clear Cart
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart items list */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div
              key={item.productId}
              className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-2xl glass-card border border-white/10 gap-4"
            >
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl bg-surface-secondary/80 border border-white/10 flex items-center justify-center overflow-hidden shrink-0">
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                  ) : (
                    <ShoppingBag className="w-6 h-6 text-text-muted/40" />
                  )}
                </div>

                <div>
                  <Link
                    to={`/products/${item.productId}`}
                    className="text-sm font-semibold text-text-primary hover:text-primary transition-colors line-clamp-1"
                  >
                    {item.name}
                  </Link>
                  <p className="text-xs text-text-muted mt-0.5">
                    Unit Price: <PriceDisplay amount={item.price} size="sm" />
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between w-full sm:w-auto gap-6 sm:justify-end">
                <QuantitySelector
                  value={item.quantity}
                  onChange={(qty) => updateQuantity(item.productId, qty)}
                  size="sm"
                />

                <div className="text-right min-w-[70px]">
                  <PriceDisplay amount={item.price * item.quantity} size="md" />
                </div>

                <button
                  onClick={() => removeItem(item.productId)}
                  className="p-2 rounded-xl text-text-muted hover:text-status-error hover:bg-status-error/10 transition-colors cursor-pointer"
                  aria-label="Remove item"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}

          <div className="pt-2">
            <Link
              to={ROUTES.PRODUCTS}
              className="inline-flex items-center gap-2 text-xs font-medium text-text-muted hover:text-text-primary transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Continue Shopping</span>
            </Link>
          </div>
        </div>

        {/* Summary */}
        <div>
          <GlassCard className="p-6 border-white/10 space-y-5 sticky top-24">
            <h3 className="text-base font-semibold text-text-primary pb-3 border-b border-white/10">
              Order Summary
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between text-text-secondary">
                <span>Subtotal</span>
                <PriceDisplay amount={subtotal} size="sm" />
              </div>

              <div className="flex justify-between text-text-secondary">
                <span>Estimated Shipping</span>
                <span>{shipping === 0 ? <span className="text-status-success font-semibold">Free</span> : `$${shipping.toFixed(2)}`}</span>
              </div>

              <div className="flex justify-between text-text-secondary">
                <span>Estimated Tax (8%)</span>
                <PriceDisplay amount={tax} size="sm" />
              </div>

              <div className="pt-3 border-t border-white/10 flex justify-between text-base font-bold text-text-primary">
                <span>Total</span>
                <PriceDisplay amount={total} size="lg" />
              </div>
            </div>

            <Button
              variant="primary"
              size="lg"
              className="w-full justify-between"
              onClick={() => navigate(ROUTES.CHECKOUT)}
              icon={ArrowRight}
              iconPosition="right"
            >
              Proceed to Checkout
            </Button>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
