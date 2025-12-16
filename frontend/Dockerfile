# 1. Builder stage - builds the frontend
FROM node:lts-alpine3.22 AS builder

WORKDIR /app

# Copy workspace root package files
COPY package*.json ./

# Copy frontend package.json
COPY frontend/package*.json ./frontend/

# Install frontend workspace dependencies
RUN npm ci -w frontend

# Copy frontend source code
COPY frontend ./frontend

# Build the application
WORKDIR /app/frontend
RUN npm run build

# Production stage with nginx
FROM nginx:alpine

# Copy built files from builder
COPY --from=builder /app/frontend/dist /usr/share/nginx/html

# Copy nginx configuration
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf

# keep nginx running in the foreground
CMD ["nginx", "-g", "daemon off;"]
