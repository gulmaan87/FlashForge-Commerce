import * as promClient from 'prom-client';
import { Request, Response, NextFunction } from 'express';

export const METRICS_PREFIX = 'flashforge_';

// Initialize the default registry
export const register = new promClient.Registry();

// Add default node metrics (CPU, memory, etc.)
promClient.collectDefaultMetrics({ register, prefix: METRICS_PREFIX });

// Common metrics definitions
export const httpRequestDurationMicroseconds = new promClient.Histogram({
  name: `${METRICS_PREFIX}http_request_duration_seconds`,
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10],
});

export const httpRequestsTotal = new promClient.Counter({
  name: `${METRICS_PREFIX}http_requests_total`,
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
});

export const businessEventsTotal = new promClient.Counter({
  name: `${METRICS_PREFIX}business_events_total`,
  help: 'Total number of business events (e.g. checkout, payment_success)',
  labelNames: ['event_type', 'status'],
});

register.registerMetric(httpRequestDurationMicroseconds);
register.registerMetric(httpRequestsTotal);
register.registerMetric(businessEventsTotal);

export function metricsMiddleware() {
  return (req: Request, res: Response, next: NextFunction) => {
    const end = httpRequestDurationMicroseconds.startTimer();
    res.on('finish', () => {
      const route = req.route ? req.route.path : req.path;
      end({ method: req.method, route, status_code: res.statusCode });
      httpRequestsTotal.inc({ method: req.method, route, status_code: res.statusCode });
    });
    next();
  };
}

export async function getMetrics() {
  return await register.metrics();
}
