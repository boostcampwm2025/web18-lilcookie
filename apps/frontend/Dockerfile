# 1. Builder stage - builds the frontend
FROM node:lts-slim AS builder

WORKDIR /app

RUN corepack enable

# Copy workspace root package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Copy frontend package.json
COPY apps/frontend/package.json ./apps/frontend/
COPY packages/api/package.json ./packages/api/

# Install frontend workspace dependencies
RUN pnpm install --frozen-lockfile --filter frontend...

# Copy frontend source code
COPY packages/api ./packages/api
COPY apps/frontend ./apps/frontend

# Build the application
RUN pnpm --filter @repo/api build

WORKDIR /app/apps/frontend
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
RUN pnpm run build

# Production stage with nginx
FROM nginx:alpine

# Copy built files from builder
COPY --from=builder /app/apps/frontend/dist /usr/share/nginx/html

# Copy nginx configuration
COPY apps/frontend/nginx.conf /etc/nginx/conf.d/default.conf

# keep nginx running in the foreground
CMD ["nginx", "-g", "daemon off;"]
