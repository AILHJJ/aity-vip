#!/bin/bash
# Let's Encrypt SSL证书一键部署脚本
# 适用于：腾讯云服务器 + Ubuntu/Debian
# 用途：自动申请免费SSL证书并配置Nginx

set -e

echo "=========================================="
echo "  Let's Encrypt SSL一键部署脚本"
echo "=========================================="

# 配置变量
DOMAIN="aity88.online"
EMAIL="your-email@example.com"  # 修改为你的邮箱
PROJECT_DIR="/root/aity-vip"
BACKEND_PORT="3001"

# 检查是否为root用户
if [ "$EUID" -ne 0 ]; then
    echo "❌ 请使用root用户运行此脚本"
    echo "使用: sudo bash $0"
    exit 1
fi

# 1. 更新系统
echo "📦 [1/8] 更新系统包..."
apt update

# 2. 安装必要软件
echo "📦 [2/8] 安装必要软件..."
apt install -y curl git nginx

# 安装certbot
if ! command -v certbot &> /dev/null; then
    echo "安装certbot..."
    apt install -y certbot
else
    echo "✅ certbot已安装"
fi

# 3. 拉取项目代码
echo "📥 [3/8] 拉取项目代码..."
if [ -d "$PROJECT_DIR" ]; then
    echo "项目目录已存在，更新代码..."
    cd "$PROJECT_DIR"
    git pull origin feature/iteration-1
else
    echo "克隆项目..."
    git clone https://github.com/AILHJJ/aity-vip.git "$PROJECT_DIR"
    cd "$PROJECT_DIR"
    git checkout feature/iteration-1
fi

# 4. 安装后端依赖
echo "📦 [4/8] 安装后端依赖..."
cd "$PROJECT_DIR/backend"
npm install

# 5. 申请SSL证书
echo "🔐 [5/8] 申请SSL证书..."
systemctl stop nginx 2>/dev/null || true

if certbot certonly --standalone -d "$DOMAIN" -d "www.$DOMAIN" --email "$EMAIL" --agree-tos --non-interactive; then
    echo "✅ SSL证书申请成功"
else
    echo "❌ SSL证书申请失败"
    systemctl start nginx
    exit 1
fi

# 6. 配置Nginx
echo "⚙️  [6/8] 配置Nginx..."
cat > /etc/nginx/sites-available/aity-vip << EOF
server {
    listen 443 ssl http2;
    server_name $DOMAIN www.$DOMAIN;

    # SSL证书配置
    ssl_certificate /etc/letsencrypt/live/$DOMAIN/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/$DOMAIN/privkey.pem;

    # SSL安全配置
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # 安全头部
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options DENY always;
    add_header X-Content-Type-Options nosniff always;

    # 日志
    access_log /var/log/nginx/aity-access.log;
    error_log /var/log/nginx/aity-error.log;

    # 反向代理到后端
    location / {
        proxy_pass http://localhost:$BACKEND_PORT;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;

        # 超时配置
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # 健康检查
    location /health {
        proxy_pass http://localhost:$BACKEND_PORT/health;
        access_log off;
    }
}

# HTTP重定向到HTTPS
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;
    return 301 https://\$server_name\$request_uri;
}
EOF

# 启用Nginx配置
ln -sf /etc/nginx/sites-available/aity-vip /etc/nginx/sites-enabled/aity-vip

# 测试Nginx配置
if nginx -t; then
    echo "✅ Nginx配置正确"
else
    echo "❌ Nginx配置错误"
    exit 1
fi

# 7. 启动后端服务
echo "🚀 [7/8] 启动后端服务..."
cd "$PROJECT_DIR/backend"

# 安装PM2（如果没有）
if ! command -v pm2 &> /dev/null; then
    echo "安装PM2..."
    npm install -g pm2
fi

# 启动或重启服务
if pm2 list | grep -q "aity-backend"; then
    pm2 restart aity-backend
else
    pm2 start src/index.js --name aity-backend --env production
fi
pm2 save

# 启动Nginx
systemctl start nginx
systemctl enable nginx

# 8. 配置证书自动续期
echo "🔄 [8/8] 配置证书自动续期..."
(crontab -l 2>/dev/null; echo "0 2 * * * certbot renew --quiet --post-hook 'systemctl reload nginx'") | crontab -

# 测试自动续期
echo "🧪 测试自动续期..."
certbot renew --dry-run

echo ""
echo "=========================================="
echo "  ✅ 部署完成！"
echo "=========================================="
echo ""
echo "📊 服务信息："
echo "  后端地址: http://localhost:$BACKEND_PORT"
echo "  网站地址: https://$DOMAIN"
echo "  API文档: https://$DOMAIN/api-docs"
echo ""
echo "🔧 证书信息："
echo "  证书路径: /etc/letsencrypt/live/$DOMAIN/"
echo "  自动续期: 已配置（每天凌晨2点）"
echo ""
echo "📋 常用命令："
echo "  查看日志: pm2 logs aity-backend"
echo "  重启服务: pm2 restart aity-backend"
echo "  查看证书: certbot certificates"
echo "  手动续期: certbot renew"
echo ""
echo "=========================================="

# 测试访问
sleep 2
echo "🧐 测试访问..."
if curl -s "http://localhost:$BACKEND_PORT/api/health" > /dev/null; then
    echo "✅ 后端服务正常"
else
    echo "⚠️  后端服务可能有问题，请检查日志"
fi

if curl -s "https://$DOMAIN/api/health" > /dev/null; then
    echo "✅ HTTPS访问正常"
else
    echo "⚠️  HTTPS访问可能有问题，请检查DNS和防火墙"
fi

echo ""
echo "=========================================="
