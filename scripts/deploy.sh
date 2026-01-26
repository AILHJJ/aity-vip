#!/bin/bash
###
 # @Author: fuli fuli@example.com
 # @Date: 2026-01-26 14:14:28
 # @LastEditors: fuli fuli@example.com
 # @LastEditTime: 2026-01-26 14:14:31
 # @FilePath: \your-mcp-proxy\AITY_VIP\scripts\deploy.sh
 # @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
### 
# 部署脚本 - 用于将代码部署到腾讯云服务器

# 配置信息
SERVER_IP="124.221.119.134"     # 腾讯云服务器IP
SERVER_USER="root"                 # 服务器用户名
FRONTEND_DIR="/var/www/aity-vip/frontend"  # 前端部署目录
BACKEND_DIR="/var/www/aity-vip/backend"    # 后端部署目录
NGINX_DIR="/etc/nginx"                       # Nginx配置目录

# HTTPS配置
HTTPS_DOMAIN="aity88.online"
HTTPS_PORT="8443"
HTTP_PORT="8080"
FRONTEND_URL="https://$HTTPS_DOMAIN:$HTTPS_PORT"
BACKEND_URL="https://$HTTPS_DOMAIN:$HTTPS_PORT/api"

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

# 开始部署
echo_yellow "开始部署AITY VIP项目..."

# 1. 构建前端
echo_yellow "\n1. 构建前端项目..."
cd "$(dirname "$0")/../frontend"
if npm run build; then
    echo_green "前端构建成功!"
else
    echo_red "前端构建失败!"
    exit 1
fi

# 2. 部署前端
echo_yellow "\n2. 部署前端到服务器..."
if scp -r dist/* "$SERVER_USER@$SERVER_IP:$FRONTEND_DIR"; then
    echo_green "前端部署成功!"
else
    echo_red "前端部署失败!"
    exit 1
fi

# 3. 部署后端
echo_yellow "\n3. 部署后端到服务器..."
if scp -r "$(dirname "$0")/../backend"/* "$SERVER_USER@$SERVER_IP:$BACKEND_DIR"; then
    echo_green "后端代码复制成功!"
else
    echo_red "后端代码复制失败!"
    exit 1
fi

# 4. 安装后端依赖并重启服务
echo_yellow "\n4. 安装后端依赖并重启服务..."
if ssh "$SERVER_USER@$SERVER_IP" "cd $BACKEND_DIR && npm install --production && pm2 restart ecosystem.config.js"; then
    echo_green "后端服务重启成功!"
else
    echo_red "后端服务重启失败!"
    exit 1
fi

# 5. 配置Nginx HTTPS
echo_yellow "\n5. 配置Nginx HTTPS..."
if ssh "$SERVER_USER@$SERVER_IP" "test -f $NGINX_DIR/conf.d/aity-vip-https.conf"; then
    echo_green "Nginx HTTPS配置已存在!"
else
    echo_yellow "创建Nginx HTTPS配置..."
    ssh "$SERVER_USER@$SERVER_IP" "cat > $NGINX_DIR/conf.d/aity-vip-https.conf << 'EOF'
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
        proxy_pass http://localhost:3000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF"
    echo_green "Nginx HTTPS配置创建成功!"
fi

# 6. 重启Nginx服务
echo_yellow "\n6. 重启Nginx服务..."
if ssh "$SERVER_USER@$SERVER_IP" "nginx -t && systemctl reload nginx"; then
    echo_green "Nginx服务重启成功!"
else
    echo_red "Nginx服务重启失败!"
    exit 1
fi

# 7. 验证部署
echo_yellow "\n7. 验证部署状态..."
if ssh "$SERVER_USER@$SERVER_IP" "pm2 status"; then
    echo_green "部署验证成功!"
else
    echo_red "部署验证失败!"
    exit 1
fi

echo_green "\n🎉 AITY VIP项目部署完成!"
echo_green "前端访问地址: $FRONTEND_URL"
echo_green "后端API地址: $BACKEND_URL"
echo_yellow "HTTP访问地址: http://$HTTPS_DOMAIN:$HTTP_PORT (自动重定向至HTTPS)"
echo_green "HTTPS访问地址: $FRONTEND_URL"