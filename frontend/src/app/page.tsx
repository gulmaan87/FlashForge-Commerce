'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Zap, ArrowRight, Clock, TrendingUp, Shield } from 'lucide-react';
import { productApi } from '@/lib/api';
import ProductCard from '@/components/ProductCard';
import type { Product } from '@/lib/types';

function CountdownTimer({ seconds }: { seconds: number }) {
  const [timeLeft, setTimeLeft] = useState(seconds);

  useEffect(() => {
    const id = setInterval(() => setTimeLeft(t => (t > 0 ? t - 1 : 0)), 1000);
    return () => clearInterval(id);
  }, []);

  const h = Math.floor(timeLeft / 3600);
  const m = Math.floor((timeLeft % 3600) / 60);
  const s = timeLeft % 60;

  const pad = (n: number) => String(n).padStart(2, '0');

  return (
    <div className="flex items-center gap-2">
      {[h, m, s].map((val, i) => (
        <React.Fragment key={i}>
          <div
            className="flex flex-col items-center px-3 py-2 rounded-lg text-center"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', minWidth: '52px' }}
          >
            <span className="font-mono font-bold text-2xl text-gradient">{pad(val)}</span>
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
              {i === 0 ? 'hr' : i === 1 ? 'min' : 'sec'}
            </span>
          </div>
          {i < 2 && <span className="text-xl font-bold" style={{ color: 'var(--accent)' }}>:</span>}
        </React.Fragment>
      ))}
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="glass-card overflow-hidden" style={{ animationDelay: '0ms' }}>
      <div className="skeleton h-44 w-full" />
      <div className="p-4 space-y-3">
        <div className="skeleton h-4 w-3/4" />
        <div className="skeleton h-3 w-full" />
        <div className="skeleton h-3 w-1/2" />
        <div className="skeleton h-10 w-full" />
      </div>
    </div>
  );
}

export default function HomePage() {
  const { data: products, isLoading, isError } = useQuery({
    queryKey: ['products'],
    queryFn: productApi.getAll,
  });

  // First 4 are "flash deals", rest in catalog
  const flashDeals  = (products ?? []).slice(0, 4);
  const moreProducts = (products ?? []).slice(4);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-20">

      {/* Hero */}
      <section className="relative text-center py-16">
        {/* Glow background */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 blur-3xl opacity-20 pointer-events-none"
          style={{ background: 'radial-gradient(circle, var(--accent) 0%, transparent 70%)' }}
        />

        <div className="relative">
          <div className="inline-flex items-center gap-2 mb-6 px-4 py-1.5 rounded-full text-sm font-medium" style={{ background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.3)', color: 'var(--accent)' }}>
            <Zap className="w-4 h-4" fill="currentColor" />
            Flash Sales Active Now
          </div>

          <h1 className="text-5xl sm:text-7xl font-black mb-6 leading-tight">
            <span className="text-gradient">Lightning-Fast</span>
            <br />
            <span style={{ color: 'var(--text-primary)' }}>Flash Deals</span>
          </h1>

          <p className="text-lg max-w-2xl mx-auto mb-10" style={{ color: 'var(--text-secondary)' }}>
            Exclusive products at unbeatable prices — but only for a limited time.
            Built on a production-grade microservices checkout platform.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a href="#flash-deals" className="btn-accent text-base px-8 py-3">
              Shop Flash Deals
              <Zap className="w-5 h-5" fill="currentColor" />
            </a>
            <Link href="/products" className="btn-ghost text-base px-8 py-3">
              Browse All Products
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Flash Deal Timer Banner */}
      <section id="flash-deals">
        <div
          className="rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-6 mb-8"
          style={{ background: 'linear-gradient(135deg, rgba(249,115,22,0.15), rgba(239,68,68,0.1))', border: '1px solid rgba(249,115,22,0.3)' }}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(249,115,22,0.2)' }}>
              <Clock className="w-5 h-5" style={{ color: 'var(--accent)' }} />
            </div>
            <div>
              <p className="font-bold text-lg">Flash Sale Ends In</p>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Hurry — limited stock available!</p>
            </div>
          </div>
          <CountdownTimer seconds={5 * 3600 + 43 * 60 + 21} />
        </div>

        {/* Flash product grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {isLoading && [...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
          {isError && (
            <p className="col-span-4 text-center py-12" style={{ color: 'var(--text-muted)' }}>
              ⚡ Could not load products. Make sure the product-service is running.
            </p>
          )}
          {flashDeals.map((p, i) => (
            <ProductCard key={p.id} product={p} isFlash delay={i * 80} />
          ))}
        </div>
      </section>

      {/* Features Strip */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {[
          { icon: Zap, title: 'Instant Checkout', desc: 'One-click flash checkout powered by exactly-once idempotent API design.' },
          { icon: Shield, title: 'Safe & Secure', desc: 'Idempotency keys, optimistic locking, and distributed inventory management.' },
          { icon: TrendingUp, title: 'Real-time Stock', desc: 'Live inventory tracking across our microservices ensures no overselling.' },
        ].map(({ icon: Icon, title, desc }) => (
          <div key={title} className="glass-card p-6 flex gap-4">
            <div className="w-10 h-10 flex-shrink-0 rounded-xl flex items-center justify-center" style={{ background: 'rgba(249,115,22,0.15)' }}>
              <Icon className="w-5 h-5" style={{ color: 'var(--accent)' }} />
            </div>
            <div>
              <h3 className="font-semibold mb-1">{title}</h3>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{desc}</p>
            </div>
          </div>
        ))}
      </section>

      {/* More Products */}
      {moreProducts.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold mb-6">More Products</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {moreProducts.map((p, i) => (
              <ProductCard key={p.id} product={p} delay={i * 60} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
