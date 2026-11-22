import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  Layers,
  User,
  LogOut,
  Shield,
  Bell,
  Menu,
  X,
  Package,
} from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { useCartStore } from '../../stores/cartStore';
import { useUIStore } from '../../stores/uiStore';
import { useLogout } from '../../hooks/api/useAuth';
import { Button } from '../common/Button';
import { Avatar } from '../common/Avatar';
import { ROUTES } from '../../config/routes';

export function Navbar() {
  const navigate = useNavigate();
  const { user, isAuthenticated, isAdmin } = useAuthStore();
  const cartItemCount = useCartStore((s) => s.getItemCount());
  const openCartDrawer = useUIStore((s) => s.openCartDrawer);
  const logoutMutation = useLogout();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full glass border-b border-white/10 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/25 group-hover:scale-105 transition-transform">
            <Layers className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-text-primary to-text-secondary bg-clip-text text-transparent">
            OrderFlow
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          <Link
            to={ROUTES.PRODUCTS}
            className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
          >
            Products
          </Link>
          {isAuthenticated && (
            <Link
              to={ROUTES.ORDERS}
              className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
            >
              My Orders
            </Link>
          )}
          {isAdmin() && (
            <Link
              to={ROUTES.ADMIN_DASHBOARD}
              className="text-sm font-medium text-primary-light hover:text-primary transition-colors flex items-center gap-1.5"
            >
              <Shield className="w-3.5 h-3.5" />
              Admin Portal
            </Link>
          )}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {/* Notifications */}
          {isAuthenticated && (
            <Link
              to={ROUTES.NOTIFICATIONS}
              className="p-2 rounded-xl text-text-muted hover:text-text-primary hover:bg-white/10 transition-colors"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5" />
            </Link>
          )}

          {/* Cart Button */}
          <button
            onClick={openCartDrawer}
            className="relative p-2.5 rounded-xl glass hover:bg-white/10 border border-white/10 text-text-primary transition-colors cursor-pointer"
            aria-label="Open Cart"
          >
            <ShoppingBag className="w-5 h-5" />
            {cartItemCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-gradient-to-r from-primary to-accent text-white text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-lg shadow-primary/40 animate-scale-in">
                {cartItemCount > 99 ? '99+' : cartItemCount}
              </span>
            )}
          </button>

          {/* Auth Menu */}
          {isAuthenticated ? (
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 p-1 pl-2 rounded-xl glass hover:bg-white/10 border border-white/10 cursor-pointer"
              >
                <span className="hidden sm:inline-block text-xs font-medium text-text-primary max-w-[120px] truncate">
                  {user?.fullName || user?.email}
                </span>
                <Avatar name={user?.fullName || user?.email} size="sm" />
              </button>

              {userDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setUserDropdownOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-56 rounded-2xl glass-card border border-white/15 bg-surface-secondary/95 shadow-2xl py-2 z-50 animate-scale-in">
                    <div className="px-4 py-2 border-b border-white/10">
                      <p className="text-sm font-semibold text-text-primary truncate">
                        {user?.fullName || 'User'}
                      </p>
                      <p className="text-xs text-text-muted truncate">{user?.email}</p>
                    </div>

                    <div className="py-1">
                      <Link
                        to={ROUTES.PROFILE}
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-white/10"
                      >
                        <User className="w-4 h-4" /> Profile & Addresses
                      </Link>
                      <Link
                        to={ROUTES.ORDERS}
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-white/10"
                      >
                        <Package className="w-4 h-4" /> Order History
                      </Link>
                      {isAdmin() && (
                        <Link
                          to={ROUTES.ADMIN_DASHBOARD}
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-sm text-primary-light hover:text-primary hover:bg-white/10"
                        >
                          <Shield className="w-4 h-4" /> Admin Console
                        </Link>
                      )}
                    </div>

                    <div className="pt-1 border-t border-white/10">
                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          logoutMutation.mutate();
                        }}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-status-error hover:bg-status-error/10 cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" /> Sign Out
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(ROUTES.LOGIN)}
              >
                Sign In
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => navigate(ROUTES.REGISTER)}
              >
                Get Started
              </Button>
            </div>
          )}

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl text-text-muted hover:text-text-primary hover:bg-white/10"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile navigation panel */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-white/10 bg-surface-secondary/95 px-4 py-4 space-y-3">
          <Link
            to={ROUTES.PRODUCTS}
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-medium text-text-secondary hover:text-text-primary"
          >
            Products
          </Link>
          {isAuthenticated && (
            <Link
              to={ROUTES.ORDERS}
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-medium text-text-secondary hover:text-text-primary"
            >
              My Orders
            </Link>
          )}
          {isAdmin() && (
            <Link
              to={ROUTES.ADMIN_DASHBOARD}
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-medium text-primary-light hover:text-primary"
            >
              Admin Portal
            </Link>
          )}
          {!isAuthenticated && (
            <div className="pt-3 border-t border-white/10 flex flex-col gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigate(ROUTES.LOGIN);
                }}
              >
                Sign In
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigate(ROUTES.REGISTER);
                }}
              >
                Get Started
              </Button>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
