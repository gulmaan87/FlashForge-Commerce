/**
 * FlashForge Commerce — Inventory Stress Test
 *
 * Simulates a true flash-sale scenario:
 * - Fixed stock of 100 units
 * - 500 concurrent VUs all trying to buy at once
 * - Validates: no oversell, correct 409 responses
 *
 * Usage:
 *   k6 run load-tests/k6/inventory-stress.js
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Counter, Rate } from 'k6/metrics';

const reservedCount  = new Counter('reservations_succeeded');
const rejectedCount  = new Counter('reservations_rejected_out_of_stock');
const errorCount     = new Counter('reservations_errored');
const successRate    = new Rate('reservation_success_or_expected_reject');

const INVENTORY_URL = 'http://localhost:4002';
const HEADERS = { 'Content-Type': 'application/json' };

// Target: STOCK_LIMIT simultaneous reservations
const STOCK_LIMIT  = 100;
const TOTAL_BUYERS = 500;

export const options = {
  scenarios: {
    flash_sale_spike: {
      executor: 'shared-iterations',
      vus: TOTAL_BUYERS,
      iterations: TOTAL_BUYERS,
      maxDuration: '2m',
    },
  },
  thresholds: {
    // We accept that ~80% will fail (out of stock) — that's correct behaviour
    reservations_succeeded:   [`count <= ${STOCK_LIMIT}`],
    http_req_failed:          ['rate < 0.01'],
  },
};

export function setup() {
  // You'd call a reset endpoint here in a real scenario
  // For now just log
  console.log(`Flash-sale stress test: ${TOTAL_BUYERS} buyers, ${STOCK_LIMIT} items`);
}

// NOTE: replace PRODUCT_ID with a real productId from your seed data
const PRODUCT_ID = process.env.PRODUCT_ID || 'replace-with-real-id';

export default function () {
  const userId = `stress-user-${__VU}-${__ITER}`;

  const res = http.post(
    `${INVENTORY_URL}/api/inventory/reserve`,
    JSON.stringify({ productId: PRODUCT_ID, userId, quantity: 1 }),
    { headers: HEADERS }
  );

  if (res.status === 200 || res.status === 201) {
    reservedCount.add(1);
    successRate.add(true);
  } else if (res.status === 409) {
    rejectedCount.add(1);
    successRate.add(true);   // 409 is correct — out of stock
  } else {
    errorCount.add(1);
    successRate.add(false);
    check(res, { 'unexpected error': () => false });
  }
}

export function teardown(data) {
  console.log('Inventory stress test complete.');
}
