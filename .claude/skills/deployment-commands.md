# 部署命令参考

> 常用部署命令和流程速查

---

## 服务器信息

| 配置项 | 值 |
|--------|-----|
| 服务器IP | 124.221.119.134 |
| 域名 | aity88.online |
| SSH端口 | 22 |
| HTTPS端口 | 8443 |
| 用户 | root |

---

## 本地开发命令

### 启动服务
```bash
# 后端（在 backend/ 目录）
npm run dev

# H5 前端（在 aity-uni-app-v2/ 目录）
npm run dev:h5

# 小程序（在 aity-uni-app-v2/ 目录）
npm run dev:mp-weixin
```

### 编译构建
```bash
# 编译 H5
cd aity-uni-app-v2
npm run build:h5

# 编译微信小程序
npm run build:mp-weixin
```

---

## 部署方案选择

| 场景 | 方案 | 命令 |
|------|------|------|
| 完整部署 | 本地编译+上传 | `scripts/full-deploy.bat` |
| 仅后端更新 | SSH拉取+重启 | `scripts/deploy-backend.bat` |
| 仅前端更新 | 编译+上传 | `scripts/upload-h5-to-server.bat` |

---

## 方案1：完整部署（推荐）

### Windows 本地执行
```batch
cd D:\your-mcp-proxy\AITY_VIP\aity-uni-app-v2\scripts
full-deploy.bat
```

自动完成：
1. 本地编译 H5
2. 压缩并上传到服务器
3. 更新后端代码
4. 重启后端服务
5. 部署 H5 到 Web 目录

---

## 方案2：仅更新后端

### SSH 到服务器执行
```bash
ssh root@aity88.online

# 拉取代码并重启
cd /root/AITY_VIP/backend
git pull origin feature/iteration-1
npm install  # 如有新依赖
pm2 restart aity-vip-backend
```

### 或使用本地脚本
```batch
cd D:\your-mcp-proxy\AITY_VIP\aity-uni-app-v2\scripts
deploy-backend.bat
```

---

## 方案3：仅更新前端

### 本地编译后上传
```batch
cd D:\your-mcp-proxy\AITY_VIP\aity-uni-app-v2
npm run build:h5
cd scripts
upload-h5-to-server.bat
```

---

## PM2 常用命令

```bash
# 查看服务状态
pm2 status

# 查看日志
pm2 logs aity-vip-backend --lines 50

# 查看错误日志
pm2 logs aity-vip-backend --err

# 重启服务
pm2 restart aity-vip-backend

# 停止服务
pm2 stop aity-vip-backend

# 监控
pm2 monit
```

---

## Nginx 常用命令

```bash
# 测试配置
nginx -t

# 重新加载配置
systemctl reload nginx

# 重启 Nginx
systemctl restart nginx

# 查看状态
systemctl status nginx

# 查看日志
tail -f /var/log/nginx/error.log
tail -f /var/log/nginx/access.log
```

---

## Git 工作流

### 日常提交
```bash
# 查看状态
git status

# 添加修改
git add .

# 提交（使用规范格式）
git commit -m "feat(module): 功能描述"

# 推送
git push origin feature/iteration-1
```

### Commit 类型
| 类型 | 说明 |
|------|------|
| `feat` | 新功能 |
| `fix` | Bug修复 |
| `docs` | 文档更新 |
| `style` | 代码格式 |
| `refactor` | 重构 |
| `perf` | 性能优化 |
| `test` | 测试 |
| `chore` | 构建/工具 |

---

## 小程序发布

### 1. 编译
```bash
cd aity-uni-app-v2
npm run build:mp-weixin
```

### 2. 微信开发者工具
1. 导入项目：`dist/build/mp-weixin`
2. 预览测试
3. 上传代码
4. 提交审核

---

## 故障排查

### 后端服务无响应
```bash
# 检查服务状态
pm2 status

# 查看错误日志
pm2 logs aity-vip-backend --err --lines 100

# 重启服务
pm2 restart aity-vip-backend
```

### 前端页面空白
```bash
# 检查 Nginx
nginx -t
systemctl status nginx

# 检查文件是否存在
ls -la /var/www/html/h5/

# 查看错误日志
tail -f /var/log/nginx/error.log
```

### 数据库连接失败
```bash
# 检查 MySQL 服务
systemctl status mysql

# 测试连接
mysql -h 124.221.119.134 -u fl -p
```

---

## 快速检查脚本

```bash
#!/bin/bash
# 一键检查所有服务

echo "=== 后端服务 ==="
pm2 status

echo "=== Nginx ==="
systemctl status nginx --no-pager

echo "=== MySQL ==="
systemctl status mysql --no-pager

echo "=== 磁盘空间 ==="
df -h

echo "=== 内存使用 ==="
free -m
```

---

**详细文档**: `docs/core/部署手册.md`
**更新**: 2026-02-28
