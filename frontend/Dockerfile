# ── Stage 1: install deps ──────────────────────
FROM node:20-alpine AS deps
RUN npm i -g pnpm@10.0.0
WORKDIR /app

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml tsconfig.base.json ./
COPY frontend/package.json ./frontend/package.json
COPY packages/shared-types/package.json    ./packages/shared-types/package.json
COPY packages/shared-logger/package.json   ./packages/shared-logger/package.json
COPY packages/shared-config/package.json   ./packages/shared-config/package.json
COPY packages/shared-metrics/package.json  ./packages/shared-metrics/package.json
COPY packages/shared-rabbitmq/package.json ./packages/shared-rabbitmq/package.json

RUN pnpm install --frozen-lockfile

# ── Stage 2: build Next.js ─────────────────────
FROM deps AS builder
WORKDIR /app
COPY packages/ ./packages/
COPY frontend/  ./frontend/

# NEXT_PUBLIC_ vars are baked in at build time
ARG NEXT_PUBLIC_PRODUCT_SERVICE_URL=http://35.154.247.227/api/products
ARG NEXT_PUBLIC_CHECKOUT_SERVICE_URL=http://35.154.247.227/api/checkout
ARG NEXT_PUBLIC_ORDER_SERVICE_URL=http://35.154.247.227/api/orders
ENV NEXT_PUBLIC_PRODUCT_SERVICE_URL=$NEXT_PUBLIC_PRODUCT_SERVICE_URL
ENV NEXT_PUBLIC_CHECKOUT_SERVICE_URL=$NEXT_PUBLIC_CHECKOUT_SERVICE_URL
ENV NEXT_PUBLIC_ORDER_SERVICE_URL=$NEXT_PUBLIC_ORDER_SERVICE_URL

RUN pnpm --filter @flashforge/frontend run build

# ── Stage 3: lean runner ───────────────────────
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/frontend/.next/standalone ./
COPY --from=builder /app/frontend/.next/static     ./.next/static
# public/ may be empty but must exist — copy with a fallback mkdir
RUN mkdir -p ./public
COPY --from=builder /app/frontend/public/          ./public/

EXPOSE 3000
ENV PORT=3000
CMD ["node", "server.js"]
