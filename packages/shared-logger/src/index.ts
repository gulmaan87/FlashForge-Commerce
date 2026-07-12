import pino from 'pino';
import pinoHttp from 'pino-http';
import { v4 as uuidv4 } from 'uuid';




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












export function createRequestLogger(appLogger: pino.Logger) {
  return pinoHttp({

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
  } as any);
}
