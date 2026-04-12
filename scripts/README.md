# 部署脚本使用说明

## 📋 脚本列表

### 一键部署脚本

1. **deploy-with-ssl.sh** - Let's Encrypt免费SSL一键部署（推荐）⭐
   - 自动申请免费SSL证书
   - 配置Nginx反向代理
   - 启动后端服务
   - 配置证书自动续期

2. **full-deploy.sh** - 完整部署脚本
   - 拉取最新代码
   - 安装依赖
   - 部署SSL证书（如果有）
   - 启动后端服务

3. **update-and-restart.sh** - 快速更新并重启
   - 拉取最新代码
   - 重启服务
   - 适用于日常更新

### 监控脚本

4. **check-cert-expiry.sh** - SSL证书有效期检查
   - 检查证书过期时间
   - 提前30天警告
   - 可配置定时任务

### 其他工具

5. **ssl-certs/deploy-ssl.sh** - 手动SSL证书部署
   - 部署购买的SSL证书
   - 配置Nginx
   - 适用于有证书的情况

---

## 🚀 快速开始

### 首次部署（推荐）

```bash
# 1. 登录服务器
ssh root@your_server_ip

# 2. 克隆项目
git clone https://github.com/AILHJJ/aity-vip.git /root/aity-vip
cd /root/aity-vip
git checkout feature/iteration-1

# 3. （可选）配置个人信息
cp scripts/deploy.config.example.sh scripts/deploy.config.sh
nano scripts/deploy.config.sh
# 修改域名、邮箱等信息

# 4. 一键部署（包含SSL证书）
bash scripts/deploy-with-ssl.sh
```

**就这么简单！** 🎉

脚本会自动完成：
- ✅ 安装必要软件（certbot、nginx、git）
- ✅ 申请Let's Encrypt免费SSL证书
- ✅ 配置Nginx反向代理
- ✅ 启动后端服务
- ✅ 配置证书自动续期
- ✅ 测试访问

### 日常更新

```bash
# 在服务器上执行
cd /root/aity-vip
bash scripts/update-and-restart.sh
```

---

## 📝 配置文件说明

### deploy.config.example.sh

配置文件模板，包含所有可配置项：

```bash
# 必填项
DOMAIN="aity88.online"           # 你的域名
EMAIL="your-email@example.com"   # 你的邮箱

# 可选项（使用默认值即可）
BACKEND_PORT="3001"
PROJECT_DIR="/root/aity-vip"
```

### 使用配置文件

```bash
# 1. 复制配置模板
cp scripts/deploy.config.example.sh scripts/deploy.config.sh

# 2. 编辑配置文件
nano scripts/deploy.config.sh

# 3. 在部署脚本中使用配置
source scripts/deploy.config.sh
```

---

## 🔧 常见使用场景

### 场景1：首次部署，使用免费SSL证书

```bash
ssh root@server
cd /root/aity-vip
bash scripts/deploy-with-ssl.sh
```

### 场景2：已有SSL证书，手动部署

```bash
# 1. 将证书文件放到 ssl-certs/ 目录
# 2. 提交到Git
git add ssl-certs/
git commit -m "添加SSL证书"
git push

# 3. 在服务器部署
ssh root@server
cd /root/aity-vip
git pull
bash ssl-certs/deploy-ssl.sh
```

### 场景3：代码更新，重启服务

```bash
ssh root@server
cd /root/aity-vip
bash scripts/update-and-restart.sh
```

### 场景4：检查SSL证书有效期

```bash
ssh root@server
bash /root/aity-vip/scripts/check-cert-expiry.sh
```

---

## 📋 Let's Encrypt免费证书信息

### 需要提供的信息

使用Let's Encrypt申请免费证书，需要：

1. **域名** - 必须已解析到服务器IP
   - 例如：aity88.online
   - 包括：aity88.online 和 www.aity88.online

2. **邮箱地址** - 用于证书申请和续期提醒
   - 例如：admin@example.com
   - 必须是真实有效的邮箱

### 证书申请过程

脚本会自动：
1. 检测域名DNS解析
2. 停止Nginx（使用standalone模式）
3. 向Let's Encrypt申请证书
4. 配置Nginx使用证书
5. 启动服务

### 证书续期

证书有效期：90天

自动续期：脚本会配置每天凌晨2点自动检查并续期

```bash
# 手动测试续期
certbot renew --dry-run

# 手动强制续期
certbot renew --force-renewal
```

---

## ✅ 部署检查清单

部署完成后，检查以下项目：

### 基础检查

- [ ] 证书申请成功
- [ ] Nginx运行正常
- [ ] 后端服务运行正常
- [ ] HTTP自动重定向到HTTPS

### 访问测试

- [ ] https://aity88.online 可以访问
- [ ] http://aity88.online 自动跳转到HTTPS
- [ ] https://aity88.online/api/health 返回正常
- [ ] 浏览器不显示安全警告

### 服务检查

```bash
# 检查Nginx
systemctl status nginx

# 检查后端服务
pm2 status

# 检查证书
certbot certificates

# 检查端口
netstat -tlnp | grep -E ':(80|443|3001)'

# 测试访问
curl https://aity88.online/api/health
```

---

## 🛠️ 故障排查

### 问题1：证书申请失败

**可能原因**：
- 域名未解析到服务器
- 80端口被占用
- 防火墙未开放80端口

**解决方法**：
```bash
# 检查DNS解析
nslookup aity88.online

# 检查80端口
netstat -tlnp | grep :80

# 开放防火墙端口
ufw allow 80/tcp
ufw allow 443/tcp
```

### 问题2：HTTPS无法访问

**可能原因**：
- Nginx配置错误
- 证书文件路径错误
- 防火墙未开放443端口

**解决方法**：
```bash
# 检查Nginx配置
nginx -t

# 查看Nginx日志
tail -f /var/log/nginx/error.log

# 重载Nginx
systemctl reload nginx
```

### 问题3：后端服务无法访问

**可能原因**：
- PM2进程未运行
- 后端服务启动失败
- 端口3001被占用

**解决方法**：
```bash
# 查看PM2状态
pm2 status

# 查看错误日志
pm2 logs aity-backend --err

# 重启服务
pm2 restart aity-backend
```

---

## 📞 获取帮助

### 查看日志

```bash
# Nginx日志
tail -f /var/log/nginx/aity-error.log
tail -f /var/log/nginx/aity-access.log

# 后端日志
pm2 logs aity-backend

# 系统日志
journalctl -u nginx -n 50
```

### 重新部署

如果遇到无法解决的问题，可以重新部署：

```bash
cd /root/aity-vip
bash scripts/deploy-with-ssl.sh
```

### 查看详细文档

- `docs/PRAGMATIC_SSL_SOLUTION.md` - 完整SSL解决方案
- `docs/SSL_CERTIFICATE_SECURITY_ALERT.md` - SSL安全说明
- `ssl-certs/README.md` - SSL证书目录说明

---

## 🎯 总结

### 最简单的使用方式

```bash
# 首次部署（一键搞定）
ssh root@server
cd /root/aity-vip
bash scripts/deploy-with-ssl.sh

# 日常更新（一键重启）
ssh root@server
cd /root/aity-vip
bash scripts/update-and-restart.sh
```

### 优势

- ✅ 一键部署，无需手动配置
- ✅ Let's Encrypt免费SSL，自动续期
- ✅ 适合非专业团队
- ✅ 从Git拉取即用
- ✅ 完整的错误处理和日志

---

**推荐使用Let's Encrypt免费证书，省心省力！** ⭐
