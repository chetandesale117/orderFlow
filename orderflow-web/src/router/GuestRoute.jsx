import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { ROUTES } from '../config/routes';

export function GuestRoute({ children }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const location = useLocation();

  if (isAuthenticated) {
    const from = location.state?.from?.pathname || ROUTES.HOME;
    return <Navigate to={from} replace />;
  }

  return children;
}
