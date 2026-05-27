# 私有仓库SSL证书便捷管理方案

## 🎯 适用场景

- ✅ 私有Git仓库
- ✅ 小团队内部使用
- ✅ 便捷性优先
- ✅ 需要一键部署脚本

---

## 📦 方案概述

### 方案选择

我们提供两个方案：

**方案A：自动化方案（推荐）** ⭐
- 使用Let's Encrypt免费证书
- 自动申请和续期
- 一键脚本部署
- 无需手动管理证书

**方案B：手动证书管理**
- 购买或申请证书
- 提交到私有Git仓库
- 通过脚本部署
- 需要手动更新（每年）

---

## 🚀 方案A：Let's Encrypt自动化方案（推荐）

### 优势
- ✅ 完全免费
- ✅ 自动续期（无需手动操作）
- ✅ 一键部署脚本
- ✅ 安全可靠

### 部署脚本

我已经为你准备好了完整的一键部署脚本，保存在项目根目录。

#### 1. 在腾讯云服务器上执行

```bash
# 登录服务器
ssh root@your_server_ip

# 拉取最新代码
cd /root/aity-vip
git pull origin feature/iteration-1

# 执行一键部署脚本
bash scripts/deploy-with-ssl.sh
```

#### 2. 脚本会自动完成

✅ 安装certbot
✅ 申请SSL证书
✅ 配置Nginx
✅ 启动后端服务
✅ 配置自动续期
✅ 测试访问

**全程无需手动配置！**

---

## 📋 方案B：手动证书管理（如果必须）

如果你们已经有购买的证书或者不想用Let's Encrypt，可以使用这个方案。

### 第一步：准备证书文件

将证书文件放在项目目录：

```
AITY_VIP/
└── ssl-certs/
    ├── aity88.online.key           # 私钥
    ├── aity88.online_bundle.crt    # 证书
    └── deploy-ssl.sh              # 部署脚本
```

### 第二步：创建部署脚本

```bash
#!/bin/bash
# 脚本名称: ssl-certs/deploy-ssl.sh
# 用途: 一键部署SSL证书和Nginx配置

set -e

echo "=========================================="
echo "  SSL证书一键部署脚本"
echo "=========================================="

# 配置变量
DOMAIN="aity88.online"
PROJECT_DIR="/root/aity-vip"
SSL_DIR="$PROJECT_DIR/ssl-certs"
NGINX_CONF_DIR="/etc/nginx/sites-available"
NGINX_ENABLED_DIR="/etc/nginx/sites-enabled"

# 1. 检查证书文件
echo "📋 检查证书文件..."
if [ ! -f "$SSL_DIR/aity88.online.key" ]; then
    echo "❌ 错误: 找不到私钥文件"
    exit 1
fi

if [ ! -f "$SSL_DIR/aity88.online_bundle.crt" ]; then
    echo "❌ 错误: 找不到证书文件"
    exit 1
fi

echo "✅ 证书文件检查通过"

# 2. 创建服务器证书目录
echo "📁 创建证书目录..."
mkdir -p /etc/nginx/ssl

# 3. 复制证书到服务器
echo "📤 复制证书到服务器..."
cp "$SSL_DIR/aity88.online.key" /etc/nginx/ssl/
cp "$SSL_DIR/aity88.online_bundle.crt" /etc/nginx/ssl/

# 4. 设置正确的权限
echo "🔒 设置文件权限..."
chmod 600 /etc/nginx/ssl/aity88.online.key
chmod 644 /etc/nginx/ssl/aity88.online_bundle.crt

# 5. 创建Nginx配置
echo "⚙️  配置Nginx..."
cat > "$NGINX_CONF_DIR/aity-vip" << EOF
server {
    listen 443 ssl http2;
    server_name $DOMAIN www.$DOMAIN;

    # SSL证书配置
    ssl_certificate /etc/nginx/ssl/aity88.online_bundle.crt;
    ssl_certificate_key /etc/nginx/ssl/aity88.online.key;

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

# 6. 启用配置
echo "🔗 启用Nginx配置..."
ln -sf "$NGINX_CONF_DIR/aity-vip" "$NGINX_ENABLED_DIR/aity-vip"

# 7. 测试Nginx配置
echo "🧪 测试Nginx配置..."
if nginx -t; then
    echo "✅ Nginx配置测试通过"
else
    echo "❌ Nginx配置测试失败"
    exit 1
fi

# 8. 重载Nginx
echo "🔄 重载Nginx..."
systemctl reload nginx

# 9. 检查证书有效期
echo "📅 证书信息："
openssl x509 -in /etc/nginx/ssl/aity88.online_bundle.crt -noout -dates

echo ""
echo "=========================================="
echo "  ✅ SSL证书部署完成！"
echo "=========================================="
echo "访问地址: https://$DOMAIN"
echo "测试命令: curl https://$DOMAIN/api/health"
echo "=========================================="

# 10. 测试HTTPS访问
echo "🧐 测试HTTPS访问..."
sleep 2
if curl -s https://$DOMAIN/api/health > /dev/null; then
    echo "✅ HTTPS访问正常"
else
    echo "⚠️  HTTPS访问可能有问题，请手动检查"
fi
```

### 第三步：使用方式

#### 在服务器上执行

```bash
# 1. 登录服务器
ssh root@your_server_ip

# 2. 进入项目目录
cd /root/aity-vip

# 3. 拉取最新代码（包含证书）
git pull origin feature/iteration-1

# 4. 执行部署脚本
bash ssl-certs/deploy-ssl.sh
```

**就这么简单！** 🎉

---

## 🎯 推荐的完整工作流程

### 日常部署流程

```bash
# 1. 本地更新代码后提交
git add .
git commit -m "更新代码"
git push origin feature/iteration-1

# 2. 在服务器上更新并部署
ssh root@your_server_ip
cd /root/aity-vip
git pull origin feature/iteration-1
bash scripts/update-and-restart.sh
```

### 一键更新脚本

创建 `scripts/update-and-restart.sh`:

```bash
#!/bin/bash
# 一键更新并重启服务

echo "=========================================="
echo "  更新AITY项目"
echo "=========================================="

cd /root/aity-vip

# 1. 拉取最新代码
echo "📥 拉取最新代码..."
git pull origin feature/iteration-1

# 2. 更新后端
echo "📦 更新后端..."
cd backend
npm install

# 3. 重启服务
echo "🔄 重启服务..."
pm2 restart aity-backend

# 4. 查看状态
echo "📊 服务状态："
pm2 status

# 5. 测试健康检查
echo "🏥 测试健康检查..."
if curl -s http://localhost:3001/api/health > /dev/null; then
    echo "✅ 服务运行正常"
else
    echo "❌ 服务可能有问题"
fi

echo ""
echo "=========================================="
echo "  更新完成！"
echo "=========================================="
```

---

## 📚 证书管理最佳实践（简化版）

### 1. 证书有效期提醒

创建提醒脚本 `scripts/check-cert-expiry.sh`:

```bash
#!/bin/bash
# 检查SSL证书有效期

DOMAIN="aity88.online"
CERT_FILE="/etc/nginx/ssl/aity88.online_bundle.crt"

# 检查证书文件是否存在
if [ ! -f "$CERT_FILE" ]; then
    echo "❌ 证书文件不存在"
    exit 1
fi

# 获取证书过期日期
EXPIRY_DATE=$(openssl x509 -in "$CERT_FILE" -noout -enddate | cut -d= -f2)
EXPIRY_EPOCH=$(date -d "$EXPIRY_DATE" +%s)
CURRENT_EPOCH=$(date +%s)
DAYS_LEFT=$(( ($EXPIRY_EPOCH - $CURRENT_EPOCH) / 86400 ))

echo "=========================================="
echo "  SSL证书状态"
echo "=========================================="
echo "域名: $DOMAIN"
echo "过期日期: $EXPIRY_DATE"
echo "剩余天数: $DAYS_LEFT 天"
echo "=========================================="

# 如果剩余不足30天，显示警告
if [ $DAYS_LEFT -lt 30 ]; then
    echo "⚠️  警告：证书将在 $DAYS_LEFT 天后过期"
    echo "请及时更新证书文件"
    echo ""
    echo "更新步骤："
    echo "1. 购买新证书或重新申请"
    echo "2. 替换 ssl-certs/ 目录中的证书文件"
    echo "3. 提交到Git"
    echo "4. 在服务器执行: bash ssl-certs/deploy-ssl.sh"
else
    echo "✅ 证书状态良好"
fi
```

添加到定时任务（每周检查一次）：

```bash
# 编辑crontab
crontab -e

# 添加：每周一上午9点检查
0 9 * * 1 /root/aity-vip/scripts/check-cert-expiry.sh
```

### 2. 证书更新流程

当证书即将过期时（30天内）：

```bash
# 1. 获取新证书
# 从证书提供商处购买或申请

# 2. 替换证书文件
# 将新证书复制到 ssl-certs/ 目录
cp /path/to/new/cert.key /path/to/aity-vip/ssl-certs/aity88.online.key
cp /path/to/new/cert.crt /path/to/aity-vip/ssl-certs/aity88.online_bundle.crt

# 3. 提交到Git
git add ssl-certs/
git commit -m "更新SSL证书"
git push origin feature/iteration-1

# 4. 在服务器部署
ssh root@your_server_ip
cd /root/aity-vip
git pull origin feature/iteration-1
bash ssl-certs/deploy-ssl.sh
```

---

## 🛠️ 完整的项目一键部署脚本

创建 `scripts/full-deploy.sh`（完整部署，包括SSL）:

```bash
#!/bin/bash
# 完整部署脚本：包括代码、SSL证书、后端服务

set -e

echo "=========================================="
echo "  AITY完整部署脚本"
echo "=========================================="

PROJECT_DIR="/root/aity-vip"
cd "$PROJECT_DIR"

# 1. 拉取最新代码
echo "📥 [1/6] 拉取最新代码..."
git pull origin feature/iteration-1

# 2. 安装后端依赖
echo "📦 [2/6] 安装后端依赖..."
cd backend
npm install
cd ..

# 3. 部署SSL证书（如果证书有更新）
echo "🔐 [3/6] 部署SSL证书..."
if [ -f "ssl-certs/deploy-ssl.sh" ]; then
    bash ssl-certs/deploy-ssl.sh
else
    echo "⚠️  SSL证书脚本不存在，跳过"
fi

# 4. 启动后端服务
echo "🚀 [4/6] 启动后端服务..."
cd backend
if pm2 list | grep -q "aity-backend"; then
    pm2 restart aity-backend
else
    pm2 start src/index.js --name aity-backend --env production
fi
pm2 save
cd ..

# 5. 查看服务状态
echo "📊 [5/6] 服务状态："
pm2 status

# 6. 测试访问
echo "🧪 [6/6] 测试访问..."
echo "HTTP: http://localhost:3001/api/health"
curl -s http://localhost:3001/api/health || echo "HTTP测试失败"

echo ""
echo "HTTPS: https://aity88.online/api/health"
curl -s https://aity88.online/api/health || echo "HTTPS测试失败"

echo ""
echo "=========================================="
echo "  ✅ 部署完成！"
echo "=========================================="
echo "后端地址: http://localhost:3001"
echo "网站地址: https://aity88.online"
echo "API文档: https://aity88.online/api-docs"
echo "=========================================="
```

---

## 📁 推荐的目录结构

```
AITY_VIP/
├── backend/                    # 后端服务
├── aity-uni-app-v2/           # 小程序
├── ssl-certs/                 # SSL证书目录（方案B）
│   ├── aity88.online.key
│   ├── aity88.online_bundle.crt
│   └── deploy-ssl.sh
├── scripts/                   # 部署脚本
│   ├── deploy-with-ssl.sh    # Let's Encrypt一键部署（方案A）
│   ├── update-and-restart.sh # 更新并重启
│   ├── check-cert-expiry.sh  # 检查证书过期
│   └── full-deploy.sh        # 完整部署
└── docs/                      # 文档
```

---

## ✅ 使用总结

### 日常使用流程

```bash
# 开发者：更新代码并推送
git add .
git commit -m "更新功能"
git push origin feature/iteration-1

# 运维：在服务器上更新部署
ssh root@server
cd /root/aity-vip
bash scripts/full-deploy.sh
```

### 证书更新流程（方案B）

```bash
# 1. 获取新证书并替换文件
# 2. 提交到Git
git add ssl-certs/
git commit -m "更新SSL证书"
git push origin feature/iteration-1

# 3. 服务器部署
ssh root@server
cd /root/aity-vip
git pull origin feature/iteration-1
bash ssl-certs/deploy-ssl.sh
```

---

## 🎯 总结

### 两个方案对比

| 特性 | 方案A（Let's Encrypt） | 方案B（手动证书） |
|-----|---------------------|------------------|
| 成本 | 免费 | 需购买 |
| 配置难度 | 简单（一键脚本） | 简单（一键脚本） |
| 续期 | 自动（无需操作） | 手动（每年一次） |
| 适合 | 长期使用 | 已有证书 |

### 推荐选择

**如果你现在网站无法访问**：
- ✅ 使用方案A（Let's Encrypt）
- ✅ 立即执行一键部署脚本
- ✅ 几分钟内恢复访问

**如果你已有购买的证书**：
- ✅ 使用方案B（手动证书）
- ✅ 按照流程更新证书
- ✅ 每年续期一次

### 优势

两个方案都提供了：
- ✅ 一键部署脚本
- ✅ 无需手动配置
- ✅ 从Git拉取即用
- ✅ 适合非专业团队

---

**选择建议**：优先使用方案A（Let's Encrypt），省心省力，免费自动！
