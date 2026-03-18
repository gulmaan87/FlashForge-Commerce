import { createLogger } from '@flashforge/shared-logger';
import axios from 'axios';
import { getEnv } from '@flashforge/shared-config';

const logger = createLogger('worker-service:payment');
const orderServiceUrl = getEnv('ORDER_SERVICE_URL', 'http://localhost:4005/api/orders');
const inventoryServiceUrl = getEnv('INVENTORY_SERVICE_URL', 'http://localhost:4002/api/inventory');

interface PaymentSuccessPayload {
  sessionId: string;
  userId: string;
  reservationIds: string[];
  cart: { productId: string; quantity: number; price: number }[];
  totalAmount: number;
}

/**
 * Handles the payment.success event emitted by checkout-service.
 *
 * Responsibilities:
 *  1. Create an Order record in order-service (idempotent via sessionId).
 *  2. Commit each inventory reservation so stock is permanently decremented.
 */
export async function handlePaymentSuccess(payload: PaymentSuccessPayload) {
  const { sessionId, userId, reservationIds, cart, totalAmount } = payload;

  logger.info({ sessionId, userId }, 'Handling payment.success event');

  // Step 1 — Create the order in order-service
  try {
    const idempotencyKey = `order-${sessionId}`;
    await axios.post(
      `${orderServiceUrl}`,
      {
        sessionId,
        userId,
        totalAmount,
        items: cart.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
        })),
      },
      {
        headers: { 'x-idempotency-key': idempotencyKey },
      }
    );
    logger.info({ sessionId }, 'Order created successfully');
  } catch (err: any) {
    // 409 means the order already exists (idempotency) — that's fine
    if (err?.response?.status === 409) {
      logger.warn({ sessionId }, 'Order already exists for session — skipping creation');
    } else {
      logger.error({ err, sessionId }, 'Failed to create order after payment success');
      // Re-throw so the RabbitMQ consumer can nack/retry this message
      throw err;
    }
  }

  // Step 2 — Commit inventory reservations
  const commitFailures: string[] = [];
  for (const reservationId of reservationIds) {
    try {
      await axios.post(`${inventoryServiceUrl}/reservations/${reservationId}/commit`);
      logger.info({ reservationId }, 'Inventory reservation committed');
    } catch (err) {
      logger.error({ err, reservationId }, 'Failed to commit inventory reservation');
      commitFailures.push(reservationId);
    }
  }

  if (commitFailures.length > 0) {
    // Log but continue — order is already created. A separate reconciliation job
    // or dead-letter queue should handle uncommitted reservations.
    logger.warn({ commitFailures, sessionId }, 'Some reservations could not be committed');
  }

  logger.info({ sessionId }, 'payment.success event handled successfully');
}
