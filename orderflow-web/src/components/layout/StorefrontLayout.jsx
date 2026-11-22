import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { CartDrawer } from './CartDrawer';

export function StorefrontLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-surface-primary text-text-primary selection:bg-primary/30 selection:text-white">
      <Navbar />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
      <Footer />
      <CartDrawer />
    </div>
  );
}
