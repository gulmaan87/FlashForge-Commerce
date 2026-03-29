'use client';

import React, { useRef, MouseEvent } from 'react';
import { ShoppingCart, Zap, Star, Eye } from 'lucide-react';
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

function fakeOriginalPrice(price: number) {
  return Math.round(price * 1.38);
}

const GRADIENTS = [
  'linear-gradient(135deg, #1a0a2e 0%, #16213e 50%, #0f3460 100%)',
  'linear-gradient(135deg, #1a0f0f 0%, #2d1414 50%, #1a0a0a 100%)',
  'linear-gradient(135deg, #0a1a0a 0%, #1a2e1a 50%, #0a1f0a 100%)',
  'linear-gradient(135deg, #1a1a0a 0%, #2e2d14 50%, #1a1900 100%)',
  'linear-gradient(135deg, #0f0f25 0%, #1a1035 50%, #0d0d1f 100%)',
  'linear-gradient(135deg, #1a0a1a 0%, #2e1535 50%, #1a0525 100%)',
];

const ACCENT_COLORS = ['#8b5cf6', '#f97316', '#22c55e', '#f59e0b', '#3b82f6', '#ec4899'];

function getStyle(id: string) {
  const hash = id.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  return {
    gradient: GRADIENTS[hash % GRADIENTS.length],
    accent: ACCENT_COLORS[hash % ACCENT_COLORS.length],
  };
}

function getProductImage(name: string): string {
  const keyMap: Record<string, string> = {
    shirt:   'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400&q=80',
    jacket:  'https://images.unsplash.com/photo-1551537278-a7ed6f48e8e2?w=400&q=80',
    top:     'https://images.unsplash.com/photo-1562572159-4eaaf0db17a0?w=400&q=80',
    bag:     'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&q=80',
    shoes:   'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80',
    tuxedo:  'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=400&q=80',
    tee:     'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&q=80',
    jumper:  'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400&q=80',
    blouse:  'https://images.unsplash.com/photo-1618244972963-dbee1a7edc95?w=400&q=80',
    skirt:   'https://images.unsplash.com/photo-1583496661160-fb5386a2788d?w=400&q=80',
  };
  const n = name.toLowerCase();
  for (const [key, url] of Object.entries(keyMap)) {
    if (n.includes(key)) return url;
  }
  return 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&q=80';
}

export default function ProductCard({ product, isFlash = false, delay = 0 }: ProductCardProps) {
  const { addItem } = useCart();
  const cardRef = useRef<HTMLDivElement>(null);
  const originalPrice = fakeOriginalPrice(product.price);
  const discountPct   = Math.round(((originalPrice - product.price) / originalPrice) * 100);
  const { gradient, accent } = getStyle(product.id);
  const imgSrc = product.imageUrl || getProductImage(product.name);

  // Only apply 3D tilt on non-touch devices
  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    const el = cardRef.current;
    if (!el) return;
    // Skip on touch devices (touches are handled by :active CSS)
    if (window.matchMedia('(hover: none)').matches) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width  - 0.5;
    const y = (e.clientY - rect.top)  / rect.height - 0.5;
    el.style.transform  = `perspective(1000px) rotateY(${x * 10}deg) rotateX(${-y * 10}deg) translateY(-6px) scale(1.02)`;
    el.style.boxShadow  = `${-x * 16}px ${-y * 16}px 50px rgba(0,0,0,0.55), 0 0 35px ${accent}30, 0 0 0 1px ${accent}40`;
  };

  const handleMouseLeave = () => {
    const el = cardRef.current;
    if (!el) return;
    el.style.transform = '';
    el.style.boxShadow = '';
  };

  return (
    <div className="animate-fadeUp" style={{ animationDelay: `${delay}ms` }}>
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="glass-card flex flex-col overflow-hidden cursor-pointer group h-full"
        style={{ transition: 'transform 0.15s ease, box-shadow 0.15s ease, border-color 0.3s ease' }}
      >
        {/* ── Image ── */}
        <div
          className="relative overflow-hidden flex-shrink-0"
          style={{
            /* Fluid image height — shorter on xs, taller on lg */
            height: 'clamp(150px, 30vw, 210px)',
            background: gradient,
          }}
        >
          {imgSrc && (
            <img
              src={imgSrc}
              alt={product.name}
              loading="lazy"
              decoding="async"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              style={{ opacity: 0.85 }}
            />
          )}
          <div className="img-overlay" />

          {/* Flash badge */}
          {isFlash && (
            <div className="absolute top-2.5 left-2.5 badge-flash flex items-center gap-1 z-10">
              <Zap className="w-3 h-3" fill="white" />
              Flash Deal
            </div>
          )}

          {/* Discount & hover quick-view */}
          {isFlash && (
            <div
              className="absolute top-2.5 right-2.5 text-xs font-bold px-2 py-0.5 rounded-full z-10"
              style={{
                background: 'rgba(34,197,94,0.2)', color: '#22c55e',
                border: '1px solid rgba(34,197,94,0.4)', backdropFilter: 'blur(8px)',
              }}
            >
              -{discountPct}%
            </div>
          )}

          {/* Accent bottom line */}
          <div className="absolute bottom-0 left-0 right-0 h-px"
            style={{ background: `linear-gradient(90deg, transparent, ${accent}88, transparent)` }} />

          {/* Hover overlay — hide on touch */}
          <div
            className="absolute inset-0 items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 hidden sm:flex"
            style={{ background: 'rgba(0,0,0,0.3)' }}
          >
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-white text-xs font-semibold"
              style={{ background: 'rgba(249,115,22,0.9)', backdropFilter: 'blur(10px)' }}>
              <Eye className="w-3.5 h-3.5" />
              Quick View
            </div>
          </div>
        </div>

        {/* ── Info ── */}
        <div className="flex flex-col flex-1 gap-2.5" style={{ padding: 'clamp(0.75rem, 2vw, 1rem)' }}>
          {/* Name & description */}
          <div>
            <h3
              className="font-semibold leading-snug line-clamp-2"
              style={{ fontSize: 'clamp(0.8rem, 2vw, 0.9rem)', color: 'var(--text-primary)' }}
            >
              {product.name}
            </h3>
            <p
              className="mt-1 line-clamp-2 leading-relaxed"
              style={{ fontSize: 'clamp(0.7rem, 1.5vw, 0.75rem)', color: 'var(--text-muted)' }}
            >
              {product.description}
            </p>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-1.5">
            <div className="flex items-center gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3 h-3" fill={i < 4 ? accent : 'none'}
                  style={{ color: i < 4 ? accent : 'var(--text-muted)' }} />
              ))}
            </div>
            <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>4.0 (128)</span>
          </div>

          {/* Price row */}
          <div className="flex items-baseline gap-1.5 flex-wrap">
            <span
              className="font-black leading-none"
              style={{
                fontSize: 'clamp(1.1rem, 3vw, 1.4rem)',
                background: `linear-gradient(135deg, ${accent}, ${accent}bb)`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              ${formatPrice(product.price)}
            </span>
            {isFlash && (
              <span className="text-xs line-through" style={{ color: 'var(--text-muted)' }}>
                ${formatPrice(originalPrice)}
              </span>
            )}
          </div>

          {/* Add to cart — always at bottom */}
          <button
            onClick={e => { e.stopPropagation(); addItem(product); }}
            className="btn-accent mt-auto w-full justify-center"
            style={{ fontSize: 'clamp(0.75rem, 2vw, 0.875rem)', padding: 'clamp(0.5rem, 1.5vw, 0.65rem) 1rem' }}
          >
            <ShoppingCart className="w-4 h-4 flex-shrink-0" />
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}
