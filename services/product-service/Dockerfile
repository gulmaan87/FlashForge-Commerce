# ───────────────────────────────────────────────
# Stage 1 – install ALL workspace deps
# ───────────────────────────────────────────────
FROM node:20-alpine AS deps
RUN npm i -g pnpm@10.0.0
WORKDIR /app

# Copy workspace manifests (needed for pnpm to resolve workspace: links)
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY packages/shared-types/package.json        ./packages/shared-types/package.json
COPY packages/shared-logger/package.json       ./packages/shared-logger/package.json
COPY packages/shared-metrics/package.json      ./packages/shared-metrics/package.json
COPY packages/shared-config/package.json       ./packages/shared-config/package.json
COPY packages/shared-rabbitmq/package.json     ./packages/shared-rabbitmq/package.json
COPY services/product-service/package.json     ./services/product-service/package.json

RUN pnpm install --frozen-lockfile

# ───────────────────────────────────────────────
# Stage 2 – copy source & build
# ───────────────────────────────────────────────
FROM deps AS builder
WORKDIR /app

COPY packages/ ./packages/
COPY services/product-service/ ./services/product-service/

# Generate Prisma client
RUN pnpm --filter @flashforge/product-service exec \
    sh -c 'cd /app/services/product-service && npx prisma generate'

# Compile TypeScript
RUN pnpm --filter @flashforge/product-service run build

# ───────────────────────────────────────────────
# Stage 3 – lean production image
# ───────────────────────────────────────────────
FROM node:20-alpine AS runner
RUN npm i -g pnpm@10.0.0
WORKDIR /app
ENV NODE_ENV=production

# Copy node_modules from builder (includes workspace symlinks resolved)
COPY --from=builder /app/node_modules         ./node_modules
COPY --from=builder /app/packages              ./packages
COPY --from=builder /app/services/product-service/dist              ./services/product-service/dist
COPY --from=builder /app/services/product-service/src/generated     ./services/product-service/src/generated
COPY --from=builder /app/services/product-service/package.json      ./services/product-service/package.json

WORKDIR /app/services/product-service
EXPOSE 4001
CMD ["node", "--max-old-space-size=128", "dist/server.js"]
