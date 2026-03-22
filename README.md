# FlashForge Commerce

> **Production-grade flash-sale e-commerce platform** built on Node.js microservices, demonstrating high-concurrency checkout orchestration, inventory oversell prevention, idempotent payments, async event processing, and full observability.

---

## ✨ What's Inside

| Layer | Technology |
|---|---|
| **Services** | 6 TypeScript/Express microservices |
| **Frontend** | Next.js 15 App Router storefront |
| **Database** | PostgreSQL 15 + Prisma ORM |
| **Cache / Locks** | Redis 7 (TTL-based inventory reservation) |
| **Messaging** | RabbitMQ 3 (async payment → order pipeline) |
| **Observability** | Prometheus + Grafana |
| **Load Testing** | k6 |
| **Containers** | Docker Compose (full stack); AWS VPC via `infra/terraform/` |
| **Monorepo** | pnpm workspaces + shared packages |

---

## 🚀 Quick Start

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (with Compose v2)
- Node.js 20+ and pnpm (for local dev only)

### One-command boot (Docker — all services)

```bash
# From the repo root:
docker compose -f infra/docker-compose/docker-compose.yml up --build
```

This boots everything: PostgreSQL, Redis, RabbitMQ, all 6 microservices, the Next.js frontend, Prometheus, and Grafana.

| URL | Service |
|---|---|
| http://localhost:3000 | **Storefront** (Next.js) |
| http://localhost:4001 | Product Service API |
| http://localhost:4002 | Inventory Service API |
| http://localhost:4003 | Checkout Service API |
| http://localhost:4004 | Payment Service API |
| http://localhost:4005 | Order Service API |
| http://localhost:15672 | RabbitMQ Management (`user`/`password`) |
| http://localhost:9090 | Prometheus |
| http://localhost:3001 | Grafana (`admin`/`admin`) |

### Local Development (hot-reload)

```powershell
# Install dependencies
pnpm install

# Start infrastructure (Postgres, Redis, RabbitMQ)
docker compose -f infra/docker-compose/docker-compose.yml up postgres redis rabbitmq -d

# Run all services with hot-reload
.\start-dev.ps1
```

### Seed Product Data

```bash
pnpm --filter @flashforge/product-service exec prisma migrate deploy
pnpm --filter @flashforge/product-service exec ts-node prisma/seed.ts

pnpm --filter @flashforge/inventory-service exec prisma migrate deploy
pnpm --filter @flashforge/inventory-service exec ts-node prisma/seed.ts
```

---

## 🏗️ Architecture

See [docs/architecture.md](docs/architecture.md) for the full design.

```
Browser
  │
  ▼
Next.js Frontend (3000)
  │
  ├─► Product Service (4001)  ──► PostgreSQL (products)
  │
  ├─► Inventory Service (4002) ─► PostgreSQL (inventory)
  │                              Redis (TTL reservation locks)
  │
  └─► Checkout Service (4003) ──► Inventory Service (reserve)
                                  Payment Service (charge)
                                  RabbitMQ (payment_completed / payment_failed)
                                     │
                                     ▼
                               Worker Service (4006)
                                  │
                                  ├─► Order Service (4005) ──► PostgreSQL (orders)
                                  └─► Inventory Service (commit/release)
```

---

## 🔑 Key Design Decisions

### 1. Inventory Reservation with TTL (No Oversell)
Inventory is **reserved** (not decremented) in Redis with a 10-minute TTL before checkout. This means:
- Concurrent requests see correct stock levels
- Abandoned carts auto-release after TTL
- Actual decrement only happens after payment confirmation

### 2. Idempotent Payments
Every payment request includes a `sessionId`. The payment service stores results keyed by `sessionId` — duplicate retries return the cached outcome, preventing double charges.

### 3. Async Order Creation
Checkout does not wait for order creation. Instead:
1. Payment response is immediate (sync)
2. A `payment_completed` event is published to RabbitMQ
3. Worker Service consumes it and creates the order
4. This keeps checkout latency low and order creation reliable

### 4. Saga Pattern (Worker Service)
The worker implements a compensating saga:
- **payment_completed** → create order + commit inventory
- **payment_failed** → release inventory reservation

---

## 📊 Observability

### Prometheus Metrics
All services expose `/metrics` with:
- `http_requests_total` (by method, path, status_code)
- `http_request_duration_seconds` (histogram for p50/p95/p99)

### Grafana Dashboard
Auto-provisioned at http://localhost:3001 → **FlashForge Commerce / Service Overview**:
- HTTP requests/sec per service
- p95 latency per service
- 5xx error rate
- Checkout & payment success panels

---

## 🧪 Load Testing

```bash
# Install k6 — https://k6.io/docs/getting-started/installation/

# Full checkout flow load test (progressive ramp → spike)
k6 run load-tests/k6/checkout-load.js

# Flash-sale stress test (500 buyers, 100 items — validates no oversell)
k6 run load-tests/k6/inventory-stress.js
```

**Default thresholds:**
- Checkout p95 latency < 2000ms
- Reservation p95 latency < 500ms
- Checkout success rate > 70%
- HTTP error rate < 5%

---

## 📁 Project Structure

```
FlashForge Commerce/
├── services/
│   ├── product-service/     Port 4001 — Product CRUD
│   ├── inventory-service/   Port 4002 — Stock reservation
│   ├── checkout-service/    Port 4003 — Checkout orchestration
│   ├── payment-service/     Port 4004 — Mock payment gateway
│   ├── order-service/       Port 4005 — Order management
│   └── worker-service/      Port 4006 — Async event consumers
├── frontend/                Next.js 15 storefront
├── packages/
│   ├── shared-types/        Shared TypeScript interfaces
│   ├── shared-config/       Env config helpers
│   ├── shared-logger/       Structured Pino logging
│   ├── shared-metrics/      Prometheus middleware
│   └── shared-rabbitmq/     RabbitMQ connection factory
├── infra/
│   ├── docker-compose/      Full stack Compose + Prometheus + Grafana
│   └── terraform/           AWS VPC foundation (+ phased tasks in SKILL.md)
└── load-tests/k6/           k6 load & stress tests
```

---

## 📄 Docs

- [Architecture Deep-Dive](docs/architecture.md)
- [API Reference](docs/api.md)
- [Development Guide](docs/development.md)