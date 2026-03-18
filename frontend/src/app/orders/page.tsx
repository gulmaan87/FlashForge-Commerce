'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { orderApi } from '@/lib/api';
import { Package, Clock, CheckCircle, XCircle, RotateCcw, Zap } from 'lucide-react';
import Link from 'next/link';
import type { Order } from '@/lib/types';

const DEMO_USER_ID = 'user-demo-001';

function formatPrice(cents: number) {
  return (cents / 100).toFixed(2);
}

function formatDate(iso: string) {
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(iso));
}

function StatusBadge({ status }: { status: Order['status'] }) {
  const config: Record<Order['status'], { icon: React.ReactNode; label: string; cls: string }> = {
    CREATED:   { icon: <Clock className="w-3.5 h-3.5" />,       label: 'Created',   cls: 'status-created' },
    PAID:      { icon: <CheckCircle className="w-3.5 h-3.5" />, label: 'Paid',      cls: 'status-paid' },
    FAILED:    { icon: <XCircle className="w-3.5 h-3.5" />,     label: 'Failed',    cls: 'status-failed' },
    CANCELLED: { icon: <RotateCcw className="w-3.5 h-3.5" />,   label: 'Cancelled', cls: 'status-cancelled' },
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
    <div className="glass-card p-5 space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <p className="font-semibold">Order</p>
          <p className="font-mono text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{order.id}</p>
        </div>
        <StatusBadge status={order.status} />
      </div>

      {/* Items */}
      <div className="space-y-2">
        {order.items.map(item => (
          <div key={item.id} className="flex justify-between text-sm" style={{ color: 'var(--text-secondary)' }}>
            <span>Product ID: <span className="font-mono text-xs">{item.productId.slice(0, 8)}…</span> × {item.quantity}</span>
            <span>${formatPrice(item.price * item.quantity)}</span>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3" style={{ borderTop: '1px solid var(--border)' }}>
        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
          {formatDate(order.createdAt)}
        </span>
        <span className="font-bold text-gradient">${formatPrice(order.totalAmount)}</span>
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
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Package className="w-7 h-7" style={{ color: 'var(--accent)' }} />
            My Orders
          </h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
            Track your flash deal purchases
          </p>
        </div>
        <Link href="/" className="btn-ghost text-sm">
          <Zap className="w-4 h-4" />
          Shop More
        </Link>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="glass-card p-5 space-y-3">
              <div className="skeleton h-4 w-1/3" />
              <div className="skeleton h-3 w-full" />
              <div className="skeleton h-3 w-2/3" />
            </div>
          ))}
        </div>
      )}

      {/* Error */}
      {isError && (
        <div
          className="rounded-xl p-6 text-center"
          style={{ background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.2)', color: 'var(--error)' }}
        >
          <p className="font-medium">Failed to load orders</p>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
            Make sure the order-service is running on port 4005.
          </p>
        </div>
      )}

      {/* Empty */}
      {!isLoading && !isError && orders?.length === 0 && (
        <div className="text-center py-20" style={{ color: 'var(--text-muted)' }}>
          <p className="text-5xl mb-4">📦</p>
          <p className="font-medium mb-2">No orders yet</p>
          <p className="text-sm mb-6">Complete a flash deal checkout to see your orders here.</p>
          <Link href="/" className="btn-accent">Browse Flash Deals</Link>
        </div>
      )}

      {/* Orders list */}
      {!isLoading && !isError && orders && orders.length > 0 && (
        <div className="space-y-4">
          {orders.map(order => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      )}
    </div>
  );
}
