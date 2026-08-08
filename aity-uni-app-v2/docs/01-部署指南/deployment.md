# 部署指南 - Deployment Guide

**项目**: VIP投研内部分享系统
**当前版本**: v1.5.1
**部署环境**: 生产环境
**文档更新**: 2025-02-03

---

## 目录

- [部署架构](#部署架构)
- [前置要求](#前置要求)
- [后端部署](#后端部署)
- [前端部署](#前端部署)
- [微信小程序部署](#微信小程序部署)
- [Nginx配置](#nginx配置)
- [SSL证书配置](#ssl证书配置)
- [部署检查清单](#部署检查清单)
- [故障排查](#故障排查)

---

## 部署架构

```
┌─────────────────┐
│  用户客户端      │
│  (小程序/H5)    │
└────────┬────────┘
         │ HTTPS (443)
         ▼
┌─────────────────┐
│  Nginx          │ ← SSL证书 (8443端口)
│  反向代理        │
└────────┬────────┘
         │ HTTP (内网)
         ▼
┌─────────────────┐
│  Node.js 后端   │ ← Express.js (3001端口)
│  MySQL 数据库   │
└─────────────────┘
```

### 服务器信息

- **服务器地址**: aity88.online
- **SSH端口**: 22
- **HTTPS端口**: 8443
- **项目路径**:
  - 后端: `D:\your-mcp-proxy\AITY_VIP\backend` (本地开发)
  - 前端: `D:\your-mcp-proxy\AITY_VIP\aity-uni-app-v2` (本地开发)
  - 生产部署路径: 待定

---

## 前置要求

### 服务器环境

- **操作系统**: Linux (推荐 Ubuntu 20.04+ / CentOS 7+)
- **Node.js**: >= 16.0.0
- **MySQL**: >= 5.7 或 >= 8.0
- **Nginx**: >= 1.18
- **PM2**: 全局安装（进程管理）

### 本地开发环境

- **Node.js**: >= 16.0.0
- **npm**: >= 8.0.0
- **微信开发者工具**: 最新稳定版
- **Git**: 版本控制

### 域名与SSL

- **域名**: aity88.online
- **SSL证书**: 已配置HTTPS（8443端口）
- **小程序域名白名单**: 需在微信公众平台配置

---

## 后端部署

### 1. 上传代码到服务器

```bash
# 方式一：使用Git
cd /var/www
git clone <your-backend-repo-url> backend
cd backend

# 方式二：使用SCP（本地执行）
scp -r backend/ user@aity88.online:/var/www/backend/
```

### 2. 安装依赖

```bash
cd /var/www/backend
npm install --production
```

### 3. 配置环境变量

创建 `.env` 文件：

```bash
# 服务器配置
NODE_ENV=production
PORT=3001

# 数据库配置
DB_HOST=localhost
DB_PORT=3306
DB_NAME=aity_vip
DB_USER=root
DB_PASSWORD=your_password

# JWT配置
JWT_SECRET=your_jwt_secret_key_change_this
JWT_EXPIRES_IN=7d

# 文件上传配置
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760

# CORS配置
CORS_ORIGIN=https://aity88.online:8443
```

### 4. 初始化数据库

```bash
# 创建数据库
mysql -u root -p
CREATE DATABASE aity_vip CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;

# 导入初始数据（如果有）
mysql -u root -p aity_vip < database/init.sql
```

### 5. 使用PM2启动服务

```bash
# 安装PM2
npm install -g pm2

# 启动应用
pm2 start server.js --name aity-vip-backend

# 设置开机自启
pm2 startup
pm2 save

# 查看日志
pm2 logs aity-vip-backend

# 查看状态
pm2 status
```

### 6. 验证后端服务

```bash
# 本地测试
curl http://localhost:3001/api/health

# 远程测试
curl http://aity88.online:3001/api/health
```

---

## 前端部署

### 1. 构建生产版本

```bash
cd aity-uni-app-v2

# 构建微信小程序
npm run build:mp-weixin

# 构建H5（可选）
npm run build:h5
```

### 2. 部署H5到服务器（可选）

```bash
# 本地构建完成后，上传到服务器
scp -r dist/build/h5/* user@aity88.online:/var/www/html/

# 或使用Nginx直接指向静态文件目录
```

---

## 微信小程序部署

### 1. 准备上传工具

确保项目中有 `scripts/upload-weixin.js`：

```javascript
const ci = require('miniprogram-ci')

const project = new ci.Project({
  appid: 'wxb16a33cdd58f05d3',
  type: 'miniProgram',
  projectPath: './dist/dev/mp-weixin',
  privateKeyPath: './private.wxb16a33cdd58f05d3.key',
  ignores: ['node_modules/**/*']
})

async function upload() {
  const uploadResult = await ci.upload({
    project,
    version: '1.5.1',
    desc: '正式发布版本 - UI全面优化',
    setting: {
      es6: true,
      es7: true,
      minify: true,
      codeProtect: true,
      autoPrefixWXSS: true
    },
    onProgressUpdate: (progress) => {
      console.log('上传进度:', progress)
    }
  })

  console.log('上传成功:', uploadResult)
}

upload().catch(console.error)
```

### 2. 使用npm脚本上传

```bash
# 确保已构建
npm run build:mp-weixin

# 上传到微信服务器
npm run upload:weixin
```

### 3. 微信公众平台配置

#### 3.1 登录微信公众平台

访问：https://mp.weixin.qq.com/

#### 3.2 配置服务器域名

在**开发 -> 开发管理 -> 开发设置 -> 服务器域名**中配置：

```
request合法域名：
https://aity88.online:8443

uploadFile合法域名：
https://aity88.online:8443

downloadFile合法域名：
https://aity88.online:8443
```

#### 3.3 提交审核

1. 在微信开发者工具中点击"上传"
2. 登录微信公众平台
3. 进入**版本管理**
4. 将开发版本提交审核
5. 填写审核信息：

```
版本号: 1.5.1
版本描述: 正式发布版本 - UI全面优化，建立设计系统，优化用户体验
```

---

## Nginx配置

### 配置文件示例

创建 `/etc/nginx/sites-available/aity-vip`：

```nginx
# HTTP重定向到HTTPS
server {
    listen 80;
    server_name aity88.online;
    return 301 https://$server_name:8443$request_uri;
}

# HTTPS配置
server {
    listen 8443 ssl http2;
    server_name aity88.online;

    # SSL证书配置
    ssl_certificate /etc/nginx/ssl/aity88.online.crt;
    ssl_certificate_key /etc/nginx/ssl/aity88.online.key;

    # SSL优化配置
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # 日志配置
    access_log /var/log/nginx/aity-vip-access.log;
    error_log /var/log/nginx/aity-vip-error.log;

    # H5静态文件（可选）
    location / {
        root /var/www/html;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    # API反向代理
    location /api/ {
        proxy_pass http://localhost:3001/api/;
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

    # 文件上传大小限制
    client_max_body_size 10M;
}
```

### 启用配置

```bash
# 创建软链接
sudo ln -s /etc/nginx/sites-available/aity-vip /etc/nginx/sites-enabled/

# 测试配置
sudo nginx -t

# 重启Nginx
sudo systemctl restart nginx
```

---

## SSL证书配置

### 使用Let's Encrypt免费证书

```bash
# 安装Certbot
sudo apt-get update
sudo apt-get install certbot python3-certbot-nginx

# 获取证书
sudo certbot --nginx -d aity88.online

# 自动续期
sudo certbot renew --dry-run
```

### 使用已有证书

将证书文件放置到 `/etc/nginx/ssl/` 目录：

```bash
sudo mkdir -p /etc/nginx/ssl
sudo cp your-cert.crt /etc/nginx/ssl/aity88.online.crt
sudo cp your-cert.key /etc/nginx/ssl/aity88.online.key

# 设置权限
sudo chmod 644 /etc/nginx/ssl/aity88.online.crt
sudo chmod 600 /etc/nginx/ssl/aity88.online.key
```

---

## 部署检查清单

### 前置检查

- [ ] 服务器环境已配置（Node.js, MySQL, Nginx）
- [ ] 域名已解析到服务器IP
- [ ] SSL证书已安装
- [ ] MySQL数据库已创建
- [ ] 防火墙已开放必要端口（22, 80, 443, 8443, 3001）

### 后端检查

- [ ] 后端代码已上传到服务器
- [ ] 依赖已安装（`npm install --production`）
- [ ] 环境变量已配置（`.env`文件）
- [ ] 数据库已初始化
- [ ] PM2进程已启动（`pm2 status`）
- [ ] 后端API可访问（`curl http://localhost:3001/api/health`）

### 前端检查

- [ ] 前端代码已构建生产版本
- [ ] 微信小程序已构建（`npm run build:mp-weixin`）
- [ ] 小程序上传脚本配置正确
- [ ] API地址已配置为生产环境

### 微信小程序检查

- [ ] 小程序已上传到微信服务器
- [ ] 服务器域名已在微信公众平台配置
- [ ] 域名已备案（如需要）
- [ ] 小程序基本信息已填写完整
- [ ] 隐私政策和用户协议已配置
- [ ] 小程序代码包大小符合要求（< 2MB）
- [ ] 已提交审核或已发布

### Nginx检查

- [ ] Nginx配置文件已创建
- [ ] 配置文件测试通过（`nginx -t`）
- [ ] Nginx服务已重启
- [ ] HTTPS可访问（`curl https://aity88.online:8443`）
- [ ] API反向代理正常工作
- [ ] 日志文件正常写入

### 功能测试

- [ ] 用户登录功能正常
- [ ] 消息列表正常显示
- [ ] 消息详情正常加载
- [ ] 图片上传功能正常
- [ ] 权限控制正常工作
- [ ] 不同角色用户可见内容正确
- [ ] 收藏功能正常
- [ ] 讨论功能正常

---

## 故障排查

### 1. 后端服务无法启动

```bash
# 查看PM2日志
pm2 logs aity-vip-backend

# 查看错误详情
pm2 show aity-vip-backend

# 重启服务
pm2 restart aity-vip-backend
```

**常见原因**:
- 端口被占用：`lsof -i:3001` 检查
- 数据库连接失败：检查`.env`配置
- 依赖缺失：重新`npm install`

### 2. Nginx 502错误

**原因**: 后端服务未启动或端口错误

**解决**:
```bash
# 检查后端服务
pm2 status

# 检查端口
netstat -tlnp | grep 3001

# 检查Nginx配置
sudo nginx -t
```

### 3. 微信小程序网络请求失败

**检查项**:
1. 服务器域名是否在微信公众平台配置
2. 域名是否有有效的SSL证书
3. 小程序是否勾选"不校验合法域名"（仅开发环境）
4. 手机是否能访问服务器（网络连通性）

### 4. 数据库连接失败

**解决**:
```bash
# 检查MySQL服务
sudo systemctl status mysql

# 测试连接
mysql -u root -p

# 检查数据库是否存在
SHOW DATABASES;
```

### 5. 上传图片失败

**检查项**:
1. Nginx `client_max_body_size` 配置
2. 后端 `MAX_FILE_SIZE` 配置
3. 上传目录权限
4. 磁盘空间是否充足

---

## 监控与维护

### 日志查看

```bash
# 后端日志
pm2 logs aity-vip-backend

# Nginx访问日志
sudo tail -f /var/log/nginx/aity-vip-access.log

# Nginx错误日志
sudo tail -f /var/log/nginx/aity-vip-error.log

# 系统日志
sudo journalctl -u nginx -f
```

### 性能监控

```bash
# PM2监控
pm2 monit

# 系统资源
htop

# 磁盘使用
df -h

# 内存使用
free -h
```

### 定期维护

1. **数据库备份**（每天）
   ```bash
   mysqldump -u root -p aity_vip > backup_$(date +%Y%m%d).sql
   ```

2. **日志清理**（每周）
   ```bash
   sudo truncate -s 0 /var/log/nginx/aity-vip-access.log
   sudo truncate -s 0 /var/log/nginx/aity-vip-error.log
   ```

3. **依赖更新**（每月）
   ```bash
   cd /var/www/backend
   npm update
   pm2 restart aity-vip-backend
   ```

---

## 回滚方案

### 后端回滚

```bash
# 使用Git回滚
cd /var/www/backend
git log --oneline  # 查看提交历史
git checkout <previous-commit>
npm install --production
pm2 restart aity-vip-backend
```

### 前端回滚

```bash
# 重新构建旧版本
cd aity-uni-app-v2
git checkout <previous-tag>
npm run build:mp-weixin
npm run upload:weixin
```

---

## 联系与支持

- **技术负责人**: 待定
- **部署负责人**: 待定
- **紧急联系**: 待定

---

**文档版本**: v1.0.0
**最后更新**: 2025-02-03
**适用版本**: v1.5.1
