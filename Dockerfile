# Build stage  
FROM node:16.20.0-alpine AS build-stage

# 设置工作目录
WORKDIR /app

# 设置npm配置以加速下载并减少输出 
RUN npm config set fund false && \
    npm config set audit false

# Copy package files for better Docker layer caching
COPY package*.json ./

# optimize cache
RUN --mount=type=cache,target=/root/.npm \
    npm ci --no-audit --no-fund --prefer-offline

# Copy source code and build
# 当源代码发生变化时，这一层及之后的层缓存会失效。
COPY . .

# build
RUN npm run build:cdn_users

# Production stage  
FROM nginx:1.24-alpine AS production-stage

# 安装健康检查工具curl（生产环境需要）
RUN apk add --no-cache curl

# Copy built files from the build-stage
# 这是多阶段构建的关键，只复制最终的构建产物，减小最终镜像大小。
COPY --from=build-stage /app/dist/ /usr/share/nginx/html/

# 创建非root用户以提高安全性
# Nginx在启动时通常需要root权限来绑定到特权端口（如80），但一旦绑定成功，
# 它可以切换到非root用户运行以降低风险。
RUN addgroup -g 1001 -S appuser && \
    adduser -S appuser -u 1001 -G appuser && \
    chown -R appuser:appuser /usr/share/nginx/html && \
    chown -R appuser:appuser /var/cache/nginx && \
    chown -R appuser:appuser /var/log/nginx && \
    chown -R appuser:appuser /etc/nginx/conf.d

# optimize cache 简化nginx pid文件处理：
RUN touch /var/run/nginx.pid && \
    chown -R appuser:appuser /var/run/nginx.pid

# 创建自定义nginx配置，监听8080端口
COPY <<EOF /etc/nginx/conf.d/default.conf
server {
    listen 8080;
    server_name localhost;
    
    location / {
        root /usr/share/nginx/html;
        index index.html index.htm;
        # 重要的try_files指令，确保Vue Router的history模式工作正常
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

# 暴露容器端口
EXPOSE 8080

# 健康检查配置（使用8080端口）
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8080/health || exit 1

# 切换到非root用户
USER appuser

# 使用非root用户运行nginx
CMD ["nginx", "-g", "daemon off;"]