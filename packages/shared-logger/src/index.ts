import pino from 'pino';
import pinoHttp from 'pino-http';
import { v4 as uuidv4 } from 'uuid';

/**
 * Creates a pino logger for manual use (server startup, DB, etc.)
 */
export function createLogger(serviceName: string): pino.Logger {
  return pino({
    name: serviceName,
    level: process.env.LOG_LEVEL || 'info',
    formatters: {
      level: (label) => ({ level: label }),
    },
    redact: ['req.headers.authorization', 'req.headers.cookie', 'password', 'token'],
  });
}

/**
 * Express HTTP-logging middleware using pino-http.
 *
 * pino-http@11 BREAKING CHANGE: passing { logger } (a pre-built pino instance)
 * causes "TypeError: logger[stringifySym] is not a function" on every response.
 * pino-http@11 must create its logger internally — pass pino options directly
 * at the root of the opts object (NOT under a "pinoOptions" key).
 *
 * We accept the app logger so callers don't need to change, but we only
 * use it to read the current log level.
 */
export function createRequestLogger(appLogger: pino.Logger) {
  return pinoHttp({
    // pino options go at root — pino-http@11 passes opts directly to pino()
    level: appLogger.level || process.env.LOG_LEVEL || 'info',
    formatters: {
      level: (label: string) => ({ level: label }),
    },
    redact: ['req.headers.authorization', 'req.headers.cookie', 'password', 'token'],
    genReqId: (req: any) =>
      req.headers['x-request-id'] || req.id || uuidv4(),
    customProps: (req: any, _res: any) => ({
      correlationId:
        req.headers['x-correlation-id'] ||
        req.headers['x-request-id'] ||
        'no-correlation-id',
    }),
  } as any);  // cast needed because pino-http types are strict about mixing pino opts
}
