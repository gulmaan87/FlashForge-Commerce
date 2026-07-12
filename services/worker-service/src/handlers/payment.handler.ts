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








export async function handlePaymentSuccess(payload: PaymentSuccessPayload) {
  const { sessionId, userId, reservationIds, cart, totalAmount } = payload;

  logger.info({ sessionId, userId }, 'Handling payment.success event');


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

    if (err?.response?.status === 409) {
      logger.warn({ sessionId }, 'Order already exists for session — skipping creation');
    } else {
      logger.error({ err, sessionId }, 'Failed to create order after payment success');

      throw err;
    }
  }


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


    logger.warn({ commitFailures, sessionId }, 'Some reservations could not be committed');
  }

  logger.info({ sessionId }, 'payment.success event handled successfully');
}
