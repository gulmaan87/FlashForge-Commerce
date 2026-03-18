const fs = require('fs');
const path = require('path');

const write = (filePath, content) => {
  const fullPath = path.resolve(__dirname, filePath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content.trim() + '\n', 'utf8');
};

// 1. shared-types
write('packages/shared-types/package.json', `
{
  "name": "@flashforge/shared-types",
  "version": "1.0.0",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "private": true,
  "scripts": {
    "build": "tsc -p tsconfig.json",
    "typecheck": "tsc --noEmit -p tsconfig.json",
    "lint": "echo \\"No lint configured yet for shared-types\\""
  }
}
`);
write('packages/shared-types/tsconfig.json', `
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": "src"
  },
  "include": ["src"]
}
`);
write('packages/shared-types/src/index.ts', `
export enum ReservationStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  EXPIRED = 'EXPIRED',
  RELEASED = 'RELEASED',
}

export enum CheckoutStatus {
  INITIATED = 'INITIATED',
  PAYMENT_PENDING = 'PAYMENT_PENDING',
  PAYMENT_SUCCESS = 'PAYMENT_SUCCESS',
  PAYMENT_FAILED = 'PAYMENT_FAILED',
  COMPLETED = 'COMPLETED',
}

export enum PaymentStatus {
  CREATED = 'CREATED',
  PROCESSING = 'PROCESSING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
  TIMEOUT = 'TIMEOUT',
}

export enum OrderStatus {
  CREATED = 'CREATED',
  PAID = 'PAID',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
}
`);

// 2. shared-config
write('packages/shared-config/package.json', `
{
  "name": "@flashforge/shared-config",
  "version": "1.0.0",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "private": true,
  "scripts": {
    "build": "tsc -p tsconfig.json",
    "typecheck": "tsc --noEmit -p tsconfig.json",
    "lint": "echo \\"No lint configured yet for shared-config\\""
  }
}
`);
write('packages/shared-config/tsconfig.json', `
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": "src"
  },
  "include": ["src"]
}
`);
write('packages/shared-config/src/index.ts', `
export function getEnv(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;
  if (!value) {
    throw new Error(\`Missing required environment variable: \${name}\`);
  }
  return value;
}
`);

// 3. shared-logger
write('packages/shared-logger/package.json', `
{
  "name": "@flashforge/shared-logger",
  "version": "1.0.0",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "private": true,
  "scripts": {
    "build": "tsc -p tsconfig.json",
    "typecheck": "tsc --noEmit -p tsconfig.json",
    "lint": "echo \\"No lint configured yet for shared-logger\\""
  },
  "dependencies": {
    "pino": "^9.6.0"
  }
}
`);
write('packages/shared-logger/tsconfig.json', `
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": "src"
  },
  "include": ["src"]
}
`);
write('packages/shared-logger/src/index.ts', `
import pino from 'pino';

export function createLogger(serviceName: string) {
  return pino({
    name: serviceName,
    level: process.env.LOG_LEVEL || 'info',
  });
}
`);

// 4. shared-metrics
write('packages/shared-metrics/package.json', `
{
  "name": "@flashforge/shared-metrics",
  "version": "1.0.0",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "private": true,
  "scripts": {
    "build": "tsc -p tsconfig.json",
    "typecheck": "tsc --noEmit -p tsconfig.json",
    "lint": "echo \\"No lint configured yet for shared-metrics\\""
  }
}
`);
write('packages/shared-metrics/tsconfig.json', `
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": "src"
  },
  "include": ["src"]
}
`);
write('packages/shared-metrics/src/index.ts', `
export const METRICS_PREFIX = 'flashforge_';
`);

// 5. shared-rabbitmq
write('packages/shared-rabbitmq/package.json', `
{
  "name": "@flashforge/shared-rabbitmq",
  "version": "1.0.0",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "private": true,
  "scripts": {
    "build": "tsc -p tsconfig.json",
    "typecheck": "tsc --noEmit -p tsconfig.json",
    "lint": "echo \\"No lint configured yet for shared-rabbitmq\\""
  }
}
`);
write('packages/shared-rabbitmq/tsconfig.json', `
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": "src"
  },
  "include": ["src"]
}
`);
write('packages/shared-rabbitmq/src/index.ts', `
export const FLASHFORGE_EVENTS_EXCHANGE = 'flashforge.events';
`);

// 6. Services Boilerplates
const services = ['product-service', 'inventory-service', 'checkout-service', 'payment-service', 'order-service', 'worker-service'];
services.forEach(service => {
  write(\`services/\${service}/package.json\`, \`
{
  "name": "@flashforge/\${service}",
  "version": "1.0.0",
  "main": "dist/server.js",
  "types": "dist/server.d.ts",
  "private": true,
  "scripts": {
    "dev": "ts-node src/server.ts",
    "build": "tsc -p tsconfig.json",
    "typecheck": "tsc --noEmit -p tsconfig.json",
    "lint": "echo \\"No lint configured yet for \${service}\\""
  },
  "dependencies": {
    "@flashforge/shared-config": "workspace:*",
    "@flashforge/shared-logger": "workspace:*",
    "@flashforge/shared-metrics": "workspace:*",
    "@flashforge/shared-types": "workspace:*",
    "express": "^4.21.2"
  },
  "devDependencies": {
    "@types/express": "^5.0.0",
    "ts-node": "^10.9.2"
  }
}
  \`);
  
  write(\`services/\${service}/tsconfig.json\`, \`
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": "src"
  },
  "include": ["src"]
}
  \`);

  write(\`services/\${service}/src/app.ts\`, \`
import express from 'express';

const app = express();
app.use(express.json());

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok', service: '\${service}' });
});

app.get('/metrics', (_req, res) => {
  res.status(200).send('metrics placeholder');
});

app.get('/ready', (_req, res) => {
  res.status(200).json({ status: 'ready', service: '\${service}' });
});

export default app;
  \`);

  const port = 4001 + services.indexOf(service);
  write(\`services/\${service}/src/server.ts\`, \`
import app from './app';
import { createLogger } from '@flashforge/shared-logger';

const PORT = Number(process.env.PORT || \${port});
const logger = createLogger('\${service}');

app.listen(PORT, () => {
  logger.info(\`\${service} listening on port \${PORT}\`);
});
  \`);
});

// Remove misplaced files
const misplaced = [
  'packages/shared-config/src/package.json',
  'packages/shared-config/src/tsconfig.json',
  'packages/shared-logger/src/package.json',
  'packages/shared-types/src/package.json',
  'packages/shared-types/src/tsconfig.json',
];

misplaced.forEach(f => {
  const fp = path.resolve(__dirname, f);
  if (fs.existsSync(fp)) {
    fs.unlinkSync(fp);
  }
});
