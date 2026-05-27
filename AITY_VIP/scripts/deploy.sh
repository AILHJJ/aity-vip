#!/bin/bash
###
 # @Author: fuli fuli@example.com
 # @Date: 2026-01-26 14:14:28
 # @LastEditors: fuli fuli@example.com
 # @LastEditTime: 2026-01-27 11:15:39
 # @FilePath: \your-mcp-proxy\AITY_VIP\scripts\deploy.sh
 # @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
### 
# 部署脚本 - 用于将代码部署到腾讯云服务器

# 默认配置
SERVER_IP="124.221.119.134"     # 腾讯云服务器IP
SERVER_USER="root"                 # 服务器用户名
FRONTEND_DIR="/root/aity-vip/aity-uni-app-v2"  # 前端部署目录
BACKEND_DIR="/root/aity-vip/backend"    # 后端部署目录
NGINX_DIR="/etc/nginx"                       # Nginx配置目录

# HTTPS配置
HTTPS_DOMAIN="aity88.online"
HTTPS_PORT="8443"
HTTP_PORT="8080"

# 路径配置
FRONTEND_LOCAL_DIR="$(dirname "$0")/../aity-uni-app-v2"
BACKEND_LOCAL_DIR="$(dirname "$0")/../backend"

# 日志配置
LOG_DIR="$(dirname "$0")/logs"
LOG_FILE="$LOG_DIR/deploy_$(date +%Y%m%d_%H%M%S).log"

# 配置文件路径
CONFIG_FILE="$(dirname "$0")/config.json"

# 读取配置文件
function load_config() {
    if [ -f "$CONFIG_FILE" ]; then
        echo_yellow "加载配置文件: $CONFIG_FILE"
        write_log "加载配置文件: $CONFIG_FILE" "INFO"
        
        # 检查是否安装了 jq
        if command -v jq &> /dev/null; then
            # 使用 jq 解析 JSON 配置文件
            SERVER_IP=$(jq -r '.server.ip' "$CONFIG_FILE" 2>/dev/null || echo "$SERVER_IP")
            SERVER_USER=$(jq -r '.server.user' "$CONFIG_FILE" 2>/dev/null || echo "$SERVER_USER")
            FRONTEND_DIR=$(jq -r '.server.frontendDir' "$CONFIG_FILE" 2>/dev/null || echo "$FRONTEND_DIR")
            BACKEND_DIR=$(jq -r '.server.backendDir' "$CONFIG_FILE" 2>/dev/null || echo "$BACKEND_DIR")
            NGINX_DIR=$(jq -r '.server.nginxDir' "$CONFIG_FILE" 2>/dev/null || echo "$NGINX_DIR")
            
            HTTPS_DOMAIN=$(jq -r '.https.domain' "$CONFIG_FILE" 2>/dev/null || echo "$HTTPS_DOMAIN")
            HTTPS_PORT=$(jq -r '.https.port' "$CONFIG_FILE" 2>/dev/null || echo "$HTTPS_PORT")
            HTTP_PORT=$(jq -r '.https.httpPort' "$CONFIG_FILE" 2>/dev/null || echo "$HTTP_PORT")
            
            FRONTEND_LOCAL_DIR=$(jq -r '.paths.frontend' "$CONFIG_FILE" 2>/dev/null || echo "$FRONTEND_LOCAL_DIR")
            BACKEND_LOCAL_DIR=$(jq -r '.paths.backend' "$CONFIG_FILE" 2>/dev/null || echo "$BACKEND_LOCAL_DIR")
            
            LOG_DIR=$(jq -r '.logs.dir' "$CONFIG_FILE" 2>/dev/null || echo "$LOG_DIR")
            
            # 转换相对路径为绝对路径
            LOG_DIR="$(dirname "$0")/$LOG_DIR"
            FRONTEND_LOCAL_DIR="$(dirname "$0")/$FRONTEND_LOCAL_DIR"
            BACKEND_LOCAL_DIR="$(dirname "$0")/$BACKEND_LOCAL_DIR"
            
            echo_green "配置文件加载成功!"
            write_log "配置文件加载成功" "INFO"
        else
            echo_yellow "未安装 jq，使用默认配置"
            write_log "未安装 jq，使用默认配置" "INFO"
        fi
    else
        echo_yellow "配置文件不存在，使用默认配置"
        write_log "配置文件不存在，使用默认配置" "INFO"
        echo_yellow "如需自定义配置，请复制 config.example.json 为 config.json 并修改"
    fi
}

# 加载配置
load_config

# 生成访问地址
FRONTEND_URL="https://$HTTPS_DOMAIN:$HTTPS_PORT"
BACKEND_URL="https://$HTTPS_DOMAIN:$HTTPS_PORT/api"

# 颜色输出函数
function echo_green() {
    echo -e "\033[32m$1\033[0m"
    write_log "$1" "INFO"
}

function echo_yellow() {
    echo -e "\033[33m$1\033[0m"
    write_log "$1" "INFO"
}

function echo_red() {
    echo -e "\033[31m$1\033[0m"
    write_log "$1" "ERROR"
}

# 日志记录函数
function write_log() {
    local message="$1"
    local level="${2:-INFO}"
    local timestamp=$(date +"%Y-%m-%d %H:%M:%S")
    
    # 确保日志目录存在
    mkdir -p "$LOG_DIR"
    
    # 写入日志文件
    echo "[$timestamp] [$level] $message" >> "$LOG_FILE"
}

# 检查SSH连接
test_ssh_connection() {
    echo_yellow "\n检查SSH连接..."
    if ssh -q "$SERVER_USER@$SERVER_IP" "echo 'SSH连接成功'"; then
        echo_green "SSH连接成功!"
        return 0
    else
        echo_red "SSH连接失败!"
        echo_yellow "请检查以下事项:"
        echo_yellow "1. 服务器IP是否正确: $SERVER_IP"
        echo_yellow "2. 服务器用户名是否正确: $SERVER_USER"
        echo_yellow "3. 网络连接是否正常"
        echo_yellow "4. SSH密钥是否已配置或密码是否正确"
        echo_yellow "\n解决方案:"
        echo_yellow "1. 使用密钥登录:"
        echo_yellow "   ssh-keygen -t rsa -b 4096"
        echo_yellow "   ssh-copy-id $SERVER_USER@$SERVER_IP"
        echo_yellow "2. 使用密码登录:"
        echo_yellow "   确保服务器已启用密码登录"
        return 1
    fi
}

# 开始部署
echo_yellow "开始部署AITY VIP项目..."
write_log "部署开始" "INFO"
write_log "日志文件: $LOG_FILE" "INFO"

# 检查SSH连接
if ! test_ssh_connection; then
    exit 1
fi

# 1. 构建前端
echo_yellow "\n1. 构建前端项目..."
write_log "开始构建前端" "INFO"
cd "$FRONTEND_LOCAL_DIR"
if npm run build; then
    echo_green "前端构建成功!"
    write_log "前端构建成功" "INFO"
else
    echo_red "前端构建失败!"
    write_log "前端构建失败" "ERROR"
    exit 1
fi

# 2. 部署前端
echo_yellow "\n2. 部署前端到服务器..."
write_log "开始部署前端到服务器" "INFO"
# 确保服务器目录存在
ssh "$SERVER_USER@$SERVER_IP" "mkdir -p $FRONTEND_DIR"
if scp -r dist/* "$SERVER_USER@$SERVER_IP:$FRONTEND_DIR"; then
    echo_green "前端部署成功!"
    write_log "前端部署成功" "INFO"
else
    echo_red "前端部署失败!"
    write_log "前端部署失败" "ERROR"
    echo_yellow "尝试解决方案:"
    echo_yellow "1. 确保服务器目录存在: ssh $SERVER_USER@$SERVER_IP 'mkdir -p $FRONTEND_DIR'"
    echo_yellow "2. 检查服务器磁盘空间: ssh $SERVER_USER@$SERVER_IP 'df -h'"
    exit 1
fi

# 3. 部署后端
echo_yellow "\n3. 部署后端到服务器..."
write_log "开始部署后端到服务器" "INFO"
# 确保服务器目录存在
ssh "$SERVER_USER@$SERVER_IP" "mkdir -p $BACKEND_DIR"
if scp -r "$BACKEND_LOCAL_DIR"/* "$SERVER_USER@$SERVER_IP:$BACKEND_DIR"; then
    echo_green "后端代码复制成功!"
    write_log "后端代码复制成功" "INFO"
else
    echo_red "后端代码复制失败!"
    write_log "后端代码复制失败" "ERROR"
    echo_yellow "尝试解决方案:"
    echo_yellow "1. 确保服务器目录存在: ssh $SERVER_USER@$SERVER_IP 'mkdir -p $BACKEND_DIR'"
    echo_yellow "2. 检查服务器磁盘空间: ssh $SERVER_USER@$SERVER_IP 'df -h'"
    exit 1
fi

# 4. 安装后端依赖并重启服务
echo_yellow "\n4. 安装后端依赖并重启服务..."
write_log "开始安装后端依赖并重启服务" "INFO"
if ssh "$SERVER_USER@$SERVER_IP" "cd $BACKEND_DIR && npm install --production && pm2 restart ecosystem.config.js"; then
    echo_green "后端服务重启成功!"
    write_log "后端服务重启成功" "INFO"
else
    echo_red "后端服务重启失败!"
    write_log "后端服务重启失败" "ERROR"
    echo_yellow "尝试解决方案:"
    echo_yellow "1. 检查Node.js版本: ssh $SERVER_USER@$SERVER_IP 'node -v'"
    echo_yellow "2. 检查PM2是否安装: ssh $SERVER_USER@$SERVER_IP 'pm2 -v'"
    echo_yellow "3. 安装PM2: ssh $SERVER_USER@$SERVER_IP 'npm install -g pm2'"
    exit 1
fi

# 5. 配置Nginx HTTPS
echo_yellow "\n5. 配置Nginx HTTPS..."
write_log "开始配置Nginx HTTPS" "INFO"
if ssh "$SERVER_USER@$SERVER_IP" "test -f $NGINX_DIR/conf.d/aity-vip-https.conf"; then
    echo_green "Nginx HTTPS配置已存在!"
    write_log "Nginx HTTPS配置已存在" "INFO"
else
    echo_yellow "创建Nginx HTTPS配置..."
    write_log "创建Nginx HTTPS配置" "INFO"
    ssh "$SERVER_USER@$SERVER_IP" "mkdir -p $NGINX_DIR/conf.d"
    ssh "$SERVER_USER@$SERVER_IP" "cat > $NGINX_DIR/conf.d/aity-vip-https.conf << 'EOF'"
# HTTP重定向至HTTPS
server {
    listen $HTTP_PORT;
    server_name $HTTPS_DOMAIN;
    
    return 301 https://\$server_name:$HTTPS_PORT\$request_uri;
}

# HTTPS服务器配置
server {
    listen $HTTPS_PORT ssl http2;
    server_name $HTTPS_DOMAIN;
    
    # SSL证书配置
    ssl_certificate /etc/nginx/ssl/$HTTPS_DOMAIN.crt;
    ssl_certificate_key /etc/nginx/ssl/$HTTPS_DOMAIN.key;
    
    # SSL协议配置
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384';
    ssl_prefer_server_ciphers off;
    
    # HSTS配置
    add_header Strict-Transport-Security \"max-age=31536000; includeSubDomains\" always;
    
    # CSP配置
    add_header Content-Security-Policy \"default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:;\" always;
    
    # 其他安全头部
    add_header X-Frame-Options \"DENY\" always;
    add_header X-Content-Type-Options \"nosniff\" always;
    add_header X-XSS-Protection \"1; mode=block\" always;
    
    # 缓存配置
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)\$ {
        expires 1y;
        add_header Cache-Control \"public, max-age=31536000, immutable\";
    }
    
    # 反向代理配置
    location / {
        proxy_pass http://localhost:3001;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF"
    echo_green "Nginx HTTPS配置创建成功!"
    write_log "Nginx HTTPS配置创建成功" "INFO"
fi

# 6. 重启Nginx服务
echo_yellow "\n6. 重启Nginx服务..."
write_log "开始重启Nginx服务" "INFO"
if ssh "$SERVER_USER@$SERVER_IP" "nginx -t && systemctl reload nginx"; then
    echo_green "Nginx服务重启成功!"
    write_log "Nginx服务重启成功" "INFO"
else
    echo_red "Nginx服务重启失败!"
    write_log "Nginx服务重启失败" "ERROR"
    echo_yellow "尝试解决方案:"
    echo_yellow "1. 检查Nginx是否安装: ssh $SERVER_USER@$SERVER_IP 'nginx -v'"
    echo_yellow "2. 安装Nginx: ssh $SERVER_USER@$SERVER_IP 'apt install nginx' (Ubuntu/Debian)"
    echo_yellow "3. 检查Nginx配置: ssh $SERVER_USER@$SERVER_IP 'nginx -t'"
    exit 1
fi

# 7. 验证部署
echo_yellow "\n7. 验证部署状态..."
write_log "开始验证部署状态" "INFO"
if ssh "$SERVER_USER@$SERVER_IP" "pm2 status"; then
    echo_green "部署验证成功!"
    write_log "部署验证成功" "INFO"
else
    echo_red "部署验证失败!"
    write_log "部署验证失败" "ERROR"
    exit 1
fi

echo_green "\n🎉 AITY VIP项目部署完成!"
echo_green "前端访问地址: $FRONTEND_URL"
echo_green "后端API地址: $BACKEND_URL"
echo_yellow "HTTP访问地址: http://$HTTPS_DOMAIN:$HTTP_PORT (自动重定向至HTTPS)"
echo_green "HTTPS访问地址: $FRONTEND_URL"
echo_yellow "部署日志文件: $LOG_FILE"
echo_yellow "\n部署提示:"
echo_yellow "1. 如遇到端口占用问题,请运行:"
echo_yellow "   ssh $SERVER_USER@$SERVER_IP 'lsof -i :8443 && lsof -i :8080 && lsof -i :3001'"
echo_yellow "2. 如遇到服务启动失败,请查看日志:"
echo_yellow "   ssh $SERVER_USER@$SERVER_IP 'pm2 logs'"
echo_yellow "3. 如遇到Nginx错误,请查看日志:"
echo_yellow "   ssh $SERVER_USER@$SERVER_IP 'tail -f /var/log/nginx/error.log'"
echo_yellow "4. 如遇到SSH登录问题,请参考部署文档中的解决方案"
echo_yellow "   a. 使用密钥登录: ssh-keygen -t rsa -b 4096 && ssh-copy-id $SERVER_USER@$SERVER_IP"
echo_yellow "   b. 使用密码登录: 确保服务器已启用密码登录"

write_log "部署完成" "INFO"
write_log "前端访问地址: $FRONTEND_URL" "INFO"
write_log "后端API地址: $BACKEND_URL" "INFO"
write_log "HTTPS访问地址: $FRONTEND_URL" "INFO"
write_log "部署日志文件: $LOG_FILE" "INFO"