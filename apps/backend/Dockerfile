# 1. Build stage
FROM node:lts-alpine3.22 AS builder

WORKDIR /app

# better-sqlite3 빌드를 위한 빌드 도구 설치
RUN apk add --no-cache \
  python3 \
  make \
  g++ \
  libc-dev

RUN corepack enable

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/backend/package.json ./apps/backend/

RUN pnpm install --frozen-lockfile --filter backend

COPY apps/backend ./apps/backend

WORKDIR /app/apps/backend
RUN pnpm prisma:generate
RUN pnpm run build

# 2. Production stage
FROM node:lts-alpine3.22

WORKDIR /app

RUN corepack enable

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/backend/node_modules ./apps/backend/node_modules

COPY --from=builder /app/apps/backend/dist ./apps/backend/dist
COPY --from=builder /app/apps/backend/package.json ./apps/backend/

WORKDIR /app/apps/backend
CMD ["node", "dist/src/main"]
