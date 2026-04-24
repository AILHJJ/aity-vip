# SSH远程连接部署操作指南

## 概述

本指南为AITY VIP项目提供标准化的SSH远程部署操作规范，适用于腾讯云服务器的日常部署和运维。

---

## 服务器连接配置

### 基本信息

| 配置项 | 值 |
|--------|-----|
| 服务器IP | `124.221.119.134` |
| SSH用户 | `root` |
| SSH密钥 | `D:\your-mcp-proxy\AITY_VIP\aity-uni-app-v2\AITY0127.pem` |
| 域名 | `aity88.online` |

### SSH连接命令格式

```powershell
# Windows PowerShell (使用完整路径)
C:\Windows\System32\OpenSSH\ssh.exe -i "D:\your-mcp-proxy\AITY_VIP\aity-uni-app-v2\AITY0127.pem" -o StrictHostKeyChecking=no root@124.221.119.134

# 常用SSH命令示例
ssh -i "密钥路径" -o StrictHostKeyChecking=no 用户@服务器IP "执行的命令"
```

### SCP文件传输命令

```powershell
# 上传本地文件到服务器
C:\Windows\System32\OpenSSH\scp.exe -i "D:\your-mcp-proxy\AITY_VIP\AITY0127.pem" 本地文件 root@124.221.119.134:/目标路径

# 递归上传目录
C:\Windows\System32\OpenSSH\scp.exe -i "D:\your-mcp-proxy\AITY_VIP\AITY0127.pem" -r 本地目录 root@124.221.119.134:/目标路径
```

---

## 部署流程规范

### 方式一：Git Pull（推荐，需服务器有Git仓库）

适用于：服务器已初始化Git仓库，代码已推送到远程的场景

```powershell
# 一键部署命令
C:\Windows\System32\OpenSSH\ssh.exe -i "D:\your-mcp-proxy\AITY_VIP\aity-uni-app-v2\AITY0127.pem" root@124.221.119.134 "cd /root/aity-vip/backend && git pull origin feature/iteration-1 && npm install --production && pm2 restart aity-backend"

# 健康检查
C:\Windows\System32\OpenSSH\ssh.exe -i "D:\your-mcp-proxy\AITY_VIP\aity-uni-app-v2\AITY0127.pem" root@124.221.119.134 "curl -s http://localhost:3001/api/health"
```

**服务器初始化Git仓库命令**（首次使用）：
```bash
cd /root/aity-vip/backend
git init
git remote add origin https://github.com/AILHJJ/aity-vip.git
git fetch origin feature/iteration-1
git checkout -b feature/iteration-1 FETCH_HEAD
```

### 方式二：SCP上传（备用方案）

适用于：Git方式失败，或需要上传本地未推送的代码

**PowerShell命令**：
```powershell
# 1. 打包本地后端代码
cd D:\your-mcp-proxy\AITY_VIP
powershell -Command "Compress-Archive -Path backend\src,backend\package.json,backend\package-lock.json,backend\.env* -DestinationPath backend_upload.zip -Force"

# 2. SCP上传到服务器
C:\Windows\System32\OpenSSH\scp.exe -i "D:\your-mcp-proxy\AITY_VIP\aity-uni-app-v2\AITY0127.pem" D:\your-mcp-proxy\AITY_VIP\backend_upload.zip root@124.221.119.134:/tmp/

# 3. SSH执行部署（解压+安装+重启）
C:\Windows\System32\OpenSSH\ssh.exe -i "D:\your-mcp-proxy\AITY_VIP\aity-uni-app-v2\AITY0127.pem" root@124.221.119.134 "cd /root/aity-vip/backend && unzip -o /tmp/backend_upload.zip && npm install --production && pm2 restart aity-backend"
```

### 自动切换策略

**AI编程时的智能部署脚本**：
```powershell
$SSH_KEY = "D:\your-mcp-proxy\AITY_VIP\aity-uni-app-v2\AITY0127.pem"
$SERVER = "root@124.221.119.134"
$BACKEND_DIR = "/root/aity-vip/backend"

# 尝试Git Pull（最多3次）
for ($i = 1; $i -le 3; $i++) {
    $result = C:\Windows\System32\OpenSSH\ssh.exe -i $SSH_KEY $SERVER "cd $BACKEND_DIR && git pull origin feature/iteration-1"
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Git pull成功"
        break
    }
    Write-Host "Git pull失败，尝试第$i次..."
    Start-Sleep -Seconds 2
}

# 如果Git失败，自动切换SCP上传
if ($LASTEXITCODE -ne 0) {
    Write-Host "自动切换到SCP上传方式..."
    # 执行SCP上传逻辑...
}
```

---

## 服务器目录结构

```
/root/aity-vip/
├── backend/              # 后端代码目录
│   ├── src/              # 源代码
│   ├── ecosystem.config.js  # PM2配置文件
│   └── .env.production  # 生产环境配置
├── aity-uni-app-v2/      # 前端代码目录
└── logs/                  # 日志目录
    ├── pm2-out.log
    └── pm2-error.log
```

---

## PM2服务管理命令

```bash
# 查看服务状态
pm2 status

# 重启服务
pm2 restart aity-backend

# 停止服务
pm2 stop aity-backend

# 查看日志
pm2 logs aity-backend

# 查看错误日志
pm2 logs aity-backend --err --lines 50

# 查看实时日志
pm2 logs aity-backend --lines 100 --nostream

# 删除服务
pm2 delete aity-backend

# 完全重启（清理后启动）
pm2 delete aity-backend && pm2 start ecosystem.config.js --env production

# 保存PM2配置（开机自启）
pm2 save
pm2 startup
```

---

## 健康检查

```bash
# 本地健康检查
curl http://localhost:3001/health

# 或
curl http://localhost:3001/api/health

# 外部健康检查
curl https://aity88.online:8443/api/health
```

---

## 常见问题排查

### 1. SSH连接失败

```bash
# 检查SSH密钥权限（Windows）
icacls "D:\your-mcp-proxy\AITY_VIP\AITY0127.pem" /inheritance:r /grant:r "$env:USERNAME`:F"

# 检查SSH客户端是否存在
C:\Windows\System32\OpenSSH\ssh.exe -v -i "密钥路径" root@服务器IP
```

### 2. 服务无法启动

```bash
# 检查端口占用
netstat -tlnp | grep 3001
# 或
lsof -i :3001

# 杀死占用进程
kill -9 <PID>

# 检查Node.js版本
node -v

# 直接运行测试
cd /root/aity-vip/backend
NODE_ENV=production node src/index.js
```

### 3. 数据库连接失败

```bash
# 测试数据库连接
mysql -u fl -pfl10b312 -h 124.221.119.134 -e "SELECT 1;"

# 检查环境变量
cat /root/aity-vip/backend/.env.production | grep DB_
```

### 4. PM2日志查看

```bash
# 查看最近日志
pm2 logs aity-backend --lines 100 --nostream

# 实时监控
pm2 monit

# 查看内存使用
free -h
```

---

## AI编程时的自动化部署模板

### PowerShell一键部署脚本（兼容两种方式）

```powershell
$SSH_KEY = "D:\your-mcp-proxy\AITY_VIP\aity-uni-app-v2\AITY0127.pem"
$SERVER = "root@124.221.119.134"
$BACKEND_DIR = "/root/aity-vip/backend"
$BRANCH = "feature/iteration-1"

# 1. 尝试Git Pull（最多3次，如果失败自动切换SCP）
$gitSuccess = $false
for ($i = 1; $i -le 3; $i++) {
    $gitResult = C:\Windows\System32\OpenSSH\ssh.exe -i $SSH_KEY $SERVER "cd $BACKEND_DIR && git pull origin $BRANCH"
    if ($LASTEXITCODE -eq 0) {
        $gitSuccess = $true
        Write-Host "Git pull成功"
        break
    }
    Write-Host "Git pull失败第$i次，2秒后重试..."
    Start-Sleep -Seconds 2
}

# 2. 如果Git失败，切换SCP上传
if (-not $gitSuccess) {
    Write-Host "自动切换到SCP上传方式..."
    cd D:\your-mcp-proxy\AITY_VIP
    powershell -Command "Compress-Archive -Path backend\src,backend\package.json,backend\package-lock.json,backend\.env* -DestinationPath backend_upload.zip -Force"
    C:\Windows\System32\OpenSSH\scp.exe -i $SSH_KEY D:\your-mcp-proxy\AITY_VIP\backend_upload.zip $SERVER:/tmp/
    C:\Windows\System32\OpenSSH\ssh.exe -i $SSH_KEY $SERVER "cd $BACKEND_DIR && unzip -o /tmp/backend_upload.zip"
}

# 3. 安装依赖并重启
C:\Windows\System32\OpenSSH\ssh.exe -i $SSH_KEY $SERVER "cd $BACKEND_DIR && npm install --production && pm2 restart aity-backend"

# 4. 健康检查
C:\Windows\System32\OpenSSH\ssh.exe -i $SSH_KEY $SERVER "curl -s http://localhost:3001/api/health"

# 5. 查看状态
C:\Windows\System32\OpenSSH\ssh.exe -i $SSH_KEY $SERVER "pm2 status"
```

---

## 部署前检查清单

在执行部署前，请确认以下事项：

- [ ] 本地代码已提交到Git仓库
- [ ] 代码已推送到远程分支
- [ ] 服务器SSH连接正常
- [ ] 了解本次部署的内容和影响范围

---

## 文档信息

- **创建时间**: 2026-04-21
- **适用项目**: AITY VIP (aity-vip/backend)
- **维护者**: AITY VIP Team
