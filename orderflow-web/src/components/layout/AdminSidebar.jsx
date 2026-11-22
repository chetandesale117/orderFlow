import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  FolderTree,
  Boxes,
  ShoppingBag,
  CreditCard,
  Users,
  Bell,
  Layers,
  ArrowLeft,
} from 'lucide-react';
import { ROUTES } from '../../config/routes';
import { cn } from '../../utils/cn';

const NAV_ITEMS = [
  { label: 'Dashboard', icon: LayoutDashboard, to: ROUTES.ADMIN_DASHBOARD, exact: true },
  { label: 'Products', icon: Package, to: ROUTES.ADMIN_PRODUCTS },
  { label: 'Categories', icon: FolderTree, to: ROUTES.ADMIN_CATEGORIES },
  { label: 'Inventory', icon: Boxes, to: ROUTES.ADMIN_INVENTORY },
  { label: 'Orders', icon: ShoppingBag, to: ROUTES.ADMIN_ORDERS },
  { label: 'Payments', icon: CreditCard, to: ROUTES.ADMIN_PAYMENTS },
  { label: 'Users', icon: Users, to: ROUTES.ADMIN_USERS },
  { label: 'Notifications', icon: Bell, to: ROUTES.ADMIN_NOTIFICATIONS },
];

export function AdminSidebar({ isOpen, onClose }) {
  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          'fixed top-0 bottom-0 left-0 z-50 w-64 glass-card border-r border-white/10 bg-surface-primary/95 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Brand */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-white/10">
          <Link to={ROUTES.ADMIN_DASHBOARD} className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/20">
              <Layers className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-base bg-gradient-to-r from-white to-text-secondary bg-clip-text text-transparent">
              OrderFlow Admin
            </span>
          </Link>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-1.5">
          <p className="px-3 text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-2">
            Operations
          </p>
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.exact}
              onClick={onClose}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-primary/20 text-white border border-primary/30 shadow-md shadow-primary/10'
                    : 'text-text-secondary hover:text-text-primary hover:bg-white/5'
                )
              }
            >
              <item.icon className="w-4 h-4 shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Return to storefront */}
        <div className="p-4 border-t border-white/10">
          <Link
            to={ROUTES.HOME}
            className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-medium text-text-muted hover:text-text-primary hover:bg-white/5 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Storefront</span>
          </Link>
        </div>
      </aside>
    </>
  );
}
