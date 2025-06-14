# Build stage
FROM node:16.20.0-alpine AS build-stage
WORKDIR /app

# Copy and install dependencies
COPY package*.json ./
RUN npm ci --silent

# Copy source and build
COPY . .
RUN npm run build:cdn_users

# Production stage  
FROM nginx:stable-alpine AS production-stage
COPY --from=build-stage /app/dist/ /usr/share/nginx/html/
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]