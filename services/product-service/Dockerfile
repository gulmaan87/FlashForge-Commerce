FROM node:20-alpine AS deps
RUN npm i -g pnpm@10.0.0
WORKDIR /app

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml tsconfig.base.json ./
COPY packages/shared-types/package.json        ./packages/shared-types/package.json
COPY packages/shared-logger/package.json       ./packages/shared-logger/package.json
COPY packages/shared-metrics/package.json      ./packages/shared-metrics/package.json
COPY packages/shared-config/package.json       ./packages/shared-config/package.json
COPY packages/shared-rabbitmq/package.json     ./packages/shared-rabbitmq/package.json
COPY services/product-service/package.json     ./services/product-service/package.json

RUN pnpm install --frozen-lockfile

FROM deps AS builder
WORKDIR /app
COPY packages/ ./packages/
COPY services/product-service/ ./services/product-service/

# Build shared packages first
RUN pnpm --filter @flashforge/shared-types build
RUN pnpm --filter @flashforge/shared-logger build
RUN pnpm --filter @flashforge/shared-metrics build

# Generate Prisma client
RUN cd /app/services/product-service && npx prisma generate

# Build the service
RUN pnpm --filter @flashforge/product-service run build

# Create a self-contained deployable directory with all deps resolved
RUN pnpm --filter @flashforge/product-service deploy /deploy --prod

# Copy built artifacts into the deploy folder
RUN cp -r /app/services/product-service/dist /deploy/dist
RUN cp -r /app/services/product-service/src/generated /deploy/src/generated 2>/dev/null || true

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /deploy ./

EXPOSE 4001
CMD ["node", "--max-old-space-size=128", "dist/server.js"]
