const fs = require('fs');
const path = require('path');

const write = (filePath, content) => {
  const fullPath = path.resolve(__dirname, filePath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content.trim() + '\n', 'utf8');
};

const pkgs = [
  'shared-types', 'shared-config', 'shared-logger', 'shared-metrics', 'shared-rabbitmq'
];

pkgs.forEach(pkg => {
  write('packages/' + pkg + '/package.json', JSON.stringify({
    "name": "@flashforge/" + pkg,
    "version": "1.0.0",
    "main": "dist/index.js",
    "types": "dist/index.d.ts",
    "private": true,
    "scripts": {
      "build": "tsc -p tsconfig.json",
      "typecheck": "tsc --noEmit -p tsconfig.json",
      "lint": "echo 'No lint configured yet'"
    },
    "dependencies": pkg === 'shared-logger' ? { "pino": "^9.6.0" } : {}
  }, null, 2));

  write('packages/' + pkg + '/tsconfig.json', JSON.stringify({
    "extends": "../../tsconfig.base.json",
    "compilerOptions": {
      "outDir": "dist",
      "rootDir": "src"
    },
    "include": ["src"]
  }, null, 2));
});

write('packages/shared-types/src/index.ts', [
  "export enum ReservationStatus { PENDING = 'PENDING', CONFIRMED = 'CONFIRMED', EXPIRED = 'EXPIRED', RELEASED = 'RELEASED' }",
  "export enum CheckoutStatus { INITIATED = 'INITIATED', PAYMENT_PENDING = 'PAYMENT_PENDING', PAYMENT_SUCCESS = 'PAYMENT_SUCCESS', PAYMENT_FAILED = 'PAYMENT_FAILED', COMPLETED = 'COMPLETED' }",
  "export enum PaymentStatus { CREATED = 'CREATED', PROCESSING = 'PROCESSING', SUCCESS = 'SUCCESS', FAILED = 'FAILED', TIMEOUT = 'TIMEOUT' }",
  "export enum OrderStatus { CREATED = 'CREATED', PAID = 'PAID', FAILED = 'FAILED', CANCELLED = 'CANCELLED' }"
].join("\n"));

write('packages/shared-config/src/index.ts', [
  "export function getEnv(name: string, fallback?: string): string {",
  "  const value = process.env[name] ?? fallback;",
  "  if (!value) throw new Error('Missing required environment variable: ' + name);",
  "  return value;",
  "}"
].join("\n"));

write('packages/shared-logger/src/index.ts', [
  "import pino from 'pino';",
  "export function createLogger(serviceName: string) {",
  "  return pino({ name: serviceName, level: process.env.LOG_LEVEL || 'info' });",
  "}"
].join("\n"));

write('packages/shared-metrics/src/index.ts', "export const METRICS_PREFIX = 'flashforge_';");
write('packages/shared-rabbitmq/src/index.ts', "export const FLASHFORGE_EVENTS_EXCHANGE = 'flashforge.events';");
