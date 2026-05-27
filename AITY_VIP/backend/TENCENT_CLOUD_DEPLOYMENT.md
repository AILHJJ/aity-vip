# 腾讯云后端服务管理指南

## 项目信息

- **Git仓库**: https://github.com/AILHJJ/aity-vip.git
- **当前分支**: feature/iteration-1
- **后端目录**: `/root/aity-vip/backend`
- **服务端口**: 3001
- **PM2进程名**: `aity-backend`

## 快速诊断

如果后端服务断开，运行诊断脚本：

```bash
cd /root/aity-vip/backend
bash diagnose-server.sh
```

或者手动执行以下命令：

```bash
# 1. 查看PM2进程状态
pm2 status

# 2. 查看错误日志
pm2 logs aity-backend --err --lines 50

# 3. 查看输出日志
pm2 logs aity-backend --out --lines 50

# 4. 检查端口占用
netstat -tlnp | grep 3001

# 5. 测试健康检查
curl http://localhost:3001/health
```

## 快速重启

### 方法1: 使用重启脚本（推荐）

```bash
cd /root/aity-vip/backend
bash restart-backend.sh
```

### 方法2: 手动重启

```bash
cd /root/aity-vip/backend

# 拉取最新代码
git pull origin feature/iteration-1

# 安装依赖（如果需要）
npm install --production

# 重启服务
pm2 restart aity-backend

# 查看日志
pm2 logs aity-backend --lines 50
```

### 方法3: 完全重启（清理后启动）

```bash
cd /root/aity-vip/backend

# 停止并删除旧进程
pm2 delete aity-backend

# 启动新进程
pm2 start ecosystem.config.js --env production

# 保存PM2配置
pm2 save

# 查看状态
pm2 status
```

## 常用PM2命令

```bash
pm2 status                        # 查看所有进程状态
pm2 show aity-backend             # 查看进程详细信息
pm2 logs aity-backend             # 查看实时日志
pm2 logs aity-backend --lines 100 --nostream  # 最近日志
pm2 logs aity-backend --err       # 只看错误日志
pm2 restart aity-backend          # 重启服务
pm2 stop aity-backend             # 停止服务
pm2 delete aity-backend           # 删除服务
pm2 monit                         # 监控CPU和内存
pm2 save                          # 保存进程列表（开机自启）
```

## 常见问题排查

### 1. 服务无法启动

**检查端口占用**:
```bash
netstat -tlnp | grep 3001
kill -9 <PID>
```

**检查Node.js版本**:
```bash
node -v  # 建议 Node.js 18+
```

**检查环境变量**:
```bash
cat /root/aity-vip/backend/.env.production
```

### 2. 数据库连接失败

**测试数据库连接**:
```bash
mysql -u投研图灵室 -pfl10b312 -e "SELECT 1;"
```

**检查数据库配置**:
```bash
cat /root/aity-vip/backend/.env.production | grep DB_
```

### 3. 内存溢出

```bash
pm2 monit
free -h
```

### 4. 服务自动重启

```bash
pm2 show aity-backend | grep restart
pm2 logs aity-backend --err --lines 100
```

## 完整部署流程

```bash
cd /root/aity-vip/backend
git pull origin feature/iteration-1
npm install --production
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup systemd
curl http://localhost:3001/health
```

## 日志文件位置

- **PM2输出日志**: `/root/aity-vip/logs/pm2-out.log`
- **PM2错误日志**: `/root/aity-vip/logs/pm2-error.log`

## 更新代码流程

```bash
cd /root/aity-vip/backend
git pull origin feature/iteration-1
npm install --production
pm2 restart aity-backend
curl http://localhost:3001/health
pm2 logs aity-backend --lines 20
```
