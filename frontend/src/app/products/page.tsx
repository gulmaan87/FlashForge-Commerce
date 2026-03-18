'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, SlidersHorizontal } from 'lucide-react';
import { productApi } from '@/lib/api';
import ProductCard from '@/components/ProductCard';
import { useState } from 'react';

function SkeletonCard() {
  return (
    <div className="glass-card overflow-hidden">
      <div className="skeleton h-44 w-full" />
      <div className="p-4 space-y-3">
        <div className="skeleton h-4 w-3/4" />
        <div className="skeleton h-3 w-full" />
        <div className="skeleton h-10 w-full mt-4" />
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">All Products</h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          {products ? `${products.length} products available` : 'Loading catalog…'}
        </p>
      </div>

      {/* Search + Filter bar */}
      <div className="flex gap-3 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search by name, description, or SKU…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input-dark pl-10"
          />
        </div>
        <button className="btn-ghost">
          <SlidersHorizontal className="w-4 h-4" />
          <span className="hidden sm:inline">Filters</span>
        </button>
      </div>

      {/* Grid */}
      {isError && (
        <div
          className="rounded-xl p-8 text-center"
          style={{ background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.2)', color: 'var(--error)' }}
        >
          <p className="font-medium">Failed to load products</p>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
            Make sure the product-service is running on port 4001.
          </p>
        </div>
      )}

      {!isError && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {isLoading && [...Array(8)].map((_, i) => <SkeletonCard key={i} />)}
          {!isLoading && filtered.length === 0 && (
            <div className="col-span-4 text-center py-20" style={{ color: 'var(--text-muted)' }}>
              <p className="text-4xl mb-3">🔍</p>
              <p>No products match &ldquo;{search}&rdquo;</p>
            </div>
          )}
          {filtered.map((p, i) => (
            <ProductCard key={p.id} product={p} delay={i * 50} />
          ))}
        </div>
      )}
    </div>
  );
}
