'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { orderApi } from '@/lib/api';
import { Package, Clock, CheckCircle, XCircle, RotateCcw, Zap } from 'lucide-react';
import Link from 'next/link';
import type { Order } from '@/lib/types';

const DEMO_USER_ID = 'user-demo-001';

function formatPrice(cents: number) { return (cents / 100).toFixed(2); }
function formatDate(iso: string) {
  return new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(iso));
}

function StatusBadge({ status }: { status: Order['status'] }) {
  const config: Record<Order['status'], { icon: React.ReactNode; label: string; cls: string }> = {
    CREATED:   { icon: <Clock   className="w-3.5 h-3.5" />, label: 'Created',   cls: 'status-created'   },
    PAID:      { icon: <CheckCircle className="w-3.5 h-3.5" />, label: 'Paid', cls: 'status-paid'      },
    FAILED:    { icon: <XCircle className="w-3.5 h-3.5" />,    label: 'Failed',    cls: 'status-failed'    },
    CANCELLED: { icon: <RotateCcw className="w-3.5 h-3.5" />,  label: 'Cancelled', cls: 'status-cancelled' },
  };
  const { icon, label, cls } = config[status] ?? config.CREATED;
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${cls}`}>
      {icon}
      {label}
    </span>
  );
}

function OrderCard({ order }: { order: Order }) {
  return (
    <div className="glass-card" style={{ padding: 'clamp(1rem, 4vw, 1.5rem)' }}>
      {/* Header row */}
      <div className="flex items-start justify-between gap-3 flex-wrap mb-4">
        <div className="min-w-0">
          <p className="font-semibold" style={{ fontSize: 'clamp(0.875rem, 2.5vw, 1rem)' }}>Order</p>
          <p className="font-mono mt-0.5 truncate" style={{ fontSize: 'clamp(0.65rem, 1.5vw, 0.75rem)', color: 'var(--text-muted)', maxWidth: 260 }}>
            {order.id}
          </p>
        </div>
        <StatusBadge status={order.status} />
      </div>

      {/* Items */}
      <div className="flex flex-col gap-2 mb-4">
        {order.items.map(item => (
          <div key={item.id} className="flex justify-between gap-4 text-sm flex-wrap" style={{ color: 'var(--text-secondary)' }}>
            <span className="min-w-0">
              Product: <span className="font-mono" style={{ fontSize: '0.7rem' }}>{item.productId.slice(0, 8)}…</span> × {item.quantity}
            </span>
            <span className="flex-shrink-0">${formatPrice(item.price * item.quantity)}</span>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 flex-wrap gap-2" style={{ borderTop: '1px solid var(--border)' }}>
        <span style={{ fontSize: 'clamp(0.7rem, 1.5vw, 0.75rem)', color: 'var(--text-muted)' }}>
          {formatDate(order.createdAt)}
        </span>
        <span className="font-bold text-gradient" style={{ fontSize: 'clamp(0.95rem, 2.5vw, 1.1rem)' }}>
          ${formatPrice(order.totalAmount)}
        </span>
      </div>
    </div>
  );
}

export default function OrdersPage() {
  const { data: orders, isLoading, isError } = useQuery({
    queryKey: ['orders', DEMO_USER_ID],
    queryFn: () => orderApi.getByUser(DEMO_USER_ID),
  });

  return (
    <div className="page-wrapper" style={{ maxWidth: '52rem', paddingTop: 'clamp(1.5rem, 4vw, 2.5rem)' }}>
      {/* Header */}
      <div className="flex items-start sm:items-center justify-between gap-3 mb-6 sm:mb-8 flex-wrap">
        <div>
          <h1 className="font-display font-bold flex items-center gap-2 flex-wrap" style={{ fontSize: 'clamp(1.5rem, 5vw, 2rem)' }}>
            <Package className="flex-shrink-0" style={{ width: 'clamp(22px, 5vw, 30px)', height: 'clamp(22px, 5vw, 30px)', color: 'var(--accent)' }} />
            My Orders
          </h1>
          <p className="mt-1" style={{ fontSize: 'clamp(0.8rem, 2vw, 0.9rem)', color: 'var(--text-secondary)' }}>
            Track your flash deal purchases
          </p>
        </div>
        <Link href="/" className="btn-ghost text-sm flex-shrink-0">
          <Zap className="w-4 h-4 flex-shrink-0" />
          Shop More
        </Link>
      </div>

      {/* Loading skeletons */}
      {isLoading && (
        <div className="flex flex-col gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="glass-card flex flex-col gap-3" style={{ padding: 'clamp(1rem, 4vw, 1.5rem)' }}>
              <div className="skeleton h-4 w-1/3" />
              <div className="skeleton h-3 w-full" />
              <div className="skeleton h-3 w-2/3" />
            </div>
          ))}
        </div>
      )}

      {/* Error */}
      {isError && (
        <div className="rounded-xl p-6 text-center"
          style={{ background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.2)', color: 'var(--error)' }}>
          <p className="font-medium">Failed to load orders</p>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
            Make sure the order-service is running on port 4005.
          </p>
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !isError && orders?.length === 0 && (
        <div className="flex flex-col items-center text-center py-16 gap-3" style={{ color: 'var(--text-muted)' }}>
          <p style={{ fontSize: 'clamp(2.5rem, 8vw, 3.5rem)' }}>📦</p>
          <p className="font-medium" style={{ fontSize: 'clamp(0.95rem, 2.5vw, 1.1rem)' }}>No orders yet</p>
          <p className="text-sm mb-4" style={{ maxWidth: '28rem' }}>Complete a flash deal checkout to see your orders here.</p>
          <Link href="/" className="btn-accent">Browse Flash Deals</Link>
        </div>
      )}

      {/* Orders list */}
      {!isLoading && !isError && orders && orders.length > 0 && (
        <div className="flex flex-col gap-4">
          {orders.map(order => <OrderCard key={order.id} order={order} />)}
        </div>
      )}
    </div>
  );
}
