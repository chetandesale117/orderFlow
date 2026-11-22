import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Layouts
import { StorefrontLayout } from '../components/layout/StorefrontLayout';
import { AuthLayout } from '../components/layout/AuthLayout';
import { AdminLayout } from '../components/layout/AdminLayout';

// Guards
import { ProtectedRoute } from './ProtectedRoute';
import { AdminRoute } from './AdminRoute';
import { GuestRoute } from './GuestRoute';

// Storefront Pages
import { HomePage } from '../pages/storefront/HomePage';
import { ProductsPage } from '../pages/storefront/ProductsPage';
import { ProductDetailPage } from '../pages/storefront/ProductDetailPage';
import { CartPage } from '../pages/storefront/CartPage';
import { CheckoutPage } from '../pages/storefront/CheckoutPage';
import { OrdersPage } from '../pages/storefront/OrdersPage';
import { OrderDetailPage } from '../pages/storefront/OrderDetailPage';
import { ProfilePage } from '../pages/storefront/ProfilePage';
import { NotificationsPage } from '../pages/storefront/NotificationsPage';

// Auth Pages
import { LoginPage } from '../pages/auth/LoginPage';
import { RegisterPage } from '../pages/auth/RegisterPage';

// Admin Pages
import { DashboardPage } from '../pages/admin/DashboardPage';
import { AdminProductsPage } from '../pages/admin/AdminProductsPage';
import { AdminCategoriesPage } from '../pages/admin/AdminCategoriesPage';
import { AdminInventoryPage } from '../pages/admin/AdminInventoryPage';
import { AdminOrdersPage } from '../pages/admin/AdminOrdersPage';
import { AdminOrderDetailPage } from '../pages/admin/AdminOrderDetailPage';
import { AdminPaymentsPage } from '../pages/admin/AdminPaymentsPage';
import { AdminUsersPage } from '../pages/admin/AdminUsersPage';
import { AdminNotificationsPage } from '../pages/admin/AdminNotificationsPage';

// Error Pages
import { NotFoundPage } from '../pages/error/NotFoundPage';
import { ForbiddenPage } from '../pages/error/ForbiddenPage';

import { ROUTES } from '../config/routes';

export function AppRouter() {
  return (
    <Routes>
      {/* Storefront Layout Routes */}
      <Route element={<StorefrontLayout />}>
        <Route path={ROUTES.HOME} element={<HomePage />} />
        <Route path={ROUTES.PRODUCTS} element={<ProductsPage />} />
        <Route path="/products/:id" element={<ProductDetailPage />} />
        <Route path={ROUTES.CART} element={<CartPage />} />

        {/* Protected Storefront Routes */}
        <Route
          path={ROUTES.CHECKOUT}
          element={
            <ProtectedRoute>
              <CheckoutPage />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.ORDERS}
          element={
            <ProtectedRoute>
              <OrdersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/orders/:id"
          element={
            <ProtectedRoute>
              <OrderDetailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.PROFILE}
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.NOTIFICATIONS}
          element={
            <ProtectedRoute>
              <NotificationsPage />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* Auth Layout Routes */}
      <Route element={<AuthLayout />}>
        <Route
          path={ROUTES.LOGIN}
          element={
            <GuestRoute>
              <LoginPage />
            </GuestRoute>
          }
        />
        <Route
          path={ROUTES.REGISTER}
          element={
            <GuestRoute>
              <RegisterPage />
            </GuestRoute>
          }
        />
      </Route>

      {/* Admin Layout Routes */}
      <Route
        element={
          <AdminRoute>
            <AdminLayout />
          </AdminRoute>
        }
      >
        <Route path={ROUTES.ADMIN_DASHBOARD} element={<DashboardPage />} />
        <Route path={ROUTES.ADMIN_PRODUCTS} element={<AdminProductsPage />} />
        <Route path={ROUTES.ADMIN_CATEGORIES} element={<AdminCategoriesPage />} />
        <Route path={ROUTES.ADMIN_INVENTORY} element={<AdminInventoryPage />} />
        <Route path={ROUTES.ADMIN_ORDERS} element={<AdminOrdersPage />} />
        <Route path="/admin/orders/:id" element={<AdminOrderDetailPage />} />
        <Route path={ROUTES.ADMIN_PAYMENTS} element={<AdminPaymentsPage />} />
        <Route path={ROUTES.ADMIN_USERS} element={<AdminUsersPage />} />
        <Route path={ROUTES.ADMIN_NOTIFICATIONS} element={<AdminNotificationsPage />} />
      </Route>

      {/* Error & Fallback Routes */}
      <Route path={ROUTES.FORBIDDEN} element={<ForbiddenPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
