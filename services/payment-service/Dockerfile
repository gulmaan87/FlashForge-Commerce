FROM node:20-alpine
RUN apk add --no-cache openssl
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

COPY packages/ ./packages/
COPY services/payment-service/ ./services/payment-service/

RUN pnpm --filter @flashforge/shared-types build
RUN pnpm --filter @flashforge/shared-logger build
RUN pnpm --filter @flashforge/shared-metrics build
RUN pnpm --filter @flashforge/shared-rabbitmq build

RUN cd /app/services/payment-service && npx prisma generate
RUN pnpm --filter @flashforge/payment-service run build
RUN cp -r /app/services/payment-service/src/generated /app/services/payment-service/dist/

ENV NODE_ENV=production
WORKDIR /app/services/payment-service
EXPOSE 4004
CMD ["node", "--max-old-space-size=128", "dist/server.js"]
