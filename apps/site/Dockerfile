# 1. Builder stage - builds the VitePress site
FROM node:lts-slim AS builder

WORKDIR /app

RUN corepack enable

# Copy workspace root package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Copy site package.json
COPY apps/site/package.json ./apps/site/

# Install site workspace dependencies
RUN pnpm install --frozen-lockfile --filter site...

# Copy site source code
COPY apps/site ./apps/site

# Build the VitePress site
WORKDIR /app/apps/site
RUN pnpm run build

# 2. Production stage with nginx
FROM nginx:alpine

# Copy built files from builder (VitePress outputs to .vitepress/dist)
COPY --from=builder /app/apps/site/.vitepress/dist /usr/share/nginx/html

# Copy nginx configuration
COPY apps/site/nginx.conf /etc/nginx/conf.d/default.conf

# Keep nginx running in the foreground
CMD ["nginx", "-g", "daemon off;"]
