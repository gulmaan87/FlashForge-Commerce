import { CheckoutRepository } from '../repositories/checkout.repository';
import { CheckoutStatus, PaymentStatus } from '@flashforge/shared-types';
import axios from 'axios';
import { getEnv } from '@flashforge/shared-config';
import { publishEvent } from '@flashforge/shared-rabbitmq';
import { createLogger } from '@flashforge/shared-logger';

const logger = createLogger('checkout-service');

// 5-second timeout for all inter-service HTTP calls.
// Prevents a hung downstream service from freezing checkout indefinitely.
const http = axios.create({ timeout: 5_000 });

interface CartItem {
  productId: string;
  quantity: number;
  price: number;
}

export class CheckoutService {
  private repo: CheckoutRepository;
  private inventoryServiceUrl: string;
  private paymentServiceUrl: string;

  constructor() {
    this.repo = new CheckoutRepository();
    this.inventoryServiceUrl = getEnv('INVENTORY_SERVICE_URL', 'http://inventory-service:4002/api/inventory');
    this.paymentServiceUrl = getEnv('PAYMENT_SERVICE_URL', 'http://payment-service:4004/api/payments');
  }

  async createSession(userId: string, cart: CartItem[]) {
    let totalAmount = 0;
    cart.forEach(item => totalAmount += item.price * item.quantity);

    return this.repo.createSession({
      userId,
      cart,
      totalAmount,
      status: CheckoutStatus.INITIATED,
    });
  }

  async confirmCheckout(sessionId: string) {
    const session = await this.repo.getSession(sessionId);
    if (!session) throw new Error('Session not found');
    if (session.status !== CheckoutStatus.INITIATED && session.status !== CheckoutStatus.PAYMENT_FAILED) {
      throw new Error('Checkout session in invalid state');
    }

    const cart = session.cart as unknown as CartItem[];

    // Step 1: Reserve Inventory
    const reservations: string[] = [];
    try {
      for (const item of cart) {
        const { data } = await http.post(
          `${this.inventoryServiceUrl}/${item.productId}/reservations`,
          { quantity: item.quantity },
        );
        reservations.push(data.data.id);
      }
    } catch (err: unknown) {
      // Rollback all successfully created reservations
      for (const resId of reservations) {
        await http
          .post(`${this.inventoryServiceUrl}/reservations/${resId}/release`)
          .catch((e: unknown) => logger.error(e, 'Failed to rollback reservation'));
      }
      throw new Error('Failed to reserve inventory');
    }

    await this.repo.updateSession(sessionId, {
      status: CheckoutStatus.PAYMENT_PENDING,
      reservationId: reservations.join(','),
    });

    // Step 2: Create Payment Intent
    let paymentId: string;
    try {
      const { data } = await http.post(`${this.paymentServiceUrl}/intents`, {
        sessionId,
        amount: session.totalAmount,
      });
      paymentId = data.data.id;
      await this.repo.updateSession(sessionId, { paymentId });
    } catch (err) {
      throw new Error('Failed to create payment intent');
    }

    // Step 3: Confirm Payment (simulated — in production this would be a webhook)
    let paymentSucceeded = false;
    try {
      const { data } = await http.post(`${this.paymentServiceUrl}/confirm`, { sessionId });
      paymentSucceeded = data.data?.status === PaymentStatus.SUCCESS;
    } catch (err) {
      logger.error(err, 'Payment confirmation call failed');
    }

    // Step 4: Publish event and update session status
    // connectRabbitMQ is called once at server startup (server.ts),
    // so the channel is already available here — no per-request reconnect needed.
    try {
      if (paymentSucceeded) {
        await this.repo.updateSession(sessionId, { status: CheckoutStatus.COMPLETED });

        await publishEvent('payment.success', {
          sessionId,
          userId: session.userId,
          reservationIds: reservations,
          cart,
          totalAmount: session.totalAmount,
        });

        logger.info({ sessionId }, 'Payment success event published');
      } else {
        await this.repo.updateSession(sessionId, { status: CheckoutStatus.PAYMENT_FAILED });

        await publishEvent('payment.failed', {
          sessionId,
          reservationIds: reservations,
        });

        logger.warn({ sessionId }, 'Payment failed event published');
      }
    } catch (err) {
      logger.error(err, 'Failed to publish payment event to RabbitMQ');
      // Don't throw — the payment DB record and session status are already updated
    }

    return {
      sessionId,
      paymentId: paymentId!,
      totalAmount: session.totalAmount,
      paymentStatus: paymentSucceeded ? PaymentStatus.SUCCESS : PaymentStatus.FAILED,
    };
  }
}
