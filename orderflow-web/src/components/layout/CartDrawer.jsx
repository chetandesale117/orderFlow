import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCartStore } from '../../stores/cartStore';
import { useUIStore } from '../../stores/uiStore';
import { Button } from '../common/Button';
import { PriceDisplay } from '../common/PriceDisplay';
import { QuantitySelector } from '../common/QuantitySelector';
import { ROUTES } from '../../config/routes';

export function CartDrawer() {
  const navigate = useNavigate();
  const { isCartDrawerOpen, closeCartDrawer } = useUIStore();
  const { items, removeItem, updateQuantity, getSubtotal, getItemCount } = useCartStore();

  const subtotal = getSubtotal();
  const shipping = subtotal > 100 || subtotal === 0 ? 0 : 9.99;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  const handleCheckout = () => {
    closeCartDrawer();
    navigate(ROUTES.CHECKOUT);
  };

  return (
    <AnimatePresence>
      {isCartDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCartDrawer}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm cursor-pointer"
          />

          {/* Drawer container */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="relative w-full max-w-md h-full bg-surface-primary/95 glass-card border-l border-white/10 shadow-2xl flex flex-col z-10"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <ShoppingBag className="w-5 h-5 text-primary" />
                <h3 className="text-base font-semibold text-text-primary">
                  Shopping Cart ({getItemCount()})
                </h3>
              </div>
              <button
                onClick={closeCartDrawer}
                className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-white/10 transition-colors"
                aria-label="Close cart drawer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Items list */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6">
                  <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-text-muted mb-4">
                    <ShoppingBag className="w-8 h-8" />
                  </div>
                  <h4 className="text-base font-semibold text-text-primary mb-1">
                    Your cart is empty
                  </h4>
                  <p className="text-xs text-text-muted max-w-xs mb-6">
                    Looks like you haven't added any products to your bag yet.
                  </p>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      closeCartDrawer();
                      navigate(ROUTES.PRODUCTS);
                    }}
                  >
                    Start Shopping
                  </Button>
                </div>
              ) : (
                items.map((item) => (
                  <div
                    key={item.productId}
                    className="flex gap-4 p-3.5 rounded-xl glass border border-white/5 bg-white/[0.02] hover:border-white/15 transition-all"
                  >
                    {/* Thumbnail */}
                    <div className="w-16 h-16 rounded-lg bg-surface-secondary/80 border border-white/10 flex items-center justify-center overflow-hidden shrink-0">
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <ShoppingBag className="w-6 h-6 text-text-muted/40" />
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-sm font-medium text-text-primary truncate">
                          {item.name}
                        </h4>
                        <button
                          onClick={() => removeItem(item.productId)}
                          className="text-text-muted hover:text-status-error transition-colors p-1"
                          aria-label="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="flex items-center justify-between mt-2">
                        <PriceDisplay amount={item.price} size="sm" />
                        <QuantitySelector
                          size="sm"
                          value={item.quantity}
                          onChange={(qty) => updateQuantity(item.productId, qty)}
                        />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer / Summary */}
            {items.length > 0 && (
              <div className="p-5 border-t border-white/10 bg-surface-secondary/40 space-y-3">
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between text-text-secondary">
                    <span>Subtotal</span>
                    <PriceDisplay amount={subtotal} size="sm" />
                  </div>
                  <div className="flex justify-between text-text-secondary">
                    <span>Estimated Shipping</span>
                    <span>{shipping === 0 ? <span className="text-status-success">Free</span> : `$${shipping.toFixed(2)}`}</span>
                  </div>
                  <div className="flex justify-between text-text-secondary">
                    <span>Estimated Tax (8%)</span>
                    <PriceDisplay amount={tax} size="sm" />
                  </div>
                  <div className="pt-2 border-t border-white/10 flex justify-between text-sm font-semibold text-text-primary">
                    <span>Total</span>
                    <PriceDisplay amount={total} size="md" />
                  </div>
                </div>

                <Button
                  variant="primary"
                  className="w-full justify-between"
                  onClick={handleCheckout}
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
