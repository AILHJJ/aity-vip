# 🚀 腾讯云服务器快速部署指南

## 📋 前提条件

在开始之前，请确保：

1. ✅ 你有腾讯云服务器的root权限
2. ✅ 域名已解析到服务器IP
3. ✅ 服务器80和443端口已开放

---

## 🎯 方案选择

### 方案A：Let's Encrypt免费SSL证书（推荐）⭐

**优势**：
- ✅ 完全免费
- ✅ 自动续期（无需手动操作）
- ✅ 一键部署，5分钟完成
- ✅ 安全可靠

**适合**：所有用户，特别推荐

### 方案B：手动SSL证书

**适合**：已有购买证书的情况

---

## 🚀 方案A：Let's Encrypt一键部署（推荐）

### 第一步：准备信息

Let's Encrypt申请免费SSL证书需要提供：

1. **域名**：`aity88.online`（你的域名）
2. **邮箱**：`your-email@example.com`（用于证书申请和续期提醒）

**重要**：
- 域名必须已解析到服务器IP
- 邮箱必须是真实有效的邮箱

### 第二步：登录服务器

```bash
ssh root@your_server_ip
```

### 第三步：克隆项目

```bash
# 克隆项目
git clone https://github.com/AILHJJ/aity-vip.git /root/aity-vip

# 进入项目目录
cd /root/aity-vip

# 切换到开发分支
git checkout feature/iteration-1
```

### 第四步：（可选）配置个人信息

如果你想修改域名或邮箱：

```bash
# 1. 复制配置模板
cp scripts/deploy.config.example.sh scripts/deploy.config.sh

# 2. 编辑配置文件
nano scripts/deploy.config.sh

# 3. 修改以下信息
DOMAIN="aity88.online"           # 改为你的域名
EMAIL="your-email@example.com"   # 改为你的邮箱

# 4. 保存并退出（Ctrl+X, Y, Enter）
```

**如果使用默认配置，可以跳过此步骤。**

### 第五步：一键部署

```bash
bash scripts/deploy-with-ssl.sh
```

**脚本会自动完成**：
1. ✅ 安装必要软件（certbot、nginx、git）
2. ✅ 拉取最新代码
3. ✅ 安装后端依赖
4. ✅ 申请Let's Encrypt免费SSL证书
5. ✅ 配置Nginx反向代理
6. ✅ 启动后端服务（PM2）
7. ✅ 配置证书自动续期
8. ✅ 测试访问

**预计时间**：5-10分钟

### 第六步：验证部署

```bash
# 1. 查看服务状态
pm2 status

# 2. 查看证书信息
certbot certificates

# 3. 测试HTTPS访问
curl https://aity88.online/api/health

# 4. 在浏览器访问
# https://aity88.online
```

### 完成！🎉

网站已成功部署，SSL证书会自动续期。

---

## 🔄 日常使用

### 更新代码并重启服务

```bash
ssh root@server
cd /root/aity-vip
bash scripts/update-and-restart.sh
```

### 检查SSL证书有效期

```bash
ssh root@server
bash /root/aity-vip/scripts/check-cert-expiry.sh
```

### 查看服务日志

```bash
# 后端日志
pm2 logs aity-backend --lines 50

# Nginx日志
tail -f /var/log/nginx/aity-error.log
```

---

## 📋 方案B：手动SSL证书部署

如果你有购买的SSL证书：

### 第一步：准备证书文件

将证书文件放到 `ssl-certs/` 目录：

```
ssl-certs/
├── aity88.online.key           # 私钥文件
└── aity88.online_bundle.crt    # 证书文件
```

### 第二步：提交到Git

```bash
git add ssl-certs/
git commit -m "添加SSL证书"
git push origin feature/iteration-1
```

### 第三步：在服务器部署

```bash
ssh root@server
cd /root/aity-vip
git pull origin feature/iteration-1
bash ssl-certs/deploy-ssl.sh
```

---

## ✅ 部署验证清单

部署完成后，请检查：

### 基础检查
- [ ] PM2服务运行正常（`pm2 status`）
- [ ] Nginx运行正常（`systemctl status nginx`）
- [ ] 证书申请成功（`certbot certificates`）

### 访问测试
- [ ] https://aity88.online 可以访问
- [ ] http://aity88.online 自动跳转到HTTPS
- [ ] https://aity88.online/api/health 返回正常
- [ ] 浏览器地址栏显示锁图标🔒

### 功能测试
- [ ] 后端API可以正常调用
- [ ] 小程序可以正常访问
- [ ] 健康检查接口正常

---

## 🛠️ 常见问题

### Q1: 证书申请失败

**原因**：域名未解析到服务器

**解决**：
```bash
# 检查DNS解析
nslookup aity88.online

# 等待DNS生效后重试（可能需要几分钟到几小时）
```

### Q2: 端口被占用

**解决**：
```bash
# 检查80端口
netstat -tlnp | grep :80

# 停止占用端口的服务
systemctl stop nginx  # 如果Nginx已运行

# 然后重新运行部署脚本
```

### Q3: 防火墙阻止

**解决**：
```bash
# 开放必要端口
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 3001/tcp

# 或使用腾讯云安全组配置
```

### Q4: 自动续期不工作

**解决**：
```bash
# 检查crontab
crontab -l | grep certbot

# 手动测试续期
certbot renew --dry-run

# 重新配置自动续期
(crontab -l 2>/dev/null; echo "0 2 * * * certbot renew --quiet --post-hook 'systemctl reload nginx'") | crontab -
```

---

## 📊 维护建议

### 定期检查

建议每周或每月检查一次：

```bash
# 1. 检查服务状态
pm2 status

# 2. 检查证书有效期
bash /root/aity-vip/scripts/check-cert-expiry.sh

# 3. 检查磁盘空间
df -h

# 4. 检查内存使用
free -h
```

### 设置证书到期提醒

添加到crontab（每周一上午9点检查）：

```bash
crontab -e
# 添加以下行
0 9 * * 1 /root/aity-vip/scripts/check-cert-expiry.sh
```

### 备份重要数据

```bash
# 创建备份脚本
cat > /root/backup.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/root/backups/aity-vip"
mkdir -p $BACKUP_DIR

# 备份配置文件
cp /root/aity-vip/backend/.env $BACKUP_DIR/

# 备份证书（如果使用手动证书）
mkdir -p $BACKUP_DIR/ssl
cp /etc/nginx/ssl/* $BACKUP_DIR/ssl/ 2>/dev/null || true

# 打包
tar -czf $BACKUP_DIR/backup-$(date +%Y%m%d).tar.gz $BACKUP_DIR/

echo "备份完成: $BACKUP_DIR/backup-$(date +%Y%m%d).tar.gz"
EOF

chmod +x /root/backup.sh

# 添加到crontab（每周日凌晨3点备份）
crontab -e
# 添加: 0 3 * * 0 /root/backup.sh
```

---

## 📞 获取帮助

### 查看日志

```bash
# 后端日志
pm2 logs aity-backend

# Nginx错误日志
tail -f /var/log/nginx/aity-error.log

# Let's Encrypt日志
journalctl -u certbot.timer -n 50
```

### 重新部署

如果遇到无法解决的问题：

```bash
cd /root/aity-vip
git pull origin feature/iteration-1
bash scripts/deploy-with-ssl.sh
```

### 查看详细文档

在服务器上查看：

```bash
# 脚本使用说明
cat /root/aity-vip/scripts/README.md

# SSL解决方案
cat /root/aity-vip/docs/PRAGMATIC_SSL_SOLUTION.md

# 配置文件说明
cat /root/aity-vip/scripts/deploy.config.example.sh
```

---

## 🎯 总结

### 最简单的部署方式

```bash
# 登录服务器
ssh root@server

# 一键部署（5分钟搞定）
git clone https://github.com/AILHJJ/aity-vip.git /root/aity-vip
cd /root/aity-vip
git checkout feature/iteration-1
bash scripts/deploy-with-ssl.sh
```

### 日常维护

```bash
# 更新代码
ssh root@server
cd /root/aity-vip
bash scripts/update-and-restart.sh

# 检查证书
bash /root/aity-vip/scripts/check-cert-expiry.sh
```

### 优势

- ✅ **免费**：Let's Encrypt完全免费
- ✅ **自动**：证书自动续期，无需手动操作
- ✅ **简单**：一键部署，无需专业知识
- ✅ **安全**：使用行业标准的SSL证书
- ✅ **可靠**：Let's Encrypt被全球数百万网站使用

---

**推荐使用Let's Encrypt免费证书，省心省力，一次配置，终身免费！** ⭐

需要帮助？查看 `scripts/README.md` 或 `docs/PRAGMATIC_SSL_SOLUTION.md`
