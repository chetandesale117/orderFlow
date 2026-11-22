import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  ShieldCheck,
  Zap,
  GitBranch,
  Layers,
  Database,
  Cpu,
  Package,
} from 'lucide-react';
import { Button } from '../../components/common/Button';
import { GlassCard } from '../../components/common/GlassCard';
import { ProductCard } from '../../components/features/products/ProductCard';
import { Skeleton } from '../../components/common/Skeleton';
import { useProducts } from '../../hooks/api/useProducts';
import { ROUTES } from '../../config/routes';

export function HomePage() {
  const { data: productsData, isLoading } = useProducts({ size: 8 });
  const products = productsData?.content || [];

  return (
    <div className="space-y-20 pb-12">
      {/* Hero Section */}
      <section className="relative pt-8 sm:pt-16 pb-12 text-center flex flex-col items-center">
        {/* Ambient background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 max-w-3xl h-80 bg-primary/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-4xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass border border-primary/30 text-xs font-mono text-primary-light mb-2 shadow-lg shadow-primary/10">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
            </span>
            <span>MICROSERVICES PLATFORM &bull; SAGA PATTERN</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-text-primary leading-[1.1]">
            Next-Gen E-Commerce with{' '}
            <span className="bg-gradient-to-r from-primary via-accent to-purple-400 bg-clip-text text-transparent">
              Event-Driven Saga
            </span>
          </h1>

          <p className="text-base sm:text-lg text-text-secondary max-w-2xl mx-auto leading-relaxed">
            High-concurrency microservices architecture orchestrated via Apache Kafka,
            transactional outbox schedules, optimistic inventory locking, and real-time state visualization.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Link to={ROUTES.PRODUCTS}>
              <Button size="lg" variant="primary" icon={ArrowRight} iconPosition="right">
                Explore Catalog
              </Button>
            </Link>
            <Link to={ROUTES.ADMIN_DASHBOARD}>
              <Button size="lg" variant="secondary" icon={ShieldCheck}>
                Admin Operations
              </Button>
            </Link>
          </div>

          {/* Quick metric pills */}
          <div className="pt-10 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto">
            <div className="p-4 rounded-xl glass border border-white/5 bg-white/[0.02] text-center">
              <p className="text-2xl font-bold font-mono text-text-primary">8</p>
              <p className="text-[11px] text-text-muted mt-1 uppercase tracking-wider">
                Microservices
              </p>
            </div>
            <div className="p-4 rounded-xl glass border border-white/5 bg-white/[0.02] text-center">
              <p className="text-2xl font-bold font-mono text-status-success">100%</p>
              <p className="text-[11px] text-text-muted mt-1 uppercase tracking-wider">
                Event Idempotency
              </p>
            </div>
            <div className="p-4 rounded-xl glass border border-white/5 bg-white/[0.02] text-center">
              <p className="text-2xl font-bold font-mono text-primary-light">RS256</p>
              <p className="text-[11px] text-text-muted mt-1 uppercase tracking-wider">
                Token Rotation
              </p>
            </div>
            <div className="p-4 rounded-xl glass border border-white/5 bg-white/[0.02] text-center">
              <p className="text-2xl font-bold font-mono text-text-primary">&lt;5ms</p>
              <p className="text-[11px] text-text-muted mt-1 uppercase tracking-wider">
                Redis Cache Latency
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="space-y-6">
        <div className="flex items-end justify-between border-b border-white/10 pb-4">
          <div>
            <h2 className="text-2xl font-bold text-text-primary">Featured Products</h2>
            <p className="text-xs text-text-muted mt-1">
              Curated items ready for synchronous distributed ordering
            </p>
          </div>
          <Link
            to={ROUTES.PRODUCTS}
            className="text-xs font-semibold text-primary hover:text-primary-light flex items-center gap-1 transition-colors"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, idx) => (
              <div key={idx} className="space-y-3 p-4 rounded-2xl glass border border-white/5">
                <Skeleton className="aspect-square w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="p-12 text-center rounded-2xl glass-card border border-white/10">
            <Package className="w-10 h-10 text-text-muted mx-auto mb-3" />
            <p className="text-sm text-text-secondary">No products currently seeded in catalog.</p>
            <Link to={ROUTES.ADMIN_PRODUCTS} className="mt-4 inline-block">
              <Button size="sm" variant="secondary">
                Create First Product in Admin
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* Architecture Highlights */}
      <section className="space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-2xl font-bold text-text-primary">Engineering Highlights</h2>
          <p className="text-xs text-text-muted">
            Engineered from ground up with enterprise-grade distributed patterns
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <GlassCard className="border-white/10 p-6 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary-light flex items-center justify-center">
              <Cpu className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-text-primary">Saga State Machine</h3>
            <p className="text-xs text-text-muted leading-relaxed">
              Order flow coordinates step-by-step stock reservation, sandbox payment authorization,
              and automatic rollbacks on failures with real-time browser polling.
            </p>
          </GlassCard>

          <GlassCard className="border-white/10 p-6 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-accent/10 text-accent flex items-center justify-center">
              <GitBranch className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-text-primary">Transactional Outbox</h3>
            <p className="text-xs text-text-muted leading-relaxed">
              Guarantees at-least-once message delivery to Kafka topics without distributed two-phase
              commit locks, preventing dual-write state divergences.
            </p>
          </GlassCard>

          <GlassCard className="border-white/10 p-6 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-status-success/10 text-status-success flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-text-primary">RS256 & Token Rotation</h3>
            <p className="text-xs text-text-muted leading-relaxed">
              Asymmetric cryptographic signing allows Spring Cloud Gateway to verify JWTs locally.
              Refresh token rotation instantly revokes stolen token families.
            </p>
          </GlassCard>
        </div>
      </section>
    </div>
  );
}
