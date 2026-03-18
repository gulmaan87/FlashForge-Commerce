import { CheckoutRepository } from '../repositories/checkout.repository';
import { CheckoutStatus, PaymentStatus } from '@flashforge/shared-types';
import axios from 'axios';
import { getEnv } from '@flashforge/shared-config';
import { publishEvent, connectRabbitMQ } from '@flashforge/shared-rabbitmq';
import { createLogger } from '@flashforge/shared-logger';

const logger = createLogger('checkout-service');

export class CheckoutService {
  private repo: CheckoutRepository;
  private inventoryServiceUrl: string;
  private paymentServiceUrl: string;
  private rabbitMqUrl: string;

  constructor() {
    this.repo = new CheckoutRepository();
    this.inventoryServiceUrl = getEnv('INVENTORY_SERVICE_URL', 'http://localhost:4002/api/inventory');
    this.paymentServiceUrl = getEnv('PAYMENT_SERVICE_URL', 'http://localhost:4004/api/payments');
    this.rabbitMqUrl = getEnv('RABBITMQ_URL', 'amqp://localhost:5672');
  }

  async createSession(userId: string, cart: { productId: string; quantity: number; price: number }[]) {
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

    const cart = session.cart as any[];
    
    // Step 1: Reserve Inventory
    const reservations: string[] = [];
    try {
      for (const item of cart) {
        const { data } = await axios.post(`${this.inventoryServiceUrl}/${item.productId}/reservations`, {
          quantity: item.quantity
        });
        reservations.push(data.data.id);
      }
    } catch (err: any) {
      // Rollback all successfully created reservations
      for (const resId of reservations) {
        await axios.post(`${this.inventoryServiceUrl}/reservations/${resId}/release`).catch(e => logger.error(e, 'Failed to rollback reservation'));
      }
      throw new Error('Failed to reserve inventory');
    }

    await this.repo.updateSession(sessionId, {
      status: CheckoutStatus.PAYMENT_PENDING,
      reservationId: reservations.join(',')
    });

    // Step 2: Create Payment Intent
    let paymentId: string;
    try {
      const { data } = await axios.post(`${this.paymentServiceUrl}/intents`, {
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
      const { data } = await axios.post(`${this.paymentServiceUrl}/confirm`, { sessionId });
      paymentSucceeded = data.data?.status === PaymentStatus.SUCCESS;
    } catch (err) {
      logger.error(err, 'Payment confirmation call failed');
    }

    // Step 4: Publish event and update session status
    try {
      await connectRabbitMQ({ url: this.rabbitMqUrl });

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
      paymentId,
      totalAmount: session.totalAmount,
      paymentStatus: paymentSucceeded ? PaymentStatus.SUCCESS : PaymentStatus.FAILED,
    };
  }
}

