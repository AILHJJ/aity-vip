# 如何在腾讯云服务器上找到项目目录

## 🚀 快速方法（推荐）

### 方法1: 使用查找脚本（最简单）

```bash
# 1. 登录服务器
ssh root@your_server_ip

# 2. 创建并运行查找脚本
cat > find-project.sh << 'EOF'
#!/bin/bash
echo "正在查找AITY项目目录..."
echo ""
echo "=== PM2进程信息 ==="
pm2 status 2>/dev/null || echo "PM2未安装或未运行"
echo ""
echo "=== PM2进程工作目录 ==="
pm2 list 2>/dev/null | head -20
echo ""
echo "=== 查找package.json文件 ==="
find /root /home /opt -maxdepth 4 -name "package.json" -path "*/backend/*" 2>/dev/null | head -10
echo ""
echo "=== 查找Git仓库 ==="
find /root /home /opt -maxdepth 4 -name ".git" -type d 2>/dev/null | while read dir; do
    parent=$(dirname "$dir")
    if [ -f "$parent/backend/package.json" ] || [ -f "$parent/package.json" ]; then
        echo "$parent"
    fi
done | head -10
EOF

chmod +x find-project.sh
bash find-project.sh
```

### 方法2: 查看PM2进程信息（最快）

```bash
# 查看PM2进程状态
pm2 status

# 查看详细的进程信息（包含工作目录）
pm2 show private-sharing-app-backend
# 或
pm2 show aity-backend

# 查看所有进程
pm2 list
```

在PM2输出中查找 `restart time` 和 `script path`，会显示项目的完整路径。

### 方法3: 查找运行中的Node.js进程

```bash
# 查看Node.js进程
ps aux | grep node

# 查看进程的工作目录
cd /proc/$(pgrep -f "node.*index.js" | head -1)/cwd && pwd
```

### 方法4: 搜索常见目录

```bash
# 搜索包含package.json的backend目录
find /root /home /opt /var/www -maxdepth 5 -name "package.json" -path "*/backend/*" 2>/dev/null

# 搜索Git仓库
find /root /home /opt -maxdepth 4 -name ".git" -type d 2>/dev/null

# 搜索包含src/index.js的目录
find /root /home /opt -maxdepth 5 -name "index.js" -path "*/src/*" 2>/dev/null
```

### 方法5: 检查端口占用

```bash
# 查看端口3001的占用情况
netstat -tlnp | grep :3001
# 或
ss -tlnp | grep :3001

# 从进程ID查找工作目录
lsop -p <PID> | grep cwd
```

---

## 📁 常见的项目目录位置

根据之前的部署脚本和配置，项目可能在以下位置：

```
/root/private-sharing-app/backend
/root/aity-vip/backend
/root/aity/backend
/home/private-sharing-app/backend
/home/aity-vip/backend
/var/www/aity-vip/backend
/opt/aity-vip/backend
```

---

## 🔍 验证是否是正确的项目目录

找到目录后，运行以下命令验证：

```bash
# 进入目录
cd <找到的目录>

# 检查是否是Git仓库
git status

# 检查远程仓库地址（应该包含 aity-vip）
git remote -v

# 检查当前分支
git branch

# 检查是否有package.json
ls package.json

# 检查是否有src/index.js
ls src/index.js
```

正确的项目应该显示：
```
origin	https://github.com/AILHJJ/aity-vip.git (fetch)
origin	https://github.com/AILHJJ/aity-vip.git (push)
```

---

## 🎯 找到目录后的操作

### 确认项目目录后，拉取最新代码：

```bash
# 1. 进入backend目录
cd /root/xxx/backend  # 替换为实际路径

# 2. 确认是正确的项目
git remote -v
# 应该显示: github.com/AILHJJ/aity-vip.git

# 3. 查看当前分支
git branch
# 应该显示: * feature/iteration-1 或其他分支

# 4. 拉取最新代码
git pull origin feature/iteration-1

# 5. 查看最新提交
git log -1 --oneline
# 应该显示最新的提交: 2b43fed docs: 添加腾讯云服务器Git拉取代码详细指南

# 6. 重启服务
pm2 restart private-sharing-app-backend

# 7. 查看状态
pm2 status
pm2 logs private-sharing-app-backend --lines 30
```

---

## 🛠️ 如果所有方法都找不到

### 创建全局搜索脚本

```bash
# 创建深度搜索脚本
cat > deep-search.sh << 'EOF'
#!/bin/bash
echo "深度搜索所有目录..."
echo "这可能需要一些时间..."
echo ""

# 搜索包含特定关键字的目录
echo "=== 搜索包含'aity'关键字的目录 ==="
find / -maxdepth 6 -type d -iname "*aity*" 2>/dev/null | head -20

echo ""
echo "=== 搜索包含'private-sharing'关键字的目录 ==="
find / -maxdepth 6 -type d -iname "*private-sharing*" 2>/dev/null | head -20

echo ""
echo "=== 搜索所有package.json文件 ==="
find / -maxdepth 7 -name "package.json" 2>/dev/null | xargs grep -l "private-sharing-app-backend\|aity" 2>/dev/null | head -10

echo ""
echo "=== 搜索所有Git仓库 ==="
find / -maxdepth 6 -name ".git" -type d 2>/dev/null | while read dir; do
    parent=$(dirname "$dir")
    if [ -f "$parent/.git/config" ]; then
        remote=$(grep -A1 "remote \"origin\"" "$parent/.git/config" | grep url | awk '{print $3}')
        if echo "$remote" | grep -q "aity"; then
            echo "$parent - $remote"
        fi
    fi
done | head -10
EOF

chmod +x deep-search.sh
bash deep-search.sh
```

### 检查最近的操作记录

```bash
# 查看bash历史记录
cat ~/.bash_history | grep -E "cd |git " | tail -50

# 查看最近修改的文件
find /root /home -maxdepth 5 -type f -mtime -7 -name "*.js" 2>/dev/null | head -20
```

---

## 📞 如果还是找不到

1. **联系部署人员** 询问最初部署时的目录位置
2. **检查systemd服务** 如果使用了systemd而不是PM2
3. **检查Docker容器** 如果项目运行在Docker中
4. **检查nginx配置** 查看反向代理指向的路径

```bash
# 检查nginx配置
cat /etc/nginx/sites-enabled/* 2>/dev/null | grep proxy_pass
cat /www/server/nginx/conf/vhost/* 2>/dev/null | grep proxy_pass

# 检查Docker容器
docker ps -a
docker inspect <container_name> | grep -A10 "Mounts"
```

---

## ✅ 找到目录后的清单

- [ ] 进入项目目录
- [ ] 确认是Git仓库（git status）
- [ ] 确认远程仓库地址（git remote -v）
- [ ] 查看当前分支（git branch）
- [ ] 拉取最新代码（git pull）
- [ ] 安装依赖（npm install）
- [ ] 重启服务（pm2 restart）
- [ ] 验证服务运行（curl /health）
