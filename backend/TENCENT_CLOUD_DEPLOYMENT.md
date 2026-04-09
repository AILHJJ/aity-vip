# 腾讯云后端服务管理指南

## 项目信息

- **Git仓库**: https://github.com/AILHJJ/aity-vip.git
- **当前分支**: feature/iteration-1
- **后端目录**: `/root/private-sharing-app/backend` (根据实际部署位置调整)
- **服务端口**: 3001
- **PM2进程名**: `private-sharing-app-backend`

## 快速诊断

如果后端服务断开，运行诊断脚本：

```bash
cd /root/private-sharing-app/backend
bash diagnose-server.sh
```

或者手动执行以下命令：

```bash
# 1. 查看PM2进程状态
pm2 status

# 2. 查看错误日志
pm2 logs private-sharing-app-backend --err --lines 50

# 3. 查看输出日志
pm2 logs private-sharing-app-backend --out --lines 50

# 4. 检查端口占用
netstat -tlnp | grep 3001

# 5. 测试健康检查
curl http://localhost:3001/health
```

## 快速重启

### 方法1: 使用重启脚本（推荐）

```bash
cd /root/private-sharing-app/backend
bash restart-backend.sh
```

### 方法2: 手动重启

```bash
cd /root/private-sharing-app/backend

# 拉取最新代码
git pull origin feature/iteration-1

# 安装依赖（如果需要）
npm install --production

# 重启服务
pm2 restart private-sharing-app-backend

# 查看日志
pm2 logs private-sharing-app-backend --lines 50
```

### 方法3: 完全重启（清理后启动）

```bash
cd /root/private-sharing-app/backend

# 停止并删除旧进程
pm2 delete private-sharing-app-backend

# 启动新进程
pm2 start src/index.js --name private-sharing-app-backend --env production

# 保存PM2配置
pm2 save

# 查看状态
pm2 status
```

## 常用PM2命令

```bash
# 查看所有进程状态
pm2 status

# 查看进程详细信息
pm2 show private-sharing-app-backend

# 查看实时日志
pm2 logs private-sharing-app-backend

# 查看最近的日志（不跟踪）
pm2 logs private-sharing-app-backend --lines 100 --nostream

# 只看错误日志
pm2 logs private-sharing-app-backend --err

# 重启服务
pm2 restart private-sharing-app-backend

# 停止服务
pm2 stop private-sharing-app-backend

# 删除服务
pm2 delete private-sharing-app-backend

# 监控CPU和内存
pm2 monit

# 保存进程列表（开机自启）
pm2 save

# 查看启动日志
pm2 startup
```

## 常见问题排查

### 1. 服务无法启动

**检查端口占用**:
```bash
netstat -tlnp | grep 3001
# 如果端口被占用，杀死占用进程
kill -9 <PID>
```

**检查Node.js版本**:
```bash
node -v
# 建议使用 Node.js 16+ 或 18+
```

**检查环境变量**:
```bash
cat /root/private-sharing-app/backend/.env
```

### 2. 数据库连接失败

**测试数据库连接**:
```bash
mysql -h124.221.119.134 -ufl -pfl10b312 -e "SELECT 1;"
```

**检查数据库配置**:
```bash
cat /root/private-sharing-app/backend/.env | grep DB_
```

### 3. 内存溢出

**查看内存使用**:
```bash
pm2 monit
# 或
free -h
```

**增加PM2内存限制**（在ecosystem.config.js中）:
```javascript
max_memory_restart: '2G', // 从1G增加到2G
```

### 4. 服务自动重启

**查看重启次数**:
```bash
pm2 show private-sharing-app-backend | grep restart
```

**查看重启原因**:
```bash
pm2 logs private-sharing-app-backend --err --lines 100
```

## 完整部署流程

如果是首次部署或需要重新部署：

```bash
# 1. 进入项目目录
cd /root/private-sharing-app/backend

# 2. 拉取最新代码
git pull origin feature/iteration-1

# 3. 安装依赖
npm install --production

# 4. 配置环境变量（如果不存在）
cp .env.example .env
# 编辑.env文件，配置数据库等信息

# 5. 初始化数据库（如果需要）
mysql -h124.221.119.134 -ufl -pfl10b312 < src/config/init-db.sql

# 6. 启动服务
pm2 start src/index.js --name private-sharing-app-backend --env production

# 7. 保存PM2配置
pm2 save

# 8. 设置开机自启
pm2 startup systemd
# 按照提示执行输出的命令

# 9. 验证服务
curl http://localhost:3001/health
```

## 日志文件位置

- **PM2输出日志**: `/root/private-sharing-app/logs/pm2-out.log`
- **PM2错误日志**: `/root/private-sharing-app/logs/pm2-error.log`
- **应用日志**: 通过PM2 logs查看

## 监控和告警

建议设置监控脚本定期检查服务状态：

```bash
# 创建监控脚本
cat > /root/check-backend.sh << 'EOF'
#!/bin/bash
if ! curl -s http://localhost:3001/health > /dev/null; then
    echo "Backend is down, restarting..."
    cd /root/private-sharing-app/backend
    pm2 restart private-sharing-app-backend
fi
EOF

# 添加到crontab（每5分钟检查一次）
chmod +x /root/check-backend.sh
crontab -e
# 添加: */5 * * * * /root/check-backend.sh
```

## 更新代码流程

```bash
# 1. 备份当前版本（可选）
cd /root/private-sharing-app
git stash

# 2. 拉取最新代码
git pull origin feature/iteration-1

# 3. 安装新依赖（如果有）
cd backend
npm install --production

# 4. 数据库迁移（如果有）
# mysql -h124.221.119.134 -ufl -pfl10b312 < migrations/xxx.sql

# 5. 重启服务
pm2 restart private-sharing-app-backend

# 6. 验证
curl http://localhost:3001/health
pm2 logs private-sharing-app-backend --lines 20
```

## 联系方式

如有问题，请检查：
1. Git仓库: https://github.com/AILHJJ/aity-vip.git
2. 部署文档: backend/scripts/deploy-production.sh
3. PM2文档: https://pm2.keymetrics.io/
