# 🚀 腾讯云服务器快速操作指南

## 第一步：登录服务器

```bash
ssh root@your_server_ip
```

---

## 第二步：查找项目目录

### 方法A：使用查找脚本（最简单）⭐

```bash
# 创建临时查找脚本
cat > find-project.sh << 'EOF'
#!/bin/bash
echo "=========================================="
echo "  查找AITY项目目录"
echo "=========================================="
echo ""
echo "=== 1. PM2进程状态 ==="
pm2 status 2>/dev/null || echo "PM2未安装"
echo ""
echo "=== 2. PM2进程详细信息 ==="
pm2 show private-sharing-app-backend 2>/dev/null || pm2 show aity-backend 2>/dev/null || echo "未找到进程"
echo ""
echo "=== 3. 搜索Git仓库 ==="
find /root /home /opt -maxdepth 4 -name ".git" -type d 2>/dev/null | while read dir; do
    parent=$(dirname "$dir")
    if [ -f "$parent/backend/package.json" ] || [ -f "$parent/package.json" ]; then
        echo "找到: $parent"
        cd "$parent" 2>/dev/null && git remote -v 2>/dev/null | grep aity && echo ""
    fi
done
echo ""
echo "=== 4. 搜索package.json ==="
find /root /home /opt -maxdepth 5 -name "package.json" -path "*/backend/*" 2>/dev/null
echo ""
echo "=== 5. 检查端口3001 ==="
netstat -tlnp 2>/dev/null | grep :3001 || ss -tlnp 2>/dev/null | grep :3001 || echo "端口3001未占用"
EOF

chmod +x find-project.sh
bash find-project.sh
```

### 方法B：快速查看PM2（最快）

```bash
# 查看PM2进程
pm2 status

# 查看进程详细信息（包含路径）
pm2 show private-sharing-app-backend
# 或
pm2 show aity-backend
```

### 方法C：搜索常见目录

```bash
# 搜索可能的目录
ls -d /root/*/backend 2>/dev/null
ls -d /home/*/backend 2>/dev/null
find /root -maxdepth 3 -type d -name "backend" 2>/dev/null
```

---

## 第三步：确认项目目录

找到目录后，进入并验证：

```bash
# 进入找到的目录（替换为实际路径）
cd /root/xxx/backend

# 验证1: 检查Git远程地址
git remote -v
# 应该显示: github.com/AILHJJ/aity-vip.git

# 验证2: 检查当前分支
git branch
# 应该显示: * feature/iteration-1 或其他

# 验证3: 检查项目文件
ls src/index.js
ls package.json
```

---

## 第四步：拉取最新代码

```bash
# 确认在正确的目录
pwd  # 应该显示 .../backend

# 拉取最新代码
git pull origin feature/iteration-1

# 查看最新提交
git log -1 --oneline
# 应该显示: df2650a feat: 添加腾讯云项目目录查找工具
```

---

## 第五步：安装依赖并重启服务

```bash
# 安装依赖（如果有新增）
npm install --production

# 重启服务
pm2 restart private-sharing-app-backend
# 或
pm2 restart aity-backend

# 查看服务状态
pm2 status

# 查看日志
pm2 logs private-sharing-app-backend --lines 30
```

---

## 第六步：验证服务运行

```bash
# 测试健康检查接口
curl http://localhost:3001/health

# 应该返回类似:
# {"status":"ok","timestamp":"2026-04-09T..."}
```

---

## 📝 完整操作示例（从零开始）

```bash
# 1. 登录服务器
ssh root@your_server_ip

# 2. 查找项目
bash find-project.sh

# 假设找到了 /root/private-sharing-app/backend

# 3. 进入目录
cd /root/private-sharing-app/backend

# 4. 确认项目
git remote -v

# 5. 拉取代码
git pull origin feature/iteration-1

# 6. 重启服务
pm2 restart private-sharing-app-backend

# 7. 验证
pm2 status
curl http://localhost:3001/health
```

---

## 🔍 如果找不到项目目录

### 尝试深度搜索：

```bash
# 搜索所有包含aity的目录
find / -maxdepth 6 -type d -iname "*aity*" 2>/dev/null

# 搜索所有package.json
find / -maxdepth 7 -name "package.json" 2>/dev/null | xargs grep -l "aity" 2>/dev/null

# 查看bash历史记录
cat ~/.bash_history | grep "cd " | tail -50

# 查看所有PM2进程
pm2 list

# 查看所有Git仓库
find /root /home /opt -maxdepth 5 -name ".git" -type d 2>/dev/null
```

---

## ❓ 常见问题

### Q1: PM2显示进程不存在
```bash
# 查找所有PM2进程
pm2 list

# 查看所有Node.js进程
ps aux | grep node

# 查看端口占用
netstat -tlnp | grep :3001
```

### Q2: Git提示权限错误
```bash
# 检查Git远程地址类型
git remote -v

# 如果是HTTPS，可能需要配置token
# 如果是SSH，检查SSH密钥
```

### Q3: 找不到backend目录
```bash
# 可能在项目根目录
cd /root/your-project
ls -la

# 或直接在项目根目录操作
cd /root/your-project
git pull origin feature/iteration-1
cd backend
pm2 restart private-sharing-app-backend
```

---

## 📞 获取帮助

如果遇到问题，可以查看服务器上的文档：

```bash
# 拉取代码后，查看详细指南
cd /root/xxx/backend
cat TENCENT_CLOUD_DEPLOYMENT.md
cat PULL_FROM_GIT.md
cat FIND_PROJECT_GUIDE.md
```

---

## ✅ 成功标志

当你看到以下内容，说明操作成功：

1. ✅ Git拉取成功：`df2650a feat: 添加腾讯云项目目录查找工具`
2. ✅ PM2状态：`private-sharing-app-backend  online`
3. ✅ 健康检查：`{"status":"ok",...}`
4. ✅ 日志正常：没有ERROR级别的日志

---

## 🎯 一键操作（如果知道项目路径）

```bash
# 替换为实际路径
PROJECT_DIR="/root/private-sharing-app/backend"

cd $PROJECT_DIR && \
git pull origin feature/iteration-1 && \
npm install --production && \
pm2 restart private-sharing-app-backend && \
pm2 status && \
curl http://localhost:3001/health
```
