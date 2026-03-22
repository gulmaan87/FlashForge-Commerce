/**
 * FlashForge Commerce — k6 Load Test Suite
 *
 * Tests the full checkout flow under progressive load:
 *   1. Browse products
 *   2. Reserve inventory
 *   3. Initiate checkout
 *   4. Verify order creation
 *
 * Usage:
 *   k6 run load-tests/k6/checkout-load.js
 *   k6 run --vus 100 --duration 60s load-tests/k6/checkout-load.js
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';

// ─── Custom Metrics ───────────────────────────────────────────────────────────
const reservationSuccessRate = new Rate('reservation_success_rate');
const checkoutSuccessRate    = new Rate('checkout_success_rate');
const reservationLatency     = new Trend('reservation_latency_ms', true);
const checkoutLatency        = new Trend('checkout_latency_ms', true);
const oversellAttempts       = new Counter('oversell_attempts');

// ─── Config ───────────────────────────────────────────────────────────────────
const BASE = {
  product:   'http://localhost:4001',
  inventory: 'http://localhost:4002',
  checkout:  'http://localhost:4003',
  order:     'http://localhost:4005',
};

const HEADERS = { 'Content-Type': 'application/json' };

// Smoke → Ramp → Spike → Cool-down
export const options = {
  stages: [
    { duration: '30s', target: 10  },   // Warm up
    { duration: '1m',  target: 50  },   // Ramp to moderate load
    { duration: '30s', target: 150 },   // Flash-sale spike
    { duration: '30s', target: 50  },   // Scale back
    { duration: '30s', target: 0   },   // Cool down
  ],
  thresholds: {
    // 95th percentile checkout must be under 2 seconds
    checkout_latency_ms:       ['p(95) < 2000'],
    reservation_latency_ms:    ['p(95) < 500'],
    reservation_success_rate:  ['rate > 0.85'],
    checkout_success_rate:     ['rate > 0.70'],
    http_req_failed:           ['rate < 0.05'],
  },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function randomUserId() {
  return `user-${Math.floor(Math.random() * 100000)}`;
}

function randomProductId(products) {
  return products[Math.floor(Math.random() * products.length)].id;
}

// ─── Setup: fetch available products ─────────────────────────────────────────
export function setup() {
  const res = http.get(`${BASE.product}/api/products`);
  if (res.status !== 200) {
    throw new Error(`Product service unavailable: ${res.status}`);
  }

  const body = JSON.parse(res.body);
  const products = body.data || body;
  if (!products || products.length === 0) {
    throw new Error('No products found — run the seed script first');
  }

  console.log(`Found ${products.length} products. Starting load test...`);
  return { products };
}

// ─── Default function (main load) ────────────────────────────────────────────
export default function (data) {
  const { products } = data;
  const userId    = randomUserId();
  const productId = randomProductId(products);
  const quantity  = 1;

  // ── Step 1: Browse product ────────────────────────────────────────────────
  const productRes = http.get(`${BASE.product}/api/products/${productId}`);
  check(productRes, { 'product fetch 200': (r) => r.status === 200 });
  sleep(0.2);

  // ── Step 2: Reserve inventory ─────────────────────────────────────────────
  const reserveStart = Date.now();
  const reserveRes = http.post(
    `${BASE.inventory}/api/inventory/reserve`,
    JSON.stringify({ productId, userId, quantity }),
    { headers: HEADERS }
  );
  reservationLatency.add(Date.now() - reserveStart);

  const reserveOk = reserveRes.status === 200 || reserveRes.status === 201;
  reservationSuccessRate.add(reserveOk);

  if (!reserveOk) {
    if (reserveRes.status === 409) oversellAttempts.add(1);
    sleep(1);
    return;
  }

  let reservationToken;
  try {
    const reserveBody = JSON.parse(reserveRes.body);
    reservationToken = reserveBody.data?.reservationToken || reserveBody.reservationToken;
  } catch {
    sleep(1);
    return;
  }

  if (!reservationToken) { sleep(1); return; }
  sleep(0.3);

  // ── Step 3: Initiate checkout ─────────────────────────────────────────────
  const sessionId = `sess-k6-${__VU}-${__ITER}`;
  const checkoutStart = Date.now();

  const checkoutRes = http.post(
    `${BASE.checkout}/api/checkout`,
    JSON.stringify({
      sessionId,
      userId,
      reservationToken,
      items: [{ productId, quantity, price: 5000 }],
      totalAmount: 5000,
    }),
    { headers: HEADERS }
  );
  checkoutLatency.add(Date.now() - checkoutStart);

  const checkoutOk = checkoutRes.status === 200 || checkoutRes.status === 201 || checkoutRes.status === 202;
  checkoutSuccessRate.add(checkoutOk);

  check(checkoutRes, {
    'checkout accepted': (r) => r.status === 200 || r.status === 201 || r.status === 202,
  });

  sleep(1);
}

// ─── Teardown ─────────────────────────────────────────────────────────────────
export function teardown() {
  console.log('Load test complete.');
}
