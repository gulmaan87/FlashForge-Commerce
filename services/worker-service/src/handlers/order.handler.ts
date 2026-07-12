import { createLogger } from '@flashforge/shared-logger';

const logger = createLogger('worker-service:order');

export async function handleOrderCreation(payload: any) {
  logger.info({ payload }, 'Handling order creation event');

}
