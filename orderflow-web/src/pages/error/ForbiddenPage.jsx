import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, Home } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { GlassCard } from '../../components/common/GlassCard';
import { ROUTES } from '../../config/routes';

export function ForbiddenPage() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <GlassCard className="max-w-md w-full p-8 text-center border-status-error/30 bg-status-error/5 space-y-5">
        <div className="w-16 h-16 rounded-2xl bg-status-error/15 border border-status-error/30 flex items-center justify-center mx-auto text-status-error">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <div>
          <h1 className="text-4xl font-extrabold font-mono text-status-error tracking-tight">403</h1>
          <h2 className="text-base font-semibold text-text-primary mt-1">Access Forbidden</h2>
          <p className="text-xs text-text-muted mt-2 leading-relaxed">
            You do not have the administrative privileges required to access the OrderFlow Admin Console.
          </p>
        </div>

        <div className="pt-2 flex justify-center gap-3">
          <Link to={ROUTES.HOME}>
            <Button variant="secondary" size="sm" icon={Home}>
              Return to Storefront
            </Button>
          </Link>
        </div>
      </GlassCard>
    </div>
  );
}
