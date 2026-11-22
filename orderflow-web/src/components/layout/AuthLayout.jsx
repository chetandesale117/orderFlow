import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Layers } from 'lucide-react';
import { ROUTES } from '../../config/routes';

export function AuthLayout() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 bg-surface-primary relative overflow-hidden">
      {/* Ambient background glow spheres */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl pointer-events-none" />

      {/* Brand header */}
      <div className="mb-8 text-center relative z-10">
        <Link to={ROUTES.HOME} className="inline-flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/30 group-hover:scale-105 transition-transform">
            <Layers className="w-5 h-5 text-white" />
          </div>
          <span className="text-2xl font-bold tracking-tight bg-gradient-to-r from-white via-text-primary to-text-secondary bg-clip-text text-transparent">
            OrderFlow
          </span>
        </Link>
      </div>

      {/* Auth Card Container */}
      <div className="w-full max-w-md relative z-10">
        <Outlet />
      </div>

      {/* Footer minimal info */}
      <div className="mt-8 text-center text-xs text-text-muted relative z-10">
        <p>&copy; {new Date().getFullYear()} OrderFlow Inc. Enterprise Event-Driven Architecture.</p>
      </div>
    </div>
  );
}
