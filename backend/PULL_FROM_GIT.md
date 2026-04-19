# 腾讯云服务器 - 从Git拉取最新代码并部署

## 📋 前置信息

- **Git仓库**: https://github.com/AILHJJ/aity-vip.git
- **分支**: feature/iteration-1
- **项目目录**: /root/aity-vip/backend

## 🚀 一键更新

```bash
cd /root/aity-vip/backend && \
git pull origin feature/iteration-1 && \
npm install --production && \
pm2 restart aity-backend && \
pm2 status && \
curl http://localhost:3001/health
```

## 📖 详细步骤

### 1. 进入项目目录

```bash
cd /root/aity-vip/backend
pwd  # 确认路径正确
```

### 2. 查看当前版本

```bash
git log -1 --oneline
git status
```

### 3. 拉取最新代码

```bash
git pull origin feature/iteration-1
```

### 4. 安装依赖（如有新增）

```bash
npm install --production
```

### 5. 重启服务

```bash
pm2 restart aity-backend
pm2 logs aity-backend --lines 20 --nostream
```

### 6. 验证

```bash
curl http://localhost:3001/health
```

## ⚠️ 常见问题

### Git 认证失败

```bash
# 检查远程地址
git remote -v

# 如果需要配置凭据
git remote set-url origin https://<token>@github.com/AILHJJ/aity-vip.git
```

### 合并冲突

```bash
# 查看冲突文件
git status

# 放弃本地修改，强制使用远程版本
git fetch origin
git reset --hard origin/feature/iteration-1
```
