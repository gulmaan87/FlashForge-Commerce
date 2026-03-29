import * as amqp from 'amqplib';
import { createLogger } from '@flashforge/shared-logger';

const logger = createLogger('shared-rabbitmq');

export const FLASHFORGE_EVENTS_EXCHANGE = 'flashforge.events';
export const DLQ_EXCHANGE = 'flashforge.dlq';

export interface RabbitMQConfig {
  url: string;
  /** Max reconnect attempts before giving up (default: Infinity) */
  maxRetries?: number;
  /** Initial backoff in ms — doubles each attempt, caps at 30 s (default: 1000) */
  initialBackoffMs?: number;
}

let _config: RabbitMQConfig | null = null;
let connection: amqp.ChannelModel | null = null;
let channel: amqp.Channel | null = null;
let _reconnecting = false;

// ─── Internal: establish connection + channel, setup exchanges ─────────────────
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

// ─── Internal: exponential-backoff reconnect loop ─────────────────────────────
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

// ─── Public API ───────────────────────────────────────────────────────────────

export async function connectRabbitMQ(
  config: RabbitMQConfig,
): Promise<{ connection: amqp.ChannelModel; channel: amqp.Channel }> {
  _config = config; // persist for auto-reconnect

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
  await channel.bindQueue(dlqName, DLQ_EXCHANGE, '#');

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

export function getChannel(): amqp.Channel {
  if (!channel) {
    throw new Error('RabbitMQ channel not initialized');
  }
  return channel;
}
