# 腾讯云服务器 - 从Git拉取最新代码并部署

## 📋 前置信息

- **Git仓库**: https://github.com/AILHJJ/aity-vip.git
- **分支**: feature/iteration-1
- **项目目录**: `/root/private-sharing-app/backend` (根据实际路径调整)

---

## 🚀 方法一：完整部署流程（推荐）

适用于：首次部署 或 需要更新代码并重启服务

```bash
# 1. 进入后端项目目录
cd /root/private-sharing-app/backend

# 2. 查看当前Git状态
git status

# 3. 拉取最新代码
git pull origin feature/iteration-1

# 4. 如果有新的依赖，安装依赖
npm install --production

# 5. 重启后端服务
pm2 restart private-sharing-app-backend

# 6. 查看服务状态
pm2 status

# 7. 查看日志（确认服务正常启动）
pm2 logs private-sharing-app-backend --lines 50

# 8. 测试健康检查接口
curl http://localhost:3001/health
```

---

## 🔧 方法二：快速更新（无依赖变化）

适用于：只是代码更新，没有新增npm依赖

```bash
# 一键更新
cd /root/private-sharing-app/backend && \
git pull origin feature/iteration-1 && \
pm2 restart private-sharing-app-backend && \
pm2 logs private-sharing-app-backend --lines 20
```

---

## 🛠️ 方法三：使用自动部署脚本（如果有）

如果服务器上存在 `restart-backend.sh` 脚本：

```bash
cd /root/private-sharing-app/backend
bash restart-backend.sh
```

脚本会自动：
1. 进入后端目录
2. 询问是否拉取最新代码
3. 询问是否安装依赖
4. 停止旧服务
5. 启动新服务
6. 显示服务状态和日志

---

## 🔍 方法四：诊断后再更新

如果服务有问题，先诊断再更新：

```bash
# 1. 运行诊断脚本
cd /root/private-sharing-app/backend
bash diagnose-server.sh

# 2. 根据诊断结果决定如何操作
# 3. 拉取最新代码
git pull origin feature/iteration-1

# 4. 安装依赖（如果需要）
npm install --production

# 5. 重启服务
pm2 restart private-sharing-app-backend

# 6. 查看日志
pm2 logs private-sharing-app-backend --lines 50
```

---

## ⚠️ 常见问题处理

### 问题1: Git提示有本地修改

```bash
# 查看修改了什么
git status

# 方案A: 暂存本地修改
git stash
git pull origin feature/iteration-1
# 如果需要恢复本地修改
git stash pop

# 方案B: 放弃本地修改（慎用）
git reset --hard HEAD
git pull origin feature/iteration-1
```

### 问题2: Git提示分支冲突

```bash
# 查看当前分支
git branch

# 确保在正确的分支
git checkout feature/iteration-1

# 拉取时使用rebase
git pull --rebase origin feature/iteration-1
```

### 问题3: 依赖安装失败

```bash
# 清理npm缓存
npm cache clean --force

# 删除node_modules重新安装
rm -rf node_modules package-lock.json
npm install --production
```

### 问题4: PM2服务无法启动

```bash
# 停止并删除旧进程
pm2 delete private-sharing-app-backend

# 重新启动
pm2 start src/index.js --name private-sharing-app-backend --env production

# 保存配置
pm2 save

# 查看详细日志
pm2 logs private-sharing-app-backend --err
```

### 问题5: 端口被占用

```bash
# 查看端口占用
netstat -tlnp | grep 3001

# 杀死占用进程
kill -9 <PID>

# 重启服务
pm2 restart private-sharing-app-backend
```

---

## 📊 验证部署成功

```bash
# 1. 检查PM2进程状态
pm2 status

# 应该看到：
# ✅ private-sharing-app-backend    online

# 2. 检查日志（没有错误）
pm2 logs private-sharing-app-backend --lines 50

# 3. 测试健康检查接口
curl http://localhost:3001/health

# 应该返回：
# {"status":"ok","timestamp":"..."}

# 4. 检查端口监听
netstat -tlnp | grep 3001

# 应该看到：
# tcp  0  0 0.0.0.0:3001  0.0.0.0:*  LISTEN  <PID>/node
```

---

## 🔐 配置SSH密钥（可选，避免每次输入密码）

如果需要配置Git免密拉取：

```bash
# 1. 生成SSH密钥（如果没有）
ssh-keygen -t rsa -b 4096 -C "your_email@example.com"
# 一路回车即可

# 2. 查看公钥
cat ~/.ssh/id_rsa.pub

# 3. 将公钥添加到GitHub
# - 复制公钥内容
# - 访问 https://github.com/settings/keys
# - 点击 "New SSH key"
# - 粘贴公钥

# 4. 测试SSH连接
ssh -T git@github.com

# 5. 修改Git远程地址为SSH
git remote set-url origin git@github.com:AILHJJ/aity-vip.git
```

---

## 📝 完整部署脚本示例

创建一个自动化部署脚本 `deploy-and-restart.sh`：

```bash
#!/bin/bash

set -e  # 遇到错误立即退出

echo "=========================================="
echo "  自动部署并重启后端服务"
echo "=========================================="

# 进入项目目录
cd /root/private-sharing-app/backend

# 拉取最新代码
echo "📥 拉取最新代码..."
git pull origin feature/iteration-1

# 安装依赖
echo "📦 安装依赖..."
npm install --production

# 重启服务
echo "🔄 重启服务..."
pm2 restart private-sharing-app-backend

# 等待服务启动
echo "⏳ 等待服务启动..."
sleep 5

# 查看状态
echo "📊 服务状态："
pm2 status

# 测试健康检查
echo "🏥 测试健康检查..."
if curl -s http://localhost:3001/health > /dev/null; then
    echo "✅ 服务启动成功！"
else
    echo "❌ 服务启动失败，查看日志："
    pm2 logs private-sharing-app-backend --lines 50 --err
    exit 1
fi

echo "=========================================="
echo "  部署完成！"
echo "=========================================="
```

使用方法：

```bash
chmod +x deploy-and-restart.sh
./deploy-and-restart.sh
```

---

## 🎯 推荐工作流程

### 日常更新流程

```bash
# 1. 登录服务器
ssh root@your_server_ip

# 2. 进入后端目录
cd /root/private-sharing-app/backend

# 3. 查看当前代码版本
git log -1 --oneline

# 4. 拉取最新代码
git pull origin feature/iteration-1

# 5. 检查是否有依赖变化
git diff HEAD@{1} HEAD -- package.json

# 6. 如果有依赖变化，安装新依赖
npm install --production

# 7. 重启服务
pm2 restart private-sharing-app-backend

# 8. 查看日志确认
pm2 logs private-sharing-app-backend --lines 30

# 9. 测试接口
curl http://localhost:3001/health
```

### 紧急回滚流程

如果新代码有问题，需要回滚：

```bash
# 查看最近的提交
git log --oneline -10

# 回滚到上一个版本
git reset --hard HEAD~1

# 或者回滚到指定版本
git reset --hard <commit_hash>

# 强制推送（谨慎使用）
git push origin feature/iteration-1 --force

# 重启服务
pm2 restart private-sharing-app-backend
```

---

## 📞 技术支持

如有问题，请检查：
1. Git仓库: https://github.com/AILHJJ/aity-vip.git
2. 部署文档: backend/TENCENT_CLOUD_DEPLOYMENT.md
3. 诊断脚本: backend/diagnose-server.sh
4. 重启脚本: backend/restart-backend.sh

---

## 📌 快捷命令备忘

```bash
# 快速查看状态
pm2 status && pm2 logs private-sharing-app-backend --lines 20 --nostream

# 快速重启
pm2 restart private-sharing-app-backend && pm2 logs private-sharing-app-backend --lines 20

# 快速更新并重启
cd /root/private-sharing-app/backend && git pull && pm2 restart private-sharing-app-backend

# 查看错误日志
pm2 logs private-sharing-app-backend --err --lines 50

# 监控资源
pm2 monit
```
