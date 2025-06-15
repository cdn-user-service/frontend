# Build stage  
FROM node:16.20.0-alpine AS build-stage

# 设置工作目录
WORKDIR /app

# 设置npm配置以加速下载并减少输出 
RUN npm config set fund false && \
    npm config set audit false

# Copy package files for better Docker layer caching
COPY package*.json ./

# [优化点 2] 使用BuildKit的缓存挂载来优化npm ci的缓存
# `target` 指定了npm将缓存写入的目录。BuildKit会将其挂载为一个可缓存的卷。
# 这会极大地提高npm包的安装速度，特别是在多次构建时。
RUN --mount=type=cache,target=/root/.npm \
    npm ci --no-audit --no-fund --prefer-offline

# Copy source code and build
# 当源代码发生变化时，这一层及之后的层缓存会失效。
COPY . .

# 构建项目
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

# [优化点 3] 简化nginx pid文件处理：
# 当nginx以“daemon off;”在前台运行时，通常不会创建pid文件，
# 或者pid文件路径可以在nginx配置中指定为一个非特权用户可写的地方。
# 原始的`touch`和`chown`可能不是必须的，但为了兼容性，如果你的Nginx配置
# 确实需要这个文件，且放在`/var/run`下，保留此chown是合理的。
# 考虑到安全，让appuser拥有/var/run/nginx.pid的权限是正确的做法，
# 如果Nginx确实尝试在那里创建它。
# 简化方式（如果Nginx不强制创建PID文件）：可以删除这两行，
# 并在default.conf中明确指定pid文件路径（如果需要的话）。
# 但为了保持和原有逻辑的兼容性，我们暂时保留它。
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