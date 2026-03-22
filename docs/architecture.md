# Architecture Deep-Dive

## System Overview

FlashForge Commerce is a microservices-based e-commerce platform purpose-built to handle **burst traffic**, **concurrent checkout**, and **inventory race conditions** — the core challenges of flash sales.

---

## Component Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          Browser / Client                                │
└───────────────────────────────┬─────────────────────────────────────────┘
                                │ HTTP
                                ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                     Next.js Frontend  :3000                             │
│  pages: / (home)  /products  /checkout  /order-confirmation             │
└──────┬────────────────────┬──────────────────────┬───────────────────── ┘
       │                    │                       │
  GET /api/products    POST /api/checkout     GET /api/orders/:id
       │                    │                       │
       ▼                    ▼                       ▼
┌──────────────┐  ┌──────────────────┐   ┌──────────────────┐
│Product Svc   │  │ Checkout Svc     │   │  Order Svc       │
│   :4001      │  │   :4003          │   │    :4005         │
│              │  │                  │   │                  │
│ CRUD         │  │ 1. validateCart  │   │ idempotent       │
│ PostgreSQL   │  │ 2. reserve(inv)  │   │ order create     │
└──────────────┘  │ 3. pay(payment)  │   │ PostgreSQL       │
                  │ 4. publish(mq)   │   └──────────────────┘
                  └──────┬───────────┘            ▲
                         │                        │
              ┌──────────▼─────────┐   ┌──────────┴─────────┐
              │  Inventory Svc     │   │  Worker Svc        │
              │    :4002           │   │    :4006           │
              │                   │   │                    │
              │  reserve()        │   │ consumes:          │
              │  commit()         │   │ payment_completed  │
              │  release()        │   │ payment_failed     │
              │  PostgreSQL       │   │                    │
              │  Redis (TTL lock) │   │ → createOrder()    │
              └───────────────────┘   │ → commitInv()      │
                                      │ → releaseInv()     │
              ┌─────────────────┐     └──────────┬─────────┘
              │  Payment Svc    │                 │
              │    :4004        ◄─ sync ──────────┘
              │                 │  (checkout calls it)
              │  mock gateway   │
              │  80% success    │     ┌───────────────────┐
              │  idempotency    │     │  RabbitMQ :5672   │
              │  sessionId      │     │                   │
              └─────────────────┘     │ exchange: events  │
                                      │ queue: payments   │
                       Checkout ──────► orders            │
                       publishes      └───────────────────┘
```

---

## Data Flow: Checkout

```
1. POST /api/checkout  (sessionId, userId, items, reservationToken)
        │
        ├─ Validate items against product catalogue
        │
        ├─ Confirm reservationToken still valid (inventory-service)
        │
        ├─ POST /api/payments  →  Payment Service
        │       │
        │       ├─ [SUCCESS 200] idempotent charge recorded
        │       │
        │       └─ [FAIL 402]   → release reservation → return 402
        │
        ├─ [Payment OK] publish → RabbitMQ: payment_completed
        │
        └─ Return 201 {checkoutId, status: "processing"}

Async (Worker Service):
        RabbitMQ consumer receives payment_completed
        │
        ├─ POST /api/orders (idempotent, keyed by checkoutId)
        │
        └─ POST /api/inventory/commit (decrement reserved stock)
```

---

## Inventory Reservation Protocol

Prevents overselling without database-level locks on every request:

```
1.  Client → POST /api/inventory/reserve
            { productId, userId, quantity }

2.  Inventory Service:
      a. Check Redis SET NX "reserve:{productId}:{userId}" with TTL=600s
         (prevents same user double-reserving)
      b. Increment "reserved_count:{productId}" atomically in Redis
      c. Verify reserved_count ≤ available_stock
         YES → return reservationToken (UUID)
         NO  → return 409 { code: "OUT_OF_STOCK" }

3.  On payment success:
      POST /api/inventory/commit { reservationToken }
      → decrement stock in PostgreSQL
      → delete Redis keys

4.  On payment failure OR TTL expiry:
      POST /api/inventory/release { reservationToken }
      → decrement reserved_count in Redis
      → Redis TTL auto-cleans user key
```

---

## Idempotency

| Service | Idempotency Key | Behaviour |
|---|---|---|
| Payment | `sessionId` | Returns cached outcome on retry |
| Order | `checkoutId` | Duplicate inserts ignored (upsert) |
| Inventory Reserve | `userId + productId` | Redis NX prevents double reserve |

---

## Shared Packages

| Package | Responsibility |
|---|---|
| `@flashforge/shared-types` | Common TypeScript interfaces and Zod schemas |
| `@flashforge/shared-config` | `env()` helper — reads & validates env vars |
| `@flashforge/shared-logger` | Pino structured logger factory |
| `@flashforge/shared-metrics` | Prometheus `prom-client` middleware |
| `@flashforge/shared-rabbitmq` | `createChannel()` factory, exchange/queue declarations |

---

## Technology Decisions

### Why Redis for reservations (not Postgres)?
Redis atomic operations (`INCR`, `SET NX`) handle high-concurrency locks without the overhead of Postgres row locks. At 500 RPS, Redis handles this in microseconds; a Postgres `SELECT FOR UPDATE` would serialize requests.

### Why RabbitMQ instead of direct HTTP for order creation?
If checkout called order-service synchronously:
- Order-service outage = checkout fails (cascading failure)
- Order creation latency adds directly to checkout latency

With RabbitMQ:
- Checkout returns immediately after payment
- Order creation is durable (messages survive restarts)
- Order-service can scale independently

### Why Prisma ORM?
- Type-safe queries without raw SQL
- Auto-generated migrations
- Works well in monorepo with `prisma generate` per service

---

## Deployment

### Docker Compose (all-in-one)
```bash
docker compose -f infra/docker-compose/docker-compose.yml up --build
```

### Kubernetes
Optional: per-service `Deployment` + `Service` + `ConfigMap`; HPA can target `checkout-service` and `inventory-service`. (Manifests may be added under `infra/k8s/` when adopted.)

### AWS (Terraform)
VPC baseline and phased tasks (RDS, ECS, Amazon MQ, etc.) are tracked in root **`SKILL.md`** and implemented under `infra/terraform/`.

---

## Performance Targets

| Metric | Target |
|---|---|
| Checkout p95 latency | < 2s |
| Inventory reservation p95 | < 500ms |
| Checkout success rate (under load) | > 70% |
| Oversell rate | 0% |
| Payment idempotency | 100% |
