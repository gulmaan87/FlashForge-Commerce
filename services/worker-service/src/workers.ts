import { connectRabbitMQ, setupQueue } from '@flashforge/shared-rabbitmq';
import { getEnv } from '@flashforge/shared-config';
import { createLogger } from '@flashforge/shared-logger';
import { handlePaymentSuccess } from './handlers/payment.handler';
import { handleOrderCreation } from './handlers/order.handler';

const logger = createLogger('worker-service');

export async function startWorkers() {
  const rmqUrl = getEnv('RABBITMQ_URL', 'amqp://localhost:5672');
  const { channel } = await connectRabbitMQ({ url: rmqUrl });
  
  // Set up queues
  const paymentQueue = await setupQueue('payment.events.queue', ['payment.*']);
  const orderQueue = await setupQueue('order.events.queue', ['order.*']);

  logger.info('Workers started, waiting for messages...');

  channel.consume(paymentQueue, async (msg: any) => {
    if (msg) {
      const routingKey = msg.fields.routingKey;
      const payload = JSON.parse(msg.content.toString());
      try {
        if (routingKey === 'payment.success') {
          await handlePaymentSuccess(payload);
        }
        channel.ack(msg);
      } catch (err) {
        logger.error(err, 'Failed to process payment message');
        channel.nack(msg, false, false); // Send to DLQ
      }
    }
  });

  channel.consume(orderQueue, async (msg: any) => {
    if (msg) {
      const routingKey = msg.fields.routingKey;
      const payload = JSON.parse(msg.content.toString());
      try {
        if (routingKey === 'order.created') {
          await handleOrderCreation(payload);
        }
        channel.ack(msg);
      } catch (err) {
        logger.error(err, 'Failed to process order message');
        channel.nack(msg, false, false); // Send to DLQ
      }
    }
  });
}
