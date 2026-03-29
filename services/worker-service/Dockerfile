FROM node:20-alpine AS deps
RUN npm i -g pnpm@10.0.0
WORKDIR /app

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml tsconfig.base.json ./
COPY packages/shared-types/package.json        ./packages/shared-types/package.json
COPY packages/shared-logger/package.json       ./packages/shared-logger/package.json
COPY packages/shared-metrics/package.json      ./packages/shared-metrics/package.json
COPY packages/shared-config/package.json       ./packages/shared-config/package.json
COPY packages/shared-rabbitmq/package.json     ./packages/shared-rabbitmq/package.json
COPY services/worker-service/package.json      ./services/worker-service/package.json

RUN pnpm install --frozen-lockfile

FROM deps AS builder
WORKDIR /app
COPY packages/ ./packages/
COPY services/worker-service/ ./services/worker-service/

RUN pnpm --filter @flashforge/shared-types build
RUN pnpm --filter @flashforge/shared-logger build
RUN pnpm --filter @flashforge/shared-metrics build
RUN pnpm --filter @flashforge/shared-config build
RUN pnpm --filter @flashforge/shared-rabbitmq build

RUN pnpm --filter @flashforge/worker-service run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/node_modules       ./node_modules
COPY --from=builder /app/packages           ./packages
COPY --from=builder /app/services/worker-service/dist         ./services/worker-service/dist
COPY --from=builder /app/services/worker-service/package.json ./services/worker-service/package.json

WORKDIR /app/services/worker-service
EXPOSE 4006
CMD ["node", "--max-old-space-size=128", "dist/server.js"]
