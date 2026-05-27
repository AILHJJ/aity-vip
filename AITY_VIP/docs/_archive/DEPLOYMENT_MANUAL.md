# AITY VIP 项目部署运营手册

## 📋 项目基本信息

### 项目概述
- **项目名称**: AITY VIP - 投研内部分享系统
- **项目版本**: v1.6.2
- **最后更新**: 2026-04-12
- **文档版本**: v1.0

### 项目技术栈
- **前端**: uni-app 3.0 (Vue 3) + 微信小程序
- **后端**: Node.js + Express + MySQL
- **部署**: 腾讯云服务器 + PM2 + Nginx
- **证书**: Let's Encrypt免费SSL证书（自动续期）

---

## 🔐 Git仓库信息

### 远程仓库配置

**仓库地址**:
```
https://github.com/AILHJJ/aity-vip.git
```

**认证信息**:
- **用户名**: `AILHJJ`
- **访问令牌**: `YOUR_GITHUB_TOKEN_HERE`（请查看本地Git配置或密码管理器）

⚠️ **获取Token**:
- 登录GitHub账号
- 访问 https://github.com/settings/tokens
- 生成新的Personal Access Token
- 选择完全访问权限（repo）
- 复制token并妥善保管

⚠️ **安全提醒**:
- 这是GitHub个人访问令牌，具有完全访问权限
- 请妥善保管，不要分享给他人
- **不要将token提交到Git仓库**
- 如果token泄露，立即撤销并重新生成

### 分支策略
- **主分支**: `main` - 稳定版本，用于生产部署
- **开发分支**: `feature/iteration-1` - 当前开发分支
- **其他分支**: `feature/xxx` - 新功能开发分支

**当前工作分支**: `feature/iteration-1`

### 本地Git用户配置
项目配置了两个用户信息（可能不同提交使用）：
1. **用户1**: `fuli` / `fuli@example.com`
2. **用户2**: `lhdms88` / `lhdms88@163.com`

---

## 🚀 腾讯云服务器信息

### 服务器配置
- **域名**: `aity88.online`
- **SSH地址**: `ssh root@aity88.online`
- **SSH端口**: `22`
- **HTTPS端口**: `8443`（外网访问）
- **后端端口**: `3001`（内部）

### 服务器项目路径
- **项目目录**: `/root/aity-vip`（首次部署）或 `/root/private-sharing-app`（旧路径）
- **后端目录**: `/root/aity-vip/backend`
- **PM2进程名**: `private-sharing-app-backend`（旧）或 `aity-backend`（新）

### 数据库配置
- **数据库服务器**: `124.221.119.134:3306`
- **测试数据库**: `投研图灵室_test`
- **生产数据库**: `投研图灵室`
- **数据库用户**: `fl`
- **数据库密码**: `fl10b312`

---

## 📁 项目目录结构

### 优化后的目录结构
```
AITY_VIP/
├── backend/                  # 后端服务
│   ├── src/                 # 源代码
│   ├── package.json         # 依赖配置
│   ├── .env                 # 环境变量
│   └── ecosystem.config.js  # PM2配置
├── aity-uni-app-v2/         # 微信小程序
│   ├── src/                 # 源代码
│   ├── dist/                # 编译输出
│   ├── package.json         # 依赖配置
│   ├── AITY0127.pem        # 小程序私钥
│   └── private.wxb16a33cdd58f05d3.key  # 小程序私钥
├── docs/                    # 项目文档
│   ├── core/               # 核心文档
│   ├── config/             # 配置文档
│   └── iteration/          # 迭代文档
├── scripts/                 # 部署脚本
│   ├── deploy-with-ssl.sh  # Let's Encrypt一键部署
│   ├── update-and-restart.sh  # 快速更新重启
│   ├── full-deploy.sh      # 完整部署
│   └── check-cert-expiry.sh  # SSL证书检查
├── ssl-certs/              # SSL证书目录（手动证书）
├── tests/                  # 正式测试
├── archive/                # 归档内容
│   ├── frontend/          # 历史前端代码
│   └── tools/             # 历史工具
├── aity88.online_nginx/   # SSL证书临时目录（私有仓库）
├── .claude/                # AI协作配置
├── .gitignore
├── README.md
├── QUICK_START_GUIDE.md
└── TENCENT_CLOUD_DEPLOY_GUIDE.md
```

### 已移除的内容
- ❌ `frontend/` - 已被`aity-uni-app-v2/`取代，移至`archive/frontend/`
- ❌ `tools/` - 移至`archive/tools/`
- ❌ `home-decoration/` - 不相关项目，已移除
- ❌ `chrome-win64/` - Chrome测试浏览器，已删除
- ❌ `test-*.js/sh/bat` - 临时测试脚本，已删除
- ❌ 各种临时文件 - 已清理

---

## 🎯 快速部署指南

### 首次部署（腾讯云服务器）

#### 方式一：一键部署（推荐）⭐

```bash
# 登录服务器
ssh root@aity88.online

# 一键克隆并部署（包含免费SSL证书）
git clone https://github.com/AILHJJ/aity-vip.git /root/aity-vip && \
cd /root/aity-vip && \
git checkout feature/iteration-1 && \
bash scripts/deploy-with-ssl.sh
```

**执行时间**: 约5-10分钟

**自动完成**:
1. ✅ 安装必要软件（certbot、nginx、git）
2. ✅ 拉取最新代码
3. ✅ 安装后端依赖
4. ✅ 申请Let's Encrypt免费SSL证书
5. ✅ 配置Nginx反向代理
6. ✅ 启动后端服务（PM2）
7. ✅ 配置证书自动续期
8. ✅ 测试访问

#### 方式二：分步部署

如果项目已存在，更新部署：

```bash
# 1. 登录服务器
ssh root@aity88.online

# 2. 进入项目目录
cd /root/aity-vip

# 3. 拉取最新代码
git pull origin feature/iteration-1

# 4. 快速更新并重启
bash scripts/update-and-restart.sh
```

### 日常维护流程

#### 更新代码并重启服务

```bash
ssh root@aity88.online
cd /root/aity-vip
git pull origin feature/iteration-1
bash scripts/update-and-restart.sh
```

#### 检查服务状态

```bash
# 查看PM2状态
pm2 status

# 查看后端日志
pm2 logs private-sharing-app-backend --lines 50

# 测试健康检查
curl http://localhost:3001/api/health

# 测试HTTPS访问
curl https://aity88.online/api/health
```

#### 检查SSL证书有效期

```bash
bash /root/aity-vip/scripts/check-cert-expiry.sh
```

---

## 🔧 常用运维命令

### PM2进程管理

```bash
# 查看所有进程
pm2 status

# 查看进程详情
pm2 show private-sharing-app-backend

# 查看日志
pm2 logs private-sharing-app-backend

# 重启服务
pm2 restart private-sharing-app-backend

# 停止服务
pm2 stop private-sharing-app-backend

# 删除服务
pm2 delete private-sharing-app-backend

# 监控资源
pm2 monit

# 保存进程列表
pm2 save

# 查看启动日志
pm2 startup
```

### Git操作

```bash
# 查看当前分支
git branch

# 查看状态
git status

# 查看最近提交
git log -5 --oneline

# 拉取最新代码
git pull origin feature/iteration-1

# 查看远程仓库
git remote -v
```

### Nginx管理

```bash
# 测试配置
nginx -t

# 重载Nginx
nginx -s reload

# 重启Nginx
systemctl restart nginx

# 查看Nginx状态
systemctl status nginx

# 查看错误日志
tail -f /var/log/nginx/aity-error.log
```

### 证书管理

```bash
# 查看证书信息
certbot certificates

# 手动续期
certbot renew

# 强制续期
certbot renew --force-renewal

# 测试续期
certbot renew --dry-run
```

---

## 📊 项目服务监控

### 健康检查

```bash
# 后端健康检查
curl http://localhost:3001/api/health

# HTTPS健康检查
curl https://aity88.online/api/health

# 版本信息
curl https://aity88.online/api/version
```

### 日志查看

```bash
# PM2日志
pm2 logs private-sharing-app-backend --lines 100

# Nginx访问日志
tail -f /var/log/nginx/aity-access.log

# Nginx错误日志
tail -f /var/log/nginx/aity-error.log
```

### 性能监控

```bash
# 系统资源
htop

# 磁盘使用
df -h

# 内存使用
free -h

# 端口占用
netstat -tlnp | grep -E ':(80|443|3001)'
```

---

## ⚠️ 常见问题处理

### 问题1: Git推送失败

**原因**: Token过期或权限问题

**解决**:
```bash
# 查看远程仓库URL
git remote -v

# 更新token（在URL中替换）
git remote set-url origin https://AILHJJ:NEW_TOKEN@github.com/AILHJJ/aity-vip.git

# 或使用SSH
git remote set-url origin git@github.com:AILHJJ/aity-vip.git
```

### 问题2: 后端服务无法启动

**检查步骤**:
```bash
# 1. 查看PM2日志
pm2 logs private-sharing-app-backend --err

# 2. 手动运行测试
cd /root/aity-vip/backend
npm run dev

# 3. 检查端口占用
netstat -tlnp | grep 3001

# 4. 检查环境变量
cat .env
```

### 问题3: SSL证书过期

**自动续期**:
```bash
# 证书已配置自动续期（每天凌晨2点）
# 查看定时任务
crontab -l | grep certbot

# 手动续期
certbot renew

# 重载Nginx
systemctl reload nginx
```

**手动证书**:
```bash
# 如果使用手动证书
cd /root/aity-vip
git pull origin feature/iteration-1
bash ssl-certs/deploy-ssl.sh
```

### 问题4: 小程序无法连接后端

**检查**:
1. 确认后端服务运行正常
2. 确认域名DNS解析正确
3. 确认防火墙端口开放
4. 检查小程序配置中的API地址

---

## 🔄 更新发布流程

### 后端更新流程

```bash
# 1. 本地修改并提交
git add .
git commit -m "feat: 功能描述"
git push origin feature/iteration-1

# 2. 服务器更新
ssh root@aity88.online
cd /root/aity-vip
git pull origin feature/iteration-1

# 3. 安装依赖（如有新增）
cd backend
npm install

# 4. 重启服务
pm2 restart private-sharing-app-backend

# 5. 验证
pm2 status
curl http://localhost:3001/api/health
```

### 小程序更新流程

```bash
# 1. 本地编译
cd aity-uni-app-v2
npm run build:mp-weixin

# 2. 微信开发者工具上传
# 项目路径: dist/build/mp-weixin
# 版本号: 1.6.x
# 版本描述: 更新说明

# 3. 提交审核
# 4. 等待审核通过
```

### 完整更新流程（后端+小程序）

```bash
# 1. 更新代码
git add .
git commit -m "feat: 功能更新"
git push origin feature/iteration-1

# 2. 更新后端
ssh root@aity88.online
cd /root/aity-vip
git pull origin feature/iteration-1
bash scripts/update-and-restart.sh

# 3. 更新小程序
# 在本地执行
cd aity-uni-app-v2
npm run build:mp-weixin

# 4. 微信开发者工具上传
```

---

## 📞 紧急联系

### 技术支持

- **GitHub Issues**: https://github.com/AILHJJ/aity-vip/issues
- **项目负责人**: ___________
- **紧急联系**: ___________

### 备份和恢复

```bash
# 创建备份
cd /root/aity-vip
tar -czf /root/backups/aity-vip-$(date +%Y%m%d).tar.gz .

# 恢复备份
cd /
tar -xzf /root/backups/aity-vip-YYYYMMDD.tar.gz
```

---

## 📝 文档更新记录

| 日期 | 版本 | 更新内容 | 更新人 |
|------|------|---------|--------|
| 2026-04-12 | v1.0 | 初始版本，包含Git信息、部署流程、运维手册 | Claude |

---

## 附录

### A. 相关文档
- [快速开始指南](QUICK_START_GUIDE.md)
- [腾讯云部署指南](TENCENT_CLOUD_DEPLOY_GUIDE.md)
- [脚本使用说明](scripts/README.md)
- [SSL解决方案](docs/PRAGMATIC_SSL_SOLUTION.md)

### B. 外部链接
- GitHub仓库: https://github.com/AILHJJ/aity-vip
- GitHub Token管理: https://github.com/settings/tokens
- Let's Encrypt: https://letsencrypt.org/

### C. 环境变量示例

```bash
# 后端 .env 文件示例
NODE_ENV=production
PORT=3001
HOST=0.0.0.0

DB_HOST=124.221.119.134
DB_PORT=3306
DB_NAME=投研图灵室_test
DB_USER=fl
DB_PASSWORD=fl10b312

JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=24h
```

---

**文档维护**: 请在每次重大更新后及时更新此文档
**最后更新**: 2026-04-12
