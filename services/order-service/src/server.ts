import app from './app';
import { createLogger } from '@flashforge/shared-logger';

const PORT = Number(process.env.PORT || 4005);
const logger = createLogger('order-service');

process.on('unhandledRejection', (reason: unknown) => {
  logger.error({ reason }, 'Unhandled promise rejection');
});

process.on('uncaughtException', (err: Error) => {
  logger.error({ err }, 'Uncaught exception');
});

app.listen(PORT, () => {
  logger.info('order-service listening on port ' + PORT);
});
