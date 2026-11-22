import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      // Item schema: { productId, name, sku, price, imageUrl, quantity }

      addItem: (product, quantity = 1) => {
        const items = get().items;
        const existing = items.find((i) => i.productId === product.id);
        if (existing) {
          set({
            items: items.map((i) =>
              i.productId === product.id
                ? { ...i, quantity: i.quantity + quantity }
                : i
            ),
          });
        } else {
          set({
            items: [
              ...items,
              {
                productId: product.id,
                name: product.name,
                sku: product.sku,
                price: Number(product.price),
                imageUrl: product.imageUrl,
                quantity,
              },
            ],
          });
        }
      },

      updateQuantity: (productId, quantity) =>
        set({
          items:
            quantity > 0
              ? get().items.map((i) =>
                  i.productId === productId ? { ...i, quantity } : i
                )
              : get().items.filter((i) => i.productId !== productId),
        }),

      removeItem: (productId) =>
        set({ items: get().items.filter((i) => i.productId !== productId) }),

      clearCart: () => set({ items: [] }),

      getTotal: () =>
        get().items.reduce((s, i) => s + i.price * i.quantity, 0),

      getItemCount: () =>
        get().items.reduce((s, i) => s + i.quantity, 0),
    }),
    { name: 'orderflow-cart' }
  )
);
