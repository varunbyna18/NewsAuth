# Multi-stage build for production
FROM node:18-alpine AS builder

WORKDIR /app

# Copy backend
COPY backend/package*.json ./backend/
RUN cd backend && npm ci --only=production

# Copy backend source
COPY backend/server.js ./backend/
COPY backend/routes ./backend/routes/
COPY backend/services ./backend/services/
COPY backend/middleware ./backend/middleware/
COPY backend/utils ./backend/utils/

# Production stage
FROM node:18-alpine

WORKDIR /app

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Copy built dependencies
COPY --from=builder /app/backend ./backend/

# Create .env from environment variables
ENV NODE_ENV=production
ENV PORT=8080

EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:8080/api/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Use dumb-init to handle signals properly
ENTRYPOINT ["/sbin/dumb-init", "--"]

# Start backend
CMD ["node", "backend/server.js"]
