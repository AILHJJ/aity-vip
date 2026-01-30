# 部署与运维指南

> **文档版本**：v1.0.0
> **创建日期**：2026-01-29
> **最后更新**：2026-01-29
> **文档类型**：服务器和部署信息汇总
> **集成目标**：与字节跳动 Trae 编辑器无缝集成，支持 Skill 功能

---

## 🌐 服务器基本信息

### 腾讯云服务器

| 配置项 | 值 |
|--------|-----|
| 服务器IP | 124.221.119.134 |
| 服务器用户 | root |
| 域名 | aity88.online |
| HTTPS端口 | 8443 |
| HTTP端口 | 8080 |
| SSH端口 | 22 |

### 部署目录

| 服务 | 部署目录 |
|------|---------|
| 前端 | /var/www/aity-vip/frontend |
| 后端 | /var/www/aity-vip/backend |
| Nginx配置 | /etc/nginx |
| 日志目录 | /root/private-sharing-app/logs |

---

## 💾 数据库信息

### MySQL数据库

| 配置项 | 值 |
|--------|-----|
| 数据库地址 | 124.221.119.134:3306 |
| 数据库名（开发） | 投研图灵室 |
| 数据库名（测试） | 投研图灵室_test |
| 数据库用户 | root |
| 数据库密码 | （见.env文件） |

### 数据库连接字符串

**开发环境：**
```
mysql://root:password@localhost:3306/投研图灵室
```

**生产环境：**
```
mysql://root:password@124.221.119.134:3306/投研图灵室_test
```

---

## 🔧 环境配置

### 后端环境变量

**开发环境（.env.development）：**
```env
NODE_ENV=development
HOST=0.0.0.0
PORT=3001

DB_HOST=localhost
DB_PORT=3306
DB_NAME=投研图灵室
DB_USER=fl
DB_PASSWORD=fl10b312

JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRES_IN=24h

CORS_ORIGINS=http://localhost:5173,http://localhost:3000

UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760

HTTPS_ENABLED=false
SSL_CERT_PATH=
SSL_KEY_PATH=
```

**生产环境（.env.production）：**
```env
NODE_ENV=production
HOST=0.0.0.0
PORT=3001

DB_HOST=124.221.119.134
DB_PORT=3306
DB_NAME=投研图灵室_test
DB_USER=fl
DB_PASSWORD=fl10b312

JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRES_IN=24h

CORS_ORIGINS=https://aity88.online:8443

UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760

HTTPS_ENABLED=true
SSL_CERT_PATH=/etc/nginx/ssl/aity88.online.crt
SSL_KEY_PATH=/etc/nginx/ssl/aity88.online.key
```

### 前端环境变量

**开发环境（.env.development）：**
```env
VITE_API_BASE_URL=http://localhost:3001/api
```

**生产环境（.env.production）：**
```env
VITE_API_BASE_URL=https://aity88.online:8443/api
```

---

## 🚀 PM2配置

### ecosystem.config.js

```javascript
module.exports = {
  apps: [
    {
      name: 'private-sharing-app-backend',
      script: './src/index.js',
      cwd: '/root/private-sharing-app/backend',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'development',
        HOST: '0.0.0.0',
        PORT: 3001
      },
      env_production: {
        NODE_ENV: 'production',
        HOST: '0.0.0.0',
        PORT: 3001
      },
      error_file: '/root/private-sharing-app/logs/pm2-error.log',
      out_file: '/root/private-sharing-app/logs/pm2-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      min_uptime: '10s',
      max_restarts: 10,
      restart_delay: 4000
    }
  ]
};
```

### PM2常用命令

```bash
# 启动服务
pm2 start ecosystem.config.js

# 停止服务
pm2 stop private-sharing-app-backend

# 重启服务
pm2 restart private-sharing-app-backend

# 查看服务状态
pm2 status

# 查看日志
pm2 logs private-sharing-app-backend

# 查看监控
pm2 monit

# 删除服务
pm2 delete private-sharing-app-backend
```

---

## 🌐 Nginx配置

### HTTPS配置

```nginx
server {
  listen 8080;
  server_name aity88.online;
  
  return 301 https://$server_name:8443$request_uri;
}

server {
  listen 8443 ssl http2;
  server_name aity88.online;
  
  # SSL证书配置
  ssl_certificate /etc/nginx/ssl/aity88.online.crt;
  ssl_certificate_key /etc/nginx/ssl/aity88.online.key;
  
  # SSL协议配置
  ssl_protocols TLSv1.2 TLSv1.3;
  ssl_ciphers 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384';
  ssl_prefer_server_ciphers off;
  
  # HSTS配置
  add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
  
  # CSP配置
  add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:;" always;
  
  # 其他安全头部
  add_header X-Frame-Options "DENY" always;
  add_header X-Content-Type-Options "nosniff" always;
  add_header X-XSS-Protection "1; mode=block" always;
  
  # 缓存配置
  location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
    expires 1y;
    add_header Cache-Control "public, max-age=31536000, immutable";
  }
  
  # 反向代理配置
  location / {
    proxy_pass http://localhost:5173;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
  
  location /api {
    proxy_pass http://localhost:3001;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}
```

### Nginx常用命令

```bash
# 测试配置文件
nginx -t

# 重启Nginx
systemctl restart nginx

# 重新加载配置
systemctl reload nginx

# 查看状态
systemctl status nginx

# 查看错误日志
tail -f /var/log/nginx/error.log

# 查看访问日志
tail -f /var/log/nginx/access.log
```

---

## 🔐 安全配置

### SSL证书

**证书位置：**
- 证书文件：/etc/nginx/ssl/aity88.online.crt
- 私钥文件：/etc/nginx/ssl/aity88.online.key

**证书更新：**
```bash
# 备份旧证书
cp /etc/nginx/ssl/aity88.online.crt /etc/nginx/ssl/aity88.online.crt.bak
cp /etc/nginx/ssl/aity88.online.key /etc/nginx/ssl/aity88.online.key.bak

# 上传新证书
scp new.crt root@124.221.119.134:/etc/nginx/ssl/aity88.online.crt
scp new.key root@124.221.119.134:/etc/nginx/ssl/aity88.online.key

# 重新加载Nginx
ssh root@124.221.119.134 "nginx -t && systemctl reload nginx"
```

### 防火墙配置

```bash
# 检查防火墙状态
ufw status

# 开放端口
ufw allow 22/tcp
ufw allow 8080/tcp
ufw allow 8443/tcp
ufw allow 3001/tcp
ufw allow 5173/tcp

# 启用防火墙
ufw enable
```

---

## 📊 监控和日志

### 日志位置

| 日志类型 | 路径 |
|---------|------|
| PM2错误日志 | /root/private-sharing-app/logs/pm2-error.log |
| PM2输出日志 | /root/private-sharing-app/logs/pm2-out.log |
| Nginx错误日志 | /var/log/nginx/error.log |
| Nginx访问日志 | /var/log/nginx/access.log |

### 监控命令

```bash
# 查看PM2日志
pm2 logs private-sharing-app-backend

# 查看Nginx日志
tail -f /var/log/nginx/error.log
tail -f /var/log/nginx/access.log

# 查看系统资源使用
htop

# 查看磁盘使用
df -h

# 查看内存使用
free -m
```

---

## 🔄 部署流程

### 本地部署

1. **启动后端服务**
```bash
cd backend
npm install
npm run dev
```

2. **启动前端服务**
```bash
cd aity-uni-app-new
npm install
npm run dev
```

3. **访问地址**
- 前端：http://localhost:5173
- 后端API：http://localhost:3001/api

### 服务器部署

1. **构建前端**
```bash
cd aity-uni-app-new
# 构建H5版本
npm run build:h5
# 构建小程序版本（以微信小程序为例）
npm run build:mp-weixin
```

2. **部署到服务器**
```bash
# 使用部署脚本
cd scripts
bash deploy.sh
```

3. **重启后端服务**
```bash
ssh root@124.221.119.134 "cd /var/www/aity-vip/backend && pm2 restart private-sharing-app-backend"
```

4. **重启Nginx**
```bash
ssh root@124.221.119.134 "nginx -t && systemctl reload nginx"
```

### 小程序部署

1. **构建小程序代码**
```bash
# 构建微信小程序
npm run build:mp-weixin
# 构建支付宝小程序
npm run build:mp-alipay
# 构建百度小程序
npm run build:mp-baidu
# 构建字节跳动小程序
npm run build:mp-toutiao
```

2. **上传到小程序平台**
- **微信小程序**：使用微信开发者工具导入 `dist/build/mp-weixin` 目录，然后上传代码
- **支付宝小程序**：使用支付宝开发者工具导入 `dist/build/mp-alipay` 目录，然后上传代码
- **百度小程序**：使用百度开发者工具导入 `dist/build/mp-baidu` 目录，然后上传代码
- **字节跳动小程序**：使用字节跳动开发者工具导入 `dist/build/mp-toutiao` 目录，然后上传代码

---

## ⚠️ 常见问题

### 1. 端口被占用

**检查端口占用：**
```bash
lsof -i :3001
lsof -i :5173
lsof -i :8443
lsof -i :8080
```

**释放端口：**
```bash
kill -9 <PID>
```

### 2. 数据库连接失败

**检查数据库服务：**
```bash
systemctl status mysql
```

**测试数据库连接：**
```bash
mysql -h 124.221.119.134 -u root -p
```

### 3. Nginx配置错误

**测试配置文件：**
```bash
nginx -t
```

**查看错误日志：**
```bash
tail -f /var/log/nginx/error.log
```

### 4. SSL证书过期

**检查证书有效期：**
```bash
openssl x509 -in /etc/nginx/ssl/aity88.online.crt -noout -dates
```

**更新证书：**
参考"SSL证书"部分

---

## 📋 部署检查清单

在部署前，请确认：

- [ ] 确认服务器IP和端口
- [ ] 确认数据库连接信息
- [ ] 确认环境变量配置
- [ ] 确认PM2配置
- [ ] 确认Nginx配置
- [ ] 确认SSL证书有效
- [ ] 确认防火墙规则
- [ ] 测试本地服务
- [ ] 备份现有数据
- [ ] 准备回滚方案

---

**文档维护者**：开发团队
**最后更新**：2026-01-29
**适用范围**：AITY VIP 项目部署和运维
