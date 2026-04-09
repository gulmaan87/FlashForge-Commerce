import { connectRabbitMQ, setupQueue, shouldRetry, getDeathCount, MAX_RETRY_ATTEMPTS } from '@flashforge/shared-rabbitmq';
import { getEnv } from '@flashforge/shared-config';
import { createLogger } from '@flashforge/shared-logger';
import { handlePaymentSuccess } from './handlers/payment.handler';
import { handleOrderCreation } from './handlers/order.handler';

const logger = createLogger('worker-service');

export async function startWorkers() {
  const rmqUrl = getEnv('RABBITMQ_URL', 'amqp://localhost:5672');
  const { channel } = await connectRabbitMQ({ url: rmqUrl });

  // Process one message at a time per worker — prevents a surge from
  // overwhelming the service and ensures fair dispatching.
  channel.prefetch(1);

  // Set up queues (main + retry holding queue + permanent DLQ)
  const paymentQueue = await setupQueue('payment.events.queue', ['payment.*']);
  const orderQueue = await setupQueue('order.events.queue', ['order.*']);

  logger.info('Workers started, waiting for messages...');

  channel.consume(paymentQueue, async (msg) => {
    if (!msg) return;
    const routingKey = msg.fields.routingKey;
    try {
      const payload = JSON.parse(msg.content.toString());
      if (routingKey === 'payment.success') {
        await handlePaymentSuccess(payload);
      }
      channel.ack(msg);
    } catch (err) {
      const deathCount = getDeathCount(msg);
      if (shouldRetry(msg)) {
        logger.warn({ err, routingKey, attempt: deathCount + 1, maxRetries: MAX_RETRY_ATTEMPTS },
          'Payment message processing failed — will retry after delay');
        channel.nack(msg, false, false); // → retry queue (TTL delay then re-deliver)
      } else {
        logger.error({ err, routingKey, deathCount },
          'Payment message exhausted retries — sending to permanent DLQ');
        channel.nack(msg, false, false); // retry count exceeded → permanent DLQ
      }
    }
  });

  channel.consume(orderQueue, async (msg) => {
    if (!msg) return;
    const routingKey = msg.fields.routingKey;
    try {
      const payload = JSON.parse(msg.content.toString());
      if (routingKey === 'order.created') {
        await handleOrderCreation(payload);
      }
      channel.ack(msg);
    } catch (err) {
      const deathCount = getDeathCount(msg);
      if (shouldRetry(msg)) {
        logger.warn({ err, routingKey, attempt: deathCount + 1, maxRetries: MAX_RETRY_ATTEMPTS },
          'Order message processing failed — will retry after delay');
        channel.nack(msg, false, false);
      } else {
        logger.error({ err, routingKey, deathCount },
          'Order message exhausted retries — sending to permanent DLQ');
        channel.nack(msg, false, false);
      }
    }
  });
}

