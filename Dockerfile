# 构建阶段
FROM node:18 as build-stage
WORKDIR /app
COPY frontend/ ./
RUN npm install && npm run build:cdn_users

# 运行阶段
FROM nginx:stable-alpine
COPY --from=build-stage /app/dist/ /usr/share/nginx/html
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80