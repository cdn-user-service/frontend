# Build 
FROM node:18 AS build-stage
WORKDIR /app
COPY pom.xml .
COPY src ./src
COPY . .
RUN npm install && npm run build:cdn_users

# Production AS production-stage
FROM nginx:stable-alpine
COPY --from=build-stage /app/dist/ /usr/share/nginx/html
EXPOSE 80