import app from './app';
import { createLogger } from '@flashforge/shared-logger';

const PORT = Number(process.env.PORT || 4004);
const logger = createLogger('payment-service');

process.on('unhandledRejection', (reason: unknown) => {
  logger.error({ reason }, 'Unhandled promise rejection');
});

process.on('uncaughtException', (err: Error) => {
  logger.error({ err }, 'Uncaught exception');
});

app.listen(PORT, () => {
  logger.info('payment-service listening on port ' + PORT);
});
