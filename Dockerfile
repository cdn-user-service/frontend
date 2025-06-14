# Build stage
FROM node:16.20.0-alpine AS build-stage
WORKDIR /app

# Copy package files for better Docker layer caching
COPY package*.json ./
RUN npm ci --only=production --silent

# Copy source code and build
COPY . .
RUN npm run build:cdn_users

# Production stage
FROM nginx:stable-alpine AS production-stage

# Copy built files
COPY --from=build-stage /app/dist/ /usr/share/nginx/html/

# Add custom nginx config if needed
# COPY nginx.conf /etc/nginx/nginx.conf

# Create non-root user for security
RUN addgroup -g 1001 -S appuser && \
    adduser -S appuser -u 1001 -G appuser && \
    chown -R appuser:appuser /usr/share/nginx/html

EXPOSE 80

# Health check for container orchestration
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost/ || exit 1

USER appuser
CMD ["nginx", "-g", "daemon off;"]