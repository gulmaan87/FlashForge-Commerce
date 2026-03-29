# ─────────────────────────────────────────────────────────────────────────────
# Stage 1 — install ALL workspace deps (shared + service)
# ─────────────────────────────────────────────────────────────────────────────
FROM node:20-alpine AS deps
RUN npm i -g pnpm@10.0.0
WORKDIR /app

# Copy all manifests first for layer caching
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml tsconfig.base.json ./
COPY packages/shared-types/package.json        ./packages/shared-types/package.json
COPY packages/shared-logger/package.json       ./packages/shared-logger/package.json
COPY packages/shared-metrics/package.json      ./packages/shared-metrics/package.json
COPY packages/shared-config/package.json       ./packages/shared-config/package.json
COPY packages/shared-rabbitmq/package.json     ./packages/shared-rabbitmq/package.json
COPY services/product-service/package.json     ./services/product-service/package.json

RUN pnpm install --frozen-lockfile

# ─────────────────────────────────────────────────────────────────────────────
# Stage 2 — copy source, build shared packages FIRST, then the service
# ─────────────────────────────────────────────────────────────────────────────
FROM deps AS builder
WORKDIR /app

# Copy all source
COPY packages/ ./packages/
COPY services/product-service/ ./services/product-service/

# Build shared packages in dependency order
RUN pnpm --filter @flashforge/shared-types build
RUN pnpm --filter @flashforge/shared-logger build
RUN pnpm --filter @flashforge/shared-metrics build

# Build the service
RUN pnpm --filter @flashforge/product-service run build

# ─────────────────────────────────────────────────────────────────────────────
# Stage 3 — minimal production image
# ─────────────────────────────────────────────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/node_modules     ./node_modules
COPY --from=builder /app/packages         ./packages
COPY --from=builder /app/services/product-service/dist    ./services/product-service/dist
COPY --from=builder /app/services/product-service/package.json ./services/product-service/package.json

WORKDIR /app/services/product-service
EXPOSE 4001
CMD ["node", "--max-old-space-size=128", "dist/server.js"]
