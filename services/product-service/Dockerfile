FROM node:20-alpine
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

COPY packages/ ./packages/
COPY services/product-service/ ./services/product-service/

RUN pnpm --filter @flashforge/shared-types build
RUN pnpm --filter @flashforge/shared-logger build
RUN pnpm --filter @flashforge/shared-metrics build

RUN cd /app/services/product-service && npx prisma generate
RUN pnpm --filter @flashforge/product-service run build

ENV NODE_ENV=production
WORKDIR /app/services/product-service
EXPOSE 4001
CMD ["node", "--max-old-space-size=128", "dist/server.js"]
