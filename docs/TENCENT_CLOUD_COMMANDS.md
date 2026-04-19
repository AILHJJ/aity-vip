# 腾讯云服务器操作命令手册

## 📋 快速参考

### 服务器信息
- **域名**: `aity88.online`
- **SSH登录**: `ssh root@aity88.online`
- **项目路径**: `/root/aity-vip`
- **后端端口**: `3001`
- **HTTPS端口**: `8443`

### Git仓库信息
- **仓库地址**: `https://github.com/AILHJJ/aity-vip.git`
- **开发分支**: `feature/iteration-1`
- **用户名**: `AILHJJ`
- **访问令牌**: `YOUR_GITHUB_TOKEN_HERE`（请查看本地Git配置或密码管理器）

⚠️ **获取Token**:
- 登录GitHub账号
- 访问 https://github.com/settings/tokens
- 生成新的Personal Access Token
- 选择完全访问权限（repo）
- 复制token并妥善保管

---

## 🚀 一、首次部署命令

### 方式一：一键部署（Let's Encrypt免费SSL）⭐ 推荐

```bash
# 1. 登录服务器
ssh root@aity88.online

# 2. 一键克隆并部署（包含免费SSL证书）
git clone https://github.com/AILHJJ/aity-vip.git /root/aity-vip && \
cd /root/aity-vip && \
git checkout feature/iteration-1 && \
bash scripts/deploy-with-ssl.sh
```

**自动完成**：
- ✅ 安装必要软件（certbot、nginx、git）
- ✅ 拉取最新代码
- ✅ 安装后端依赖
- ✅ 申请Let's Encrypt免费SSL证书
- ✅ 配置Nginx反向代理
- ✅ 启动后端服务（PM2）
- ✅ 配置证书自动续期
- ✅ 测试访问

**执行时间**：约5-10分钟

---

### 方式二：手动SSL证书部署

如果已有购买的SSL证书：

```bash
# 1. 登录服务器
ssh root@aity88.online

# 2. 克隆项目
git clone https://github.com/AILHJJ/aity-vip.git /root/aity-vip
cd /root/aity-vip
git checkout feature/iteration-1

# 3. 部署SSL证书
bash ssl-certs/deploy-ssl.sh
```

---

## 🔄 二、日常更新命令

### 更新代码并重启服务

```bash
# 1. 登录服务器
ssh root@aity88.online

# 2. 进入项目目录
cd /root/aity-vip

# 3. 拉取最新代码
git pull origin feature/iteration-1

# 4. 快速更新并重启
bash scripts/update-and-restart.sh
```

**或者一行命令**：

```bash
ssh root@aity88.online "cd /root/aity-vip && git pull origin feature/iteration-1 && bash scripts/update-and-restart.sh"
```

---

## 📊 三、服务监控命令

### 查看服务状态

```bash
# 登录服务器
ssh root@aity88.online

# 查看PM2状态
pm2 status

# 查看后端日志（最近50行）
pm2 logs aity-backend --lines 50

# 查看Nginx状态
systemctl status nginx

# 测试后端健康检查
curl http://localhost:3001/api/health

# 测试HTTPS访问
curl https://aity88.online/api/health
```

### 查看实时日志

```bash
# PM2实时日志
pm2 logs aity-backend

# Nginx访问日志
tail -f /var/log/nginx/aity-access.log

# Nginx错误日志
tail -f /var/log/nginx/aity-error.log
```

### 系统资源监控

```bash
# 系统资源
htop

# 磁盘使用
df -h

# 内存使用
free -h

# 端口占用
netstat -tlnp | grep -E ':(80|443|3001)'
```

---

## 🔧 四、PM2进程管理命令

### 常用PM2命令

```bash
# 查看所有进程
pm2 status

# 查看进程详情
pm2 show aity-backend

# 查看日志
pm2 logs aity-backend

# 重启服务
pm2 restart aity-backend

# 停止服务
pm2 stop aity-backend

# 删除服务
pm2 delete aity-backend

# 监控资源
pm2 monit

# 保存进程列表
pm2 save

# 查看启动日志
pm2 startup
```

---

## 🔐 五、SSL证书管理命令

### Let's Encrypt证书管理

```bash
# 查看证书信息
certbot certificates

# 手动续期
certbot renew

# 强制续期
certbot renew --force-renewal

# 测试续期
certbot renew --dry-run

# 查看续期定时任务
crontab -l | grep certbot
```

### 检查证书有效期

```bash
# 使用项目脚本检查
bash /root/aity-vip/scripts/check-cert-expiry.sh
```

---

## 🛠️ 六、Nginx管理命令

```bash
# 测试Nginx配置
nginx -t

# 重载Nginx
nginx -s reload

# 重启Nginx
systemctl restart nginx

# 查看Nginx状态
systemctl status nginx

# 查看Nginx错误日志
tail -f /var/log/nginx/aity-error.log

# 查看Nginx访问日志
tail -f /var/log/nginx/aity-access.log
```

---

## 📝 七、Git操作命令

```bash
# 查看当前分支
git branch

# 查看状态
git status

# 查看最近提交
git log -5 --oneline

# 拉取最新代码
git pull origin feature/iteration-1

# 查看远程仓库
git remote -v

# 切换分支
git checkout feature/iteration-1
```

---

## 🔄 八、完整部署流程

### 后端更新流程

```bash
# 1. 本地修改并提交
git add .
git commit -m "feat: 功能描述"
git push origin feature/iteration-1

# 2. 服务器更新
ssh root@aity88.online
cd /root/aity-vip
git pull origin feature/iteration-1

# 3. 安装依赖（如有新增）
cd backend
npm install

# 4. 重启服务
pm2 restart aity-backend

# 5. 验证
pm2 status
curl http://localhost:3001/api/health
```

### 小程序更新流程

```bash
# 1. 本地编译
cd aity-uni-app-v2
npm run build:mp-weixin

# 2. 微信开发者工具上传
# 项目路径: dist/build/mp-weixin
# 版本号: 1.6.x
# 版本描述: 更新说明

# 3. 提交审核
# 4. 等待审核通过
```

---

## 🚨 九、故障排查命令

### 问题1：后端服务无法启动

```bash
# 1. 查看PM2日志
pm2 logs aity-backend --err

# 2. 手动运行测试
cd /root/aity-vip/backend
npm run dev

# 3. 检查端口占用
netstat -tlnp | grep 3001

# 4. 检查环境变量
cat .env
```

### 问题2：SSL证书过期

```bash
# 自动续期
certbot renew

# 重载Nginx
systemctl reload nginx

# 检查证书
certbot certificates
```

### 问题3：HTTPS无法访问

```bash
# 1. 检查Nginx配置
nginx -t

# 2. 查看Nginx日志
tail -f /var/log/nginx/aity-error.log

# 3. 重载Nginx
systemctl reload nginx

# 4. 检查防火墙
ufw status
ufw allow 443/tcp
```

### 问题4：Git推送失败

```bash
# 查看远程仓库URL
git remote -v

# 更新token
git remote set-url origin https://AILHJJ:NEW_TOKEN@github.com/AILHJJ/aity-vip.git

# 或使用SSH
git remote set-url origin git@github.com:AILHJJ/aity-vip.git
```

---

## 📋 十、部署验证清单

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

## 🎯 十一、最常用命令汇总

### 日常维护（最常用）

```bash
# 登录服务器
ssh root@aity88.online

# 更新并重启
cd /root/aity-vip && bash scripts/update-and-restart.sh

# 查看服务状态
pm2 status

# 查看日志
pm2 logs aity-backend --lines 50

# 检查证书
bash /root/aity-vip/scripts/check-cert-expiry.sh
```

### 首次部署

```bash
ssh root@aity88.online
git clone https://github.com/AILHJJ/aity-vip.git /root/aity-vip && \
cd /root/aity-vip && \
git checkout feature/iteration-1 && \
bash scripts/deploy-with-ssl.sh
```

---

## 📞 十二、获取帮助

### 查看项目文档

```bash
# 在服务器上查看文档
cat /root/aity-vip/docs/DEPLOYMENT_MANUAL.md
cat /root/aity-vip/QUICK_START_GUIDE.md
cat /root/aity-vip/scripts/README.md
```

### 相关文档链接

- **完整部署手册**: `docs/DEPLOYMENT_MANUAL.md`
- **快速开始指南**: `QUICK_START_GUIDE.md`
- **脚本使用说明**: `scripts/README.md`
- **SSL解决方案**: `docs/PRAGMATIC_SSL_SOLUTION.md`

---

## 💡 十三、使用技巧

### 技巧1：使用SSH密钥免密登录

```bash
# 在本地生成SSH密钥
ssh-keygen -t rsa -b 4096

# 复制公钥到服务器
ssh-copy-id root@aity88.online

# 之后登录无需密码
ssh root@aity88.online
```

### 技巧2：使用SSH配置文件

```bash
# 在本地编辑 ~/.ssh/config
Host aity
    HostName aity88.online
    User root
    Port 22

# 之后可以这样登录
ssh aity
```

### 技巧3：一键更新命令（本地创建别名）

```bash
# 在本地 ~/.bashrc 或 ~/.zshrc 中添加
alias aity-update='ssh root@aity88.online "cd /root/aity-vip && git pull origin feature/iteration-1 && bash scripts/update-and-restart.sh"'

# 使用
aity-update
```

---

## 📊 十四、性能优化建议

### 定期检查（建议每周）

```bash
# 检查服务状态
pm2 status

# 检查证书有效期
bash /root/aity-vip/scripts/check-cert-expiry.sh

# 检查磁盘空间
df -h

# 检查内存使用
free -h
```

### 设置证书到期提醒（可选）

```bash
# 添加到crontab（每周一上午9点检查）
crontab -e
# 添加以下行
0 9 * * 1 /root/aity-vip/scripts/check-cert-expiry.sh
```

---

## 🎓 十五、数据库连接信息

```bash
# 数据库服务器
DB_HOST=124.221.119.134
DB_PORT=3306
DB_NAME=投研图灵室_test
DB_USER=fl
DB_PASSWORD=fl10b312
```

---

## 📝 版本信息

- **项目名称**: AITY VIP - 投研内部分享系统
- **项目版本**: v1.6.2
- **最后更新**: 2026-04-12
- **文档版本**: v1.0

---

**推荐使用Let's Encrypt免费证书，省心省力，一次配置，终身免费！** ⭐

需要更多帮助？查看 `docs/DEPLOYMENT_MANUAL.md` 或 `scripts/README.md`
