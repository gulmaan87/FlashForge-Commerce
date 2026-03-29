'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ShoppingCart, Zap, Package, Menu, X } from 'lucide-react';
import { useCart } from './Providers';

export default function Navbar() {
  const { itemCount, toggleCart } = useCart();
  const [scrolled, setScrolled]   = useState(false);
  const [mobileOpen, setMobile]   = useState(false);
  const [cartBump, setCartBump]   = useState(false);
  const prevCount = useRef(itemCount);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (itemCount > prevCount.current) {
      setCartBump(true);
      setTimeout(() => setCartBump(false), 500);
    }
    prevCount.current = itemCount;
  }, [itemCount]);

  // Close mobile menu on route change / resize to desktop
  useEffect(() => {
    const onResize = () => { if (window.innerWidth >= 768) setMobile(false); };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const navLinks = [
    { href: '/',         label: 'Flash Deals', icon: null },
    { href: '/products', label: 'All Products', icon: null },
    { href: '/orders',   label: 'My Orders',    icon: Package },
  ];

  return (
    <>
      <header
        className="sticky top-0 z-40 w-full transition-all duration-300"
        style={{
          background: scrolled ? 'rgba(4,4,10,0.95)' : 'rgba(4,4,10,0.7)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: scrolled ? '1px solid rgba(249,115,22,0.15)' : '1px solid rgba(255,255,255,0.05)',
          boxShadow: scrolled ? '0 4px 40px rgba(0,0,0,0.5)' : 'none',
        }}
      >
        {/* Animated top accent line */}
        <div className="absolute top-0 left-0 right-0 h-px" style={{
          background: 'linear-gradient(90deg, transparent 0%, #f97316 20%, #f59e0b 50%, #f97316 80%, transparent 100%)',
          opacity: scrolled ? 1 : 0.4,
          transition: 'opacity 0.3s',
        }} />

        <nav
          className="max-w-7xl mx-auto flex items-center justify-between"
          style={{
            paddingInline: 'clamp(1rem, 4vw, 2rem)',
            height: 'clamp(56px, 8vw, 68px)',
          }}
        >
          {/* ── Logo ── */}
          <Link href="/" className="flex items-center gap-2 group shrink-0" onClick={() => setMobile(false)}>
            <div className="relative flex items-center justify-center" style={{ width: 36, height: 36 }}>
              <div
                className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{
                  background: 'rgba(249,115,22,0.15)',
                  border: '1px solid rgba(249,115,22,0.4)',
                  boxShadow: '0 0 20px rgba(249,115,22,0.3)',
                }}
              />
              <Zap
                className="relative z-10 transition-transform duration-300 group-hover:scale-110"
                style={{ width: 22, height: 22, color: 'var(--accent)' }}
                fill="currentColor"
              />
              <div className="absolute inset-0 blur-lg opacity-40" style={{ background: '#f97316', borderRadius: 10 }} />
            </div>

            <div className="flex flex-col leading-none">
              <span className="font-display font-bold tracking-tight" style={{ fontSize: 'clamp(1rem, 3vw, 1.25rem)' }}>
                <span className="text-gradient">Flash</span>
                <span style={{ color: 'var(--text-primary)' }}>Forge</span>
              </span>
              {/* Hide on very small screens */}
              <span className="hidden xs:block text-[9px] font-mono tracking-[0.2em] uppercase" style={{ color: 'var(--text-muted)' }}>
                Commerce
              </span>
            </div>
          </Link>

          {/* ── Desktop Links ── */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-1.5 rounded-xl text-sm font-medium transition-all duration-200 hover:bg-white/5 hover:text-orange-400"
                style={{
                  color: 'var(--text-secondary)',
                  padding: 'clamp(0.4rem, 1vw, 0.5rem) clamp(0.6rem, 2vw, 1rem)',
                }}
              >
                {Icon && <Icon style={{ width: 14, height: 14 }} />}
                {label}
              </Link>
            ))}
          </div>

          {/* ── Right actions ── */}
          <div className="flex items-center gap-2">
            {/* Cart button */}
            <button
              onClick={toggleCart}
              className="relative flex items-center justify-center rounded-xl transition-all duration-200"
              style={{
                width: 44, height: 44,
                background: 'rgba(15,15,26,0.8)',
                border: '1px solid var(--border)',
                backdropFilter: 'blur(10px)',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(249,115,22,0.5)';
                (e.currentTarget as HTMLButtonElement).style.boxShadow   = '0 0 20px rgba(249,115,22,0.2)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border)';
                (e.currentTarget as HTMLButtonElement).style.boxShadow   = 'none';
              }}
              aria-label={`Open cart — ${itemCount} items`}
            >
              <ShoppingCart
                style={{
                  width: 20, height: 20,
                  color: 'var(--text-primary)',
                  transform: cartBump ? 'scale(1.3)' : 'scale(1)',
                  transition: 'transform 0.3s cubic-bezier(0.175,0.885,0.32,1.275)',
                }}
              />
              {itemCount > 0 && (
                <span
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center text-white"
                  style={{
                    background: 'linear-gradient(135deg, var(--accent), #ef4444)',
                    boxShadow: '0 0 10px rgba(249,115,22,0.5)',
                    transform: cartBump ? 'scale(1.3)' : 'scale(1)',
                    transition: 'transform 0.3s cubic-bezier(0.175,0.885,0.32,1.275)',
                  }}
                >
                  {itemCount > 9 ? '9+' : itemCount}
                </span>
              )}
            </button>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobile(o => !o)}
              className="md:hidden flex items-center justify-center rounded-xl transition-all"
              style={{
                width: 44, height: 44,
                background: 'rgba(15,15,26,0.8)',
                border: `1px solid ${mobileOpen ? 'rgba(249,115,22,0.4)' : 'var(--border)'}`,
              }}
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileOpen}
            >
              {mobileOpen
                ? <X style={{ width: 20, height: 20 }} />
                : <Menu style={{ width: 20, height: 20 }} />
              }
            </button>
          </div>
        </nav>

        {/* ── Mobile drawer (slide down) ── */}
        <div
          className="md:hidden overflow-hidden transition-all duration-300 ease-in-out"
          style={{
            maxHeight: mobileOpen ? '300px' : '0px',
            opacity: mobileOpen ? 1 : 0,
            borderTop: mobileOpen ? '1px solid var(--border)' : 'none',
          }}
        >
          <div
            className="flex flex-col"
            style={{
              background: 'rgba(4,4,10,0.98)',
              paddingInline: 'clamp(1rem, 4vw, 2rem)',
              paddingBlock: '0.75rem',
            }}
          >
            {navLinks.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMobile(false)}
                className="flex items-center gap-3 py-3 text-sm font-medium rounded-xl transition-all hover:text-orange-400"
                style={{
                  color: 'var(--text-secondary)',
                  borderBottom: '1px solid rgba(255,255,255,0.04)',
                  paddingInline: '0.5rem',
                }}
              >
                {Icon && <Icon style={{ width: 16, height: 16 }} />}
                {label}
              </Link>
            ))}
          </div>
        </div>
      </header>
    </>
  );
}
