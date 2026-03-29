'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/components/Providers';
import { checkoutApi } from '@/lib/api';
import { ShoppingBag, CreditCard, ArrowRight, CheckCircle, Loader2, User, MapPin, Lock } from 'lucide-react';
import Link from 'next/link';

type Step = 'review' | 'payment' | 'success';

function formatPrice(cents: number) { return (cents / 100).toFixed(2); }

const DEMO_USER_ID = 'user-demo-001';

/* ─── Step indicator ─── */
function StepIndicator({ current }: { current: Step }) {
  const steps: { key: Step; label: string }[] = [
    { key: 'review',  label: 'Review' },
    { key: 'payment', label: 'Payment' },
    { key: 'success', label: 'Done' },
  ];
  const idx = steps.findIndex(s => s.key === current);

  return (
    <div className="flex items-center justify-center gap-0 mb-8" role="list">
      {steps.map((s, i) => (
        <React.Fragment key={s.key}>
          <div className="flex flex-col items-center gap-1" role="listitem">
            <div
              className="rounded-full flex items-center justify-center font-bold text-sm"
              style={{
                width: 32, height: 32,
                background: i <= idx ? 'var(--accent)' : 'var(--bg-card)',
                border: `2px solid ${i <= idx ? 'var(--accent)' : 'var(--border)'}`,
                color: i <= idx ? 'white' : 'var(--text-muted)',
                boxShadow: i <= idx ? '0 0 12px rgba(249,115,22,0.4)' : 'none',
                transition: 'all 0.3s',
              }}
            >
              {i + 1}
            </div>
            <span style={{ fontSize: '0.65rem', color: i <= idx ? 'var(--accent)' : 'var(--text-muted)', fontWeight: 600 }}>
              {s.label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div
              className="h-px flex-1 mx-2 mb-5 transition-all duration-500"
              style={{
                background: i < idx ? 'var(--accent)' : 'var(--border)',
                maxWidth: '60px',
                minWidth: '20px',
              }}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, total, clearCart } = useCart();
  const [step, setStep]       = useState<Step>('review');
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);

  const [form, setForm] = useState({
    email:   'demo@flashforge.dev',
    name:    'Demo User',
    address: '123 Flash Street, Commerce City, CA 90210',
    card:    '4242 4242 4242 4242',
    expiry:  '12/27',
    cvv:     '123',
  });

  if (items.length === 0 && step !== 'success') {
    return (
      <div className="page-wrapper flex flex-col items-center justify-center" style={{ paddingTop: 'clamp(4rem, 15vw, 8rem)', textAlign: 'center' }}>
        <p style={{ fontSize: 'clamp(3rem, 10vw, 4rem)', marginBottom: '1rem' }}>🛒</p>
        <h1 className="font-display font-bold mb-2" style={{ fontSize: 'clamp(1.4rem, 5vw, 2rem)' }}>Your cart is empty</h1>
        <p className="mb-6" style={{ color: 'var(--text-secondary)', fontSize: 'clamp(0.85rem, 2vw, 1rem)' }}>Add some flash deals first!</p>
        <Link href="/" className="btn-accent">Back to Flash Deals</Link>
      </div>
    );
  }

  async function handleConfirm() {
    setLoading(true); setError(null);
    try {
      const cartPayload = items.map(i => ({ productId: i.productId, quantity: i.quantity, price: i.price }));
      const session = await checkoutApi.createSession(DEMO_USER_ID, cartPayload);
      const key     = `checkout-${session.id}-${Date.now()}`;
      const order   = await checkoutApi.confirm(session.id, key);
      setOrderId(order.id);
      clearCart();
      setStep('success');
    } catch (err: any) {
      setError(err?.response?.data?.error?.message ?? err?.message ?? 'Checkout failed');
    } finally {
      setLoading(false);
    }
  }

  /* ─── Review ─── */
  if (step === 'review') {
    return (
      <div className="page-wrapper" style={{ paddingTop: 'clamp(1.5rem, 4vw, 2.5rem)' }}>
        <h1 className="font-display font-bold mb-2" style={{ fontSize: 'clamp(1.6rem, 5vw, 2.25rem)' }}>Checkout</h1>
        <StepIndicator current="review" />

        {/* Two-column on lg, stacked on mobile */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-8">

          {/* Order summary */}
          <div className="lg:col-span-3 flex flex-col gap-4">
            <h2 className="font-semibold flex items-center gap-2" style={{ fontSize: 'clamp(0.95rem, 2.5vw, 1.1rem)' }}>
              <ShoppingBag className="w-5 h-5 flex-shrink-0" style={{ color: 'var(--accent)' }} />
              Order Summary
            </h2>

            <div className="flex flex-col gap-3">
              {items.map(item => (
                <div key={item.productId}
                  className="flex items-center gap-3 sm:gap-4 rounded-xl"
                  style={{ padding: 'clamp(0.75rem, 3vw, 1rem)', background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                  <div className="rounded-lg flex items-center justify-center text-xl flex-shrink-0"
                    style={{ width: 48, height: 48, background: 'var(--bg-secondary)', minWidth: 48 }}>
                    🛍️
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{item.product.name}</p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Qty: {item.quantity}</p>
                  </div>
                  <p className="font-semibold flex-shrink-0" style={{ color: 'var(--accent)', fontSize: 'clamp(0.85rem, 2vw, 0.95rem)' }}>
                    ${formatPrice(item.price * item.quantity)}
                  </p>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="rounded-xl flex flex-col gap-2" style={{ padding: 'clamp(0.75rem, 3vw, 1rem)', background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
              {[
                { label: 'Subtotal', val: `$${formatPrice(total)}`,  accent: false },
                { label: 'Shipping', val: 'FREE',                    accent: true  },
                { label: 'Tax (0%)', val: '$0.00',                   accent: false },
              ].map(({ label, val, accent }) => (
                <div key={label} className="flex justify-between text-sm" style={{ color: 'var(--text-secondary)' }}>
                  <span>{label}</span>
                  <span style={accent ? { color: 'var(--success)' } : {}}>{val}</span>
                </div>
              ))}
              <div className="flex justify-between font-bold pt-2" style={{ borderTop: '1px solid var(--border)', fontSize: 'clamp(1rem, 3vw, 1.15rem)' }}>
                <span>Total</span>
                <span className="text-gradient">${formatPrice(total)}</span>
              </div>
            </div>
          </div>

          {/* Info form */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            <h2 className="font-semibold flex items-center gap-2" style={{ fontSize: 'clamp(0.95rem, 2.5vw, 1.1rem)' }}>
              <User className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--accent)' }} />
              Your Info
            </h2>

            <div className="flex flex-col gap-3">
              {[
                { label: 'Email',     key: 'email'   as const },
                { label: 'Full Name', key: 'name'    as const },
              ].map(({ label, key }) => (
                <div key={key}>
                  <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>{label}</label>
                  <input className="input-dark" value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })} />
                </div>
              ))}
            </div>

            <div>
              <h3 className="font-semibold flex items-center gap-2 mb-2" style={{ fontSize: 'clamp(0.875rem, 2vw, 1rem)' }}>
                <MapPin className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--accent)' }} />
                Shipping Address
              </h3>
              <textarea
                className="input-dark resize-none"
                rows={3}
                value={form.address}
                onChange={e => setForm({ ...form, address: e.target.value })}
              />
            </div>

            <button onClick={() => setStep('payment')} className="btn-accent w-full justify-center">
              Continue to Payment
              <ArrowRight className="w-4 h-4 flex-shrink-0" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ─── Payment ─── */
  if (step === 'payment') {
    return (
      <div className="page-wrapper" style={{ paddingTop: 'clamp(1.5rem, 4vw, 2.5rem)', maxWidth: '36rem' }}>
        <h1 className="font-display font-bold mb-2" style={{ fontSize: 'clamp(1.6rem, 5vw, 2.25rem)' }}>Payment</h1>
        <StepIndicator current="payment" />

        <div className="glass-card flex flex-col gap-5" style={{ padding: 'clamp(1.25rem, 5vw, 2rem)' }}>
          <div className="flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
            <Lock className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--success)' }} />
            <span className="text-sm">Secured by TLS encryption</span>
          </div>

          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Card Number</label>
            <input className="input-dark font-mono" value={form.card} onChange={e => setForm({ ...form, card: e.target.value })} maxLength={19} />
          </div>

          {/* Expiry + CVV — 2 col on xs+, never wraps */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Expiry</label>
              <input className="input-dark" placeholder="MM/YY" value={form.expiry} onChange={e => setForm({ ...form, expiry: e.target.value })} />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>CVV</label>
              <input className="input-dark" placeholder="123" value={form.cvv} onChange={e => setForm({ ...form, cvv: e.target.value })} maxLength={4} />
            </div>
          </div>

          <div className="flex justify-between items-center rounded-xl" style={{ padding: 'clamp(0.75rem, 3vw, 1rem)', background: 'var(--bg-secondary)' }}>
            <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Total to pay</span>
            <span className="font-bold text-gradient" style={{ fontSize: 'clamp(1.1rem, 3vw, 1.4rem)' }}>${formatPrice(total)}</span>
          </div>

          {error && (
            <div className="rounded-xl p-4 text-sm"
              style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', color: 'var(--error)' }}>
              {error}
            </div>
          )}

          <button onClick={handleConfirm} disabled={loading} className="btn-accent w-full justify-center"
            style={{ fontSize: 'clamp(0.875rem, 2.5vw, 1rem)', paddingBlock: 'clamp(0.75rem, 2vw, 0.875rem)' }}>
            {loading
              ? <><Loader2 className="w-5 h-5 animate-spin flex-shrink-0" />Processing…</>
              : <><CreditCard className="w-5 h-5 flex-shrink-0" />Pay ${formatPrice(total)}</>
            }
          </button>

          <button onClick={() => setStep('review')} className="w-full text-sm text-center py-1 transition-colors hover:text-orange-400" style={{ color: 'var(--text-muted)' }}>
            ← Back to review
          </button>
        </div>
      </div>
    );
  }

  /* ─── Success ─── */
  return (
    <div className="page-wrapper flex flex-col items-center justify-center" style={{ paddingTop: 'clamp(3rem, 10vw, 6rem)', maxWidth: '36rem', textAlign: 'center' }}>
      <div className="glass-card w-full flex flex-col items-center gap-6" style={{ padding: 'clamp(2rem, 8vw, 3rem)' }}>
        <div className="rounded-full flex items-center justify-center" style={{ width: 80, height: 80, background: 'rgba(34,197,94,0.15)' }}>
          <CheckCircle className="w-10 h-10" style={{ color: 'var(--success)' }} />
        </div>

        <div>
          <h1 className="font-display font-black text-gradient" style={{ fontSize: 'clamp(1.5rem, 6vw, 2.25rem)' }}>Order Confirmed!</h1>
          <p className="mt-2" style={{ color: 'var(--text-secondary)', fontSize: 'clamp(0.875rem, 2vw, 1rem)' }}>
            Your flash deal is secured. 🎉
          </p>
        </div>

        {orderId && (
          <div className="rounded-xl p-4 w-full" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Order ID: </span>
            <span className="font-mono text-xs break-all">{orderId}</span>
          </div>
        )}

        {/* Buttons stack on xs, row on sm */}
        <div className="flex flex-col sm:flex-row gap-3 w-full">
          <Link href="/orders" className="btn-accent flex-1 justify-center">View Orders</Link>
          <Link href="/" className="btn-ghost flex-1 justify-center">Shop More</Link>
        </div>
      </div>
    </div>
  );
}
