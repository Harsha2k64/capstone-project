# ── Stage 1: Build ────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files first (Docker cache layer)
COPY package*.json ./

# Install production dependencies only
RUN npm ci --only=production

# ── Stage 2: Production image ─────────────────────────────────────
FROM node:20-alpine AS production

# Security: run as non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser  -S nodeuser -u 1001

WORKDIR /app

# Copy dependencies from builder
COPY --from=builder /app/node_modules ./node_modules

# Copy application code
COPY --chown=nodeuser:nodejs . .

# Remove dev files
RUN rm -f .env .env.example

# Switch to non-root user
USER nodeuser

# Expose port
EXPOSE 8080

# Health check — GCP Load Balancer uses this
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD wget -qO- http://localhost:8080/health || exit 1

# Start command
ENV NODE_ENV=production
ENV APP_PORT=8080

CMD ["node", "src/routes/router.js"]
