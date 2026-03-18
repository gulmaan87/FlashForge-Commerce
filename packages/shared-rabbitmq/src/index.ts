import * as amqp from 'amqplib';

export const FLASHFORGE_EVENTS_EXCHANGE = 'flashforge.events';
export const DLQ_EXCHANGE = 'flashforge.dlq';

export interface RabbitMQConfig {
  url: string;
}

let connection: any = null;
let channel: any = null;

export async function connectRabbitMQ(config: RabbitMQConfig): Promise<{ connection: any; channel: any }> {
  if (connection && channel) {
    return { connection, channel };
  }

  try {
    const conn = await amqp.connect(config.url);
    const ch = await conn.createChannel();

    // Setup main exchange
    await ch.assertExchange(FLASHFORGE_EVENTS_EXCHANGE, 'topic', { durable: true });
    
    // Setup DLQ exchange
    await ch.assertExchange(DLQ_EXCHANGE, 'topic', { durable: true });

    conn.on('error', (err) => {
      console.error('RabbitMQ connection error', err);
      connection = null;
      channel = null;
    });

    conn.on('close', () => {
      console.warn('RabbitMQ connection closed');
      connection = null;
      channel = null;
    });

    connection = conn;
    channel = ch;

    return { connection: conn, channel: ch };
  } catch (error) {
    console.error('Failed to connect to RabbitMQ', error);
    throw error;
  }
}

export async function publishEvent(routingKey: string, payload: any, options?: amqp.Options.Publish) {
  if (!channel) {
    throw new Error('RabbitMQ channel is not initialized');
  }

  const message = Buffer.from(JSON.stringify(payload));
  return channel.publish(FLASHFORGE_EVENTS_EXCHANGE, routingKey, message, {
    persistent: true,
    ...options,
  });
}

export async function setupQueue(queueName: string, routingKeys: string[]) {
  if (!channel) {
    throw new Error('RabbitMQ channel is not initialized');
  }

  const dlqName = `${queueName}.dlq`;

  // Create DLQ
  await channel.assertQueue(dlqName, { durable: true });
  await channel.bindQueue(dlqName, DLQ_EXCHANGE, '#');

  // Create Main Queue
  const q = await channel.assertQueue(queueName, {
    durable: true,
    deadLetterExchange: DLQ_EXCHANGE,
    deadLetterRoutingKey: queueName,
  });

  for (const rk of routingKeys) {
    await channel.bindQueue(q.queue, FLASHFORGE_EVENTS_EXCHANGE, rk);
  }

  return q.queue;
}

export function getChannel() {
  if (!channel) {
    throw new Error('RabbitMQ channel not initialized');
  }
  return channel;
}
