export const queryKeys = {
  auth: {
    me: ['auth', 'me'],
  },
  users: {
    profile: ['users', 'profile'],
    addresses: ['users', 'addresses'],
    all: (params) => ['admin', 'users', params],
  },
  products: {
    all: (filters) => ['products', 'list', filters],
    detail: (id) => ['products', 'detail', id],
    slug: (slug) => ['products', 'slug', slug],
    categories: ['products', 'categories'],
  },
  inventory: {
    stock: (productId) => ['inventory', 'stock', productId],
    batch: (ids) => ['inventory', 'batch', ...(ids || [])],
  },
  orders: {
    all: (params) => ['orders', 'list', params],
    detail: (id) => ['orders', 'detail', id],
    adminAll: (params) => ['admin', 'orders', params],
  },
  payments: {
    forOrder: (orderId) => ['payments', 'order', orderId],
    adminAll: (params) => ['admin', 'payments', params],
  },
  notifications: {
    all: (params) => ['notifications', 'list', params],
    detail: (id) => ['notifications', 'detail', id],
  },
};
