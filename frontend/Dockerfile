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
COPY frontend/package.json frontend/

RUN pnpm install --frozen-lockfile

# ── Stage 2: build ────────────────────────────────────────────────────────────
FROM deps AS builder
WORKDIR /workspace
COPY packages/ packages/
COPY frontend/ frontend/

RUN pnpm --filter @flashforge/frontend build

# ── Stage 3: runtime ──────────────────────────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /workspace
ENV NODE_ENV=production
RUN corepack enable && corepack prepare pnpm@latest --activate

COPY package.json pnpm-workspace.yaml ./
COPY frontend/package.json frontend/

RUN pnpm install --prod --frozen-lockfile --filter @flashforge/frontend

COPY --from=builder /workspace/frontend/.next frontend/.next
COPY --from=builder /workspace/frontend/public frontend/public
COPY --from=builder /workspace/frontend/next.config.ts frontend/next.config.ts

EXPOSE 3000
CMD ["pnpm", "--filter", "@flashforge/frontend", "start"]
