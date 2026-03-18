const fs = require('fs');
const path = require('path');

const write = (filePath, content) => {
  const fullPath = path.resolve(__dirname, filePath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content.trim() + '\n', 'utf8');
};

const services = ['product-service', 'inventory-service', 'checkout-service', 'payment-service', 'order-service', 'worker-service'];
services.forEach((service, i) => {
  const port = 4001 + i;
  
  write('services/' + service + '/package.json', JSON.stringify({
    "name": "@flashforge/" + service,
    "version": "1.0.0",
    "main": "dist/server.js",
    "types": "dist/server.d.ts",
    "private": true,
    "scripts": {
      "dev": "ts-node src/server.ts",
      "build": "tsc -p tsconfig.json",
      "typecheck": "tsc --noEmit -p tsconfig.json",
      "lint": "echo 'No lint configured yet for " + service + "'"
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
  }, null, 2));

  write('services/' + service + '/tsconfig.json', JSON.stringify({
    "extends": "../../tsconfig.base.json",
    "compilerOptions": {
      "outDir": "dist",
      "rootDir": "src"
    },
    "include": ["src"]
  }, null, 2));

  write('services/' + service + '/src/app.ts', [
    "import express from 'express';",
    "",
    "const app = express();",
    "app.use(express.json());",
    "",
    "app.get('/health', (_req, res) => {",
    "  res.status(200).json({ status: 'ok', service: '" + service + "' });",
    "});",
    "",
    "app.get('/metrics', (_req, res) => {",
    "  res.status(200).send('metrics placeholder');",
    "});",
    "",
    "app.get('/ready', (_req, res) => {",
    "  res.status(200).json({ status: 'ready', service: '" + service + "' });",
    "});",
    "",
    "export default app;"
  ].join("\n"));

  write('services/' + service + '/src/server.ts', [
    "import app from './app';",
    "import { createLogger } from '@flashforge/shared-logger';",
    "",
    "const PORT = Number(process.env.PORT || " + port + ");",
    "const logger = createLogger('" + service + "');",
    "",
    "app.listen(PORT, () => {",
    "  logger.info('" + service + " listening on port ' + PORT);",
    "});"
  ].join("\n"));
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
