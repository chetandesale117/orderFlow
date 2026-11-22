export const ROUTES = {
  // Public Storefront
  HOME: '/',
  PRODUCTS: '/products',
  PRODUCT_DETAIL: '/products/:slug',
  CART: '/cart',
  
  // Auth
  LOGIN: '/login',
  REGISTER: '/register',
  
  // Customer Protected
  CHECKOUT: '/checkout',
  ORDERS: '/orders',
  ORDER_DETAIL: '/orders/:id',
  PROFILE: '/profile',
  NOTIFICATIONS: '/notifications',
  
  // Admin Protected
  ADMIN_DASHBOARD: '/admin',
  ADMIN_PRODUCTS: '/admin/products',
  ADMIN_CATEGORIES: '/admin/categories',
  ADMIN_INVENTORY: '/admin/inventory',
  ADMIN_ORDERS: '/admin/orders',
  ADMIN_ORDER_DETAIL: '/admin/orders/:id',
  ADMIN_PAYMENTS: '/admin/payments',
  ADMIN_USERS: '/admin/users',
  
  // Errors
  FORBIDDEN: '/forbidden',
  NOT_FOUND: '/404',
};
