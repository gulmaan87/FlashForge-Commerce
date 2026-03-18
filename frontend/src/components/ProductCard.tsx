'use client';

import React from 'react';
import { ShoppingCart, Zap, Star } from 'lucide-react';
import type { Product } from '@/lib/types';
import { useCart } from './Providers';

interface ProductCardProps {
  product: Product;
  isFlash?: boolean;
  delay?: number;
}

function formatPrice(cents: number) {
  return (cents / 100).toFixed(2);
}

// Deterministic "original price" for demo — 30–50% markup
function fakeOriginalPrice(price: number) {
  return Math.round(price * 1.38);
}

const EMOJI_MAP: Record<number, string> = {
  0: '💻', 1: '📱', 2: '🎧', 3: '⌚', 4: '📷', 5: '🖥️', 6: '🎮', 7: '🖨️',
};

function getEmoji(id: string) {
  const hash = id.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  return EMOJI_MAP[hash % 8] || '📦';
}

export default function ProductCard({ product, isFlash = false, delay = 0 }: ProductCardProps) {
  const { addItem } = useCart();
  const originalPrice = fakeOriginalPrice(product.price);
  const discountPct   = Math.round(((originalPrice - product.price) / originalPrice) * 100);

  return (
    <div
      className="glass-card flex flex-col overflow-hidden cursor-pointer group animate-fadeUp"
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Image Area */}
      <div
        className="relative flex items-center justify-center h-44 text-6xl select-none transition-transform duration-300 group-hover:scale-110"
        style={{ background: 'linear-gradient(135deg, var(--bg-secondary), var(--bg-card-hover))' }}
      >
        {getEmoji(product.id)}

        {/* Flash badge */}
        {isFlash && (
          <div className="absolute top-3 left-3 badge-flash flex items-center gap-1">
            <Zap className="w-3 h-3" fill="white" />
            Flash Deal
          </div>
        )}

        {/* Discount badge */}
        {isFlash && (
          <div
            className="absolute top-3 right-3 text-xs font-bold px-2 py-0.5 rounded-full"
            style={{ background: 'rgba(34,197,94,0.2)', color: 'var(--success)', border: '1px solid rgba(34,197,94,0.3)' }}
          >
            -{discountPct}%
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-col flex-1 p-4 gap-3">
        <div>
          <h3 className="font-semibold text-sm leading-snug line-clamp-2">{product.name}</h3>
          <p className="text-xs mt-1 line-clamp-2" style={{ color: 'var(--text-muted)' }}>
            {product.description}
          </p>
        </div>

        {/* Rating (mock) */}
        <div className="flex items-center gap-1">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className="w-3 h-3"
              fill={i < 4 ? '#f97316' : 'none'}
              style={{ color: i < 4 ? 'var(--accent)' : 'var(--text-muted)' }}
            />
          ))}
          <span className="text-xs ml-1" style={{ color: 'var(--text-muted)' }}>(128)</span>
        </div>

        {/* Price */}
        <div className="flex items-baseline gap-2">
          <span className="font-bold text-xl text-gradient">${formatPrice(product.price)}</span>
          {isFlash && (
            <span className="text-xs line-through" style={{ color: 'var(--text-muted)' }}>
              ${formatPrice(originalPrice)}
            </span>
          )}
        </div>

        {/* SKU */}
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>SKU: {product.sku}</p>

        {/* Add to cart */}
        <button
          onClick={(e) => { e.stopPropagation(); addItem(product); }}
          className="btn-accent mt-auto w-full justify-center text-sm"
        >
          <ShoppingCart className="w-4 h-4" />
          Add to Cart
        </button>
      </div>
    </div>
  );
}
