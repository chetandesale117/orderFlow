import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  CreditCard,
  MapPin,
  CheckCircle,
  ShieldCheck,
  ArrowRight,
  Boxes,
} from 'lucide-react';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { GlassCard } from '../../components/common/GlassCard';
import { PriceDisplay } from '../../components/common/PriceDisplay';
import { useCartStore } from '../../stores/cartStore';
import { useAddresses } from '../../hooks/api/useUser';
import { useCreateOrder } from '../../hooks/api/useOrders';
import { ROUTES } from '../../config/routes';
import { toast } from 'sonner';

const addressSchema = z.object({
  fullName: z.string().min(2, 'Name is required'),
  streetLine1: z.string().min(3, 'Address line 1 is required'),
  streetLine2: z.string().optional(),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  postalCode: z.string().min(3, 'Postal code is required'),
  country: z.string().min(2, 'Country is required'),
  phone: z.string().min(5, 'Phone number is required'),
});

export function CheckoutPage() {
  const navigate = useNavigate();
  const { items, getSubtotal } = useCartStore();
  const { data: addressesData } = useAddresses();
  const addresses = addressesData || [];

  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [useCustomAddress, setUseCustomAddress] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('CREDIT_CARD');

  const createOrderMutation = useCreateOrder();

  const subtotal = getSubtotal();
  const shipping = subtotal > 100 || subtotal === 0 ? 0 : 9.99;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      fullName: 'John Doe',
      streetLine1: '123 Distributed Way',
      streetLine2: 'Suite 400',
      city: 'San Francisco',
      state: 'CA',
      postalCode: '94105',
      country: 'USA',
      phone: '+1 555-0199',
    },
  });

  const onSubmit = (formData) => {
    if (items.length === 0) {
      toast.error('Cart is empty. Please add items before placing an order.');
      navigate(ROUTES.PRODUCTS);
      return;
    }

    let shippingAddress = formData;
    if (!useCustomAddress && selectedAddressId) {
      const selected = addresses.find((a) => a.id === selectedAddressId);
      if (selected) {
        shippingAddress = {
          fullName: selected.fullName,
          streetLine1: selected.streetLine1,
          streetLine2: selected.streetLine2,
          city: selected.city,
          state: selected.state,
          postalCode: selected.postalCode,
          country: selected.country,
          phone: selected.phone,
        };
      }
    }

    const payload = {
      items: items.map((i) => ({
        productId: i.productId,
        quantity: i.quantity,
      })),
      shippingAddress,
      paymentMethod,
    };

    createOrderMutation.mutate(payload, {
      onSuccess: (res) => {
        const orderId = res?.id || res?.data?.id || (res && typeof res === 'object' && res.orderNumber ? res.id : null);
        if (orderId) {
          navigate(`/orders/${orderId}`);
        } else {
          navigate(ROUTES.ORDERS);
        }
      },
    });
  };

  if (items.length === 0) {
    return (
      <div className="py-12 text-center">
        <GlassCard className="max-w-md mx-auto p-8 border-white/10">
          <Boxes className="w-12 h-12 text-text-muted mx-auto mb-3" />
          <h2 className="text-lg font-bold text-text-primary">Your cart is empty</h2>
          <p className="text-xs text-text-muted mt-1 mb-6">
            You cannot proceed to checkout without items.
          </p>
          <Button variant="primary" size="sm" onClick={() => navigate(ROUTES.PRODUCTS)}>
            Browse Products
          </Button>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      <div>
        <h1 className="text-3xl font-bold text-text-primary tracking-tight">Checkout</h1>
        <p className="text-xs text-text-muted mt-1">Complete your order to initiate real-time Saga execution</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Step 1: Shipping Address */}
            <GlassCard className="p-6 border-white/10 space-y-5">
              <div className="flex items-center gap-2.5 pb-3 border-b border-white/10">
                <MapPin className="w-5 h-5 text-primary" />
                <h3 className="text-base font-semibold text-text-primary">1. Shipping Address</h3>
              </div>

              {addresses.length > 0 && (
                <div className="space-y-3">
                  <p className="text-xs font-medium text-text-secondary">Select a saved address:</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {addresses.map((addr) => (
                      <div
                        key={addr.id}
                        onClick={() => {
                          setSelectedAddressId(addr.id);
                          setUseCustomAddress(false);
                        }}
                        className={`p-3.5 rounded-xl border text-xs cursor-pointer transition-all ${
                          selectedAddressId === addr.id && !useCustomAddress
                            ? 'border-primary bg-primary/10 text-text-primary'
                            : 'border-white/10 bg-white/[0.02] text-text-muted hover:border-white/20'
                        }`}
                      >
                        <p className="font-semibold text-text-primary">{addr.fullName}</p>
                        <p className="mt-1">{addr.streetLine1}</p>
                        <p>{addr.city}, {addr.state} {addr.postalCode}</p>
                        <p className="mt-1 font-mono">{addr.phone}</p>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => setUseCustomAddress(!useCustomAddress)}
                      className="text-xs text-primary hover:underline font-medium"
                    >
                      {useCustomAddress ? 'Use saved address above' : '+ Enter custom address'}
                    </button>
                  </div>
                </div>
              )}

              {(addresses.length === 0 || useCustomAddress) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="sm:col-span-2">
                    <Input
                      label="Recipient Full Name"
                      error={errors.fullName?.message}
                      {...register('fullName')}
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <Input
                      label="Street Address"
                      error={errors.streetLine1?.message}
                      {...register('streetLine1')}
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <Input
                      label="Apartment, suite, etc. (optional)"
                      error={errors.streetLine2?.message}
                      {...register('streetLine2')}
                    />
                  </div>

                  <Input
                    label="City"
                    error={errors.city?.message}
                    {...register('city')}
                  />

                  <Input
                    label="State / Province"
                    error={errors.state?.message}
                    {...register('state')}
                  />

                  <Input
                    label="Postal Code"
                    error={errors.postalCode?.message}
                    {...register('postalCode')}
                  />

                  <Input
                    label="Country"
                    error={errors.country?.message}
                    {...register('country')}
                  />

                  <div className="sm:col-span-2">
                    <Input
                      label="Phone Number"
                      error={errors.phone?.message}
                      {...register('phone')}
                    />
                  </div>
                </div>
              )}
            </GlassCard>

            {/* Step 2: Payment Method */}
            <GlassCard className="p-6 border-white/10 space-y-4">
              <div className="flex items-center gap-2.5 pb-3 border-b border-white/10">
                <CreditCard className="w-5 h-5 text-primary" />
                <h3 className="text-base font-semibold text-text-primary">2. Payment Method</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div
                  onClick={() => setPaymentMethod('CREDIT_CARD')}
                  className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                    paymentMethod === 'CREDIT_CARD'
                      ? 'border-primary bg-primary/10'
                      : 'border-white/10 bg-white/[0.02] hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <CreditCard className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-xs font-semibold text-text-primary">Sandbox Card (Test Mode)</p>
                      <p className="text-[11px] text-text-muted">Simulates 100% successful payment</p>
                    </div>
                  </div>
                  {paymentMethod === 'CREDIT_CARD' && (
                    <CheckCircle className="w-4 h-4 text-primary" />
                  )}
                </div>

                <div
                  onClick={() => setPaymentMethod('INSTANT_SANDBOX')}
                  className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                    paymentMethod === 'INSTANT_SANDBOX'
                      ? 'border-primary bg-primary/10'
                      : 'border-white/10 bg-white/[0.02] hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="w-5 h-5 text-status-success" />
                    <div>
                      <p className="text-xs font-semibold text-text-primary">Instant Settlement</p>
                      <p className="text-[11px] text-text-muted">Direct microservice confirmation</p>
                    </div>
                  </div>
                  {paymentMethod === 'INSTANT_SANDBOX' && (
                    <CheckCircle className="w-4 h-4 text-primary" />
                  )}
                </div>
              </div>
            </GlassCard>
          </div>

          {/* Right Summary */}
          <div>
            <GlassCard className="p-6 border-white/10 space-y-5 sticky top-24">
              <h3 className="text-base font-semibold text-text-primary pb-3 border-b border-white/10">
                Order Review ({items.length} items)
              </h3>

              <div className="max-h-60 overflow-y-auto space-y-3 pr-1">
                {items.map((i) => (
                  <div key={i.productId} className="flex justify-between text-xs">
                    <span className="text-text-secondary truncate max-w-[180px]">
                      {i.quantity}x {i.name}
                    </span>
                    <PriceDisplay amount={i.price * i.quantity} size="sm" />
                  </div>
                ))}
              </div>

              <div className="pt-3 border-t border-white/10 space-y-2 text-xs">
                <div className="flex justify-between text-text-secondary">
                  <span>Subtotal</span>
                  <PriceDisplay amount={subtotal} size="sm" />
                </div>
                <div className="flex justify-between text-text-secondary">
                  <span>Shipping</span>
                  <span>{shipping === 0 ? <span className="text-status-success font-semibold">Free</span> : `$${shipping.toFixed(2)}`}</span>
                </div>
                <div className="flex justify-between text-text-secondary">
                  <span>Tax (8%)</span>
                  <PriceDisplay amount={tax} size="sm" />
                </div>
                <div className="pt-3 border-t border-white/10 flex justify-between text-base font-bold text-text-primary">
                  <span>Total</span>
                  <PriceDisplay amount={total} size="lg" />
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full justify-between"
                isLoading={createOrderMutation.isPending}
                icon={ArrowRight}
                iconPosition="right"
              >
                Place Order &amp; Start Saga
              </Button>
            </GlassCard>
          </div>
        </div>
      </form>
    </div>
  );
}
