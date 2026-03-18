import express, { NextFunction, Request, Response } from 'express';
import cors from 'cors';
import paymentRoutes from './routes/payment.routes';
import { createLogger, createRequestLogger } from '@flashforge/shared-logger';
import { metricsMiddleware, getMetrics } from '@flashforge/shared-metrics';

const logger = createLogger('payment-service');

const app: express.Application = express();
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(createRequestLogger(logger));
app.use(metricsMiddleware());

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok', service: 'payment-service' });
});

app.get('/metrics', async (_req, res) => {
  try {
    const metrics = await getMetrics();
    res.setHeader('Content-Type', 'text/plain');
    res.status(200).send(metrics);
  } catch (err) {
    res.status(500).send('Could not fetch metrics');
  }
});

app.get('/ready', (_req, res) => {
  res.status(200).json({ status: 'ready', service: 'payment-service' });
});

app.use('/api/payments', paymentRoutes);

// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  logger.error(err, 'Unhandled error in request');
  if (!res.headersSent) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: err.message || 'Internal server error' } });
  }
});

export default app;
