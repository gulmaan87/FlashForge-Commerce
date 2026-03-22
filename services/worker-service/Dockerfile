# ── Stage 1: dependencies ─────────────────────────────────────────────────────
FROM node:20-alpine AS deps
WORKDIR /workspace
RUN corepack enable && corepack prepare pnpm@latest --activate

COPY package.json pnpm-workspace.yaml ./
COPY packages/shared-config/package.json packages/shared-config/
COPY packages/shared-logger/package.json packages/shared-logger/
COPY packages/shared-metrics/package.json packages/shared-metrics/
COPY packages/shared-rabbitmq/package.json packages/shared-rabbitmq/
COPY packages/shared-types/package.json packages/shared-types/
COPY services/worker-service/package.json services/worker-service/

RUN pnpm install --frozen-lockfile

# ── Stage 2: build ────────────────────────────────────────────────────────────
FROM deps AS builder
WORKDIR /workspace
COPY packages/ packages/
COPY services/worker-service/ services/worker-service/

RUN pnpm --filter @flashforge/shared-types build \
    && pnpm --filter @flashforge/shared-config build \
    && pnpm --filter @flashforge/shared-logger build \
    && pnpm --filter @flashforge/shared-metrics build \
    && pnpm --filter @flashforge/shared-rabbitmq build \
    && pnpm --filter @flashforge/worker-service build

# ── Stage 3: runtime ──────────────────────────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /workspace
ENV NODE_ENV=production
RUN corepack enable && corepack prepare pnpm@latest --activate

COPY package.json pnpm-workspace.yaml ./
COPY packages/shared-config/package.json packages/shared-config/
COPY packages/shared-logger/package.json packages/shared-logger/
COPY packages/shared-metrics/package.json packages/shared-metrics/
COPY packages/shared-rabbitmq/package.json packages/shared-rabbitmq/
COPY packages/shared-types/package.json packages/shared-types/
COPY services/worker-service/package.json services/worker-service/

RUN pnpm install --prod --frozen-lockfile

COPY --from=builder /workspace/packages/shared-config/dist packages/shared-config/dist
COPY --from=builder /workspace/packages/shared-logger/dist packages/shared-logger/dist
COPY --from=builder /workspace/packages/shared-metrics/dist packages/shared-metrics/dist
COPY --from=builder /workspace/packages/shared-rabbitmq/dist packages/shared-rabbitmq/dist
COPY --from=builder /workspace/packages/shared-types/dist packages/shared-types/dist
COPY --from=builder /workspace/services/worker-service/dist services/worker-service/dist

EXPOSE 4006
CMD ["node", "services/worker-service/dist/server.js"]
