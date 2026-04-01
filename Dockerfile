# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies for native modules
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    sqlite

# Copy package files
COPY package.json ./

# Install dependencies
RUN npm install --legacy-peer-deps

# Copy source code
COPY . .

# Build Next.js application
RUN npm run build

# Production stage
FROM tailscale/tailscale:latest AS tailscale

# Main production stage
FROM node:20-alpine AS runner

WORKDIR /app

# Install runtime dependencies
RUN apk add --no-cache \
    sqlite \
    dumb-init

# Copy tailscale binaries from official image
COPY --from=tailscale /usr/local/bin/tailscaled /usr/local/bin/tailscaled
COPY --from=tailscale /usr/local/bin/tailscale /usr/local/bin/tailscale
RUN chmod +x /usr/local/bin/tailscaled /usr/local/bin/tailscale

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

# Copy necessary files from builder
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Create data directory
RUN mkdir -p /app/data && chown -R nextjs:nodejs /app/data

# Create Tailscale directories
RUN mkdir -p /var/lib/tailscale /var/run/tailscale && chown -R nextjs:nodejs /var/lib/tailscale /var/run/tailscale

# Set environment
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
ENV DATABASE_PATH=/app/data/tailscale-dashboard.db

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

# Start the application
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "server.js"]
