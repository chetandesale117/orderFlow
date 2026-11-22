import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Eye, Check } from 'lucide-react';
import { PriceDisplay } from '../../common/PriceDisplay';
import { Badge } from '../../common/Badge';
import { useCartStore } from '../../../stores/cartStore';
import { toast } from 'sonner';

export function ProductCard({ product }) {
  const addItem = useCartStore((s) => s.addItem);

  const isOutOfStock = product.status === 'OUT_OF_STOCK' || product.availableStock === 0;

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (isOutOfStock) {
      toast.error('Item is currently out of stock');
      return;
    }

    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      imageUrl: product.imageUrl || (product.images && product.images[0]),
      quantity: 1,
    });

    toast.success(`Added ${product.name} to cart`);
  };

  return (
    <Link
      to={`/products/${product.id}`}
      className="group relative flex flex-col rounded-2xl glass-card border border-white/10 hover:border-white/20 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/5 overflow-hidden"
    >
      {/* Thumbnail area */}
      <div className="relative aspect-square w-full bg-surface-secondary/60 overflow-hidden flex items-center justify-center">
        {product.imageUrl || (product.images && product.images[0]) ? (
          <img
            src={product.imageUrl || product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="text-text-muted/30 flex flex-col items-center">
            <ShoppingBag className="w-12 h-12 mb-1" />
            <span className="text-[11px] font-mono">No Image</span>
          </div>
        )}

        {/* Category Pill */}
        {product.categoryName && (
          <div className="absolute top-3 left-3">
            <Badge variant="secondary" size="sm" className="backdrop-blur-md bg-surface-primary/70">
              {product.categoryName}
            </Badge>
          </div>
        )}

        {/* Out of stock overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-surface-primary/80 backdrop-blur-xs flex items-center justify-center">
            <Badge variant="danger" size="md">
              Out of Stock
            </Badge>
          </div>
        )}
      </div>

      {/* Details */}
      <div className="flex-1 p-5 flex flex-col justify-between">
        <div>
          <h3 className="text-sm font-semibold text-text-primary group-hover:text-primary-light transition-colors line-clamp-1 mb-1">
            {product.name}
          </h3>
          <p className="text-xs text-text-muted line-clamp-2 leading-relaxed">
            {product.description || 'High performance item in the OrderFlow catalog.'}
          </p>
        </div>

        <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
          <PriceDisplay amount={product.price} size="md" />

          <button
            type="button"
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className="p-2.5 rounded-xl bg-primary/10 hover:bg-primary text-primary-light hover:text-white border border-primary/20 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            aria-label="Add to cart"
          >
            <ShoppingBag className="w-4 h-4" />
          </button>
        </div>
      </div>
    </Link>
  );
}
