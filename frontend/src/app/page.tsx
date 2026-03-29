'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Zap, ArrowRight, Clock, TrendingUp, Shield, Flame, Package, Users } from 'lucide-react';
import { productApi } from '@/lib/api';
import ProductCard from '@/components/ProductCard';

/* ─── Floating particles (desktop only to preserve perf) ─── */
interface Particle { id: number; x: number; y: number; size: number; delay: number; duration: number; color: string; }

function Particles() {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    // Only on non-touch / larger screens
    if (window.matchMedia('(hover: none)').matches || window.innerWidth < 768) return;
    const colors = ['#f97316', '#fb923c', '#8b5cf6', '#a78bfa', '#f59e0b'];
    setParticles(Array.from({ length: 18 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      delay: Math.random() * 5,
      duration: Math.random() * 4 + 4,
      color: colors[i % colors.length],
    })));
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {particles.map(p => (
        <div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.x}%`, top: `${p.y}%`,
            width: p.size, height: p.size,
            background: p.color, boxShadow: `0 0 ${p.size * 3}px ${p.color}`,
            animation: `particle-drift ${p.duration}s ${p.delay}s ease-in-out infinite`,
            opacity: 0.7,
          }}
        />
      ))}
    </div>
  );
}

/* ─── Glow orb ─── */
function GlowOrb({ color, size, x, y, blur, opacity = 0.12 }: {
  color: string; size: string; x: string; y: string; blur: string; opacity?: number;
}) {
  return (
    <div aria-hidden="true" className="absolute rounded-full pointer-events-none" style={{
      width: size, height: size, left: x, top: y,
      background: color, filter: `blur(${blur})`, opacity,
      transform: 'translate(-50%, -50%)',
    }} />
  );
}

/* ─── Countdown ─── */
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
  const units = [{ val: h, label: 'hrs' }, { val: m, label: 'min' }, { val: s, label: 'sec' }];

  return (
    <div className="flex items-center gap-1.5 sm:gap-2" role="timer" aria-live="off">
      {units.map(({ val, label }, i) => (
        <React.Fragment key={label}>
          <div className="countdown-block flex flex-col items-center text-center"
            style={{ padding: 'clamp(0.4rem, 2vw, 0.75rem) clamp(0.6rem, 2.5vw, 1rem)' }}>
            <span
              className="font-mono font-black tabular-nums leading-none"
              style={{
                fontSize: 'clamp(1.25rem, 5vw, 2rem)',
                background: 'linear-gradient(180deg, #fb923c 0%, #f97316 100%)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
              }}
            >
              {pad(val)}
            </span>
            <span className="font-semibold tracking-widest uppercase mt-0.5"
              style={{ fontSize: 'clamp(0.55rem, 1.5vw, 0.65rem)', color: 'var(--text-muted)' }}>
              {label}
            </span>
          </div>
          {i < 2 && (
            <span className="font-black pb-4 opacity-70" style={{ color: 'var(--accent)', fontSize: 'clamp(1rem, 3vw, 1.5rem)' }}>:</span>
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

/* ─── Skeleton ─── */
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

/* ─── Animated counter ─── */
function AnimatedNumber({ target, suffix = '' }: { target: number; suffix?: string }) {
  const [val, setVal] = useState(0);
  const raf = useRef<number | null>(null);
  useEffect(() => {
    const start = Date.now();
    const duration = 1800;
    const tick = () => {
      const progress = Math.min((Date.now() - start) / duration, 1);
      setVal(Math.round((1 - Math.pow(1 - progress, 3)) * target));
      if (progress < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => { if (raf.current) cancelAnimationFrame(raf.current); };
  }, [target]);
  return <span>{val.toLocaleString()}{suffix}</span>;
}

/* ─── Page ─── */
export default function HomePage() {
  const { data: products, isLoading, isError } = useQuery({
    queryKey: ['products'],
    queryFn: productApi.getAll,
  });

  const [heroVisible, setHeroVisible] = useState(false);
  useEffect(() => { const t = setTimeout(() => setHeroVisible(true), 100); return () => clearTimeout(t); }, []);

  const flashDeals   = (products ?? []).slice(0, 4);
  const moreProducts = (products ?? []).slice(4);

  return (
    <div className="page-wrapper">

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {/*  HERO                                                               */}
      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section className="relative text-center overflow-hidden" style={{ paddingBlock: 'clamp(3rem, 10vw, 7rem)' }}>
        <Particles />
        <GlowOrb color="#f97316" size="clamp(300px, 50vw, 600px)" x="30%" y="0%" blur="120px" opacity={0.11} />
        <GlowOrb color="#8b5cf6" size="clamp(200px, 35vw, 400px)" x="75%" y="30%" blur="90px" opacity={0.09} />

        {/* Floating shapes — hidden below md */}
        <div className="absolute top-10 left-[8%] w-14 h-14 animate-float opacity-20 pointer-events-none hidden md:block" aria-hidden="true">
          <div style={{ width: '100%', height: '100%', border: '2px solid #f97316', borderRadius: 8, transform: 'rotate(20deg)', boxShadow: '0 0 30px rgba(249,115,22,0.3)' }} />
        </div>
        <div className="absolute top-20 right-[10%] w-9 h-9 animate-float-delayed opacity-20 pointer-events-none hidden md:block" aria-hidden="true">
          <div style={{ width: '100%', height: '100%', border: '2px solid #8b5cf6', borderRadius: '50%', boxShadow: '0 0 20px rgba(139,92,246,0.3)' }} />
        </div>

        {/* ── Content ── */}
        <div className="relative z-10" style={{
          opacity: heroVisible ? 1 : 0,
          transform: heroVisible ? 'translateY(0)' : 'translateY(28px)',
          transition: 'all 0.8s cubic-bezier(0.175,0.885,0.32,1.1)',
        }}>
          {/* Live badge */}
          <div
            className="inline-flex items-center gap-2 mb-5 px-4 py-1.5 rounded-full font-semibold"
            style={{
              fontSize: 'clamp(0.7rem, 2vw, 0.875rem)',
              background: 'rgba(249,115,22,0.08)',
              border: '1px solid rgba(249,115,22,0.3)',
              color: 'var(--accent)',
              backdropFilter: 'blur(10px)',
            }}
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500" />
            </span>
            Flash Sales Live Now
          </div>

          {/* Heading — fluid from 2.8rem (xs) to 7rem (xl) */}
          <h1
            className="font-display leading-none tracking-tight mb-5"
            style={{ fontSize: 'clamp(2.6rem, 10vw, 7rem)', fontWeight: 900 }}
          >
            <span className="text-gradient">Lightning</span>
            <br />
            <span style={{ color: 'var(--text-primary)', textShadow: '0 0 80px rgba(249,115,22,0.12)' }}>
              Flash Deals
            </span>
          </h1>

          <p
            className="mx-auto mb-8 leading-relaxed"
            style={{
              fontSize: 'clamp(0.9rem, 2.5vw, 1.1rem)',
              color: 'var(--text-secondary)',
              maxWidth: 'min(90%, 40rem)',
            }}
          >
            Exclusive products at unbeatable prices — powered by a real production-grade
            microservices checkout platform.
          </p>

          {/* CTAs — stack on xs, row on sm+ */}
          <div className="flex flex-col xs:flex-row sm:flex-row items-stretch xs:items-center sm:items-center justify-center gap-3 sm:gap-4">
            <a href="#flash-deals" className="btn-accent" style={{ fontSize: 'clamp(0.85rem, 2.5vw, 1rem)', padding: 'clamp(0.7rem, 2vw, 0.875rem) clamp(1.2rem, 4vw, 2rem)' }}>
              <Flame className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" fill="currentColor" />
              Shop Flash Deals
            </a>
            <Link href="/products" className="btn-ghost" style={{ fontSize: 'clamp(0.85rem, 2.5vw, 1rem)', padding: 'clamp(0.7rem, 2vw, 0.875rem) clamp(1.2rem, 4vw, 2rem)' }}>
              Browse All Products
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
            </Link>
          </div>

          {/* Stats row */}
          <div
            className="grid grid-cols-3 gap-3 sm:gap-6 mx-auto mt-12"
            style={{ maxWidth: 'min(90%, 22rem)' }}
          >
            {[
              { value: 20, label: 'Products', suffix: '+' },
              { value: 99, label: 'Uptime',   suffix: '%' },
              { value: 0,  label: 'Oversells', suffix: '' },
            ].map(({ value, label, suffix }) => (
              <div key={label} className="text-center">
                <div className="font-display font-black text-gradient" style={{ fontSize: 'clamp(1.2rem, 4vw, 1.75rem)' }}>
                  <AnimatedNumber target={value} suffix={suffix} />
                </div>
                <div style={{ fontSize: 'clamp(0.65rem, 1.5vw, 0.75rem)', color: 'var(--text-muted)', marginTop: 2 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {/*  FLASH DEALS                                                        */}
      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section id="flash-deals" style={{ marginTop: 'clamp(0.5rem, 2vw, 1rem)' }}>

        {/* Timer banner */}
        <div
          className="relative overflow-hidden rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6 mb-6 sm:mb-8"
          style={{
            padding: 'clamp(1rem, 4vw, 1.5rem) clamp(1rem, 4vw, 1.75rem)',
            background: 'linear-gradient(135deg, rgba(249,115,22,0.1) 0%, rgba(139,92,246,0.06) 50%, rgba(239,68,68,0.08) 100%)',
            border: '1px solid rgba(249,115,22,0.25)',
            boxShadow: '0 0 40px rgba(249,115,22,0.06)',
          }}
        >
          <div className="flex items-center gap-3 sm:gap-4">
            <div
              className="rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{
                width: 'clamp(40px, 8vw, 52px)', height: 'clamp(40px, 8vw, 52px)',
                background: 'rgba(249,115,22,0.15)',
                border: '1px solid rgba(249,115,22,0.3)',
                boxShadow: '0 0 20px rgba(249,115,22,0.2)',
              }}
            >
              <Clock style={{ width: 22, height: 22, color: 'var(--accent)' }} />
            </div>
            <div>
              <p className="font-display font-bold" style={{ fontSize: 'clamp(0.95rem, 3vw, 1.25rem)' }}>
                Flash Sale Ends In
              </p>
              <p className="mt-0.5" style={{ fontSize: 'clamp(0.7rem, 2vw, 0.875rem)', color: 'var(--text-secondary)' }}>
                Hurry — limited stock available!
              </p>
            </div>
          </div>
          <CountdownTimer seconds={5 * 3600 + 43 * 60 + 21} />
        </div>

        {/* Section header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-1 rounded-full flex-shrink-0" style={{ height: 28, background: 'linear-gradient(180deg, #f97316, #8b5cf6)' }} />
            <div>
              <h2 className="section-title">⚡ Flash Deals</h2>
              <p style={{ fontSize: 'clamp(0.65rem, 1.5vw, 0.75rem)', color: 'var(--text-muted)', marginTop: 2 }}>
                Grab them before they disappear
              </p>
            </div>
          </div>
          <Link href="/products" className="flex items-center gap-1 font-medium transition-all hover:gap-2"
            style={{ color: 'var(--accent)', fontSize: 'clamp(0.75rem, 2vw, 0.875rem)' }}>
            View all <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Grid — 1 col xs, 2 col sm, 4 col lg */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {isLoading && [...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
          {isError && (
            <div className="col-span-full text-center glass-card" style={{ padding: 'clamp(2rem, 8vw, 4rem)' }}>
              <Zap className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p style={{ color: 'var(--text-muted)', fontSize: 'clamp(0.8rem, 2vw, 0.9rem)' }}>
                Could not load products. Make sure the product-service is running.
              </p>
            </div>
          )}
          {flashDeals.map((p, i) => <ProductCard key={p.id} product={p} isFlash delay={i * 80} />)}
        </div>
      </section>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {/*  FEATURE CARDS                                                      */}
      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section
        className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5"
        style={{ marginTop: 'clamp(3rem, 8vw, 5rem)' }}
      >
        {[
          { icon: Zap,        title: 'Instant Checkout', desc: 'One-click flash checkout powered by exactly-once idempotent API design.', color: '#f97316' },
          { icon: Shield,     title: 'Safe & Secure',    desc: 'Idempotency keys, optimistic locking, and distributed inventory management.', color: '#8b5cf6' },
          { icon: TrendingUp, title: 'Real-time Stock',  desc: 'Live inventory tracking across microservices ensures no overselling.', color: '#22c55e' },
        ].map(({ icon: Icon, title, desc, color }) => (
          <div key={title} className="stat-card group cursor-default">
            <div
              className="rounded-2xl flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110"
              style={{
                width: 'clamp(40px, 8vw, 52px)', height: 'clamp(40px, 8vw, 52px)',
                background: `${color}18`, border: `1px solid ${color}33`, boxShadow: `0 0 20px ${color}18`,
              }}
            >
              <Icon style={{ width: 22, height: 22, color }} />
            </div>
            <h3 className="font-display font-bold mb-2" style={{ fontSize: 'clamp(0.95rem, 2.5vw, 1.15rem)' }}>
              {title}
            </h3>
            <p style={{ fontSize: 'clamp(0.75rem, 2vw, 0.875rem)', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              {desc}
            </p>
            <div className="absolute bottom-0 left-0 right-0 h-0.5 rounded-b-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{ background: `linear-gradient(90deg, transparent, ${color}, transparent)` }} />
          </div>
        ))}
      </section>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {/*  MORE PRODUCTS                                                      */}
      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {moreProducts.length > 0 && (
        <section style={{ marginTop: 'clamp(3rem, 8vw, 5rem)' }}>
          <div className="flex items-center justify-between mb-5 sm:mb-6">
            <div className="flex items-center gap-2.5">
              <div className="w-1 rounded-full flex-shrink-0" style={{ height: 28, background: 'linear-gradient(180deg, #8b5cf6, #3b82f6)' }} />
              <div>
                <h2 className="section-title">More Products</h2>
                <p style={{ fontSize: 'clamp(0.65rem, 1.5vw, 0.75rem)', color: 'var(--text-muted)', marginTop: 2 }}>
                  Explore the full collection
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
              style={{
                fontSize: 'clamp(0.65rem, 1.5vw, 0.75rem)', fontWeight: 600,
                background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.2)', color: '#a78bfa',
              }}>
              <Package className="w-3.5 h-3.5 flex-shrink-0" />
              {moreProducts.length} items
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {moreProducts.map((p, i) => <ProductCard key={p.id} product={p} delay={i * 50} />)}
          </div>
        </section>
      )}

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {/*  CTA BANNER                                                         */}
      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section style={{ marginTop: 'clamp(3rem, 8vw, 5rem)' }}>
        <div
          className="relative overflow-hidden rounded-2xl sm:rounded-3xl text-center"
          style={{
            padding: 'clamp(2rem, 8vw, 4rem) clamp(1.5rem, 6vw, 3rem)',
            background: 'linear-gradient(135deg, rgba(249,115,22,0.12) 0%, rgba(139,92,246,0.1) 50%, rgba(249,115,22,0.08) 100%)',
            border: '1px solid rgba(249,115,22,0.2)',
          }}
        >
          <GlowOrb color="#f97316" size="300px" x="20%" y="50%" blur="80px" opacity={0.1} />
          <GlowOrb color="#8b5cf6" size="200px" x="80%" y="50%" blur="60px" opacity={0.08} />

          <div className="relative z-10">
            <div className="inline-flex items-center gap-1.5 mb-4 px-3 py-1.5 rounded-full"
              style={{ fontSize: 'clamp(0.65rem, 1.5vw, 0.75rem)', fontWeight: 600, background: 'rgba(249,115,22,0.1)', color: 'var(--accent)', border: '1px solid rgba(249,115,22,0.2)' }}>
              <Users className="w-3.5 h-3.5 flex-shrink-0" />
              Join 10,000+ savvy shoppers
            </div>

            <h2 className="font-display font-black mb-3" style={{ fontSize: 'clamp(1.5rem, 6vw, 2.75rem)' }}>
              Don't Miss the Next{' '}
              <span className="text-gradient">Flash Sale</span>
            </h2>

            <p className="mx-auto mb-7 leading-relaxed" style={{ fontSize: 'clamp(0.85rem, 2.5vw, 1rem)', color: 'var(--text-secondary)', maxWidth: 'min(90%, 28rem)' }}>
              Production-grade checkout built on real microservices — fast, reliable, and secure.
            </p>

            <Link href="/products" className="btn-accent inline-flex" style={{ fontSize: 'clamp(0.875rem, 2.5vw, 1rem)', padding: 'clamp(0.75rem, 2vw, 0.875rem) clamp(1.5rem, 5vw, 2.5rem)' }}>
              Browse All Products
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
