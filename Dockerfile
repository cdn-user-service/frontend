# Build 
FROM node:16.20.0 AS build-stage
WORKDIR /app
COPY package.json .
COPY package-lock.json .
RUN npm install
COPY . .
RUN npm run build:cdn_users

# Production AS production-stage
FROM nginx:stable-alpine
COPY --from=build-stage /app/dist/ /usr/share/nginx/html
EXPOSE 80