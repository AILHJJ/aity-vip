# AITY VIP 项目运维部署指南

> 最后更新：2026-04-19 | 版本：v1.0

---

## 目录

1. [项目概览](#1-项目概览)
2. [服务器与基础设施](#2-服务器与基础设施)
3. [一键部署](#3-一键部署)
4. [数据库管理](#4-数据库管理)
5. [SSL 证书与 HTTPS](#5-ssl-证书与-https)
6. [微信小程序构建](#6-微信小程序构建)
7. [常见问题与故障排查](#7-常见问题与故障排查)
8. [运维检查清单](#8-运维检查清单)

---

## 1. 项目概览

**AITY VIP（投研图灵室）** 是一个金融知识学习平台的 VIP 会员系统，包含：

| 组件 | 技术栈 | 位置 |
|------|--------|------|
| 后端 API | Node.js + Express + Sequelize | `AITY_VIP/backend/` |
| 管理后台前端 | Vue 3 + Vite | `AITY_VIP/aity-admin-v2/` |
| 小程序端 | uni-app + Vue 3 | `AITY_VIP/aity-uni-app-v2/` |
| 数据库 | MySQL (Sequelize ORM) | 腾讯云服务器本地 |
| 反向代理 | Nginx + HTTPS | 腾讯云服务器 |

### Git 仓库

- **仓库**：https://github.com/AILHJJ/aity-vip.git
- **分支**：`feature/iteration-1`
- **本地 .git**：`AITY_VIP/` 根目录

---

## 2. 服务器与基础设施

### 2.1 腾讯云服务器

| 项目 | 值 |
|------|-----|
| IP | `124.221.119.134`（华东-上海，轻量应用服务器） |
| 系统 | OpenCloudOS 9.4 |
| SSH 密钥 | `AITY_VIP\aity-uni-app-v2\AITY0127.pem`（RSA 私钥） |
| 宝塔面板 | `https://124.221.119.134:8888/394c4fb6` |
| 宝塔用户 | ystgcqd3 / b2010ec5c487 |

### 2.2 服务配置

| 服务 | 详情 |
|------|------|
| PM2 进程 | `aity-backend`，端口 3001 |
| 代码目录 | `/root/aity-vip/backend` |
| 日志目录 | `/root/aity-vip/logs` |
| 备份目录 | `/root/aity-vip-backups` |
| Nginx 配置 | `/www/server/panel/vhost/nginx/aity88.online.conf` |
| SSL 证书 | `/etc/nginx/ssl/aity88.online/` |

### 2.3 域名与 HTTPS

| 项目 | 值 |
|------|-----|
| 域名 | `aity88.online` |
| SSL 证书 | TrustAsia DV TLS RSA CA 2025 |
| 证书有效期 | 2026-03-18 ~ **2026-06-15** ⚠️ |
| 证书文件 | `aity88.online_bundle.crt` + `aity88.online.key` |

---

## 3. 一键部署

### 3.1 快速部署

```bash
cd AITY_VIP/backend
node deploy.js
```

**执行流程**（约 18 秒）：

```
Step 1 → SSH 连接服务器
Step 2 → 本地 tar 打包（排除 node_modules/logs/.env）
Step 3 → 备份旧代码 + 上传新包
Step 4 → 远程解压 + npm install
Step 5 → 配置 .env + PM2 ecosystem
Step 6 → PM2 reload（零停机重启）
Step 7 → 健康检查验证
```

### 3.2 零停机原理

PM2 `reload` 使用 graceful restart 模式：
1. 启动新的实例
2. 新实例就绪后，向旧实例发送 `SIGINT`
3. 旧实例处理完当前请求后退出

### 3.3 回滚方案

```bash
# SSH 到服务器
ssh -i AITY0127.pem root@124.221.119.134

# 查看备份
ls -lt /root/aity-vip-backups/

# 回滚到指定备份
rm -rf /root/aity-vip
cp -r /root/aity-vip-backups/backup-XXXXXXXXXXXXXX /root/aity-vip
cd /root/aity-vip/backend
pm2 restart aity-backend
```

### 3.4 部署注意事项

| ⚠️ 注意 | 说明 |
|---------|------|
| **不要用 git clone 部署** | GitHub 在国内服务器下载速度仅 ~54KB/s，极慢 |
| **不要用 git pull 部署** | 服务器没有 .git，不是 Git 仓库 |
| **密码 hash 含 $ 符号** | 通过 MySQL 命令行更新密码时 `$` 会被 shell 解释，必须用 Node.js mysql2 直接更新 |
| **node-ssh connect 参数** | 不能同时传 `privateKeyPath` 和 `privateKey`，需手动 `fs.readFileSync` 后传 `privateKey` |

---

## 4. 数据库管理

### 4.1 数据库架构

| 环境 | 库名 | 用途 | .env 配置 |
|------|------|------|-----------|
| 生产 | `投研图灵室` | 线上真实数据 | `DB_ENV=production` |
| 测试 | `投研图灵室_test` | 开发调试用 | `DB_ENV=test` |

### 4.2 测试数据库——是否有必要？

**结论：有必要创建，但不需要自动同步。**

| 维度 | 分析 |
|------|------|
| **必要性** | ✅ 开发新功能、调试 SQL、测试迁移时必须用独立库，避免污染生产数据 |
| **自动同步** | ❌ 不需要。测试库只需结构一致，数据可以不同步。生产数据频繁变动，自动同步反而可能覆盖测试场景 |
| **推荐做法** | 手动同步：重大结构变更后，重新从生产库 `CREATE TABLE ... LIKE` + 可选导入部分数据 |

#### 创建测试数据库

```bash
# 在服务器上执行
mysql -u root -p < /root/aity-vip/backend/create-test-db.sql
```

或通过宝塔面板 → phpMyAdmin 执行 `create-test-db.sql`。

#### 手动同步生产库结构到测试库

```sql
-- 只同步表结构（清空测试数据）
CREATE TABLE `投研图灵室_test`.`新表名` LIKE `投研图灵室`.`原表名`;

-- 同步部分参考数据
INSERT INTO `投研图灵室_test`.`users` SELECT * FROM `投研图灵室`.`users` LIMIT 10;
```

### 4.3 数据库用户账号

| 用户 | 权限 | 说明 |
|------|------|------|
| `投研图灵室` | 读写生产库+测试库 | 应用连接 + 远程管理 |
| `root` | 全部权限 | 仅通过宝塔面板/SSH 使用 |

### 4.4 常用数据库操作

```bash
# SSH 到服务器
ssh -i AITY0127.pem root@124.221.119.134

# 查看所有用户
mysql -u 投研图灵室 -pfl10b312 -h localhost "投研图灵室" -e "SELECT id,name,email,role,status FROM users;"

# 重置用户密码（必须用 Node.js 避免 $ 被 shell 解释）
cd /root/aity-vip/backend && node -e "
const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');
(async () => {
  const hash = await bcrypt.hash('123456', 10);
  const conn = await mysql.createConnection({host:'localhost',user:'投研图灵室',password:'fl10b312',database:'投研图灵室'});
  await conn.execute('UPDATE users SET password = ? WHERE id = ?', [hash, 1]);
  console.log('密码已重置');
  await conn.end();
})();
"

# 导出生产库备份
mysqldump -u 投研图灵室 -pfl10b312 -h localhost "投研图灵室" > /root/aity-vip-backups/db-$(date +%Y%m%d).sql
```

---

## 5. SSL 证书与 HTTPS

### 5.1 当前状态

| 项目 | 值 |
|------|-----|
| 颁发机构 | TrustAsia（腾讯云免费证书） |
| 有效期 | 2026-03-18 ~ **2026-06-15** |
| 剩余天数 | ~57 天 |
| 证书类型 | DV 单域名免费证书 |
| 自动续期 | ❌ 未配置 |

### 5.2 SSL 证书自动续期方案

**推荐方案：安装 acme.sh + DNS API 自动续期**

#### 方案对比

| 方案 | 优点 | 缺点 | 推荐度 |
|------|------|------|--------|
| **acme.sh + DNS API** | 全自动续期+部署，Let's Encrypt 免费90天，到期前30天自动续 | 需要配置 DNS API Key | ⭐⭐⭐⭐⭐ |
| 宝塔面板手动续期 | 操作简单 | 需手动，容易忘 | ⭐⭐⭐ |
| 腾讯云免费证书续期 | 免费， TrustAsia 品牌 | 每次需手动申请+部署 | ⭐⭐ |

#### 安装 acme.sh 自动续期（推荐在到期前1个月执行）

```bash
# 1. SSH 到服务器
ssh -i AITY0127.pem root@124.221.119.134

# 2. 安装 acme.sh
curl https://get.acme.sh | sh -s email=admin@aity88.online
source ~/.bashrc

# 3. 配置腾讯云 DNS API（需先获取 SecretId/SecretKey）
# 腾讯云控制台 → 访问管理 → API密钥管理
export Tencent_SecretId="你的SecretId"
export Tencent_SecretKey="你的SecretKey"

# 4. 申请证书（DNS 验证方式）
~/.acme.sh/acme.sh --issue --dns dns_tencent -d aity88.online

# 5. 安装证书到 Nginx
~/.acme.sh/acme.sh --install-cert -d aity88.online \
  --key-file       /etc/nginx/ssl/aity88.online/aity88.online.key \
  --fullchain-file /etc/nginx/ssl/aity88.online/aity88.online_bundle.crt \
  --reloadcmd      "systemctl reload nginx"

# 6. 验证自动续期 cron
crontab -l | grep acme
```

安装完成后，acme.sh 会自动添加 cron 任务，在证书到期前30天自动续期并部署。

> ⏰ **提醒**：当前证书 2026-06-15 到期，建议在 **5月中旬** 前完成 acme.sh 配置。

### 5.3 Nginx HTTPS 配置

当前配置文件：`/www/server/panel/vhost/nginx/aity88.online.conf`

```nginx
server {
    listen 443 ssl;
    http2 on;
    server_name aity88.online;

    ssl_certificate /etc/nginx/ssl/aity88.online/aity88.online_bundle.crt;
    ssl_certificate_key /etc/nginx/ssl/aity88.online/aity88.online.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # API 反向代理
    location /api/ {
        proxy_pass http://127.0.0.1:3001/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

server {
    listen 80;
    server_name aity88.online;
    return 301 https://$host$request_uri;
}
```

---

## 6. 微信小程序构建

### 6.1 关键限制

> ⚠️ **禁止在代码中使用 `import.meta`**
> 
> Vite 编译小程序时会为 `import.meta` 生成 `require("url")` polyfill，
> 微信小程序运行时不支持 Node.js 模块，导致崩溃：`module 'utils/url.js' is not defined`

**正确方案**：使用 Vite `define` 编译时常量

```javascript
// vite.config.js
define: {
  __APP_API_BASE_URL__: JSON.stringify(process.env.VITE_API_BASE_URL || '')
}

// src/utils/config.js
const envApiBaseUrl = typeof __APP_API_BASE_URL__ !== 'undefined' 
  ? __APP_API_BASE_URL__ 
  : undefined
```

### 6.2 构建命令

| 版本 | 命令 | API 地址 |
|------|------|----------|
| 云端版（生产） | `npm run build:mp-weixin:cloud` | `https://aity88.online/api` |
| 本地版（开发） | `npm run build:mp-weixin:local` | `http://localhost:3001/api` |

### 6.3 上传流程

1. 在 `aity-uni-app-v2/` 目录执行构建
2. 打开微信开发者工具，导入 `dist/build/mp-weixin` 目录
3. 预览测试 → 上传提交审核

### 6.4 小程序登录账号

| 用户名 | 密码 | 角色 |
|--------|------|------|
| admin | 123456 | super_admin |
| 其他用户 | 123456（初始密码） | vip_short/vip_mid/trial |

> 登录后系统会提示修改初始密码。

---

## 7. 常见问题与故障排查

### 7.1 登录 401 — 用户名或密码错误

**根因**：数据库中的 bcrypt hash 与输入密码不匹配。

常见场景：
- 数据库密码通过 MySQL 命令行设置时，`$` 符号被 shell 解释导致 hash 损坏
- 手动导入了旧的数据导致密码 hash 被覆盖

**修复方法**（必须用 Node.js 直接操作）：

```bash
cd /root/aity-vip/backend && node -e "
const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');
(async () => {
  const hash = await bcrypt.hash('新密码', 10);
  const conn = await mysql.createConnection({
    host: 'localhost', user: '投研图灵室', 
    password: 'fl10b312', database: '投研图灵室'
  });
  await conn.execute('UPDATE users SET password = ? WHERE name = ?', [hash, '用户名']);
  console.log('密码已重置');
  await conn.end();
})();
"
```

### 7.2 小程序 require("url") 崩溃

**症状**：小程序打开后控制台报 `module 'utils/url.js' is not defined`

**原因**：代码中使用了 `import.meta.env`，Vite 编译时生成 `require("url")` polyfill

**解决**：参考 [6.1 关键限制](#61-关键限制)，改用 Vite `define` 编译时常量

### 7.3 数据库字段缺失错误

**症状**：PM2 日志中出现 `Unknown column 'xxx' in 'field list'`

**原因**：Sequelize Model 定义了字段，但数据库表中缺少对应列

**解决**：

```bash
# 查看表结构
mysql -u 投研图灵室 -pfl10b312 -h localhost "投研图灵室" -e "DESCRIBE 表名;"

# 添加缺失字段
mysql -u 投研图灵室 -pfl10b312 -h localhost "投研图灵室" -e "
  ALTER TABLE 表名 ADD COLUMN 字段名 DATETIME DEFAULT CURRENT_TIMESTAMP;
"
```

### 7.4 PM2 服务异常

```bash
# 查看进程状态
pm2 list

# 查看实时日志
pm2 logs aity-backend

# 重启服务
pm2 restart aity-backend

# 完整重启（清除缓存）
pm2 delete aity-backend
cd /root/aity-vip/backend && pm2 start ecosystem.config.js
pm2 save
```

### 7.5 Nginx 502 Bad Gateway

**原因**：后端 PM2 进程未运行或端口 3001 未监听

```bash
# 检查后端是否运行
pm2 list

# 检查端口是否监听
ss -tlnp | grep 3001

# 检查 Nginx 错误日志
tail -20 /www/wwwlogs/aity88.online_ssl_error.log
```

---

## 8. 运维检查清单

### 日常检查（每次迭代后）

- [ ] `node deploy.js` 部署成功
- [ ] `https://aity88.online/api/health` 返回 `{"status":"ok"}`
- [ ] 小程序登录功能正常
- [ ] PM2 无异常重启

### 月度检查

- [ ] SSL 证书有效期（6月15日前需续期！）
- [ ] 服务器磁盘空间 `df -h`
- [ ] 数据库备份 `ls /root/aity-vip-backups/`
- [ ] PM2 日志大小 `du -sh /root/aity-vip/logs/`

### 首次部署检查清单（已完成 ✅）

- [x] SSH 密钥配置
- [x] 宝塔面板初始化
- [x] Nginx HTTPS 443 配置
- [x] SSL 证书部署
- [x] PM2 后端服务启动
- [x] 一键部署脚本 `deploy.js` 验证
- [x] 数据库字段补全（user_message_reads）
- [x] 用户密码修复

---

## 附录 A：环境变量对照表

| 变量 | 生产环境值 | 开发环境值 |
|------|-----------|-----------|
| NODE_ENV | production | development |
| DB_HOST | localhost | 124.221.119.134 |
| DB_ENV | production | production（测试库未创建时） |
| JWT_SECRET | `4a1e8c...6af492b` | `dev-secret-key-change-in-production` |
| ALLOWED_ORIGINS | `https://aity88.online,...` | `http://localhost:5173,...` |

## 附录 B：端口映射

| 端口 | 服务 | 说明 |
|------|------|------|
| 80 | Nginx | HTTP → 301 跳转 HTTPS |
| 443 | Nginx | HTTPS，反向代理到 3001 |
| 3001 | PM2 (Node.js) | 后端 API |
| 8080 | 宝塔面板（HTTP） | 仅服务器本地 |
| 8888 | 宝塔面板（HTTPS） | 管理入口 |

## 附录 C：文件路径速查

| 用途 | 本地路径 | 服务器路径 |
|------|---------|-----------|
| 后端代码 | `AITY_VIP/backend/` | `/root/aity-vip/backend/` |
| 一键部署 | `AITY_VIP/backend/deploy.js` | — |
| SSH 密钥 | `AITY_VIP/aity-uni-app-v2/AITY0127.pem` | — |
| SSL 证书 | `AITY_VIP/aity88.online_nginx/` | `/etc/nginx/ssl/aity88.online/` |
| 测试库SQL | `AITY_VIP/backend/create-test-db.sql` | — |
| Nginx 配置 | — | `/www/server/panel/vhost/nginx/aity88.online.conf` |
| PM2 配置 | — | `/root/aity-vip/backend/ecosystem.config.js` |
