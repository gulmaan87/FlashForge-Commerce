# Development Guide

## Prerequisites

| Tool | Version | Install |
|---|---|---|
| Node.js | 20+ | [nodejs.org](https://nodejs.org) |
| pnpm | 9+ | `npm i -g pnpm` |
| Docker Desktop | latest | [docker.com](https://docker.com) |
| k6 (optional) | latest | [k6.io/docs](https://k6.io/docs/getting-started/installation/) |

---

## First-time Setup

```bash
# 1. Install all dependencies (monorepo)
pnpm install

# 2. Start infrastructure services only
docker compose -f infra/docker-compose/docker-compose.yml up postgres redis rabbitmq -d

# 3. Apply database migrations + seed data
pnpm --filter @flashforge/product-service exec prisma migrate deploy
pnpm --filter @flashforge/product-service exec ts-node prisma/seed.ts

pnpm --filter @flashforge/inventory-service exec prisma migrate deploy
pnpm --filter @flashforge/inventory-service exec ts-node prisma/seed.ts

pnpm --filter @flashforge/checkout-service exec prisma migrate deploy
pnpm --filter @flashforge/payment-service exec prisma migrate deploy
pnpm --filter @flashforge/order-service exec prisma migrate deploy

# 4. Start all services (hot-reload)
.\start-dev.ps1
# Services start on ports 4001-4006 + 3000 (frontend)
```

---

## Environment Variables

Each service reads from its `.env` file (copy from `.env.example`).

**Common variables** (all services):

```bash
PORT=4001                                          # Service port
DATABASE_URL=postgresql://user:password@localhost:5432/flashforge
REDIS_URL=redis://localhost:6379
RABBITMQ_URL=amqp://user:password@localhost:5672
LOG_LEVEL=info                                     # debug | info | warn | error
NODE_ENV=development
```

**Service-specific:**

```bash
# checkout-service
INVENTORY_SERVICE_URL=http://localhost:4002
PAYMENT_SERVICE_URL=http://localhost:4004

# worker-service
ORDER_SERVICE_URL=http://localhost:4005
INVENTORY_SERVICE_URL=http://localhost:4002
```

---

## Running Individual Services

```bash
# Run single service
pnpm --filter @flashforge/product-service dev

# Run all services in parallel (via start-dev.ps1) or:
pnpm -r dev
```

---

## Database Management

```bash
# Generate Prisma client after schema changes
pnpm --filter @flashforge/<service-name> exec prisma generate

# Create a new migration
pnpm --filter @flashforge/<service-name> exec prisma migrate dev --name add_my_column

# Apply migrations (prod)
pnpm --filter @flashforge/<service-name> exec prisma migrate deploy

# Open Prisma Studio (database GUI)
pnpm --filter @flashforge/<service-name> exec prisma studio

# Reset DB + reseed (dev only)
pnpm --filter @flashforge/<service-name> exec prisma migrate reset
```

---

## Adding a New Service

1. Create `services/<your-service>/` directory
2. Copy `package.json` from an existing service and update name/port
3. Add a `tsconfig.json` pointing to `packages/shared-config/tsconfig.base.json`
4. Register it in `pnpm-workspace.yaml` (it's already using `services/*`)
5. Add it to `infra/docker-compose/docker-compose.yml`
6. Add its Prometheus scrape target to `infra/docker-compose/prometheus.yml`

---

## Adding a Shared Package

1. Create `packages/<your-package>/` directory
2. Create `package.json` with `name: "@flashforge/<your-package>"`
3. Add `"main": "dist/index.js"` and `"types": "dist/index.d.ts"`
4. Add a `build` script: `"build": "tsc -p tsconfig.json"`
5. Reference it in other services: `"@flashforge/<your-package>": "workspace:*"`

---

## Code Style

- **TypeScript strict mode** — all services use `"strict": true`
- **Clean Architecture** layers: `routes → controllers → services → repositories`
- **Zod** for all runtime validation (request bodies, env vars)
- **Pino** for structured logging — always include context: `logger.info({ productId }, 'Product created')`
- **Prisma** for all DB access — no raw SQL
- Error responses always follow `{ success: false, error: { code: string, message: string } }`
- Success responses always follow `{ success: true, data: T }`

---

## Debugging

```bash
# View logs from a service in Docker
docker compose -f infra/docker-compose/docker-compose.yml logs -f checkout-service

# Check RabbitMQ queues
# Open http://localhost:15672 → Queues tab

# Check Redis keys
docker exec -it <redis-container-id> redis-cli
> KEYS *
> GET "reserved_count:some-product-id"

# Run Prisma Studio for a service
pnpm --filter @flashforge/product-service exec prisma studio
```

---

## Testing

Unit tests are not yet wired up (planned). For now use load tests:

```bash
# Prerequisites: stack running (dev or docker)
k6 run load-tests/k6/checkout-load.js

# Watch metrics in Grafana
open http://localhost:3001
```
