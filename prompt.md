# FLASHFORGE COMMERCE — MASTER BUILD PROMPT

## 1. PROJECT OVERVIEW

**Project Name:** FlashForge Commerce  
**Category:** Production-grade flash-sale checkout and reliability platform  
**Goal:** Build a high-performance, resilient, full-stack e-commerce platform optimized for flash-sale traffic spikes, checkout reliability, inventory consistency, and production-grade observability.

### Core Problem
Traditional e-commerce platforms fail under flash-sale conditions due to:
- overselling inventory
- payment timeouts
- duplicate orders
- poor retry logic
- weak observability
- lack of graceful degradation under load

### Product Objective
Create a portfolio-grade, real-world system that demonstrates:
- senior full-stack architecture
- microservices design
- event-driven reliability patterns
- strong TypeScript engineering standards
- DevOps maturity
- observability and failure handling

### Success Metrics
- Checkout flow remains consistent under high concurrency
- Inventory reservation prevents overselling
- Payment retries are idempotent
- Services expose health + metrics endpoints
- Full local environment runs with Docker Compose
- Repo is production-style and interview-ready

---

## 2. TARGET ARCHITECTURE

### Monorepo Structure
- `frontend/` → Next.js storefront + admin dashboard (optional admin later)
- `services/product-service/`
- `services/inventory-service/`
- `services/checkout-service/`
- `services/payment-service/`
- `services/order-service/`
- `services/worker-service/`
- `packages/shared-types/`
- `packages/shared-config/`
- `packages/shared-logger/`
- `packages/shared-metrics/`
- `packages/shared-rabbitmq/`
- `infra/docker-compose/`
- `infra/kubernetes/`
- `infra/terraform/`
- `load-tests/k6/`
- `docs/`
- `.github/workflows/`

### High-Level Service Roles
1. **Frontend**
   - product listing
   - product detail page
   - cart
   - checkout UI
   - order confirmation
   - loading / error / retry states

2. **Product Service**
   - product catalog
   - pricing
   - product detail retrieval
   - availability summary (read-only view)

3. **Inventory Service**
   - stock source of truth
   - stock reservation
   - reservation expiration
   - stock release on payment failure
   - stock commit on order success

4. **Checkout Service**
   - orchestrates checkout session
   - validates cart
   - creates reservation request
   - initiates payment
   - handles idempotency key
   - emits checkout events

5. **Payment Service**
   - mock payment gateway integration initially
   - payment intent creation
   - payment success/failure simulation
   - retry-safe processing
   - idempotent payment callbacks

6. **Order Service**
   - creates order record
   - finalizes successful order
   - tracks order state
   - exposes order query endpoints

7. **Worker Service**
   - async consumers for RabbitMQ
   - retries / dead-letter handling
   - reservation expiration jobs
   - reconciliation jobs
   - background consistency tasks

---

## 3. TECH STACK (RECOMMENDED)

### Frontend
- Next.js (App Router)
- React
- TypeScript
- Tailwind CSS
- TanStack Query
- Zustand (optional)
- Zod
- Axios or fetch wrapper

### Backend Services
- Node.js 20.x
- Express.js
- TypeScript
- Zod for request validation
- Prisma ORM (recommended)
- PostgreSQL
- Redis (caching + locks + rate limiting + idempotency support)
- RabbitMQ (event bus / async workflows)
- Pino (logging)
- Prometheus metrics
- OpenTelemetry (phase 2/3)

### DevOps / Infra
- pnpm workspaces
- Docker
- Docker Compose
- GitHub Actions
- Prometheus
- Grafana
- Nginx (optional gateway layer)
- Kubernetes manifests (phase 3)
- Terraform skeleton (phase 3)

---

## 4. ENGINEERING STANDARDS

### Non-Negotiable Rules
- Strict TypeScript only
- No `any` unless absolutely unavoidable and justified
- Validate all inbound requests with Zod
- All services must expose `/health` and `/metrics`
- All APIs must return consistent response shapes
- All services must use structured logging
- All critical operations must be idempotent where relevant
- All retries must be bounded and observable
- No placeholder code in final implementation
- No TODO-only stubs for core business logic
- Keep functions small and composable
- Prefer clean architecture separation:
  - routes
  - controllers
  - services
  - repositories
  - middleware
  - types

### Code Style
- Use clear naming
- Prefer explicit return types on public functions
- Centralize error handling middleware
- Shared types live in `packages/shared-types`
- Shared config parsing lives in `packages/shared-config`
- Shared logger abstraction in `packages/shared-logger`
- Shared metrics helpers in `packages/shared-metrics`
- Shared RabbitMQ wrapper in `packages/shared-rabbitmq`

---

## 5. ROOT MONOREPO FILES TO CREATE

### Root `package.json`
Must include:
- workspace scripts
- Node + pnpm engine constraints
- formatting + lint + typecheck + build scripts

### `pnpm-workspace.yaml`
Include:
- `frontend`
- `services/*`
- `packages/*`

### `tsconfig.base.json`
Base strict TS config shared across all workspaces.

### Root config files
- `.gitignore`
- `.editorconfig`
- `.npmrc`
- `.prettierrc`
- `eslint.config.js`
- `.nvmrc`
- `README.md`

---

## 6. SERVICE FOLDER STRUCTURE (FOR EACH SERVICE)

Each service should follow:

```text
service-name/
├── src/
│   ├── routes/
│   ├── controllers/
│   ├── services/
│   ├── repositories/
│   ├── middleware/
│   ├── types/
│   ├── app.ts
│   └── index.ts
├── prisma/               (if using Prisma)
├── package.json
├── tsconfig.json
├── .env.example
└── Dockerfile
```

### Required Initial Endpoints (all services)
- `GET /health`
- `GET /metrics`

### Optional Initial Endpoint
- `GET /ready` for readiness checks

---

## 7. SHARED PACKAGES DESIGN

### `packages/shared-types`
Contains:
- common API response types
- event payload types
- DTOs shared across services
- order status enums
- payment status enums
- inventory reservation types
- idempotency header types

### `packages/shared-config`
Contains:
- environment parsing
- service name config
- port config
- DB URL validation
- Redis URL validation
- RabbitMQ URL validation
- typed config object exports

### `packages/shared-logger`
Contains:
- Pino base logger
- request-scoped child logger helpers
- correlation ID helpers
- environment-aware logging levels

### `packages/shared-metrics`
Contains:
- Prometheus registry helpers
- HTTP duration metrics
- request count metrics
- business event counters
- inventory reservation metrics
- payment retry counters

### `packages/shared-rabbitmq`
Contains:
- connection factory
- channel helpers
- exchange + queue bootstrap helpers
- publish/consume wrappers
- retry headers
- dead-letter helpers

---

## 8. DATABASE DESIGN (PHASE 1 + PHASE 2)

### Product Service DB Tables
- `products`
- `product_prices`
- `product_metadata` (optional)

### Inventory Service DB Tables
- `inventory_items`
- `inventory_reservations`
- `inventory_reservation_events`

### Checkout Service DB Tables
- `checkout_sessions`
- `checkout_attempts`
- `idempotency_keys`

### Payment Service DB Tables
- `payment_intents`
- `payment_transactions`
- `payment_callbacks`

### Order Service DB Tables
- `orders`
- `order_items`
- `order_events`

### Key Design Rules
- Use UUIDs
- Add `createdAt` / `updatedAt`
- Add unique constraints for idempotency
- Index hot query fields
- Separate reservation vs committed stock
- Avoid coupling services to a shared operational DB in advanced phases

---

## 9. API CONTRACT STANDARDS

### Standard Success Response
```json
{
  "success": true,
  "data": {},
  "meta": {}
}
```

### Standard Error Response
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message",
    "details": {}
  }
}
```

### Required Headers for Sensitive Operations
- `x-request-id`
- `x-idempotency-key` (for checkout/payment/order creation)

### Example Core Endpoints

#### Product Service
- `GET /api/products`
- `GET /api/products/:id`

#### Inventory Service
- `GET /api/inventory/:productId`
- `POST /api/inventory/reservations`
- `POST /api/inventory/reservations/:id/release`
- `POST /api/inventory/reservations/:id/commit`

#### Checkout Service
- `POST /api/checkout/session`
- `POST /api/checkout/confirm`
- `GET /api/checkout/:sessionId`

#### Payment Service
- `POST /api/payments/intents`
- `POST /api/payments/confirm`
- `POST /api/payments/webhook`

#### Order Service
- `POST /api/orders`
- `GET /api/orders/:id`
- `GET /api/orders?userId=...`

---

## 10. CHECKOUT RELIABILITY FLOW (CRITICAL PATH)

### Phase 1 Flow
1. User opens product page
2. Frontend fetches product + availability summary
3. User adds item to cart
4. User begins checkout
5. Checkout Service validates request
6. Checkout Service requests inventory reservation
7. Inventory Service creates reservation with expiration timestamp
8. Checkout Service creates payment intent
9. Frontend confirms payment
10. Payment Service returns success/failure
11. On success:
   - Checkout Service emits `payment.succeeded`
   - Order Service creates order
   - Inventory Service commits reservation
12. On failure:
   - Inventory Service releases reservation
   - Checkout session marked failed/retryable

### Reliability Rules
- Inventory reservation must expire automatically
- Duplicate payment confirm requests must not double-charge
- Duplicate order creation must be prevented via idempotency
- Event consumers must be retry-safe
- Every state transition must be observable

---

## 11. EVENT-DRIVEN DESIGN (RABBITMQ)

### Exchanges (suggested)
- `checkout.events`
- `payment.events`
- `inventory.events`
- `order.events`

### Example Events
- `checkout.session.created`
- `inventory.reservation.created`
- `inventory.reservation.expired`
- `payment.intent.created`
- `payment.succeeded`
- `payment.failed`
- `order.created`
- `order.failed`

### Queue Design Principles
- Separate retry queues
- Use DLQ for poison messages
- Include correlation IDs in message headers
- Include idempotency keys when relevant
- Add structured retry counters

---

## 12. FAILURE SCENARIOS TO IMPLEMENT / DOCUMENT

### Scenario 1: Payment timeout after reservation
Expected behavior:
- reservation remains valid until TTL expires
- checkout session remains pending
- user can retry payment if allowed
- worker expires reservation if TTL passes

### Scenario 2: Payment succeeds but order creation fails
Expected behavior:
- retry order creation via event consumer
- idempotent order creation
- reconciliation job verifies consistency

### Scenario 3: Duplicate checkout confirmation request
Expected behavior:
- use `x-idempotency-key`
- return existing result instead of re-processing

### Scenario 4: Inventory oversell race condition
Expected behavior:
- reservation is atomic
- DB transaction or lock ensures stock correctness
- no negative stock allowed

### Scenario 5: RabbitMQ consumer crash mid-processing
Expected behavior:
- message is retried safely
- processing is idempotent
- failures routed to DLQ after threshold

### Scenario 6: Database degraded / slow queries
Expected behavior:
- latency metrics spike visibly
- logs capture slow operations
- service degrades gracefully where possible

---

## 13. SECURITY BASELINE

### Required Controls
- Validate all request bodies/params/query with Zod
- Sanitize inputs where needed
- Use Helmet middleware
- Configure CORS strictly
- Rate limit public endpoints
- Use request IDs / correlation IDs
- Do not log secrets
- Store secrets in env variables
- Provide `.env.example` only, never commit real `.env`
- Enforce idempotency on write-critical endpoints
- Separate internal vs external endpoints conceptually

### Optional Later Enhancements
- JWT auth
- API gateway auth
- service-to-service auth (advanced)
- signed internal requests

---

## 14. OBSERVABILITY & MONITORING

### Every service must expose:
- `GET /health`
- `GET /metrics`

### Metrics to capture
- HTTP request count
- HTTP latency histogram
- HTTP error count
- inventory reservation count
- reservation expiration count
- payment success count
- payment failure count
- payment retry count
- order creation count
- DLQ message count

### Logging Rules
- JSON structured logs
- Include service name
- Include request ID
- Include correlation ID
- Include operation name
- Include error code
- Never log full secrets or sensitive payment details

### Dashboards (Phase 2+)
- request latency by service
- error rate by service
- reservation success/failure trends
- payment success/failure trends
- DLQ growth

---

## 15. FRONTEND MVP REQUIREMENTS

### Pages
- Home / product listing
- Product detail
- Cart
- Checkout
- Order confirmation
- Error/retry state pages

### UI Requirements
- Clean premium e-commerce design
- Flash-sale countdown component
- Stock urgency indicator
- Disabled CTA when unavailable
- Retry UX for payment failures
- Clear order confirmation state
- Loading skeletons
- Mobile responsive

### Frontend Engineering Rules
- Type-safe API client
- Zod validation for responses if useful
- TanStack Query for server state
- Centralized error boundary strategy
- Clean loading / error / empty states

---

## 16. DEVOPS / LOCAL ENVIRONMENT (PHASE 1)

### Docker Compose Services
- postgres
- redis
- rabbitmq
- product-service
- inventory-service
- checkout-service
- payment-service
- order-service
- worker-service
- frontend (optional initially)
- prometheus (phase 1.5 / 2)
- grafana (phase 1.5 / 2)

### Requirements
- All services boot with environment config
- Health checks configured where practical
- Services communicate on internal Docker network
- Volumes for persistent local data (optional but useful)

### Service Dockerfile Rules
- Use `node:20-alpine`
- Multi-stage build preferred
- Install via pnpm
- Build TypeScript before runtime stage
- Minimal runtime image

---

## 17. CI/CD PLAN

### GitHub Actions Pipeline (Initial)
Stages:
1. Checkout
2. Setup Node 20
3. Setup pnpm
4. Install dependencies
5. Lint
6. Typecheck
7. Build
8. (Optional) Run tests
9. (Optional) Build Docker images

### Future Extensions
- service matrix builds
- image publish to registry
- staging deployment
- production deployment
- infra validation

---

## 18. IMPLEMENTATION ROADMAP (DAY-WISE)

### Day 1 — Foundation
- finalize folder structure
- create root config files
- create pnpm workspace
- create TS base config
- create docs skeleton
- create service boilerplates

### Day 2 — Shared Packages
- implement shared-types
- implement shared-config
- implement shared-logger
- implement shared-metrics
- implement shared-rabbitmq

### Day 3 — Product Service
- create product schema
- product routes/controllers/services/repositories
- seed sample products
- health + metrics endpoints

### Day 4 — Inventory Service
- create inventory schema
- implement stock query
- implement reservation creation
- implement reservation release
- implement reservation commit
- add expiration model

### Day 5 — Checkout Service
- checkout session creation
- idempotency middleware
- checkout confirm flow skeleton
- integrate inventory reservation

### Day 6 — Payment Service
- payment intent creation
- payment confirm simulation
- payment success/failure modes
- webhook/callback shape

### Day 7 — Order Service
- order creation logic
- order retrieval endpoints
- order event emission
- idempotent create rules

### Day 8 — Worker Service + Events
- RabbitMQ connection bootstrap
- consume payment events
- consume order events
- reservation expiration worker
- retry + DLQ handling

### Day 9 — Frontend MVP
- product listing UI
- product detail UI
- cart UI
- checkout UI
- order confirmation UI

### Day 10 — Integrations
- frontend ↔ product service
- frontend ↔ checkout service
- frontend ↔ payment service
- frontend ↔ order service
- end-to-end happy path

### Day 11 — Reliability Hardening
- duplicate request tests
- payment timeout simulation
- reservation expiry simulation
- retry behavior verification

### Day 12 — Docker Compose
- local environment setup
- all services containerized
- networking + env wiring
- health checks

### Day 13 — Observability
- metrics endpoints
- Prometheus scrape config
- Grafana dashboard skeleton
- log consistency improvements

### Day 14 — Polish + Portfolio Packaging
- README
- architecture docs
- API docs
- failure scenario docs
- engineering decisions
- screenshots / demo prep

---

## 19. AI CODING AGENT INSTRUCTIONS (IMPORTANT)

Use the following instructions when prompting an AI coding agent:

### Global Agent Rules
- Generate production-ready code only
- Use strict TypeScript
- Do not use placeholder logic for core flows
- Do not skip validation
- Keep files modular and complete
- Follow the exact folder structure
- Use Express for services
- Use consistent API response format
- Add health endpoint and metrics endpoint to every service
- Use shared packages wherever appropriate
- Do not duplicate shared types/config/logger code across services
- Prefer readable code over clever code
- Keep imports clean and deterministic
- Use environment variables via typed config

### Per-Task Agent Prompt Pattern
When generating any file, use:

**"Generate complete production-ready code for [FILE/PACKAGE/SERVICE] inside the FlashForge Commerce monorepo. Follow strict TypeScript, clean architecture, Express conventions, Zod validation, structured logging, metrics instrumentation, and reusable shared packages. Do not leave placeholders for core business logic. Return full file content only."**

---

## 20. DOCUMENTATION FILES TO MAINTAIN

### `docs/architecture.md`
Must include:
- architecture overview
- service interaction diagram (text or mermaid)
- sync vs async flows
- deployment topology

### `docs/api-contracts.md`
Must include:
- endpoints
- request/response examples
- error codes
- idempotency rules

### `docs/failure-scenarios.md`
Must include:
- failure cases
- expected behavior
- mitigation strategy
- observability signals

### `docs/engineering-decisions.md`
Must include:
- why Node/TS
- why monorepo
- why RabbitMQ
- why reservation model
- trade-offs accepted

### `docs/dev-log.md`
Must include:
- daily progress
- blockers
- fixes
- architecture changes

---

## 21. RESUME / INTERVIEW PACKAGING

### Resume Impact Bullets (example style)
- Built a production-style flash-sale e-commerce platform using a TypeScript monorepo with microservices for product, inventory, checkout, payment, order orchestration, and async workers.
- Designed inventory reservation and idempotent checkout flows to prevent overselling and duplicate order creation under high-concurrency flash-sale scenarios.
- Implemented event-driven workflows with RabbitMQ, Redis-backed reliability patterns, Dockerized local environments, and service-level health/metrics endpoints for observability.
- Established CI-ready monorepo standards with pnpm workspaces, strict TypeScript, shared packages, structured logging, and Prometheus-compatible metrics instrumentation.

### Interview Talking Points
- Why reservation-based inventory beats naive stock decrement
- How idempotency prevents duplicate charge/order bugs
- Why async workflows need DLQ and retries
- Why service boundaries matter even in a portfolio project
- How observability makes reliability measurable

---

## 22. FINAL BUILD EXECUTION RULE

Build in this order:
1. Root monorepo setup
2. Shared packages
3. Product service
4. Inventory service
5. Checkout service
6. Payment service
7. Order service
8. Worker service
9. Frontend
10. Docker Compose
11. Observability
12. CI/CD
13. Documentation polish

Do not skip directly to advanced features before the core reliability path works.

---

## 23. OPTIONAL FUTURE PHASES

### Phase 2
- real auth
- admin dashboard
- stock management UI
- better payment simulation states
- order history page
- Prometheus + Grafana dashboards fully wired

### Phase 3
- Kubernetes manifests
- Terraform infra modules
- API gateway / reverse proxy
- OpenTelemetry tracing
- load testing with k6
- chaos / failure injection scripts

### Phase 4
- real payment provider sandbox integration
- distributed tracing
- blue/green deployment concepts
- rate-limiting strategy per route class

---

## 24. MASTER PROMPT USAGE

Use this file as the authoritative source for:
- architecture decisions
- AI code generation prompts
- day-wise build execution
- interview prep
- README authoring
- docs alignment

When asking an AI assistant to generate code, always reference:
- project name: **FlashForge Commerce**
- service name
- file path
- exact architecture rule from this document
- requirement: **full production-ready code, no placeholders**

---

## 25. GOLDEN RULE

**Do not optimize for feature count first. Optimize for reliability, correctness, observability, and clean architecture.**

