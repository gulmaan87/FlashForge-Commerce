import * as amqp from 'amqplib';
import { createLogger } from '@flashforge/shared-logger';

const logger = createLogger('shared-rabbitmq');

export const FLASHFORGE_EVENTS_EXCHANGE = 'flashforge.events';
export const DLQ_EXCHANGE = 'flashforge.dlq';






export const MAX_RETRY_ATTEMPTS = 3;





export const RETRY_DELAY_MS = 5_000;

export interface RabbitMQConfig {
  url: string;

  maxRetries?: number;

  initialBackoffMs?: number;
}








export function getDeathCount(msg: amqp.ConsumeMessage): number {
  const xDeath = msg.properties?.headers?.['x-death'];
  if (!Array.isArray(xDeath)) return 0;
  return xDeath.reduce((sum: number, entry: { count?: number }) => sum + (entry.count ?? 0), 0);
}









export function shouldRetry(msg: amqp.ConsumeMessage): boolean {
  return getDeathCount(msg) < MAX_RETRY_ATTEMPTS;
}

let _config: RabbitMQConfig | null = null;
let connection: amqp.ChannelModel | null = null;
let channel: amqp.Channel | null = null;
let _reconnecting = false;


async function _connect(config: RabbitMQConfig): Promise<void> {
  const conn = await amqp.connect(config.url);
  const ch = await conn.createChannel();

  await ch.assertExchange(FLASHFORGE_EVENTS_EXCHANGE, 'topic', { durable: true });
  await ch.assertExchange(DLQ_EXCHANGE, 'topic', { durable: true });

  conn.on('error', (err) => {
    logger.error({ err }, 'RabbitMQ connection error — will reconnect');
    connection = null;
    channel = null;
    _scheduleReconnect();
  });

  conn.on('close', () => {
    logger.warn('RabbitMQ connection closed — will reconnect');
    connection = null;
    channel = null;
    _scheduleReconnect();
  });

  connection = conn;
  channel = ch;
  logger.info('RabbitMQ connected successfully');
}


function _scheduleReconnect(): void {
  if (_reconnecting || !_config) return;
  _reconnecting = true;

  const maxRetries = _config.maxRetries ?? Infinity;
  const initialBackoffMs = _config.initialBackoffMs ?? 1_000;
  let attempt = 0;

  const tryReconnect = async (): Promise<void> => {
    if (attempt >= maxRetries) {
      logger.error({ maxRetries }, 'RabbitMQ reconnect exhausted max retries — giving up');
      _reconnecting = false;
      return;
    }

    const backoff = Math.min(initialBackoffMs * 2 ** attempt, 30_000);
    attempt++;
    logger.info({ attempt, backoffMs: backoff }, 'Scheduling RabbitMQ reconnect');

    await new Promise<void>((resolve) => setTimeout(resolve, backoff));

    try {
      await _connect(_config!);
      _reconnecting = false;
    } catch (err) {
      logger.error({ err, attempt }, 'RabbitMQ reconnect attempt failed');
      void tryReconnect();
    }
  };

  void tryReconnect();
}



export async function connectRabbitMQ(
  config: RabbitMQConfig,
): Promise<{ connection: amqp.ChannelModel; channel: amqp.Channel }> {
  _config = config;

  if (connection && channel) {
    return { connection, channel };
  }

  try {
    await _connect(config);
  } catch (error) {
    logger.error({ error }, 'Initial RabbitMQ connection failed');
    throw error;
  }

  return { connection: connection!, channel: channel! };
}

export async function publishEvent(
  routingKey: string,
  payload: unknown,
  options?: amqp.Options.Publish,
) {
  if (!channel) {
    throw new Error('RabbitMQ channel is not initialized — call connectRabbitMQ first');
  }

  const message = Buffer.from(JSON.stringify(payload));
  return channel.publish(FLASHFORGE_EVENTS_EXCHANGE, routingKey, message, {
    persistent: true,
    ...options,
  });
}

export async function setupQueue(queueName: string, routingKeys: string[]) {
  if (!channel) {
    throw new Error('RabbitMQ channel is not initialized — call connectRabbitMQ first');
  }


  const dlqName = `${queueName}.dlq`;
  await channel.assertQueue(dlqName, { durable: true });
  await channel.bindQueue(dlqName, DLQ_EXCHANGE, dlqName);




  const retryQueueName = `${queueName}.retry`;
  const RETRY_EXCHANGE = 'flashforge.retry';
  await channel.assertExchange(RETRY_EXCHANGE, 'direct', { durable: true });

  await channel.assertQueue(retryQueueName, {
    durable: true,
    messageTtl: RETRY_DELAY_MS,
    deadLetterExchange: FLASHFORGE_EVENTS_EXCHANGE,
    deadLetterRoutingKey: routingKeys[0],
  });
  await channel.bindQueue(retryQueueName, RETRY_EXCHANGE, queueName);


  const q = await channel.assertQueue(queueName, {
    durable: true,
    deadLetterExchange: RETRY_EXCHANGE,
    deadLetterRoutingKey: queueName,
  });

  for (const rk of routingKeys) {
    await channel.bindQueue(q.queue, FLASHFORGE_EVENTS_EXCHANGE, rk);
  }

  logger.info({ queueName, retryQueueName, dlqName, maxRetries: MAX_RETRY_ATTEMPTS }, 'Queue topology set up');
  return q.queue;
}

export function getChannel(): amqp.Channel {
  if (!channel) {
    throw new Error('RabbitMQ channel not initialized');
  }
  return channel;
}
