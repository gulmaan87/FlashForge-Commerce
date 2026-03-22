# ── Stage 1: dependencies ────────────────────────────────────────────────────
FROM node:20-alpine AS deps
WORKDIR /workspace

# Install pnpm globally
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy workspace manifests
COPY package.json pnpm-workspace.yaml ./
COPY packages/shared-config/package.json packages/shared-config/
COPY packages/shared-logger/package.json packages/shared-logger/
COPY packages/shared-metrics/package.json packages/shared-metrics/
COPY packages/shared-rabbitmq/package.json packages/shared-rabbitmq/
COPY packages/shared-types/package.json packages/shared-types/
COPY services/product-service/package.json services/product-service/

RUN pnpm install --frozen-lockfile

# ── Stage 2: build ────────────────────────────────────────────────────────────
FROM deps AS builder
WORKDIR /workspace

# Copy all source
COPY packages/ packages/
COPY services/product-service/ services/product-service/

# Generate Prisma client
RUN pnpm --filter @flashforge/product-service exec prisma generate

# Build shared packages then the service
RUN pnpm --filter @flashforge/shared-types build \
    && pnpm --filter @flashforge/shared-config build \
    && pnpm --filter @flashforge/shared-logger build \
    && pnpm --filter @flashforge/shared-metrics build \
    && pnpm --filter @flashforge/product-service build

# ── Stage 3: runtime ──────────────────────────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /workspace

ENV NODE_ENV=production

RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy workspace manifests + lockfile again for production install
COPY package.json pnpm-workspace.yaml ./
COPY packages/shared-config/package.json packages/shared-config/
COPY packages/shared-logger/package.json packages/shared-logger/
COPY packages/shared-metrics/package.json packages/shared-metrics/
COPY packages/shared-rabbitmq/package.json packages/shared-rabbitmq/
COPY packages/shared-types/package.json packages/shared-types/
COPY services/product-service/package.json services/product-service/

RUN pnpm install --prod --frozen-lockfile

# Copy built artifacts from builder
COPY --from=builder /workspace/packages/shared-config/dist packages/shared-config/dist
COPY --from=builder /workspace/packages/shared-logger/dist packages/shared-logger/dist
COPY --from=builder /workspace/packages/shared-metrics/dist packages/shared-metrics/dist
COPY --from=builder /workspace/packages/shared-types/dist packages/shared-types/dist
COPY --from=builder /workspace/services/product-service/dist services/product-service/dist
COPY --from=builder /workspace/services/product-service/src/generated services/product-service/src/generated

EXPOSE 4001
CMD ["node", "services/product-service/dist/server.js"]
