# 1. Build stage
FROM node:lts-alpine3.22 AS builder

WORKDIR /app

# better-sqlite3 빌드를 위한 빌드 도구 설치
RUN apk add --no-cache \
  python3 \
  make \
  g++ \
  libc-dev

COPY package*.json ./
COPY backend/package*.json ./backend/

RUN npm ci

COPY backend ./backend

WORKDIR /app/backend
RUN npm run build

# 2. Production stage
FROM node:lts-alpine3.22

WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules

COPY --from=builder /app/backend/dist ./backend/dist
COPY --from=builder /app/backend/package*.json ./backend/

WORKDIR /app/backend
CMD ["node", "dist/main"]
