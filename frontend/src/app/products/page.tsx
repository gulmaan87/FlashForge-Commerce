'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { productApi } from '@/lib/api';
import ProductCard from '@/components/ProductCard';

function SkeletonCard() {
  return (
    <div className="glass-card overflow-hidden">
      <div className="skeleton" style={{ height: 'clamp(150px, 30vw, 200px)' }} />
      <div style={{ padding: 'clamp(0.75rem, 2vw, 1rem)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <div className="skeleton h-4 w-3/4" />
        <div className="skeleton h-3 w-full" />
        <div className="skeleton h-3 w-1/2" />
        <div className="skeleton w-full" style={{ height: 40, marginTop: 8 }} />
      </div>
    </div>
  );
}

export default function ProductsPage() {
  const [search, setSearch] = useState('');

  const { data: products, isLoading, isError } = useQuery({
    queryKey: ['products'],
    queryFn: productApi.getAll,
  });

  const filtered = (products ?? []).filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.description.toLowerCase().includes(search.toLowerCase()) ||
    p.sku.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="page-wrapper" style={{ paddingTop: 'clamp(1.5rem, 4vw, 2.5rem)' }}>

      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="font-display font-bold mb-1.5" style={{ fontSize: 'clamp(1.5rem, 5vw, 2.25rem)' }}>
          All Products
        </h1>
        <p style={{ fontSize: 'clamp(0.8rem, 2vw, 0.95rem)', color: 'var(--text-secondary)' }}>
          {products ? `${products.length} products available` : 'Loading catalog…'}
        </p>
      </div>

      {/* Search + filter bar */}
      <div className="flex gap-2 sm:gap-3 mb-6 sm:mb-8">
        <div className="relative flex-1 min-w-0">
          <Search
            className="absolute top-1/2 -translate-y-1/2"
            style={{ left: 'clamp(0.6rem, 2vw, 0.75rem)', width: 16, height: 16, color: 'var(--text-muted)' }}
          />
          <input
            type="search"
            placeholder="Search by name, description, or SKU…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input-dark"
            style={{ paddingLeft: 'clamp(2rem, 6vw, 2.5rem)' }}
            aria-label="Search products"
          />
          {/* Clear button */}
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute top-1/2 -translate-y-1/2 flex items-center justify-center rounded-full transition-colors hover:bg-white/10"
              style={{ right: '0.5rem', width: 24, height: 24, color: 'var(--text-muted)' }}
              aria-label="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <button className="btn-ghost flex-shrink-0" style={{ padding: 'clamp(0.6rem, 2vw, 0.75rem) clamp(0.75rem, 3vw, 1rem)' }}>
          <SlidersHorizontal className="w-4 h-4 flex-shrink-0" />
          <span className="hidden sm:inline">Filters</span>
        </button>
      </div>

      {/* Error */}
      {isError && (
        <div className="rounded-xl p-8 text-center"
          style={{ background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.2)', color: 'var(--error)' }}>
          <p className="font-medium">Failed to load products</p>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
            Make sure the product-service is running on port 4001.
          </p>
        </div>
      )}

      {/* Product grid — 1 col / 2 col / 3 col / 4 col */}
      {!isError && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
          {isLoading && [...Array(8)].map((_, i) => <SkeletonCard key={i} />)}

          {!isLoading && filtered.length === 0 && (
            <div className="col-span-full flex flex-col items-center text-center py-16" style={{ color: 'var(--text-muted)' }}>
              <p style={{ fontSize: 'clamp(2rem, 8vw, 3rem)', marginBottom: '0.75rem' }}>🔍</p>
              <p style={{ fontSize: 'clamp(0.875rem, 2.5vw, 1rem)' }}>
                No products match &ldquo;{search}&rdquo;
              </p>
              <button
                onClick={() => setSearch('')}
                className="mt-4 text-sm"
                style={{ color: 'var(--accent)' }}
              >
                Clear search
              </button>
            </div>
          )}

          {filtered.map((p, i) => <ProductCard key={p.id} product={p} delay={i * 40} />)}
        </div>
      )}
    </div>
  );
}
