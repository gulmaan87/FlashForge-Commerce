'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/components/Providers';
import { checkoutApi } from '@/lib/api';
import { ShoppingBag, CreditCard, ArrowRight, CheckCircle, Loader2, User, MapPin, Lock } from 'lucide-react';
import Link from 'next/link';

type Step = 'review' | 'payment' | 'success';

function formatPrice(cents: number) {
  return (cents / 100).toFixed(2);
}

// Fake user — in production this would come from auth
const DEMO_USER_ID = 'user-demo-001';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, total, clearCart } = useCart();
  const [step, setStep] = useState<Step>('review');
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);

  const [form, setForm] = useState({
    email: 'demo@flashforge.dev',
    name:  'Demo User',
    address: '123 Flash Street, Commerce City, CA 90210',
    card: '4242 4242 4242 4242',
    expiry: '12/27',
    cvv: '123',
  });

  if (items.length === 0 && step !== 'success') {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <p className="text-5xl mb-4">🛒</p>
        <h1 className="text-2xl font-bold mb-2">Your cart is empty</h1>
        <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>Add some flash deals first!</p>
        <Link href="/" className="btn-accent">Back to Flash Deals</Link>
      </div>
    );
  }

  async function handleConfirm() {
    setLoading(true);
    setError(null);

    try {
      const cartPayload = items.map(i => ({
        productId: i.productId,
        quantity: i.quantity,
        price: i.price,
      }));

      // 1) Create checkout session
      const session = await checkoutApi.createSession(DEMO_USER_ID, cartPayload);

      // 2) Confirm checkout (idempotency key = unique per attempt)
      const idempotencyKey = `checkout-${session.id}-${Date.now()}`;
      const order = await checkoutApi.confirm(session.id, idempotencyKey);

      setOrderId(order.id);
      clearCart();
      setStep('success');
    } catch (err: any) {
      setError(err?.response?.data?.error?.message ?? err?.message ?? 'Checkout failed');
    } finally {
      setLoading(false);
    }
  }

  // ── Step: Review ──────────────────────────────────────────────────────────
  if (step === 'review') {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-3xl font-bold mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Cart review */}
          <div className="lg:col-span-3 space-y-4">
            <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <ShoppingBag className="w-5 h-5" style={{ color: 'var(--accent)' }} />
              Order Summary
            </h2>

            {items.map(item => (
              <div
                key={item.productId}
                className="flex items-center gap-4 p-4 rounded-xl"
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
              >
                <div className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl flex-shrink-0" style={{ background: 'var(--bg-secondary)' }}>
                  🛍️
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{item.product.name}</p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Qty: {item.quantity}</p>
                </div>
                <p className="font-semibold" style={{ color: 'var(--accent)' }}>
                  ${formatPrice(item.price * item.quantity)}
                </p>
              </div>
            ))}

            {/* Totals */}
            <div className="rounded-xl p-4 space-y-2" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
              <div className="flex justify-between text-sm" style={{ color: 'var(--text-secondary)' }}>
                <span>Subtotal</span><span>${formatPrice(total)}</span>
              </div>
              <div className="flex justify-between text-sm" style={{ color: 'var(--text-secondary)' }}>
                <span>Shipping</span><span className="text-green-400">FREE</span>
              </div>
              <div className="flex justify-between text-sm" style={{ color: 'var(--text-secondary)' }}>
                <span>Tax (0%)</span><span>$0.00</span>
              </div>
              <div className="pt-2 flex justify-between font-bold text-lg" style={{ borderTop: '1px solid var(--border)' }}>
                <span>Total</span>
                <span className="text-gradient">${formatPrice(total)}</span>
              </div>
            </div>
          </div>

          {/* Details form */}
          <div className="lg:col-span-2 space-y-5">
            <h2 className="font-semibold text-lg flex items-center gap-2">
              <User className="w-5 h-5" style={{ color: 'var(--accent)' }} />
              Your Info
            </h2>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--text-secondary)' }}>Email</label>
                <input className="input-dark" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
              </div>
              <div>
                <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--text-secondary)' }}>Full Name</label>
                <input className="input-dark" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
              </div>
            </div>

            <h2 className="font-semibold flex items-center gap-2 pt-2">
              <MapPin className="w-4 h-4" style={{ color: 'var(--accent)' }} />
              Shipping Address
            </h2>
            <textarea
              className="input-dark resize-none"
              rows={3}
              value={form.address}
              onChange={e => setForm({ ...form, address: e.target.value })}
            />

            <button
              onClick={() => setStep('payment')}
              className="btn-accent w-full justify-center"
            >
              Continue to Payment
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Step: Payment ─────────────────────────────────────────────────────────
  if (step === 'payment') {
    return (
      <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-3xl font-bold mb-8">Payment</h1>

        <div className="glass-card p-6 space-y-5">
          <div className="flex items-center gap-2 mb-2" style={{ color: 'var(--text-secondary)' }}>
            <Lock className="w-4 h-4 text-green-400" />
            <span className="text-sm">Secured by TLS encryption</span>
          </div>

          <div>
            <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--text-secondary)' }}>Card Number</label>
            <input className="input-dark font-mono" value={form.card} onChange={e => setForm({ ...form, card: e.target.value })} maxLength={19} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--text-secondary)' }}>Expiry</label>
              <input className="input-dark" placeholder="MM/YY" value={form.expiry} onChange={e => setForm({ ...form, expiry: e.target.value })} />
            </div>
            <div>
              <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--text-secondary)' }}>CVV</label>
              <input className="input-dark" placeholder="123" value={form.cvv} onChange={e => setForm({ ...form, cvv: e.target.value })} maxLength={4} />
            </div>
          </div>

          {/* Total reminder */}
          <div className="flex justify-between items-center py-3 px-4 rounded-xl" style={{ background: 'var(--bg-secondary)' }}>
            <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Total to pay</span>
            <span className="font-bold text-xl text-gradient">${formatPrice(total)}</span>
          </div>

          {error && (
            <div
              className="rounded-xl p-4 text-sm"
              style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', color: 'var(--error)' }}
            >
              {error}
            </div>
          )}

          <button onClick={handleConfirm} disabled={loading} className="btn-accent w-full justify-center text-base py-3">
            {loading ? <><Loader2 className="w-5 h-5 animate-spin" />Processing…</> : <><CreditCard className="w-5 h-5" />Pay ${formatPrice(total)}</>}
          </button>

          <button onClick={() => setStep('review')} className="w-full text-sm text-center" style={{ color: 'var(--text-muted)' }}>
            ← Back to review
          </button>
        </div>
      </div>
    );
  }

  // ── Step: Success ─────────────────────────────────────────────────────────
  return (
    <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
      <div className="glass-card p-10 space-y-6">
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center mx-auto"
          style={{ background: 'rgba(34,197,94,0.15)' }}
        >
          <CheckCircle className="w-10 h-10 text-green-400" />
        </div>

        <div>
          <h1 className="text-3xl font-bold text-gradient">Order Confirmed!</h1>
          <p className="mt-2" style={{ color: 'var(--text-secondary)' }}>
            Your flash deal is secured. 🎉
          </p>
        </div>

        {orderId && (
          <div className="rounded-xl p-4 text-sm" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
            <span style={{ color: 'var(--text-muted)' }}>Order ID: </span>
            <span className="font-mono text-xs">{orderId}</span>
          </div>
        )}

        <div className="flex gap-3">
          <Link href="/orders" className="btn-accent flex-1 justify-center">View Orders</Link>
          <Link href="/" className="btn-ghost flex-1 justify-center">Shop More</Link>
        </div>
      </div>
    </div>
  );
}
