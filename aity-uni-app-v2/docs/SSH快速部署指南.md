# SSH快速部署指南

**更新日期**: 2026-04-23
**用途**: 腾讯云服务器快速部署更新

---

## 🔑 SSH连接配置

### 服务器信息

| 项目 | 值 |
|------|-----|
| **服务器IP** | 124.221.119.134 |
| **用户名** | root |
| **SSH密钥** | `D:\your-mcp-proxy\AITY_VIP\aity-uni-app-v2\AITY0127.pem` |
| **后端目录** | `/root/aity-vip/backend` |
| **前端目录** | `/var/www/html/h5` |
| **PM2进程名** | aity-backend |

### SSH连接命令

```bash
ssh -i "D:\your-mcp-proxy\AITY_VIP\aity-uni-app-v2\AITY0127.pem" root@124.221.119.134
```

---

## 🚀 快速部署流程

### 1. 仅更新后端代码（最快）

```bash
# 更新后端代码 + 重启服务
ssh -i "D:\your-mcp-proxy\AITY_VIP\aity-uni-app-v2\AITY0127.pem" root@124.221.119.134 "cd /root/aity-vip/backend && git pull origin feature/iteration-1 && pm2 restart ecosystem.config.js"
```

### 2. 完整部署（前端+后端）

**步骤1: 编译前端**
```bash
cd D:\your-mcp-proxy\AITY_VIP\aity-uni-app-v2
npm run build:h5
```

**步骤2: 上传前端到服务器**
```bash
cd dist\build\h5
scp -i "D:\your-mcp-proxy\AITY_VIP\aity-uni-app-v2\AITY0127.pem" -r . root@124.221.119.134:/var/www/html/h5
```

**步骤3: 更新后端并重启**
```bash
ssh -i "D:\your-mcp-proxy\AITY_VIP\aity-uni-app-v2\AITY0127.pem" root@124.221.119.134 "cd /root/aity-vip/backend && git pull origin feature/iteration-1 && pm2 restart ecosystem.config.js"
```

---

## 📋 常用SSH命令

### 查看PM2服务状态
```bash
ssh -i "D:\your-mcp-proxy\AITY_VIP\aity-uni-app-v2\AITY0127.pem" root@124.221.119.134 "pm2 list"
```

### 查看后端日志
```bash
ssh -i "D:\your-mcp-proxy\AITY_VIP\aity-uni-app-v2\AITY0127.pem" root@124.221.119.134 "pm2 logs aity-backend --lines 50"
```

### 重启后端服务
```bash
ssh -i "D:\your-mcp-proxy\AITY_VIP\aity-uni-app-v2\AITY0127.pem" root@124.221.119.134 "pm2 restart ecosystem.config.js"
```

### 查看后端Git状态
```bash
ssh -i "D:\your-mcp-proxy\AITY_VIP\aity-uni-app-v2\AITY0127.pem" root@124.221.119.134 "cd /root/aity-vip/backend && git status"
```

### 查看后端Git日志
```bash
ssh -i "D:\your-mcp-proxy\AITY_VIP\aity-uni-app-v2\AITY0127.pem" root@124.221.119.134 "cd /root/aity-vip/backend && git log --oneline -5"
```

---

## 🔧 故障排查

### 1. 后端服务无法启动
```bash
# 查看详细错误日志
ssh -i "D:\your-mcp-proxy\AITY_VIP\aity-uni-app-v2\AITY0127.pem" root@124.221.119.134 "pm2 logs aity-backend --err"

# 检查端口占用
ssh -i "D:\your-mcp-proxy\AITY_VIP\aity-uni-app-v2\AITY0127.pem" root@124.221.119.134 "lsof -i :3001"

# 检查Node.js版本
ssh -i "D:\your-mcp-proxy\AITY_VIP\aity-uni-app-v2\AITY0127.pem" root@124.221.119.134 "node -v"
```

### 2. 前端无法访问
```bash
# 检查Nginx状态
ssh -i "D:\your-mcp-proxy\AITY_VIP\aity-uni-app-v2\AITY0127.pem" root@124.221.119.134 "systemctl status nginx"

# 检查前端文件
ssh -i "D:\your-mcp-proxy\AITY_VIP\aity-uni-app-v2\AITY0127.pem" root@124.221.119.134 "ls -la /var/www/html/h5"

# 查看Nginx错误日志
ssh -i "D:\your-mcp-proxy\AITY_VIP\aity-uni-app-v2\AITY0127.pem" root@124.221.119.134 "tail -50 /var/log/nginx/error.log"
```

### 3. Git Pull失败
```bash
# 查看Git远程仓库
ssh -i "D:\your-mcp-proxy\AITY_VIP\aity-uni-app-v2\AITY0127.pem" root@124.221.119.134 "cd /root/aity-vip/backend && git remote -v"

# 强制重置到远程分支（谨慎使用）
ssh -i "D:\your-mcp-proxy\AITY_VIP\aity-uni-app-v2\AITY0127.pem" root@124.221.119.134 "cd /root/aity-vip/backend && git reset --hard origin/feature/iteration-1"
```

---

## 📊 部署验证

### 验证后端健康
```bash
curl https://aity88.online:8443/api/health
```

### 验证前端访问
```bash
curl http://124.221.119.134/h5/
```

---

## 🎯 部署检查清单

- [ ] 代码已提交到Git
- [ ] 代码已推送到GitHub远程仓库
- [ ] 后端代码已更新（git pull）
- [ ] 后端服务已重启（pm2 restart）
- [ ] PM2服务状态正常
- [ ] 前端已编译（npm run build:h5）
- [ ] 前端已上传（scp）
- [ ] 验证访问地址正常

---

## 📝 相关文档

- **统一部署脚本使用指南.md**: 完整的部署方案说明
- **H5部署指南.md**: H5前端详细部署说明
- **Git代码同步与部署总结.md**: Git同步流程

---

**重要提示**:
1. ⚠️ SSH密钥文件 `AITY0127.pem` 不要提交到Git
2. ⚠️ 每次部署前先确认代码已推送到GitHub
3. ⚠️ 部署后务必验证服务状态
4. ✅ feature/iteration-1 为当前开发分支

**最后更新**: 2026-04-23
**维护者**: 开发团队
