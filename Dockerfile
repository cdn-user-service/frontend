# Build 
FROM node:18 AS build-stage
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build:cdn_users

# Production AS production-stage
FROM nginx:stable-alpine
COPY --from=build-stage /app/dist/ /usr/share/nginx/html
EXPOSE 80