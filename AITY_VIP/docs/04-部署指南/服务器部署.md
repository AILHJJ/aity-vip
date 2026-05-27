# 服务器部署指南

> **文档版本**: v1.0.0
> **更新日期**: 2026-03-05
> **适用人群**: 运维人员、开发者

---

## 目录

- [服务器信息](#服务器信息)
- [部署前准备](#部署前准备)
- [方式一：自动化部署（推荐）](#方式一自动化部署推荐)
- [方式二：手动部署](#方式二手动部署)
- [Nginx 配置](#nginx-配置)
- [SSL 证书配置](#ssl-证书配置)
- [防火墙配置](#防火墙配置)
- [服务监控](#服务监控)
- [常见问题](#常见问题)
- [维护命令](#维护命令)

---

## 服务器信息

### 生产环境配置

| 配置项 | 值 | 说明 |
|--------|-----|------|
| **服务器** | 腾讯云 CVM | 云服务器 |
| **域名** | `aity88.online` | 生产域名 |
| **HTTPS 端口** | `8443` | 自定义 HTTPS 端口 |
| **API 地址** | `https://aity88.online:8443/api` | API 接口地址 |
| **SSH 端口** | `22` | SSH 连接端口 |
| **项目路径** | `/var/www/aity-vip` | 项目部署路径 |

### 数据库配置

| 配置项 | 值 | 说明 |
|--------|-----|------|
| **数据库主机** | `124.221.119.134` | 数据库服务器 IP |
| **数据库名称** | `投研图灵室` | 生产数据库名 |
| **数据库用户** | `fl` | 数据库用户名 |
| **数据库密码** | `fl10b312` | 数据库密码 |
| **数据库端口** | `3306` | MySQL 默认端口 |

### 微信小程序信息

| 配置项 | 值 | 说明 |
|--------|-----|------|
| **AppID** | `wxb16a33cdd58f05d3` | 微信小程序 ID |
| **小程序名称** | AITY VIP | 小程序名称 |
| **类别** | 工具 - 信息查询 | 小程序类别 |

---

## 部署前准备

### 1. 连接服务器

```bash
ssh root@aity88.online
# 或使用 IP 地址
ssh root@124.221.119.134
```

### 2. 检查系统环境

```bash
# 检查系统版本
cat /etc/os-release

# 检查已安装软件
node -v
npm -v
mysql --version
nginx -v
pm2 -v
```

---

## 方式一：自动化部署（推荐）

### 步骤 1: 上传代码到服务器

在本地执行：

```bash
# 压缩后端代码
cd D:\your-mcp-proxy\AITY_VIP
tar -czf backend.tar.gz backend/

# 上传到服务器
scp backend.tar.gz root@aity88.online:/tmp/
```

### 步骤 2: 连接服务器并解压

```bash
ssh root@aity88.online

cd /tmp
tar -xzf backend.tar.gz
mkdir -p /var/www/aity-vip
mv backend /var/www/aity-vip/
```

### 步骤 3: 运行部署脚本

如果有自动化部署脚本：

```bash
chmod +x /tmp/deploy-server.sh
/tmp/deploy-server.sh
```

脚本会自动完成：
- 安装 Node.js, MySQL, PM2, Nginx
- 配置数据库
- 创建环境配置文件
- 安装依赖
- 启动服务
- 配置 Nginx 和防火墙

---

## 方式二：手动部署

### 步骤 1: 安装 Node.js

```bash
# 安装 Node.js 18 LTS
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt-get install -y nodejs

# 验证安装
node -v
npm -v
```

### 步骤 2: 安装 MySQL

```bash
# 安装 MySQL 8.0
apt-get update
apt-get install -y mysql-server

# 启动 MySQL
systemctl start mysql
systemctl enable mysql

# 安全配置
mysql_secure_installation
```

### 步骤 3: 配置数据库

```bash
# 登录 MySQL
mysql -u root -p

# 执行以下 SQL 命令
```

```sql
-- 创建数据库
CREATE DATABASE IF NOT EXISTS `投研图灵室` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 创建用户（如果不存在）
CREATE USER IF NOT EXISTS 'fl'@'localhost' IDENTIFIED BY 'fl10b312';

-- 授权
GRANT ALL PRIVILEGES ON `投研图灵室`.* TO 'fl'@'localhost';
FLUSH PRIVILEGES;

-- 退出
EXIT;
```

### 步骤 4: 安装 PM2

```bash
npm install -g pm2

# 验证安装
pm2 -v
```

### 步骤 5: 部署后端代码

#### 创建项目目录

```bash
mkdir -p /var/www/aity-vip/backend
cd /var/www/aity-vip
```

#### 上传代码

**方法 1: 使用 SCP 上传（推荐）**

在本地执行：
```bash
cd D:\your-mcp-proxy\AITY_VIP

# 压缩后端代码
tar -czf backend.tar.gz backend/

# 上传到服务器
scp backend.tar.gz root@aity88.online:/var/www/aity-vip/
```

在服务器执行：
```bash
cd /var/www/aity-vip
tar -xzf backend.tar.gz
```

**方法 2: 使用 Git（如果代码在 Git 仓库）**

```bash
cd /var/www/aity-vip
git clone your_repository_url backend
```

### 步骤 6: 创建生产环境配置文件

```bash
cd /var/www/aity-vip/backend
nano .env.production
```

**输入以下内容**：

```env
# 数据库配置
DB_HOST=124.221.119.134
DB_PORT=3306
DB_USER=fl
DB_PASSWORD=fl10b312
DB_NAME=投研图灵室

# JWT 配置
JWT_SECRET=4a1e8c5530aec9beab0d6af47176be105af27e3dc7f4962dab7220b446af492b
JWT_EXPIRES_IN=24h

# 服务器配置
PORT=3000
NODE_ENV=production

# CORS 配置
FRONTEND_URL=https://aity88.online

# 日志配置
LOG_LEVEL=info
LOG_FILE=/var/log/aity-vip/backend.log
```

**保存并退出**：按 `Ctrl + X`，然后按 `Y`，最后按 `Enter`

**设置文件权限**：

```bash
chmod 600 .env.production
```

### 步骤 7: 安装依赖

```bash
cd /var/www/aity-vip/backend
npm install --production
```

这一步可能需要 5-10 分钟，请耐心等待。

### 步骤 8: 初始化数据库

```bash
cd /var/www/aity-vip/backend
NODE_ENV=production node scripts/init-db.js
```

**如果看到成功信息**：✅ 数据库初始化完成

### 步骤 9: 创建日志目录

```bash
mkdir -p /var/log/aity-vip
chmod 755 /var/log/aity-vip
```

### 步骤 10: 启动后端服务

```bash
cd /var/www/aity-vip/backend

# 停止旧服务（如果存在）
pm2 delete aity-backend 2>/dev/null || true

# 启动新服务
pm2 start src/index.js --name aity-backend --env production

# 查看状态
pm2 status

# 查看日志
pm2 logs aity-backend --lines 20
```

**检查服务是否正常**：

```bash
# 测试健康检查接口
curl http://localhost:3000/api/health
```

**应该返回**：
```json
{"status":"ok","timestamp":"..."}
```

**如果返回正常**：✅ 后端服务启动成功！

### 步骤 11: 配置 PM2 开机自启

```bash
pm2 startup
pm2 save
```

---

## Nginx 配置

### 步骤 1: 安装 Nginx

```bash
apt-get install -y nginx
systemctl start nginx
systemctl enable nginx
```

### 步骤 2: 创建 Nginx 配置

```bash
nano /etc/nginx/sites-available/aity-vip
```

**复制以下内容**：

```nginx
# HTTP 重定向到 HTTPS
server {
    listen 80;
    server_name aity88.online;
    return 301 https://$server_name:8443$request_uri;
}

# HTTPS 配置
server {
    listen 8443 ssl http2;
    server_name aity88.online;

    # SSL 证书配置
    ssl_certificate /etc/nginx/ssl/aity88.online.crt;
    ssl_certificate_key /etc/nginx/ssl/aity88.online.key;

    # SSL 安全配置
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # 安全头
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # 前端静态文件（H5版本）
    location / {
        root /root/aity-vip/aity-uni-app-v2/dist/build/h5;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    # API 代理
    location /api/ {
        proxy_pass http://localhost:3000/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;

        # 超时配置
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # 图片上传目录
    location /uploads/ {
        alias /root/aity-vip/backend/uploads/;
        expires 30d;
        access_log off;
        add_header Cache-Control "public, immutable";
    }

    # 健康检查
    location /health {
        proxy_pass http://localhost:3000/api/health;
        access_log off;
    }

    # 日志
    access_log /var/log/nginx/aity-vip-access.log;
    error_log /var/log/nginx/aity-vip-error.log;
}
```

**保存并退出**

### 步骤 3: 启用配置

```bash
# 创建软链接
ln -sf /etc/nginx/sites-available/aity-vip /etc/nginx/sites-enabled/

# 删除默认配置（如果存在）
rm -f /etc/nginx/sites-enabled/default

# 测试配置
nginx -t
```

**如果显示 "test is successful"**：✅ 配置正确

### 步骤 4: 重启 Nginx

```bash
systemctl restart nginx
systemctl status nginx
```

---

## SSL 证书配置

### 选项 A: 使用现有证书

如果你已有 SSL 证书：

```bash
# 创建 SSL 目录
mkdir -p /etc/nginx/ssl

# 上传证书文件（在本地执行）
scp your_cert_path/aity88.online.crt root@aity88.online:/etc/nginx/ssl/
scp your_cert_path/aity88.online.key root@aity88.online:/etc/nginx/ssl/

# 在服务器上设置权限
chmod 600 /etc/nginx/ssl/aity88.online.key
```

### 选项 B: 使用 Let's Encrypt 免费证书

```bash
# 安装 Certbot
apt-get install -y certbot python3-certbot-nginx

# 申请证书
certbot --nginx -d aity88.online

# 自动续期
certbot renew --dry-run
```

---

## 防火墙配置

```bash
# 检查防火墙状态
ufw status

# 如果防火墙未启用，执行以下命令
ufw allow 22/tcp    # SSH
ufw allow 80/tcp    # HTTP
ufw allow 443/tcp   # HTTPS
ufw allow 8443/tcp  # 自定义 HTTPS 端口
ufw --force enable

# 查看状态
ufw status
```

---

## 服务监控

### PM2 监控

```bash
# 查看服务状态
pm2 status

# 查看日志
pm2 logs aity-backend

# 查看详细信息
pm2 show aity-backend

# 监控面板
pm2 monit
```

### Nginx 监控

```bash
# 测试配置
nginx -t

# 重启 Nginx
systemctl restart nginx

# 重新加载配置
systemctl reload nginx

# 查看状态
systemctl status nginx

# 查看日志
tail -f /var/log/nginx/aity-vip-access.log
tail -f /var/log/nginx/aity-vip-error.log
```

### 数据库监控

```bash
# 登录 MySQL
mysql -u fl -p 投研图灵室

# 查看连接数
SHOW PROCESSLIST;

# 查看数据库状态
SHOW STATUS;
```

---

## 常见问题

### 1. npm install 失败

**解决方案**：
```bash
# 清除缓存
npm cache clean --force

# 重新安装
npm install --production
```

### 2. 数据库连接失败

**解决方案**：
```bash
# 测试数据库连接
mysql -u fl -pfl10b312 -h 124.221.119.134 -e "SELECT 1;"

# 检查 .env.production 文件
cat /var/www/aity-vip/backend/.env.production
```

### 3. PM2 启动失败

**解决方案**：
```bash
# 查看详细日志
pm2 logs aity-backend --err --lines 50

# 尝试直接运行
cd /var/www/aity-vip/backend
NODE_ENV=production node src/index.js
```

### 4. Nginx 配置测试失败

**解决方案**：
```bash
# 查看详细错误
nginx -t

# 检查证书文件
ls -la /etc/nginx/ssl/

# 查看 Nginx 错误日志
tail -f /var/log/nginx/error.log
```

### 5. 防火墙阻止访问

**解决方案**：
```bash
# 临时关闭防火墙测试
ufw disable

# 测试 API
curl https://aity88.online:8443/api/health

# 如果可以访问，说明是防火墙问题，重新配置
ufw allow 8443/tcp
ufw enable
```

---

## 维护命令

### 更新后端

```bash
cd /var/www/aity-vip/backend
git pull
npm install --production
pm2 restart aity-backend
```

### 更新前端

```bash
cd /var/www/aity-vip/aity-uni-app-v2
git pull
npm install
npm run build:h5
# 无需其他操作，Nginx 直接指向构建目录
```

### 一键更新脚本

创建 `/var/www/aity-vip/update.sh`：

```bash
#!/bin/bash

cd /var/www/aity-vip
git pull

cd /var/www/aity-vip/backend
npm install --production
pm2 restart aity-backend

cd /var/www/aity-vip/aity-uni-app-v2
npm install
npm run build:h5

echo "更新完成！"
echo "H5: https://aity88.online"
echo "API: https://aity88.online/api/health"
```

使用：

```bash
chmod +x /var/www/aity-vip/update.sh
/var/www/aity-vip/update.sh
```

### 数据库备份

```bash
# 创建备份脚本
nano /usr/local/bin/backup-db.sh
```

**备份脚本内容**：

```bash
#!/bin/bash
BACKUP_DIR="/var/backups/mysql"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR

mysqldump -u fl -p'fl10b312' 投研图灵室 > $BACKUP_DIR/aity_vip_$DATE.sql
gzip $BACKUP_DIR/aity_vip_$DATE.sql

# 保留最近 7 天的备份
find $BACKUP_DIR -name "*.sql.gz" -mtime +7 -delete
```

```bash
# 设置执行权限
chmod +x /usr/local/bin/backup-db.sh

# 添加到 crontab（每天凌晨 2 点备份）
crontab -e
# 添加：0 2 * * * /usr/local/bin/backup-db.sh
```

---

## 部署完成检查清单

- [ ] Node.js 已安装
- [ ] MySQL 已安装并可连接
- [ ] PM2 已安装
- [ ] Nginx 已安装
- [ ] 后端代码已上传
- [ ] 数据库已配置
- [ ] 环境配置文件已创建
- [ ] 依赖已安装
- [ ] 数据库表结构已初始化
- [ ] 后端服务已启动
- [ ] PM2 开机自启已配置
- [ ] SSL 证书已配置
- [ ] Nginx 配置已创建
- [ ] 防火墙已配置
- [ ] API 接口测试通过

---

## 访问地址

| 服务 | 地址 | 说明 |
|------|------|------|
| **H5 前端** | https://aity88.online | H5 应用 |
| **API 接口** | https://aity88.online/api | API 接口 |
| **健康检查** | https://aity88.online/api/health | 健康检查接口 |
| **图片上传** | https://aity88.online/uploads/ | 图片资源目录 |

---

**文档维护**: AITY VIP Team
**最后更新**: 2026-03-05
