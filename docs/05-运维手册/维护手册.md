# 系统维护手册

> **文档类型**: 运维文档
> **创建日期**: 2026-03-05
> **最后更新**: 2026-03-05
> **维护人员**: 运维团队
> **适用版本**: v2.0.0

---

## 文档概述

本文档是VIP投研内部分享系统的系统维护手册，提供详细的日常维护流程、备份策略和定期维护计划，确保系统稳定运行。

---

## 目录

- [日常维护](#日常维护)
  - [服务器监控](#服务器监控)
  - [日志管理](#日志管理)
  - [备份策略](#备份策略)
- [定期维护](#定期维护)
  - [每周维护](#每周维护)
  - [每月维护](#每月维护)
- [性能优化](#性能优化)
  - [服务器优化](#服务器优化)
  - [应用优化](#应用优化)

---

## 日常维护

### 服务器监控

**监控内容**：
- CPU使用率
- 内存使用率
- 磁盘使用率
- 网络流量
- 进程状态
- 服务状态

**监控工具**：
- **宝塔面板**：提供可视化监控界面
- **top**：实时查看系统资源使用情况
- **free**：查看内存使用情况
- **df**：查看磁盘使用情况
- **netstat**：查看网络连接情况

**监控命令**：

```bash
# 实时查看系统资源
top

# 查看内存使用情况
free -h

# 查看磁盘使用情况
df -h

# 查看网络连接情况
netstat -tuln

# 查看进程状态
ps aux | grep node
```

### 日志管理

**日志位置**：

| 服务 | 日志位置 | 说明 |
|------|----------|------|
| **后端服务** | `backend/logs/` | 应用日志 |
| **Nginx** | `/var/log/nginx/` | Web服务器日志 |
| **MySQL** | `/var/log/mysql/` | 数据库日志 |
| **PM2** | `~/.pm2/logs/` | 进程管理日志 |

**日志查看命令**：

```bash
# 查看后端服务日志
cd backend
npm run logs

# 查看Nginx访问日志
tail -f /var/log/nginx/access.log

# 查看Nginx错误日志
tail -f /var/log/nginx/error.log

# 查看MySQL日志
tail -f /var/log/mysql/error.log

# 查看PM2日志
pm logs
```

### 备份策略

**文件备份**：

| 内容 | 备份频率 | 备份位置 | 保留时间 |
|------|----------|----------|----------|
| **项目代码** | 每日 | 远程仓库 | 永久 |
| **数据库** | 每日 | 本地 + 远程 | 7天 |
| **配置文件** | 每周 | 本地 + 远程 | 30天 |
| **日志文件** | 每周 | 本地 | 14天 |

**备份命令**：

```bash
# 备份数据库
mysqldump -u fl -p 投研图灵室 > /root/backups/db_backup_$(date +%Y%m%d).sql

# 压缩备份文件
tar -czf /root/backups/db_backup_$(date +%Y%m%d).tar.gz /root/backups/db_backup_$(date +%Y%m%d).sql

# 删除旧备份文件
find /root/backups -name "db_backup_*.sql" -mtime +7 -delete
find /root/backups -name "db_backup_*.tar.gz" -mtime +7 -delete
```

**自动备份脚本**：

```bash
# 创建备份脚本
cat > /root/scripts/backup.sh << 'EOF'
#!/bin/bash

# 备份脚本

# 创建备份目录
mkdir -p /root/backups

# 备份数据库
echo "开始备份数据库..."
mysqldump -u fl -pfl10b312 投研图灵室 > /root/backups/db_backup_$(date +%Y%m%d).sql

# 压缩备份文件
echo "压缩备份文件..."
tar -czf /root/backups/db_backup_$(date +%Y%m%d).tar.gz /root/backups/db_backup_$(date +%Y%m%d).sql

# 删除旧备份文件
echo "清理旧备份文件..."
find /root/backups -name "db_backup_*.sql" -mtime +7 -delete
find /root/backups -name "db_backup_*.tar.gz" -mtime +7 -delete

echo "备份完成！"
EOF

# 添加执行权限
chmod +x /root/scripts/backup.sh

# 添加到crontab
(crontab -l 2>/dev/null; echo "0 0 * * * /root/scripts/backup.sh") | crontab -
```

---

## 定期维护

### 每周维护

**1. 系统更新**：
```bash
apt-get update
apt-get upgrade -y
```

**2. 依赖更新**：
```bash
cd backend
npm update

cd ../aity-uni-app-new
npm update
```

**3. 磁盘清理**：
```bash
# 清理系统垃圾
apt-get clean
apt-get autoclean

# 清理日志文件
find /var/log -name "*.log" -type f -exec truncate -s 0 {} \;
```

**4. 数据库优化**：
```bash
# 优化数据库表
mysqlcheck -u fl -p --optimize --all-databases
```

### 每月维护

**1. 安全审计**：
- 检查系统安全漏洞
- 更新SSL证书
- 检查防火墙配置

**2. 性能优化**：
- 分析系统性能瓶颈
- 优化数据库查询
- 调整Nginx配置

**3. 备份检查**：
- 验证备份文件完整性
- 测试备份恢复流程

**4. 系统重启**：
- 计划系统重启，应用所有更新

---

## 性能优化

### 服务器优化

#### 系统参数优化

**TCP优化**：

```bash
# 编辑系统配置文件
cat > /etc/sysctl.d/tcp-optimization.conf << 'EOF'
# TCP优化
net.core.somaxconn = 65535
net.ipv4.tcp_max_syn_backlog = 65535
net.ipv4.tcp_fin_timeout = 30
net.ipv4.tcp_keepalive_time = 300
net.ipv4.tcp_keepalive_probes = 5
net.ipv4.tcp_keepalive_intvl = 15
EOF

# 应用配置
sysctl -p /etc/sysctl.d/tcp-optimization.conf
```

**文件描述符优化**：

```bash
# 编辑限制配置文件
cat > /etc/security/limits.d/nofile.conf << 'EOF'
* soft nofile 65535
* hard nofile 65535
EOF

# 查看当前限制
ulimit -n
```

#### Nginx优化

**配置优化**：

```nginx
# 编辑Nginx配置
cat > /etc/nginx/nginx.conf << 'EOF'
user www-data;
worker_processes auto;
worker_rlimit_nofile 65535;
events {
    worker_connections 10240;
    use epoll;
}
http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    # 日志配置
    access_log off;
    error_log /var/log/nginx/error.log warn;

    # 连接配置
    keepalive_timeout 65;
    keepalive_requests 10000;

    # 压缩配置
    gzip on;
    gzip_comp_level 6;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # 缓存配置
    open_file_cache max=10000 inactive=20s;
    open_file_cache_valid 30s;
    open_file_cache_min_uses 2;
    open_file_cache_errors on;

    # 其他配置
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;

    include /etc/nginx/conf.d/*.conf;
    include /etc/nginx/sites-enabled/*;
}
EOF

# 重启Nginx
systemctl restart nginx
```

### 应用优化

#### 后端优化

**1. 数据库优化**：
- **索引优化**：为频繁查询的字段添加索引
- **查询优化**：优化SQL查询语句，避免全表扫描
- **连接池优化**：合理配置数据库连接池
- **缓存使用**：使用Redis缓存热点数据

**2. 代码优化**：
- **异步处理**：使用async/await处理异步操作
- **中间件优化**：合理使用中间件，避免过多中间件
- **错误处理**：完善错误处理机制
- **日志优化**：合理配置日志级别，避免过多日志

**3. 缓存优化**：
- **使用Redis**：缓存热点数据和API响应
- **缓存策略**：合理设置缓存过期时间
- **缓存失效处理**：处理缓存失效的情况

#### 前端优化

**1. 资源优化**：
- **代码分割**：使用代码分割减少首屏加载时间
- **资源压缩**：压缩CSS、JavaScript、图片等资源
- **懒加载**：使用懒加载加载非首屏资源
- **CDN使用**：使用CDN加速静态资源

**2. 性能优化**：
- **减少HTTP请求**：合并CSS、JavaScript文件
- **使用HTTP/2**：启用HTTP/2协议
- **浏览器缓存**：合理设置缓存头
- **预加载**：使用预加载提升用户体验

**3. 小程序优化**：
- **代码包大小**：控制代码包大小，避免超过限制
- **启动速度**：优化小程序启动速度
- **页面渲染**：优化页面渲染性能
- **网络请求**：减少网络请求，使用缓存

---

## 相关文档

- [监控指南](./monitoring.md) - 监控配置和告警规则
- [故障排查](./troubleshooting.md) - 常见问题和解决方案
- [部署手册](../02-deployment/deployment-guide.md) - 部署流程和配置
- [API文档](../04-api/api-reference.md) - API接口说明

---

**维护团队**: 运维团队
**最后更新**: 2026-03-05
**版本**: v1.0.0
