#!/bin/bash
# Docker 自动化部署脚本

# 脚本目录
SCRIPT_DIR="$(dirname "$0")"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# 默认配置
SERVER_IP="124.221.119.134"
SERVER_USER="root"
HTTPS_DOMAIN="aity88.online"
HTTPS_PORT="8443"
HTTP_PORT="8080"

# 颜色输出函数
function echo_green() {
    echo -e "\033[32m$1\033[0m"
}

function echo_yellow() {
    echo -e "\033[33m$1\033[0m"
}

function echo_red() {
    echo -e "\033[31m$1\033[0m"
}

# 检查Docker是否安装
function check_docker() {
    echo_yellow "检查Docker安装状态..."
    if command -v docker &> /dev/null; then
        echo_green "Docker已安装"
        return 0
    else
        echo_red "Docker未安装"
        return 1
    fi
}

# 检查Docker Compose是否安装
function check_docker_compose() {
    echo_yellow "检查Docker Compose安装状态..."
    if command -v docker-compose &> /dev/null; then
        echo_green "Docker Compose已安装"
        return 0
    else
        echo_red "Docker Compose未安装"
        return 1
    fi
}

# 创建Docker配置文件
function create_docker_config() {
    echo_yellow "创建Docker配置文件..."
    
    # 创建docker目录
    mkdir -p "$PROJECT_ROOT/docker/nginx/ssl"
    
    # 创建docker-compose.yml
    cat > "$PROJECT_ROOT/docker/docker-compose.yml" << 'EOF'
version: '3.8'

services:
  backend:
    build: ../backend
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
      - PORT=3001
    restart: unless-stopped
    networks:
      - aity-network
  
  frontend:
    build: ../frontend
    ports:
      - "5173:5173"
    restart: unless-stopped
    networks:
      - aity-network
  
  nginx:
    image: nginx:latest
    ports:
      - "8080:80"
      - "8443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf
      - ./nginx/ssl:/etc/nginx/ssl
    depends_on:
      - backend
      - frontend
    restart: unless-stopped
    networks:
      - aity-network

networks:
  aity-network:
    driver: bridge
EOF
    
    echo_green "docker-compose.yml 创建成功"
}

# 创建后端Dockerfile
function create_backend_dockerfile() {
    echo_yellow "创建后端Dockerfile..."
    
    cat > "$PROJECT_ROOT/backend/Dockerfile" << 'EOF'
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .

EXPOSE 3001

CMD ["npm", "start"]
EOF
    
    echo_green "后端Dockerfile 创建成功"
}

# 创建前端Dockerfile
function create_frontend_dockerfile() {
    echo_yellow "创建前端Dockerfile..."
    
    cat > "$PROJECT_ROOT/frontend/Dockerfile" << 'EOF'
FROM node:18-alpine as build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 5173

CMD ["nginx", "-g", "daemon off;"]
EOF
    
    echo_green "前端Dockerfile 创建成功"
}

# 创建Nginx配置文件
function create_nginx_config() {
    echo_yellow "创建Nginx配置文件..."
    
    cat > "$PROJECT_ROOT/docker/nginx/nginx.conf" << 'EOF'
events {
  worker_connections 1024;
}

http {
  server {
    listen 80;
    server_name aity88.online;
    
    return 301 https://$server_name:8443$request_uri;
  }
  
  server {
    listen 443 ssl;
    server_name aity88.online;
    
    ssl_certificate /etc/nginx/ssl/aity88.online.crt;
    ssl_certificate_key /etc/nginx/ssl/aity88.online.key;
    
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384';
    ssl_prefer_server_ciphers off;
    
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:;" always;
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)\$ {
      expires 1y;
      add_header Cache-Control "public, max-age=31536000, immutable";
    }
    
    location / {
      proxy_pass http://frontend:5173;
      proxy_set_header Host $host;
      proxy_set_header X-Real-IP $remote_addr;
      proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
      proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    location /api {
      proxy_pass http://backend:3001;
      proxy_set_header Host $host;
      proxy_set_header X-Real-IP $remote_addr;
      proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
      proxy_set_header X-Forwarded-Proto $scheme;
    }
  }
}
EOF
    
    echo_green "Nginx配置文件 创建成功"
}

# 部署Docker服务
function deploy_docker() {
    echo_yellow "部署Docker服务..."
    
    cd "$PROJECT_ROOT/docker"
    
    if docker-compose up -d --build; then
        echo_green "Docker服务部署成功"
        return 0
    else
        echo_red "Docker服务部署失败"
        return 1
    fi
}

# 验证部署
function verify_deployment() {
    echo_yellow "验证部署状态..."
    
    cd "$PROJECT_ROOT/docker"
    
    if docker-compose ps; then
        echo_green "部署验证成功"
        return 0
    else
        echo_red "部署验证失败"
        return 1
    fi
}

# 主函数
function main() {
    echo_green "开始Docker自动化部署..."
    
    # 检查Docker环境
    if ! check_docker; then
        echo_yellow "请先安装Docker: https://docs.docker.com/get-docker/"
        exit 1
    fi
    
    if ! check_docker_compose; then
        echo_yellow "请先安装Docker Compose: https://docs.docker.com/compose/install/"
        exit 1
    fi
    
    # 创建配置文件
    create_docker_config
    create_backend_dockerfile
    create_frontend_dockerfile
    create_nginx_config
    
    # 部署服务
    if deploy_docker; then
        echo_green "\n🎉 Docker自动化部署完成!"
        echo_green "前端访问地址: https://$HTTPS_DOMAIN:$HTTPS_PORT"
        echo_green "后端API地址: https://$HTTPS_DOMAIN:$HTTPS_PORT/api"
        echo_yellow "HTTP访问地址: http://$HTTPS_DOMAIN:$HTTP_PORT (自动重定向至HTTPS)"
        
        # 验证部署
        verify_deployment
    else
        echo_red "Docker部署失败"
        exit 1
    fi
}

# 执行主函数
main