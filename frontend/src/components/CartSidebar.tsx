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
        style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
        onClick={closeCart}
        aria-hidden="true"
      />

      {/* Drawer */}
      <aside
        className="fixed right-0 top-0 z-50 h-full w-full max-w-sm flex flex-col animate-slideInRight"
        style={{ background: 'var(--bg-secondary)', borderLeft: '1px solid var(--border)' }}
        role="dialog"
        aria-label="Shopping cart"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5" style={{ borderBottom: '1px solid var(--border)' }}>
          <h2 className="font-semibold text-lg flex items-center gap-2">
            <ShoppingBag className="w-5 h-5" style={{ color: 'var(--accent)' }} />
            Cart
            {itemCount > 0 && (
              <span className="text-sm font-normal" style={{ color: 'var(--text-secondary)' }}>
                ({itemCount} {itemCount === 1 ? 'item' : 'items'})
              </span>
            )}
          </h2>
          <button
            onClick={closeCart}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 gap-3" style={{ color: 'var(--text-muted)' }}>
              <ShoppingBag className="w-12 h-12 opacity-40" />
              <p className="text-sm">Your cart is empty</p>
              <button onClick={closeCart} className="text-sm mt-1" style={{ color: 'var(--accent)' }}>
                Continue shopping
              </button>
            </div>
          ) : (
            items.map(item => (
              <div
                key={item.productId}
                className="flex gap-3 p-3 rounded-xl"
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
              >
                {/* Image placeholder */}
                <div
                  className="w-16 h-16 flex-shrink-0 rounded-lg flex items-center justify-center text-2xl"
                  style={{ background: 'var(--bg-secondary)' }}
                >
                  🛍️
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{item.product.name}</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                    ${formatPrice(item.price)} each
                  </p>

                  <div className="flex items-center justify-between mt-2">
                    {/* Qty controls */}
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => updateQty(item.productId, item.quantity - 1)}
                        className="w-6 h-6 rounded-md flex items-center justify-center transition-colors hover:bg-white/10"
                        style={{ border: '1px solid var(--border)' }}
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-sm font-medium w-4 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQty(item.productId, item.quantity + 1)}
                        className="w-6 h-6 rounded-md flex items-center justify-center transition-colors hover:bg-white/10"
                        style={{ border: '1px solid var(--border)' }}
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
                        className="w-6 h-6 rounded-md flex items-center justify-center transition-colors hover:text-red-400"
                        style={{ color: 'var(--text-muted)' }}
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
          <div className="p-5 space-y-4" style={{ borderTop: '1px solid var(--border)' }}>
            <div className="flex justify-between text-sm" style={{ color: 'var(--text-secondary)' }}>
              <span>Subtotal</span>
              <span className="text-white font-semibold">${formatPrice(total)}</span>
            </div>

            <Link href="/checkout" onClick={closeCart} className="block">
              <button className="btn-accent w-full justify-center text-base">
                Checkout
                <ArrowRight className="w-4 h-4" />
              </button>
            </Link>

            <button
              onClick={clearCart}
              className="w-full text-sm text-center transition-colors hover:text-red-400"
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
