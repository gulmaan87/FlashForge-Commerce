FROM node:20-alpine AS deps
RUN npm i -g pnpm@10.0.0
WORKDIR /app

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml tsconfig.base.json ./
COPY packages/shared-types/package.json        ./packages/shared-types/package.json
COPY packages/shared-logger/package.json       ./packages/shared-logger/package.json
COPY packages/shared-metrics/package.json      ./packages/shared-metrics/package.json
COPY packages/shared-config/package.json       ./packages/shared-config/package.json
COPY packages/shared-rabbitmq/package.json     ./packages/shared-rabbitmq/package.json
COPY services/payment-service/package.json     ./services/payment-service/package.json

RUN pnpm install --frozen-lockfile

FROM deps AS builder
WORKDIR /app
COPY packages/ ./packages/
COPY services/payment-service/ ./services/payment-service/

RUN pnpm --filter @flashforge/shared-types build
RUN pnpm --filter @flashforge/shared-logger build
RUN pnpm --filter @flashforge/shared-metrics build
RUN pnpm --filter @flashforge/shared-rabbitmq build

RUN cd /app/services/payment-service && npx prisma generate
RUN pnpm --filter @flashforge/payment-service run build

RUN pnpm --filter @flashforge/payment-service deploy /deploy --prod
RUN cp -r /app/services/payment-service/dist /deploy/dist
RUN cp -r /app/services/payment-service/src/generated /deploy/src/generated 2>/dev/null || true

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /deploy ./

EXPOSE 4004
CMD ["node", "--max-old-space-size=128", "dist/server.js"]
