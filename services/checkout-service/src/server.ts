import 'dotenv/config';
import app from './app';
import { createLogger } from '@flashforge/shared-logger';
import { connectRabbitMQ } from '@flashforge/shared-rabbitmq';
import { getEnv } from '@flashforge/shared-config';

const PORT = Number(process.env.PORT || 4003);
const logger = createLogger('checkout-service');

process.on('unhandledRejection', (reason: unknown) => {
  logger.error({ reason }, 'Unhandled promise rejection');
});

process.on('uncaughtException', (err: Error) => {
  logger.error({ err }, 'Uncaught exception');
});

async function main() {
  // Connect RabbitMQ once at startup so published events never fail
  // due to missing channel during a request.
  const rabbitmqUrl = getEnv('RABBITMQ_URL', 'amqp://guest:guest@rabbitmq:5672');
  await connectRabbitMQ({ url: rabbitmqUrl });

  app.listen(PORT, () => {
    logger.info(`checkout-service listening on port ${PORT}`);
  });
}

main().catch((err) => {
  logger.error(err, 'Failed to start checkout-service');
  process.exit(1);
});
