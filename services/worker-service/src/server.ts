import 'dotenv/config';
import app from './app';
import { createLogger } from '@flashforge/shared-logger';
import { startWorkers } from './workers';

const PORT = Number(process.env.PORT || 4006);
const logger = createLogger('worker-service');

app.listen(PORT, async () => {
  logger.info(`worker-service listening on port ${PORT}`);
  try {
    await startWorkers();
  } catch (err) {
    logger.error(err, 'Failed to start workers');
  }
});
