# 腾讯云服务器运维手册

> 本文档提供 AITY 后端服务在腾讯云服务器上的完整运维指南，包括部署、启动、更新、故障排查等全流程操作。

**服务版本**: v1.0.0
**最后更新**: 2026-04-14
**服务器环境**: 腾讯云 OpenCloudOS
**Node.js 版本**: v22.22.1
**PM2 版本**: v6.0.14

---

## 📑 目录

- [一、系统环境信息](#一系统环境信息)
- [二、目录结构说明](#二目录结构说明)
- [三、首次部署流程](#三首次部署流程)
- [四、日常运维操作](#四日常运维操作)
- [五、故障排查指南](#五故障排查指南)
- [六、备份与恢复](#六备份与恢复)
- [七、安全配置](#七安全配置)
- [八、附录](#八附录)

---

## 一、系统环境信息

### 1.1 服务器配置

- **操作系统**: OpenCloudOS (基于 CentOS/RHEL)
- **Node.js 版本**: v22.22.1
- **NPM 版本**: v10.9.4
- **PM2 版本**: v6.0.14
- **MySQL 版本**: (根据实际情况填写)
- **项目目录**: `/root/aity-vip`
- **后端目录**: `/root/aity-vip/backend`

### 1.2 网络配置

- **后端服务端口**: `3000`
- **数据库端口**: `3306` (本地)
- **数据库地址**: `localhost`
- **数据库用户**: `fl`
- **数据库密码**: `fl10b312`

### 1.3 Git 仓库信息

- **仓库地址**: `https://github.com/AILHJJ/aity-vip.git`
- **当前分支**: `feature/iteration-1`
- **部署目录**: `/root/aity-vip`

---

## 二、目录结构说明

### 2.1 项目目录结构

```
/root/aity-vip/                    # 项目根目录
├── backend/                       # 后端服务目录
│   ├── src/                       # 源代码
│   │   └── index.js              # 入口文件
│   ├── config/                   # 配置文件
│   ├── routes/                   # 路由文件
│   ├── controllers/              # 控制器
│   ├── models/                   # 数据模型
│   ├── middleware/               # 中间件
│   ├── utils/                    # 工具函数
│   ├── logs/                     # 日志目录
│   ├── uploads/                  # 上传文件目录
│   ├── migrations/               # 数据库迁移
│   ├── node_modules/             # 依赖包
│   ├── package.json              # 依赖配置
│   ├── .env                      # 默认环境变量
│   ├── .env.production           # 生产环境变量 ⭐
│   ├── .env.development          # 开发环境变量
│   └── ecosystem.config.js       # PM2 配置
├── docs/                         # 文档目录
│   ├── TENCENT_CLOUD_OPERATIONS_MANUAL.md  # 本文档
│   ├── TENCENT_CLOUD_DEPLOYMENT.md        # 部署文档
│   └── QUICK_START_TENCENT_CLOUD.md       # 快速开始
└── aity-uni-app-v2/              # 小程序目录
```

### 2.2 脚本目录

```
/root/                             # root 用户家目录
├── start-aity.sh                  # 启动服务脚本 ⭐
├── restart-aity.sh                # 重启服务脚本 ⭐
├── update-aity.sh                 # 更新代码脚本 ⭐
└── check-aity.sh                  # 检查状态脚本 ⭐
```

---

## 三、首次部署流程

### 3.1 系统准备

#### 安装 Node.js

```bash
# 检查 Node.js 版本
node -v

# 如果未安装或版本过低，安装 Node.js 18.x 或更高版本
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt-get install -y nodejs

# 验证安装
node -v
npm -v
```

#### 安装 PM2

```bash
# 全局安装 PM2
npm install -g pm2

# 验证安装
pm2 -v
```

#### 安装 MySQL

```bash
# 安装 MySQL 服务器
yum install -y mysql-server

# 启动 MySQL 服务
systemctl start mysqld
systemctl enable mysqld

# 安全配置
mysql_secure_installation
```

### 3.2 克隆项目

```bash
# 进入工作目录
cd /root

# 克隆项目
git clone https://github.com/AILHJJ/aity-vip.git

# 进入项目目录
cd aity-vip

# 切换到开发分支
git checkout feature/iteration-1
```

### 3.3 配置环境变量

```bash
# 进入后端目录
cd /root/aity-vip/backend

# 查看环境配置文件
ls -la .env*

# 编辑生产环境配置
nano .env.production
```

**重要配置项**:

```bash
# 环境标识
NODE_ENV=production

# 服务器配置
HOST=0.0.0.0
PORT=3001

# 数据库配置（本地数据库）
DB_HOST=localhost
DB_PORT=3306
DB_USER=fl
DB_PASSWORD=fl10b312
DB_ENV=production

# JWT 配置
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=24h

# CORS 配置
ALLOWED_ORIGINS=https://aity88.online:8443,https://aity88.online

# 文件上传配置
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760
```

### 3.4 安装依赖

```bash
# 进入后端目录
cd /root/aity-vip/backend

# 安装依赖
npm install
```

### 3.5 配置数据库

```bash
# 登录 MySQL
mysql -u root -p

# 创建数据库（如果需要）
CREATE DATABASE IF NOT EXISTS your_database_name CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# 创建用户（如果需要）
CREATE USER IF NOT EXISTS 'fl'@'localhost' IDENTIFIED BY 'fl10b312';

# 授权
GRANT ALL PRIVILEGES ON your_database_name.* TO 'fl'@'localhost';
FLUSH PRIVILEGES;

EXIT;

# 测试连接
mysql -hlocalhost -ufl -pfl10b312 -e "SELECT 1;"
```

### 3.6 启动服务

**方式一：使用启动脚本（推荐）**

```bash
bash /root/start-aity.sh
```

**方式二：手动启动**

```bash
cd /root/aity-vip/backend

# 使用 PM2 启动
pm2 start src/index.js --name aity-backend

# 保存进程列表
pm2 save

# 设置开机自启
pm2 startup systemd
```

### 3.7 验证部署

```bash
# 1. 检查 PM2 状态
pm2 status

# 期望输出：aity-backend 显示为 online

# 2. 查看日志
pm2 logs aity-backend --lines 30

# 3. 测试健康检查
curl http://localhost:3000/api/health

# 期望输出：{"status":"ok","timestamp":"..."}

# 4. 测试版本信息
curl http://localhost:3000/api/version

# 5. 检查端口监听
netstat -tlnp | grep 3000

# 期望输出：tcp  0  0 0.0.0.0:3000  0.0.0.0:*  LISTEN  xxxxx/node
```

---

## 四、日常运维操作

### 4.1 服务管理

#### 查看服务状态

```bash
# 方式一：使用检查脚本（推荐）
bash /root/check-aity.sh

# 方式二：直接使用 PM2 命令
pm2 status
```

#### 重启服务

```bash
# 方式一：使用重启脚本（推荐）
bash /root/restart-aity.sh

# 方式二：直接使用 PM2
pm2 restart aity-backend
```

#### 停止服务

```bash
# 停止服务
pm2 stop aity-backend

# 删除服务（慎用）
pm2 delete aity-backend
```

#### 查看日志

```bash
# 实时查看所有日志
pm2 logs aity-backend

# 查看最近 50 行日志
pm2 logs aity-backend --lines 50

# 只查看错误日志
pm2 logs aity-backend --err

# 清空日志
pm2 flush
```

### 4.2 代码更新

#### 更新代码并重启

```bash
# 方式一：使用更新脚本（推荐）⭐
bash /root/update-aity.sh

# 方式二：手动更新
cd /root/aity-vip
git pull origin feature/iteration-1
cd backend
npm install
pm2 restart aity-backend
pm2 logs aity-backend --lines 30
```

#### 回滚到上一个版本

```bash
cd /root/aity-vip

# 查看提交历史
git log -5 --oneline

# 回滚到上一个版本
git reset --hard HEAD~1

# 重启服务
cd backend
pm2 restart aity-backend
```

### 4.3 数据库管理

#### 备份数据库

```bash
# 创建备份目录
mkdir -p /root/backups/mysql

# 备份数据库
mysqldump -hlocalhost -ufl -pfl10b312 your_database_name > /root/backups/mysql/backup_$(date +%Y%m%d_%H%M%S).sql

# 查看备份文件
ls -lh /root/backups/mysql/
```

#### 恢复数据库

```bash
# 从备份恢复
mysql -hlocalhost -ufl -pfl10b312 your_database_name < /root/backups/mysql/backup_20260414_100000.sql
```

#### 自动备份脚本

```bash
cat > /root/backup-mysql.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/root/backups/mysql"
DB_NAME="your_database_name"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

echo "开始备份数据库..."
mysqldump -hlocalhost -ufl -pfl10b312 $DB_NAME | gzip > $BACKUP_DIR/backup_${TIMESTAMP}.sql.gz

# 删除 7 天前的备份
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +7 -delete

echo "备份完成: $BACKUP_DIR/backup_${TIMESTAMP}.sql.gz"
ls -lh $BACKUP_DIR/ | tail -5
EOF

chmod +x /root/backup-mysql.sh

# 添加到定时任务（每天凌晨 2 点备份）
crontab -e
# 添加以下行：
0 2 * * * /root/backup-mysql.sh >> /root/backups/mysql/backup.log 2>&1
```

### 4.4 监控与告警

#### 实时监控

```bash
# 使用 PM2 监控
pm2 monit

# 查看资源使用
pm2 mem
pm2 cpu
```

#### 日志轮转配置

```bash
# 安装 pm2-logrotate
pm2 install pm2-logrotate

# 配置日志轮转
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
pm2 set pm2-logrotate:compress true
```

---

## 五、故障排查指南

### 5.1 服务无法启动

#### 问题诊断

```bash
# 1. 查看详细错误日志
pm2 logs aity-backend --err --lines 100

# 2. 手动运行查看错误
cd /root/aity-vip/backend
NODE_ENV=production node src/index.js

# 3. 检查端口占用
netstat -tlnp | grep 3000
# 或者
lsof -i :3000

# 4. 杀死占用端口的进程
kill -9 <PID>
```

#### 常见原因

1. **端口被占用**
   ```bash
   # 查找占用进程
   lsof -i :3000

   # 杀死进程
   kill -9 <PID>
   ```

2. **数据库连接失败**
   ```bash
   # 测试数据库连接
   mysql -hlocalhost -ufl -pfl10b312 -e "SELECT 1;"

   # 检查 MySQL 服务
   systemctl status mysqld

   # 启动 MySQL
   systemctl start mysqld
   ```

3. **依赖缺失**
   ```bash
   cd /root/aity-vip/backend
   npm install
   ```

4. **环境变量配置错误**
   ```bash
   # 检查环境变量
   cat /root/aity-vip/backend/.env.production

   # 重新配置
   nano /root/aity-vip/backend/.env.production
   ```

### 5.2 数据库连接失败

#### 诊断步骤

```bash
# 1. 检查 MySQL 服务状态
systemctl status mysqld

# 2. 检查 MySQL 端口监听
netstat -tlnp | grep 3306

# 3. 测试本地连接
mysql -hlocalhost -ufl -pfl10b312 -e "SELECT 1;"

# 4. 检查数据库用户权限
mysql -u root -p
mysql> SELECT user, host FROM mysql.user WHERE user='fl';
mysql> SHOW GRANTS FOR 'fl'@'localhost';
```

#### 解决方案

1. **MySQL 服务未启动**
   ```bash
   systemctl start mysqld
   systemctl enable mysqld
   ```

2. **用户权限不足**
   ```bash
   mysql -u root -p
   mysql> GRANT ALL PRIVILEGES ON your_database.* TO 'fl'@'localhost';
   mysql> FLUSH PRIVILEGES;
   ```

3. **密码错误**
   ```bash
   # 修改密码
   mysql -u root -p
   mysql> ALTER USER 'fl'@'localhost' IDENTIFIED BY 'new_password';
   mysql> FLUSH PRIVILEGES;

   # 更新 .env.production
   nano /root/aity-vip/backend/.env.production
   ```

### 5.3 Git 操作失败

#### 拉取代码失败

```bash
# 1. 检查网络连接
ping github.com

# 2. 查看远程仓库
cd /root/aity-vip
git remote -v

# 3. 重置到远程分支
git fetch origin
git reset --hard origin/feature/iteration-1

# 4. 如果有本地修改，先备份
git stash
git pull origin feature/iteration-1
```

#### 分支冲突

```bash
# 查看当前分支
git branch

# 切换到正确的分支
git checkout feature/iteration-1

# 强制重置到远程分支（慎用）
git fetch origin
git reset --hard origin/feature/iteration-1
```

### 5.4 PM2 进程异常

#### 进程反复重启

```bash
# 1. 查看重启次数
pm2 status

# 2. 查看错误日志
pm2 logs aity-backend --err

# 3. 删除旧进程
pm2 delete aity-backend

# 4. 重新启动
pm2 start src/index.js --name aity-backend
```

#### PM2 命令无响应

```bash
# 1. 刷新 PM2 守护进程
pm2 kill
pm2 resurrect

# 2. 清理 PM2 缓存
rm -rf /root/.pm2/pm2.pid
pm2 resurrect
```

### 5.5 性能问题

#### CPU 使用率过高

```bash
# 1. 查看进程资源使用
pm2 monit

# 2. 查看 Node.js 进程
top -p $(pgrep -f "node src/index.js")

# 3. 分析内存泄漏
pm2 install pm2-node-monit
pm2 monit
```

#### 内存泄漏

```bash
# 1. 查看内存使用趋势
pm2 mem

# 2. 生成内存快照
pm2 profile aity-backend

# 3. 重启服务释放内存
pm2 restart aity-backend
```

---

## 六、备份与恢复

### 6.1 数据库备份

#### 手动备份

```bash
# 创建备份目录
mkdir -p /root/backups/mysql

# 备份单个数据库
mysqldump -hlocalhost -ufl -pfl10b312 your_database_name > /root/backups/mysql/backup_$(date +%Y%m%d_%H%M%S).sql

# 备份所有数据库
mysqldump -hlocalhost -ufl -pfl10b312 --all-databases > /root/backups/mysql/all_databases_$(date +%Y%m%d_%H%M%S).sql

# 压缩备份
gzip /root/backups/mysql/backup_*.sql
```

#### 自动备份

```bash
# 编辑 crontab
crontab -e

# 添加定时任务（每天凌晨 2 点备份）
0 2 * * * /root/backup-mysql.sh >> /root/backups/mysql/backup.log 2>&1

# 查看定时任务
crontab -l
```

### 6.2 代码备份

```bash
# 备份整个项目
tar -czf /root/backups/aity-vip_$(date +%Y%m%d_%H%M%S).tar.gz /root/aity-vip

# 备份配置文件
cp /root/aity-vip/backend/.env.production /root/backups/.env.production.backup
```

### 6.3 恢复流程

#### 恢复数据库

```bash
# 1. 停止应用
pm2 stop aity-backend

# 2. 恢复数据库
gunzip < /root/backups/mysql/backup_20260414_100000.sql.gz | mysql -hlocalhost -ufl -pfl10b312 your_database_name

# 3. 重启应用
pm2 start aity-backend
```

#### 恢复代码

```bash
# 1. 备份当前代码
cp -r /root/aity-vip /root/aity-vip.backup

# 2. 解压备份
tar -xzf /root/backups/aity-vip_20260414_100000.tar.gz -C /root/

# 3. 重启服务
cd /root/aity-vip/backend
pm2 restart aity-backend
```

---

## 七、安全配置

### 7.1 防火墙配置

```bash
# 查看防火墙状态
firewall-cmd --state

# 开放后端端口
firewall-cmd --permanent --add-port=3001/tcp

# 重载防火墙
firewall-cmd --reload

# 查看已开放端口
firewall-cmd --list-ports
```

### 7.2 腾讯云安全组

1. 登录腾讯云控制台
2. 进入云服务器实例
3. 点击"安全组"
4. 配置规则：
   - 入站规则：允许 TCP 3000 端口
   - 出站规则：允许所有

### 7.3 SSL/TLS 配置

如果需要使用 HTTPS，建议使用 Nginx 反向代理：

```nginx
server {
    listen 443 ssl;
    server_name aity88.online;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://localhost:3000;
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
```

### 7.4 环境变量安全

```bash
# 设置环境变量文件权限
chmod 600 /root/aity-vip/backend/.env.production

# 确保不被 Git 跟踪
echo ".env.production" >> /root/aity-vip/backend/.gitignore
```

---

## 八、附录

### 8.1 常用命令速查表

#### PM2 命令

| 命令 | 说明 |
|------|------|
| `pm2 status` | 查看进程状态 |
| `pm2 logs aity-backend --lines 50` | 查看最近 50 行日志 |
| `pm2 restart aity-backend` | 重启服务 |
| `pm2 stop aity-backend` | 停止服务 |
| `pm2 delete aity-backend` | 删除进程 |
| `pm2 monit` | 实时监控 |
| `pm2 flush` | 清空日志 |
| `pm2 save` | 保存进程列表 |
| `pm2 startup` | 设置开机自启 |

#### 系统命令

| 命令 | 说明 |
|------|------|
| `systemctl status mysqld` | 查看 MySQL 状态 |
| `systemctl start mysqld` | 启动 MySQL |
| `netstat -tlnp \| grep 3000` | 检查端口监听 |
| `tail -f /root/.pm2/logs/aity-backend-error.log` | 实时查看错误日志 |

#### Git 命令

| 命令 | 说明 |
|------|------|
| `git pull origin feature/iteration-1` | 拉取最新代码 |
| `git status` | 查看状态 |
| `git log -5 --oneline` | 查看最近 5 次提交 |
| `git reset --hard origin/feature/iteration-1` | 强制重置到远程分支 |

### 8.2 脚本使用说明

#### 启动服务：`/root/start-aity.sh`

```bash
# 使用方式
bash /root/start-aity.sh

# 功能：
# 1. 检查 MySQL 服务
# 2. 测试数据库连接
# 3. 清理旧进程
# 4. 启动后端服务
# 5. 保存 PM2 配置
```

#### 重启服务：`/root/restart-aity.sh`

```bash
# 使用方式
bash /root/restart-aity.sh

# 功能：
# 1. 重启服务
# 2. 等待服务启动
# 3. 显示服务状态
# 4. 显示最近日志
```

#### 更新代码：`/root/update-aity.sh`

```bash
# 使用方式
bash /root/update-aity.sh

# 功能：
# 1. 拉取最新代码
# 2. 安装依赖
# 3. 重启服务
# 4. 显示状态和日志
```

#### 检查状态：`/root/check-aity.sh`

```bash
# 使用方式
bash /root/check-aity.sh

# 功能：
# 1. 显示 PM2 状态
# 2. 显示内存/CPU 使用
# 3. 健康检查
# 4. 显示最近日志
```

### 8.3 重要路径汇总

| 类型 | 路径 |
|------|------|
| 项目目录 | `/root/aity-vip` |
| 后端目录 | `/root/aity-vip/backend` |
| 入口文件 | `/root/aity-vip/backend/src/index.js` |
| 环境配置 | `/root/aity-vip/backend/.env.production` |
| PM2 日志 | `/root/.pm2/logs/` |
| 应用日志 | `/root/aity-vip/backend/logs/` |
| 上传文件 | `/root/aity-vip/backend/uploads/` |
| 备份目录 | `/root/backups/` |
| 运维脚本 | `/root/*.sh` |

### 8.4 端口使用说明

| 端口 | 服务 | 说明 |
|------|------|------|
| 3000 | 后端 API | Express 服务 |
| 3306 | MySQL | 数据库服务 |

### 8.5 联系信息

- **项目仓库**: https://github.com/AILHJJ/aity-vip
- **文档目录**: `/root/aity-vip/docs/`
- **本地文档**: 本文件 `/root/aity-vip/docs/TENCENT_CLOUD_OPERATIONS_MANUAL.md`

---

## 更新日志

| 日期 | 版本 | 更新内容 |
|------|------|----------|
| 2026-04-14 | v1.0.0 | 初始版本，包含完整的运维操作指南 |

---

**文档维护**: 本文档应随系统变更及时更新，确保信息的准确性和时效性。

**最后更新**: 2026-04-14
**文档版本**: v1.0.0
