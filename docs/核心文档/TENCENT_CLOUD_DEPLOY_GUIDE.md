# 腾讯云服务器 - 完整部署指南

## 📦 Git仓库信息

### Git远程仓库地址
```
https://github.com/AILHJJ/aity-vip.git
```

### 分支信息
- **当前分支**: `feature/iteration-1`
- **最新提交**: `721704d docs: 添加腾讯云服务器快速操作指南`

### 项目结构
```
AITY_VIP/
├── backend/                    # 后端服务（Node.js + Express）
│   ├── src/                   # 源代码
│   ├── dist/                  # 编译输出
│   ├── package.json           # 依赖配置
│   ├── .env                   # 环境变量
│   └── ecosystem.config.js    # PM2配置
└── aity-uni-app-v2/           # 小程序项目（uni-app）
    ├── src/                   # 源代码
    ├── dist/                  # 编译输出
    └── package.json           # 依赖配置
```

---

## 🚀 腾讯云服务器部署步骤

### 第一步：登录服务器

```bash
ssh root@your_server_ip
```

### 第二步：安装必要软件（首次部署）

```bash
# 更新系统
apt update && apt upgrade -y

# 安装Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt-get install -y nodejs

# 验证安装
node -v
npm -v

# 安装PM2
npm install -g pm2

# 安装Git（如果没有）
apt install -y git

# 安装MySQL客户端（可选）
apt install -y mysql-client
```

### 第三步：克隆或更新项目

#### 方案A：首次部署（克隆项目）

```bash
# 1. 进入工作目录
cd /root

# 2. 克隆项目
git clone https://github.com/AILHJJ/aity-vip.git

# 3. 进入项目目录
cd aity-vip

# 4. 切换到开发分支
git checkout feature/iteration-1
```

#### 方案B：更新已有项目

```bash
# 1. 进入项目目录
cd /root/aity-vip

# 2. 查看当前状态
git status

# 3. 拉取最新代码
git pull origin feature/iteration-1

# 4. 查看最新提交
git log -1 --oneline
# 应该显示: 721704d docs: 添加腾讯云服务器快速操作指南
```

### 第四步：部署后端服务

```bash
# 1. 进入后端目录
cd /root/aity-vip/backend

# 2. 安装依赖
npm install

# 3. 配置环境变量（如果不存在）
cp .env.example .env
# 编辑.env文件，配置数据库等信息
nano .env

# 4. 测试启动（可选）
npm run dev

# 5. 使用PM2启动生产服务
pm2 start src/index.js --name aity-backend --env production

# 6. 保存PM2配置
pm2 save

# 7. 设置开机自启
pm2 startup systemd
# 按照提示执行输出的命令
```

### 第五步：验证后端服务

```bash
# 1. 查看PM2状态
pm2 status

# 2. 查看日志
pm2 logs aity-backend --lines 50

# 3. 测试健康检查
curl http://localhost:3001/api/health

# 4. 测试版本信息
curl http://localhost:3001/api/version

# 应该返回:
# {"code":200,"message":"API Version Information","data":{...}}
```

### 第六步：配置Nginx（可选）

如果需要通过域名访问：

```bash
# 1. 安装Nginx
apt install -y nginx

# 2. 创建配置文件
nano /etc/nginx/sites-available/aity-vip

# 3. 添加以下配置
server {
    listen 80;
    server_name your_domain.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}

# 4. 启用配置
ln -s /etc/nginx/sites-available/aity-vip /etc/nginx/sites-enabled/

# 5. 测试配置
nginx -t

# 6. 重载Nginx
systemctl reload nginx
```

---

## 🔄 更新部署流程

### 当有新代码时，更新后端服务

```bash
# 1. 进入项目目录
cd /root/aity-vip

# 2. 拉取最新代码
git pull origin feature/iteration-1

# 3. 进入后端目录
cd backend

# 4. 安装新依赖（如果有）
npm install

# 5. 重启服务
pm2 restart aity-backend

# 6. 查看状态
pm2 status
pm2 logs aity-backend --lines 30
```

### 一键更新脚本

```bash
cat > /root/update-aity.sh << 'EOF'
#!/bin/bash
echo "=========================================="
echo "  更新AITY项目"
echo "=========================================="

cd /root/aity-vip
echo "📥 拉取最新代码..."
git pull origin feature/iteration-1

echo "📦 安装依赖..."
cd backend
npm install

echo "🔄 重启服务..."
pm2 restart aity-backend

echo "📊 查看状态..."
pm2 status

echo "✅ 更新完成！"
echo "=========================================="
EOF

chmod +x /root/update-aity.sh
```

使用方式：
```bash
bash /root/update-aity.sh
```

---

## 📁 项目路径总结

### 在腾讯云服务器上的完整路径

```
/root/aity-vip/                    # 项目根目录
├── backend/                       # 后端服务目录
│   ├── src/                       # 源代码
│   │   └── index.js              # 入口文件
│   ├── package.json              # 依赖配置
│   ├── .env                      # 环境变量
│   ├── ecosystem.config.js       # PM2配置
│   └── node_modules/             # 依赖包
└── aity-uni-app-v2/              # 小程序目录
    ├── src/                      # 源代码
    ├── dist/                     # 编译输出
    └── package.json              # 依赖配置
```

### 后端服务关键路径

- **项目目录**: `/root/aity-vip/backend`
- **入口文件**: `/root/aity-vip/backend/src/index.js`
- **环境配置**: `/root/aity-vip/backend/.env`
- **PM2进程名**: `aity-backend`
- **服务端口**: `3001`
- **健康检查**: `http://localhost:3001/api/health`

---

## 🔧 常用管理命令

### PM2命令

```bash
# 查看所有进程
pm2 status

# 查看进程详情
pm2 show aity-backend

# 查看日志
pm2 logs aity-backend

# 查看最近50行日志
pm2 logs aity-backend --lines 50

# 只看错误日志
pm2 logs aity-backend --err

# 重启服务
pm2 restart aity-backend

# 停止服务
pm2 stop aity-backend

# 删除服务
pm2 delete aity-backend

# 监控CPU和内存
pm2 monit

# 保存进程列表
pm2 save

# 查看启动日志
pm2 startup
```

### Git命令

```bash
# 查看当前分支
git branch

# 查看状态
git status

# 拉取最新代码
git pull origin feature/iteration-1

# 查看最近提交
git log -5 --oneline

# 查看远程仓库
git remote -v
```

---

## 🔍 故障排查

### 问题1：服务无法启动

```bash
# 1. 查看PM2日志
pm2 logs aity-backend --err

# 2. 手动运行查看错误
cd /root/aity-vip/backend
npm run dev

# 3. 检查端口占用
netstat -tlnp | grep 3001

# 4. 检查环境变量
cat .env
```

### 问题2：数据库连接失败

```bash
# 1. 测试数据库连接
mysql -h124.221.119.134 -ufl -pfl10b312 -e "SELECT 1;"

# 2. 检查.env配置
cat .env | grep DB_

# 3. 查看后端日志
pm2 logs aity-backend --lines 50
```

### 问题3：Git拉取失败

```bash
# 1. 查看远程仓库
git remote -v

# 2. 检查当前分支
git branch

# 3. 重置到远程分支
git fetch origin
git reset --hard origin/feature/iteration-1

# 4. 查看错误信息
git pull origin feature/iteration-1
```

---

## ✅ 部署验证清单

部署完成后，检查以下项目：

- [ ] PM2进程状态显示 `online`
- [ ] 健康检查返回 `{"status":"ok"}`
- [ ] 查看日志无ERROR级别错误
- [ ] Git最新提交正确显示
- [ ] 数据库连接成功
- [ ] 端口3001正常监听

---

## 📞 获取帮助

### 查看服务器上的文档

```bash
cd /root/aity-vip/backend

# 查看快速操作指南
cat QUICK_START_TENCENT_CLOUD.md

# 查看完整部署文档
cat TENCENT_CLOUD_DEPLOYMENT.md

# 查看Git拉取指南
cat PULL_FROM_GIT.md

# 查看项目查找指南
cat FIND_PROJECT_GUIDE.md
```

---

## 🎯 快速开始（复制粘贴版）

### 首次部署

```bash
# 登录服务器
ssh root@your_server_ip

# 克隆项目
cd /root
git clone https://github.com/AILHJJ/aity-vip.git
cd aity-vip
git checkout feature/iteration-1

# 部署后端
cd backend
npm install
pm2 start src/index.js --name aity-backend --env production
pm2 save

# 验证
pm2 status
curl http://localhost:3001/api/health
```

### 更新部署

```bash
cd /root/aity-vip
git pull origin feature/iteration-1
cd backend
npm install
pm2 restart aity-backend
pm2 status
```

---

## 📌 重要信息

- **Git仓库**: https://github.com/AILHJJ/aity-vip.git
- **分支**: feature/iteration-1
- **项目目录**: /root/aity-vip
- **后端目录**: /root/aity-vip/backend
- **PM2进程名**: aity-backend
- **服务端口**: 3001
- **健康检查**: http://localhost:3001/api/health

---

**最后更新**: 2026-04-10
**文档版本**: v1.0
