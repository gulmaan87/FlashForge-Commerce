import 'dotenv/config';
import app from './app';
import { createLogger } from '@flashforge/shared-logger';

const PORT = Number(process.env.PORT || 4001);
const logger = createLogger('product-service');

process.on('unhandledRejection', (reason: unknown) => {
  logger.error({ reason }, 'Unhandled promise rejection');
});

process.on('uncaughtException', (err: Error) => {
  logger.error({ err }, 'Uncaught exception');
});

app.listen(PORT, () => {
  logger.info('product-service listening on port ' + PORT);
});
