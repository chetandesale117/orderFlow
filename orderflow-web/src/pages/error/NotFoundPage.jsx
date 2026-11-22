import React from 'react';
import { Link } from 'react-router-dom';
import { Layers, Home, ArrowLeft } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { GlassCard } from '../../components/common/GlassCard';
import { ROUTES } from '../../config/routes';

export function NotFoundPage() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <GlassCard className="max-w-md w-full p-8 text-center border-white/10 space-y-5">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto text-primary">
          <Layers className="w-8 h-8" />
        </div>

        <div>
          <h1 className="text-4xl font-extrabold font-mono text-text-primary tracking-tight">404</h1>
          <h2 className="text-base font-semibold text-text-secondary mt-1">Page Not Found</h2>
          <p className="text-xs text-text-muted mt-2 leading-relaxed">
            The route you navigated to does not exist in the OrderFlow client application.
          </p>
        </div>

        <div className="pt-2 flex justify-center gap-3">
          <Link to={ROUTES.HOME}>
            <Button variant="primary" size="sm" icon={Home}>
              Return Home
            </Button>
          </Link>
        </div>
      </GlassCard>
    </div>
  );
}
