#!/bin/bash
# 手动SSL证书部署脚本
# 用于部署购买或申请的SSL证书

set -e

echo "=========================================="
echo "  手动SSL证书部署脚本"
echo "=========================================="

# 配置变量
DOMAIN="aity88.online"
PROJECT_DIR="/root/aity-vip"
SSL_DIR="$PROJECT_DIR/ssl-certs"
NGINX_SSL_DIR="/etc/nginx/ssl"

# 1. 检查证书文件
echo "📋 [1/7] 检查证书文件..."
if [ ! -f "$SSL_DIR/aity88.online.key" ]; then
    echo "❌ 错误: 找不到私钥文件 aity88.online.key"
    echo "请将证书文件放在 $SSL_DIR/ 目录"
    exit 1
fi

if [ ! -f "$SSL_DIR/aity88.online_bundle.crt" ]; then
    echo "❌ 错误: 找不到证书文件 aity88.online_bundle.crt"
    echo "请将证书文件放在 $SSL_DIR/ 目录"
    exit 1
fi

echo "✅ 证书文件检查通过"

# 2. 创建服务器证书目录
echo "📁 [2/7] 创建证书目录..."
mkdir -p "$NGINX_SSL_DIR"

# 3. 备份旧证书（如果存在）
if [ -f "$NGINX_SSL_DIR/aity88.online.key" ]; then
    BACKUP_DIR="$NGINX_SSL_DIR/backup-$(date +%Y%m%d)"
    mkdir -p "$BACKUP_DIR"
    cp "$NGINX_SSL_DIR/aity88.online.key" "$BACKUP_DIR/"
    cp "$NGINX_SSL_DIR/aity88.online_bundle.crt" "$BACKUP_DIR/"
    echo "✅ 已备份旧证书到: $BACKUP_DIR"
fi

# 4. 复制证书到服务器
echo "📤 [3/7] 复制证书到服务器..."
cp "$SSL_DIR/aity88.online.key" "$NGINX_SSL_DIR/"
cp "$SSL_DIR/aity88.online_bundle.crt" "$NGINX_SSL_DIR/"

# 5. 设置正确的权限
echo "🔒 [4/7] 设置文件权限..."
chmod 600 "$NGINX_SSL_DIR/aity88.online.key"
chmod 644 "$NGINX_SSL_DIR/aity88.online_bundle.crt"
echo "✅ 权限设置完成"

# 6. 创建Nginx配置
echo "⚙️  [5/7] 配置Nginx..."
cat > /etc/nginx/sites-available/aity-vip << EOF
server {
    listen 443 ssl http2;
    server_name $DOMAIN www.$DOMAIN;

    # SSL证书配置
    ssl_certificate $NGINX_SSL_DIR/aity88.online_bundle.crt;
    ssl_certificate_key $NGINX_SSL_DIR/aity88.online.key;

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
        proxy_pass http://localhost:3001;
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
        proxy_pass http://localhost:3001/health;
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

# 启用配置
ln -sf /etc/nginx/sites-available/aity-vip /etc/nginx/sites-enabled/aity-vip

# 7. 测试并重载Nginx
echo "🧪 [6/7] 测试Nginx配置..."
if nginx -t; then
    echo "✅ Nginx配置测试通过"
else
    echo "❌ Nginx配置测试失败"
    exit 1
fi

echo "🔄 [7/7] 重载Nginx..."
systemctl reload nginx

# 显示证书信息
echo ""
echo "📅 证书信息："
openssl x509 -in "$NGINX_SSL_DIR/aity88.online_bundle.crt" -noout -dates 2>/dev/null || echo "无法读取证书信息"

echo ""
echo "=========================================="
echo "  ✅ SSL证书部署完成！"
echo "=========================================="
echo "证书位置: $NGINX_SSL_DIR/"
echo "访问地址: https://$DOMAIN"
echo "测试命令: curl https://$DOMAIN/api/health"
echo "=========================================="

# 测试HTTPS访问
sleep 2
echo "🧐 测试HTTPS访问..."
if curl -s "https://$DOMAIN/api/health" > /dev/null; then
    echo "✅ HTTPS访问正常"
else
    echo "⚠️  HTTPS访问可能有问题，请检查："
    echo "1. DNS解析是否正确"
    echo "2. 防火墙是否开放443端口"
    echo "3. 证书是否匹配域名"
fi
