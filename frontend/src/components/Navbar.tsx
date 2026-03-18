'use client';

import React from 'react';
import Link from 'next/link';
import { ShoppingCart, Zap, Package } from 'lucide-react';
import { useCart } from './Providers';

export default function Navbar() {
  const { itemCount, toggleCart } = useCart();

  return (
    <header className="sticky top-0 z-40 w-full border-b" style={{ borderColor: 'var(--border)', background: 'rgba(10,10,15,0.85)', backdropFilter: 'blur(16px)' }}>
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="relative">
            <Zap className="w-7 h-7" style={{ color: 'var(--accent)' }} fill="currentColor" />
            <div className="absolute inset-0 blur-md opacity-50" style={{ background: 'var(--accent)' }} />
          </div>
          <span className="font-bold text-xl tracking-tight">
            <span className="text-gradient">Flash</span>
            <span style={{ color: 'var(--text-primary)' }}>Forge</span>
          </span>
        </Link>

        {/* Nav Links */}
        <div className="hidden md:flex items-center gap-6">
          <Link
            href="/"
            className="text-sm font-medium transition-colors hover:text-orange-400"
            style={{ color: 'var(--text-secondary)' }}
          >
            Flash Deals
          </Link>
          <Link
            href="/products"
            className="text-sm font-medium transition-colors hover:text-orange-400"
            style={{ color: 'var(--text-secondary)' }}
          >
            All Products
          </Link>
          <Link
            href="/orders"
            className="text-sm font-medium transition-colors hover:text-orange-400 flex items-center gap-1.5"
            style={{ color: 'var(--text-secondary)' }}
          >
            <Package className="w-4 h-4" />
            My Orders
          </Link>
        </div>

        {/* Cart Button */}
        <button
          onClick={toggleCart}
          className="relative flex items-center justify-center w-11 h-11 rounded-xl transition-all duration-200"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
          aria-label={`Cart (${itemCount} items)`}
        >
          <ShoppingCart className="w-5 h-5" style={{ color: 'var(--text-primary)' }} />
          {itemCount > 0 && (
            <span
              className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center text-white"
              style={{ background: 'var(--accent)' }}
            >
              {itemCount > 9 ? '9+' : itemCount}
            </span>
          )}
        </button>
      </nav>
    </header>
  );
}
