import app from './app';
import { createLogger } from '@flashforge/shared-logger';

const PORT = Number(process.env.PORT || 4002);
const logger = createLogger('inventory-service');

process.on('unhandledRejection', (reason: unknown) => {
  logger.error({ reason }, 'Unhandled promise rejection');
});

process.on('uncaughtException', (err: Error) => {
  logger.error({ err }, 'Uncaught exception');
});

app.listen(PORT, () => {
  logger.info('inventory-service listening on port ' + PORT);
});
