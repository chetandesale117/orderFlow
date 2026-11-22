import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  Zap,
  ShieldCheck,
  Truck,
  RotateCcw,
  Boxes,
  Cpu,
} from 'lucide-react';
import { Breadcrumb } from '../../components/common/Breadcrumb';
import { PriceDisplay } from '../../components/common/PriceDisplay';
import { QuantitySelector } from '../../components/common/QuantitySelector';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { StatusBadge } from '../../components/common/StatusBadge';
import { GlassCard } from '../../components/common/GlassCard';
import { Skeleton } from '../../components/common/Skeleton';
import { useProduct } from '../../hooks/api/useProducts';
import { useStock } from '../../hooks/api/useInventory';
import { useCartStore } from '../../stores/cartStore';
import { useUIStore } from '../../stores/uiStore';
import { toast } from 'sonner';
import { ROUTES } from '../../config/routes';

export function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);

  const { data: product, isLoading: productLoading } = useProduct(id);
  const { data: stockData, isLoading: stockLoading } = useStock(id);

  const addItem = useCartStore((s) => s.addItem);
  const openCartDrawer = useUIStore((s) => s.openCartDrawer);

  const availableStock = stockData?.availableQuantity ?? product?.availableStock ?? 0;
  const isOutOfStock = availableStock <= 0;

  const handleAddToCart = () => {
    if (isOutOfStock) {
      toast.error('Item is currently out of stock');
      return;
    }

    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      imageUrl: product.imageUrl || (product.images && product.images[0]),
      quantity,
    });

    toast.success(`Added ${quantity} x ${product.name} to cart`);
    openCartDrawer();
  };

  const handleBuyNow = () => {
    if (isOutOfStock) {
      toast.error('Item is out of stock');
      return;
    }

    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      imageUrl: product.imageUrl || (product.images && product.images[0]),
      quantity,
    });

    navigate(ROUTES.CHECKOUT);
  };

  if (productLoading) {
    return (
      <div className="space-y-6 pb-12">
        <Skeleton className="h-4 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <Skeleton className="aspect-square w-full rounded-2xl" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-12 w-1/2" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="p-12 text-center rounded-2xl glass-card border border-white/10">
        <h2 className="text-lg font-bold text-text-primary">Product Not Found</h2>
        <p className="text-xs text-text-muted mt-2">The product you are looking for does not exist.</p>
        <Button
          variant="secondary"
          size="sm"
          className="mt-4"
          onClick={() => navigate(ROUTES.PRODUCTS)}
        >
          Back to Catalog
        </Button>
      </div>
    );
  }

  const breadcrumbs = [
    { label: 'Products', to: ROUTES.PRODUCTS },
    ...(product.categoryName ? [{ label: product.categoryName }] : []),
    { label: product.name },
  ];

  return (
    <div className="space-y-8 pb-12">
      <Breadcrumb items={breadcrumbs} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Gallery / Image */}
        <div className="relative aspect-square rounded-2xl glass-card border border-white/10 bg-surface-secondary/60 overflow-hidden flex items-center justify-center p-8">
          {product.imageUrl || (product.images && product.images[0]) ? (
            <img
              src={product.imageUrl || product.images[0]}
              alt={product.name}
              className="w-full h-full object-contain"
            />
          ) : (
            <div className="text-text-muted/40 flex flex-col items-center">
              <ShoppingBag className="w-20 h-20 mb-2" />
              <span className="text-xs font-mono">Product Image</span>
            </div>
          )}

          {product.categoryName && (
            <div className="absolute top-4 left-4">
              <Badge variant="secondary" size="md">
                {product.categoryName}
              </Badge>
            </div>
          )}
        </div>

        {/* Product Details & Actions */}
        <div className="flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-mono text-text-muted">
                  SKU: {product.sku || product.id?.substring(0, 8)}
                </span>
                <span className="text-white/20">&bull;</span>
                <StatusBadge
                  status={isOutOfStock ? 'OUT_OF_STOCK' : availableStock < 10 ? 'LOW_STOCK' : 'IN_STOCK'}
                  size="sm"
                />
              </div>

              <h1 className="text-2xl sm:text-3xl font-bold text-text-primary">
                {product.name}
              </h1>
            </div>

            <PriceDisplay amount={product.price} size="xl" />

            <div className="pt-2 pb-4 border-y border-white/10">
              <p className="text-sm text-text-secondary leading-relaxed">
                {product.description ||
                  'Enterprise-grade quality product synchronized across inventory and catalog microservices.'}
              </p>
            </div>

            {/* Inventory count pill */}
            <div className="flex items-center gap-3 text-xs text-text-muted font-mono">
              <Boxes className="w-4 h-4 text-primary" />
              <span>Available in real-time inventory:</span>
              <span className="text-text-primary font-bold">
                {stockLoading ? 'Checking...' : `${availableStock} units`}
              </span>
            </div>

            {/* Quantity and Actions */}
            <div className="pt-4 space-y-4">
              <div className="flex items-center gap-4">
                <span className="text-xs font-medium text-text-secondary">Quantity:</span>
                <QuantitySelector
                  value={quantity}
                  onChange={setQuantity}
                  min={1}
                  max={Math.max(1, availableStock)}
                  disabled={isOutOfStock}
                />
              </div>

              <div className="flex flex-wrap sm:flex-nowrap gap-3 pt-2">
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full"
                  disabled={isOutOfStock}
                  onClick={handleAddToCart}
                  icon={ShoppingBag}
                >
                  Add to Cart
                </Button>
                <Button
                  variant="secondary"
                  size="lg"
                  className="w-full sm:w-auto px-8"
                  disabled={isOutOfStock}
                  onClick={handleBuyNow}
                  icon={Zap}
                >
                  Buy Now
                </Button>
              </div>
            </div>
          </div>

          {/* Microservices Architecture Context Note */}
          <GlassCard className="p-4 border-white/10 bg-white/[0.02]">
            <div className="flex items-start gap-3 text-xs">
              <Cpu className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-semibold text-text-primary">OrderFlow Microservices Guarantee</p>
                <p className="text-text-muted leading-relaxed">
                  When you checkout, Order Service coordinates an event-driven Saga via Apache Kafka.
                  Inventory will be optimistically locked and confirmed in under 1 second.
                </p>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
