import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { ROUTES } from '../config/routes';

export function AdminRoute({ children }) {
  const { isAuthenticated, isAdmin } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />;
  }

  if (!isAdmin()) {
    return <Navigate to={ROUTES.FORBIDDEN} replace />;
  }

  return children;
}
