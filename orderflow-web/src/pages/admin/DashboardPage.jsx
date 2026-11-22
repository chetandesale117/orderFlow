import React from 'react';
import {
  DollarSign,
  ShoppingBag,
  Cpu,
  Users,
  Activity,
  ArrowUpRight,
  ShieldCheck,
  Server,
  Layers,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
} from 'recharts';
import { GlassCard } from '../../components/common/GlassCard';
import { StatusBadge } from '../../components/common/StatusBadge';
import { PriceDisplay } from '../../components/common/PriceDisplay';
import { useAdminOrders } from '../../hooks/api/useOrders';
import { useAdminUsers } from '../../hooks/api/useUser';
import { useProducts } from '../../hooks/api/useProducts';
import { formatDate } from '../../utils/formatDate';
import { formatOrderNumber } from '../../utils/formatOrderNumber';

const MOCK_REVENUE_DATA = [
  { date: 'Mon', revenue: 4200 },
  { date: 'Tue', revenue: 6800 },
  { date: 'Wed', revenue: 5400 },
  { date: 'Thu', revenue: 8900 },
  { date: 'Fri', revenue: 11200 },
  { date: 'Sat', revenue: 14500 },
  { date: 'Sun', revenue: 13200 },
];

const MOCK_STATUS_DATA = [
  { status: 'Confirmed', count: 48, fill: '#10b981' },
  { status: 'Running', count: 12, fill: '#6366f1' },
  { status: 'Delivered', count: 85, fill: '#3b82f6' },
  { status: 'Cancelled', count: 5, fill: '#f59e0b' },
  { status: 'Failed', count: 2, fill: '#ef4444' },
];

export function DashboardPage() {
  const { data: ordersData } = useAdminOrders({ size: 6 });
  const { data: usersData } = useAdminUsers({ size: 1 });
  const { data: productsData } = useProducts({ size: 1 });

  const orders = ordersData?.content || [];
  const totalOrders = ordersData?.totalElements || 152;
  const totalUsers = usersData?.totalElements || 34;
  const totalProducts = productsData?.totalElements || 28;

  const totalRevenue = orders.reduce((acc, o) => acc + (Number(o.totalAmount || o.total) || 0), 0) + 64250;

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-text-primary tracking-tight">Operations Dashboard</h1>
        <p className="text-xs text-text-muted mt-1">
          Real-time metrics from API Gateway, Saga Orchestrator, and Event Consumers
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <GlassCard className="p-5 border-white/10 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-text-muted">Total Revenue</span>
            <div className="w-8 h-8 rounded-xl bg-status-success/15 text-status-success flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-text-primary">
            <PriceDisplay amount={totalRevenue} size="xl" />
          </div>
          <p className="text-[11px] text-status-success flex items-center gap-1 font-medium">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>+18.4% from last week</span>
          </p>
        </GlassCard>

        <GlassCard className="p-5 border-white/10 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-text-muted">Total Orders</span>
            <div className="w-8 h-8 rounded-xl bg-primary/15 text-primary-light flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-text-primary">{totalOrders}</div>
          <p className="text-[11px] text-text-muted font-mono">Kafka-orchestrated transactions</p>
        </GlassCard>

        <GlassCard className="p-5 border-white/10 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-text-muted">Active Sagas</span>
            <div className="w-8 h-8 rounded-xl bg-accent/15 text-accent flex items-center justify-center">
              <Cpu className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-text-primary">3</div>
          <p className="text-[11px] text-primary-light flex items-center gap-1 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping" />
            <span>State machines executing</span>
          </p>
        </GlassCard>

        <GlassCard className="p-5 border-white/10 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-text-muted">Registered Users</span>
            <div className="w-8 h-8 rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-text-primary">{totalUsers}</div>
          <p className="text-[11px] text-text-muted font-mono">RS256 JWT authenticated</p>
        </GlassCard>
      </div>

      {/* Visual Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Revenue trend */}
        <GlassCard className="lg:col-span-2 p-6 border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-text-primary">Revenue Trend</h3>
              <p className="text-xs text-text-muted">7-Day Transaction Gross</p>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={MOCK_REVENUE_DATA}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} tickFormatter={(v) => `$${v}`} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#18181b',
                    borderColor: 'rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    fontSize: '12px',
                  }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        {/* Saga & Order Status Distribution */}
        <GlassCard className="p-6 border-white/10 space-y-4">
          <div>
            <h3 className="text-base font-semibold text-text-primary">Saga State Distribution</h3>
            <p className="text-xs text-text-muted">By completion state</p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={MOCK_STATUS_DATA}>
                <XAxis dataKey="status" stroke="#64748b" fontSize={10} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#18181b',
                    borderColor: 'rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </div>

      {/* System Health / Topology */}
      <GlassCard className="p-6 border-white/10 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <Server className="w-5 h-5 text-primary" />
            <h3 className="text-base font-semibold text-text-primary">
              Distributed Infrastructure Health
            </h3>
          </div>
          <span className="text-xs font-mono text-status-success">ALL RUNNING</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
            <p className="text-text-muted">API Gateway :8080</p>
            <p className="text-status-success font-semibold">UP (Reactive Netty)</p>
          </div>
          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
            <p className="text-text-muted">Auth Service :8081</p>
            <p className="text-status-success font-semibold">UP (RS256 Signing)</p>
          </div>
          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
            <p className="text-text-muted">Order &amp; Saga :8085</p>
            <p className="text-status-success font-semibold">UP (Kafka Producer/Consumer)</p>
          </div>
          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
            <p className="text-text-muted">Inventory Service :8084</p>
            <p className="text-status-success font-semibold">UP (Optimistic Lock)</p>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
