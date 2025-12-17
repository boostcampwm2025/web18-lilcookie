# 1. Build stage
FROM node:lts-alpine3.22 AS builder

WORKDIR /app

# Copy workspace root package files
COPY package*.json ./

# Copy backend package.json
COPY backend/package*.json ./backend/

# Install backend workspace dependencies
RUN npm ci -w backend

# Copy backend source code
COPY backend ./backend

# Build the application
WORKDIR /app/backend
RUN npm run build

# 2. Production stage
FROM node:lts-alpine3.22

WORKDIR /app

# Copy workspace root package files
COPY package*.json ./

# Copy backend package.json
COPY backend/package*.json ./backend/

# Install only production dependencies for backend workspace
RUN npm ci --only=production -w backend

# Copy built application from builder
COPY --from=builder /app/backend/dist ./backend/dist

# Start the application
WORKDIR /app/backend
CMD ["node", "dist/main"]
