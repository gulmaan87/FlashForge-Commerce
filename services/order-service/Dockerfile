FROM node:20-alpine AS deps
RUN npm i -g pnpm@10.0.0
WORKDIR /app

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml tsconfig.base.json ./
COPY packages/shared-types/package.json        ./packages/shared-types/package.json
COPY packages/shared-logger/package.json       ./packages/shared-logger/package.json
COPY packages/shared-metrics/package.json      ./packages/shared-metrics/package.json
COPY packages/shared-config/package.json       ./packages/shared-config/package.json
COPY packages/shared-rabbitmq/package.json     ./packages/shared-rabbitmq/package.json
COPY services/order-service/package.json       ./services/order-service/package.json

RUN pnpm install --frozen-lockfile

FROM deps AS builder
WORKDIR /app
COPY packages/ ./packages/
COPY services/order-service/ ./services/order-service/

RUN pnpm --filter @flashforge/shared-types build
RUN pnpm --filter @flashforge/shared-logger build
RUN pnpm --filter @flashforge/shared-metrics build
RUN pnpm --filter @flashforge/shared-rabbitmq build

RUN cd /app/services/order-service && npx prisma generate
RUN pnpm --filter @flashforge/order-service run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/node_modules       ./node_modules
COPY --from=builder /app/packages           ./packages
COPY --from=builder /app/services/order-service/dist            ./services/order-service/dist
COPY --from=builder /app/services/order-service/src/generated   ./services/order-service/src/generated
COPY --from=builder /app/services/order-service/package.json    ./services/order-service/package.json

WORKDIR /app/services/order-service
EXPOSE 4005
CMD ["node", "--max-old-space-size=128", "dist/server.js"]
