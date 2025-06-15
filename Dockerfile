# Build stage - 使用更小的alpine镜像
FROM node:16.20.0-alpine AS build-stage

# 设置工作目录
WORKDIR /app

# 安装必要的构建工具（alpine语法）
RUN apk add --no-cache git

# 设置npm配置以加速下载
RUN npm config set registry https://registry.npmmirror.com/ && \
    npm config set fund false && \
    npm config set audit false

# Copy package files for better Docker layer caching
COPY package*.json ./

# 使用npm ci安装依赖，添加缓存优化
RUN npm ci --only=production --no-audit --no-fund --prefer-offline

# Copy source code and build
COPY . .

# 构建项目
RUN npm run build:cdn_users

# Production stage - 使用更小的nginx alpine镜像
FROM nginx:1.24-alpine AS production-stage

# 安装健康检查工具（alpine语法）
RUN apk add --no-cache curl

# Copy built files
COPY --from=build-stage /app/dist/ /usr/share/nginx/html/

# 创建非root用户（alpine语法）
RUN addgroup -g 1001 -S appuser && \
    adduser -S appuser -u 1001 -G appuser && \
    chown -R appuser:appuser /usr/share/nginx/html && \
    chown -R appuser:appuser /var/cache/nginx && \
    chown -R appuser:appuser /var/log/nginx && \
    chown -R appuser:appuser /etc/nginx/conf.d

# 修改nginx配置以支持非root用户
RUN touch /var/run/nginx.pid && \
    chown -R appuser:appuser /var/run/nginx.pid

# 创建自定义nginx配置
COPY <<EOF /etc/nginx/conf.d/default.conf
server {
    listen 8080;
    server_name localhost;
    
    location / {
        root /usr/share/nginx/html;
        index index.html index.htm;
        try_files \$uri \$uri/ /index.html;
    }
    
    # 健康检查端点
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
}
EOF

EXPOSE 8080

# 健康检查（使用8080端口）
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8080/health || exit 1

USER appuser

# 使用非root用户运行nginx
CMD ["nginx", "-g", "daemon off;"]