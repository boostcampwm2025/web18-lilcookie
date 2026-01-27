# 1. Builder stage - builds the frontend
FROM node:lts-slim AS builder

WORKDIR /app

RUN corepack enable

# Copy workspace root package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Copy frontend package.json
COPY frontend/package.json ./frontend/

# Install frontend workspace dependencies
RUN pnpm install --frozen-lockfile --filter frontend

# Copy frontend source code
COPY frontend ./frontend

# Build the application
WORKDIR /app/frontend
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
RUN pnpm run build

# Production stage with nginx
FROM nginx:alpine

# Copy built files from builder
COPY --from=builder /app/frontend/dist /usr/share/nginx/html

# Copy nginx configuration
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf

# keep nginx running in the foreground
CMD ["nginx", "-g", "daemon off;"]
