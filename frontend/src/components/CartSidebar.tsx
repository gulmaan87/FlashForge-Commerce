'use client';

import React from 'react';
import Link from 'next/link';
import { X, Minus, Plus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from './Providers';

function formatPrice(cents: number) {
  return (cents / 100).toFixed(2);
}

export default function CartSidebar() {
  const { items, isOpen, total, itemCount, removeItem, updateQty, clearCart, closeCart } = useCart();

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50"
        style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)' }}
        onClick={closeCart}
        aria-hidden="true"
      />

      {/* Drawer — full width on xs, capped at 400px on sm+ */}
      <aside
        className="animate-slideInRight fixed right-0 top-0 z-50 h-full flex flex-col cart-sidebar"
        style={{
          width: 'min(100vw, 400px)',
          background: 'var(--bg-secondary)',
          borderLeft: '1px solid var(--border)',
          /* Safe area on notched phones */
          paddingRight: 'env(safe-area-inset-right)',
        }}
        role="dialog"
        aria-label="Shopping cart"
      >
        {/* Header */}
        <div
          className="flex items-center justify-between"
          style={{
            padding: 'clamp(1rem, 3vw, 1.25rem) clamp(1rem, 4vw, 1.5rem)',
            borderBottom: '1px solid var(--border)',
          }}
        >
          <h2 className="font-semibold text-lg flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 flex-shrink-0" style={{ color: 'var(--accent)' }} />
            Cart
            {itemCount > 0 && (
              <span className="text-sm font-normal" style={{ color: 'var(--text-secondary)' }}>
                ({itemCount} {itemCount === 1 ? 'item' : 'items'})
              </span>
            )}
          </h2>
          <button
            onClick={closeCart}
            className="flex items-center justify-center rounded-lg transition-colors hover:bg-white/10"
            style={{ width: 36, height: 36 }}
            aria-label="Close cart"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Items — scrollable */}
        <div
          className="flex-1 overflow-y-auto"
          style={{ padding: 'clamp(0.75rem, 3vw, 1.25rem)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}
        >
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 gap-3 text-center"
              style={{ color: 'var(--text-muted)' }}>
              <ShoppingBag className="w-12 h-12 opacity-30" />
              <p className="text-sm">Your cart is empty</p>
              <button onClick={closeCart} className="text-sm" style={{ color: 'var(--accent)' }}>
                Continue shopping
              </button>
            </div>
          ) : (
            items.map(item => (
              <div
                key={item.productId}
                className="flex gap-3 rounded-xl"
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  padding: 'clamp(0.6rem, 2vw, 0.75rem)',
                }}
              >
                {/* Thumbnail */}
                <div
                  className="rounded-lg flex items-center justify-center text-xl flex-shrink-0"
                  style={{ width: 56, height: 56, background: 'var(--bg-secondary)', minWidth: 56 }}
                >
                  🛍️
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{item.product.name}</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                    ${formatPrice(item.price)} each
                  </p>

                  {/* Controls row — wraps on tiny screens */}
                  <div className="flex items-center justify-between gap-2 mt-2 flex-wrap">
                    {/* Qty */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => updateQty(item.productId, item.quantity - 1)}
                        className="flex items-center justify-center rounded-md transition-colors hover:bg-white/10"
                        style={{ width: 26, height: 26, border: '1px solid var(--border)' }}
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-sm font-medium w-5 text-center tabular-nums">{item.quantity}</span>
                      <button
                        onClick={() => updateQty(item.productId, item.quantity + 1)}
                        className="flex items-center justify-center rounded-md transition-colors hover:bg-white/10"
                        style={{ width: 26, height: 26, border: '1px solid var(--border)' }}
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm" style={{ color: 'var(--accent)' }}>
                        ${formatPrice(item.price * item.quantity)}
                      </span>
                      <button
                        onClick={() => removeItem(item.productId)}
                        className="flex items-center justify-center transition-colors hover:text-red-400"
                        style={{ width: 26, height: 26, color: 'var(--text-muted)' }}
                        aria-label={`Remove ${item.product.name}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div
            style={{
              borderTop: '1px solid var(--border)',
              padding: 'clamp(0.75rem, 3vw, 1.25rem) clamp(1rem, 4vw, 1.5rem)',
              paddingBottom: 'max(clamp(0.75rem, 3vw, 1.25rem), env(safe-area-inset-bottom))',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.875rem',
            }}
          >
            {/* Subtotal */}
            <div className="flex justify-between text-sm" style={{ color: 'var(--text-secondary)' }}>
              <span>Subtotal</span>
              <span className="font-semibold text-white">${formatPrice(total)}</span>
            </div>

            {/* Checkout */}
            <Link href="/checkout" onClick={closeCart} className="block w-full">
              <button className="btn-accent w-full justify-center text-base">
                Checkout
                <ArrowRight className="w-4 h-4" />
              </button>
            </Link>

            <button
              onClick={clearCart}
              className="w-full text-sm text-center transition-colors hover:text-red-400 py-1"
              style={{ color: 'var(--text-muted)' }}
            >
              Clear cart
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
