# SSL 证书管理与自动续期完整方案

> **文档版本**：v1.0  
> **创建日期**：2026-06-14  
> **适用项目**：AITY_VIP 小程序（aity88.online）  
> **紧急程度**：🔴 高（当前证书 2026-06-16 到期）

---

## 📋 目录

1. [当前状态概览](#1-当前状态概览)
2. [紧急处理方案（腾讯云免费证书续期）](#2-紧急处理方案腾讯云免费证书续期)
3. [长期解决方案（acme.sh 自动续期）](#3-长期解决方案acme-sh-自动续期)
4. [影响分析与风险评估](#4-影响分析与风险评估)
5. [完整操作清单](#5-完整操作清单)
6. [故障排查指南](#6-故障排查指南)
7. [监控与维护](#7-监控与维护)

---

## 1. 当前状态概览

### 1.1 证书信息

| 项目 | 值 |
|------|-----|
| **域名** | aity88.online |
| **颁发机构** | TrustAsia DV TLS RSA CA 2025（腾讯云免费 DV 证书） |
| **证书类型** | 单域名 DV 证书 |
| **生效日期** | 2026-03-18 08:00:00 |
| **过期日期** | 🔴 **2026-06-16 07:59:59** |
| **剩余时间** | ⚠️ **约 1-2 天** |
| **自动续期** | ❌ 未配置 |

### 1.2 腾讯云控制台证书列表

| 证书ID | 备注 | 域名 | 到期时间 | 状态 |
|--------|------|------|----------|------|
| VW3zgoxZQ | 未命名 | aity88.online, www.aity88.online | 2026-08-30 | 即将过期（77天） |
| W9xH9oxm | OpenCloud HTTPS证书 | aity88.online, www.aity88.online | **2026-06-16** | 🔴 **即将过期（紧急）** |
| UspGQD2D | AI跳板阿里云SSL证书 | aity88.online, www.aity88.online | 2026-04-26 | 已过期 |
| USM1tMfTo | 未命名 | aity88.online, www.aity88.online | 2026-03-30 | 已过期 |

### 1.3 当前使用的证书

**正在使用的证书**：`W9xH9oxm`（OpenCloud HTTPS证书）

验证方式：
```bash
# 在任意机器上执行
echo | openssl s_client -servername aity88.online -connect aity88.online:443 2>/dev/null | openssl x509 -noout -dates -subject
```

或使用 PowerShell：
```powershell
# Windows PowerShell
$req = [System.Net.HttpWebRequest]::Create('https://aity88.online')
$req.Method = 'HEAD'
$resp = $req.GetResponse()
$cert = $req.ServicePoint.Certificate
Write-Host "过期日期: $($cert.GetExpirationDateString())"
$daysLeft = [math]::Round(($cert.NotAfter - (Get-Date)).TotalDays, 1)
Write-Host "剩余天数: $daysLeft 天"
$resp.Close()
```

---

## 2. 紧急处理方案（腾讯云免费证书续期）

### 2.1 方案概述

**目标**：立即续期证书，确保小程序正常使用  
**耗时**：10-15分钟  
**费用**：免费  
**风险等级**：🟢 低  

### 2.2 操作步骤

#### 步骤1：登录腾讯云控制台

```
访问地址：https://console.cloud.tencent.com/ssl
登录账号：你的腾讯云账号
```

#### 步骤2：找到需要续期的证书

```
在证书列表中找到：
├─ 证书ID: W9xH9oxm
├─ 备注名称: OpenCloud HTTPS证书
├─ 到期时间: 2026-06-16
└─ 状态: 即将过期
```

#### 步骤3：点击「快速续期」或「续费」

```
操作位置：证书右侧的操作列 → 点击「快速续期」
弹出窗口：显示续费选项
```

#### 步骤4：选择续费类型

**推荐选择：「续费成免费证书」**

| 选项类型 | 有效期 | 价格 | 推荐度 |
|---------|--------|------|--------|
| ✅ **免费证书** | **90天** | **¥0** | ⭐⭐⭐⭐⭐ |
| 单域名证书 | 1年 | ¥xxx | ⭐⭐⭐ |
| 单域名证书 (DNSPod) | 1年 | ¥xxx | ⭐⭐⭐⭐ |
| 通配符证书 (DNSPod) | 1年 | ¥xxx | ⭐⭐⭐⭐ |

**为什么选免费证书？**
- ✅ 完全免费（节省成本）
- ✅ DigiCert 根证书（权威CA）
- ✅ 完全兼容微信小程序
- ✅ 配合 acme.sh 可实现全自动续期

#### 步骤5：填写申请信息

| 字段 | 填写内容 | 说明 |
|------|----------|------|
| **域名** | `aity88.online` | 已自动填充 |
| **验证方式** | ✅ **自动DNS验证**（推荐） | 最快，无需手动添加解析记录 |
| **自动删除验证** | ❌ 关闭 | 保持默认即可 |
| **有效期** | 90天 | 免费证书固定值 |

**验证方式对比：**

| 验证方式 | 速度 | 操作难度 | 推荐场景 |
|---------|------|----------|----------|
| ✅ **自动DNS验证** | ⚡ **最快（5-10分钟）** | 简单 | **首选！域名在腾讯云** |
| 手动DNS验证 | 慢（需等待DNS生效） | 中等 | 域名不在腾讯云 |
| 文件验证 | 中等 | 复杂 | 无法修改DNS时 |

#### 步骤6：提交申请

```
点击按钮：「提交申请，进行域名验证」
系统会自动完成 DNS 验证
```

#### 步骤7：等待签发

```
等待时间：通常 5-30 分钟
通知方式：短信 / 邮件 / 站内信
状态变化：待审核 → 审核中 → 已签发
```

**如何查看进度：**
```
腾讯云控制台 → SSL证书 → 证书管理 → 查看详情页
```

#### 步骤8：下载新证书

证书签发成功后：

```
1. 找到新证书（状态为「已签发」）
2. 点击「下载」按钮
3. 选择服务器类型：Nginx
4. 下载压缩包（包含 .crt 和 .key 文件）
```

**下载的文件：**
```
aity88.online_bundle.crt   # 证书文件（公钥）
aity88.online.key          # 私钥文件（绝密！）
```

#### 步骤9：部署到服务器

##### 方式A：使用项目内的部署脚本（推荐）

```bash
# 9.1 上传证书到服务器（本地执行）
scp downloaded_cert.zip root@124.221.119.134:/tmp/

# 9.2 SSH 登录服务器
ssh root@124.221.119.134

# 9.3 解压证书
cd /tmp
unzip downloaded_cert.zip
ls -la
# 应该看到:
#   aity88.online_bundle.crt
#   aity88.online.key

# 9.4 备份旧证书（重要！）
BACKUP_DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p /etc/nginx/ssl/aity88.online/backup-$BACKUP_DATE
cp /etc/nginx/ssl/aity88.online/*.crt /etc/nginx/ssl/aity88.online/backup-$BACKUP_DATE/
cp /etc/nginx/ssl/aity88.online/*.key /etc/nginx/ssl/aity88.online/backup-$BACKUP_DATE/
echo "✅ 旧证书已备份到: backup-$BACKUP_DATE"

# 9.5 替换新证书
cp aity88.online_bundle.crt /etc/nginx/ssl/aity88.online/
cp aity88.online.key /etc/nginx/ssl/aity88.online/

# 9.6 设置正确的权限（安全重要！）
chmod 600 /etc/nginx/ssl/aity88.online/aity88.online.key    # 私钥只有root可读
chmod 644 /etc/nginx/ssl/aity88.online/aity88.online_bundle.crt  # 证书所有人可读

# 9.7 测试 Nginx 配置语法
nginx -t
# 如果显示 "syntax is ok" 和 "test is successful"，继续下一步
# 如果报错，检查证书路径是否正确

# 9.8 重载 Nginx（不是 restart！）
systemctl reload nginx
# reload 会优雅地处理现有连接，几乎无中断

# 9.9 验证新证书已生效
echo | openssl s_client -servername aity88.online -connect aity88.online:443 2>/dev/null | openssl x509 -noout -dates -subject

# 应该看到新的过期日期（约90天后）
```

##### 方式B：使用项目的一键脚本

```bash
# 将新证书放到项目目录
cp aity88.online_bundle.crt /root/aity-vip/ssl-certs/
cp aity88.online.key /root/aity-vip/ssl-certs/

# 使用项目内置的部署脚本
cd /root/aity-vip
bash ssl-certs/deploy-ssl.sh
```

#### 步骤10：验证部署结果

```bash
# 10.1 检查证书信息
openssl x509 -in /etc/nginx/ssl/aity88.online/aity88.online_bundle.crt -noout -dates -subject

# 10.2 测试 HTTPS 访问
curl -I https://aity88.online

# 应该返回 HTTP/2 200 且无证书警告

# 10.3 测试 API 接口
curl https://aity88.online/api/health

# 应该返回健康检查信息

# 10.4 在线测试（可选）
# 访问 https://www.ssllabs.com/ssltest/analyze.html?d=aity88.online
# 等待评分（目标是 A 或 A+）
```

### 2.3 续期完成标志

✅ **确认以下全部通过才算成功：**

- [ ] 腾讯云控制台显示证书状态为「已签发」
- [ ] 新证书已上传到服务器 `/etc/nginx/ssl/aity88.online/`
- [ ] Nginx 配置测试通过 (`nginx -t`)
- [ ] Nginx 已重载 (`systemctl reload nginx`)
- [ ] 本地查询显示新的过期日期（约90天后）
- [ ] HTTPS 访问正常（浏览器不显示警告）
- [ ] 小程序可以正常调用 API
- [ ] SSL Labs 评分 ≥ A

---

## 3. 长期解决方案（acme.sh 自动续期）

### 3.1 方案概述

**目标**：实现证书完全自动化管理，永久不用担心过期  
**原理**：使用 acme.sh 工具 + Let's Encrypt 免费证书 + DNS API 验证  
**效果**：到期前30天自动续期 + 自动部署 + 零人工干预  

### 3.2 为什么选择 acme.sh？

| 对比项 | 腾讯云手动续期 | certbot | **acme.sh** ⭐ |
|--------|---------------|---------|----------------|
| **费用** | 免费 | 免费 | 免费 |
| **有效期** | 90天 | 90天 | 90天 |
| **续期方式** | 🔴 手动 | 半自动 | ✅ **全自动** |
| **部署方式** | 🔴 手动 | 半自动 | ✅ **全自动** |
| **验证方式** | DNS/文件 | HTTP/DNS | ✅ **DNS API（零干预）** |
| **依赖环境** | 无 | Python | 纯 Shell（轻量） |
| **适合场景** | 偶尔使用 | Linux通用 | **生产环境首选** |

### 3.3 前置准备

#### 准备1：获取腾讯云 DNS API 密钥

```
1. 登录腾讯云控制台：https://console.cloud.tencent.com/cam/capi
2. 点击「新建密钥」或使用现有密钥
3. 记录两个值：
   └─ SecretId: AKIDxxxxxxxxxxxxxxxxxxxx
   └─ SecretKey: xxxxxxxxxxxxxxxxxxxxxxxxx
4. 保存好这两个值（后续配置要用）
```

**⚠️ 安全提示：**
- SecretKey 相当于密码，不要泄露
- 不要提交到 Git 仓库
- 不要在前端代码中使用

#### 准备2：确认服务器权限

```bash
# SSH 登录服务器
ssh root@124.221.119.134

# 确认有 root 权限
whoami
# 应该输出: root

# 确认可以操作 Nginx
which nginx
nginx -v

# 确认可以写证书目录
ls -la /etc/nginx/ssl/aity88.online/
```

### 3.4 安装与配置步骤

#### 步骤1：安装 acme.sh

```bash
# 1.1 安装 acme.sh（使用官方脚本）
curl https://get.acme.sh | sh -s email=admin@aity88.online

# 1.2 使 acme.sh 命令可用
source ~/.bashrc
# 或者重新登录 shell

# 1.3 验证安装成功
acme.sh --version
# 应该输出版本号，例如: v3.0.86
```

**安装说明：**
- acme.sh 会安装到 `~/.acme.sh/` 目录
- 会自动创建一个 cron 任务（每天检查证书）
- 不需要 root 权限也能运行（但部署证书需要）

#### 步骤2：配置腾讯云 DNS API

```bash
# 2.1 设置环境变量（替换成你的真实密钥）
export Tencent_SecretId="AKIDxxxxxxxxxxxxxxxxxxxx"
export Tencent_SecretKey="xxxxxxxxxxxxxxxxxxxxxxxx"

# 2.2 验证 API 密钥有效（可选但推荐）
# 可以用这个命令测试 DNS API 是否工作正常
~/.acme.sh/acme.sh --issue --dns dns_tencent -d aity88.online --test
# 注意：--test 表示使用测试环境，不会真的签发证书
```

**如果不想每次都设置环境变量**（推荐）：

```bash
# 永久保存 API 密钥到 acme.sh 配置
~/.acme.sh/acme.sh --set-default-ca --server letsencrypt

# 编辑 ~/.acme.sh/account.conf
# 在文件末尾添加：
SAVED_Tencent_SecretId='AKIDxxxxxxxxxxxxxxxxxxxx'
SAVED_Tencent_SecretKey='xxxxxxxxxxxxxxxxxxxxxxxx'
```

#### 步骤3：首次签发证书（测试模式）

```bash
# 3.1 先用 staging 环境测试（不会消耗正式额度）
~/.acme.sh/acme.sh --issue --dns dns_tencent \
  -d aity88.online \
  --staging \
  --debug

# 3.2 如果成功，会输出类似信息：
# [2026-06-14 10:23:45] Your cert is in: /root/.acme.sh/aity88.online/
# [2026-06-14 10:23:45] Your cert key is in: /root/.acme.sh/aity88.online/
# [2026-06-14 10:23:45] The intermediate CA cert is in: /root/.acme.sh/aity88.online/ca.cer
# [2026-06-14 10:23:45] And the full chain certs is there: /root/.acme.sh/aity88.online/fullchain.cer

# 3.3 测试成功后删除测试证书
~/.acme.sh/acme.sh --remove -d aity88.online --staging
```

**为什么要先用测试模式？**
- Let's Encrypt 有速率限制（每周最多5次失败）
- 测试环境不限次数，可以反复调试
- 确保流程正确后再正式签发

#### 步骤4：正式签发证书

```bash
# 4.1 正式签发（去掉 --staging 参数）
~/.acme.sh/acme.sh --issue --dns dns_tencent \
  -d aity88.online \
  -d www.aity88.online \
  --keylength ec-256 \
  --force

# 参数说明：
# --issue              : 签发新证书
# --dns dns_tencent     : 使用腾讯云 DNS API 验证
# -d                   : 域名（可多个）
# --keylength ec-256    : 使用 ECC 256位密钥（更安全更快）
# --force               : 强制重新签发（即使已有证书）

# 4.2 成功后输出：
# [Success] Your cert is ready: /root/.acme.sh/aity88.online/aity88.online.cer
# [Success] Your cert key is ready: /root/.acme.sh/aity88.online/aity88.online.key
# [Success] The intermediate CA cert is ready: /root/.acme.sh/aity88.online/ca.cer
# [Success] And the full chain certs is ready: /root/.acme.sh/aity88.online/fullchain.cer
```

**此时证书已经签发成功，但还在 acme.sh 目录内，还没有部署到 Nginx！**

#### 步骤5：安装证书到 Nginx（关键步骤！）

```bash
# 5.1 安装证书（这一步会设置自动续期+自动部署）
~/.acme.sh/acme.sh --install-cert -d aity88.online \
  --key-file       /etc/nginx/ssl/aity88.online/aity88.online.key \
  --fullchain-file /etc/nginx/ssl/aity88.online/aity88.online_bundle.crt \
  --reloadcmd      "systemctl reload nginx"

# 参数详解：
# --install-cert       : 安装证书到指定位置
# -d                   : 域名
# --key-file           : 私钥保存路径（Nginx配置用的）
# --fullchain-file     : 完整证书链保存路径
# --reloadcmd          : 证书更新后执行的命令（重载Nginx）

# 5.2 执行后会发生什么：
# ✅ 复制证书文件到指定目录
# ✅ 设置正确的文件权限
# ✅ 执行 systemctl reload nginx（使新证书生效）
# ✅ 写入安装信息到配置文件（用于后续自动续期）
# ✅ 设置 cron 定时任务（每天检查一次）
```

**⚠️ 重要提示：**
- 这一步会导致 Nginx reload（<1秒中断）
- 建议在低峰期执行（如凌晨）
- 执行前务必备份旧证书！

#### 步骤6：验证自动续期配置

```bash
# 6.1 查看 cron 任务
crontab -l | grep acme
# 应该能看到类似：
# 10 0 * * * "/root/.acme.sh"/acme.sh --cron --home "/root/.acme.sh" > /dev/null
# 这表示每天凌晨0点10分检查证书是否需要续期

# 6.2 查看证书安装信息
~/.acme.sh/acme.sh --info -d aity88.online
# 会显示：
# Domain_PATH=/root/.acme.sh/aity88.online
# Domain_Key_File=/etc/nginx/ssl/aity88.online/aity88.online.key
# Domain_FullChainFile=/etc/nginx/ssl/aity88.online/aity88.online_bundle.crt
# Domain_ReloadCmd=systemctl reload nginx

# 6.3 手动触发续期测试（模拟到期后续期）
~/.acme.sh/acme.sh --renew -d aity88.online --force
# 这会强制续期并执行 reloadcmd
# 用于验证整个流程是否正常

# 6.4 检查当前证书状态
~/.acme.sh/acme.sh --list
# 列出所有管理的证书及其到期时间
```

### 3.5 后续自动续期机制

#### 自动续期流程图

```
每天凌晨 (cron 触发)
        ↓
acme.sh --cron 检查所有证书
        ↓
判断是否到期前30天？
        ├─ 否 → 什么都不做，退出
        └─ 是 ↓
自动执行 DNS 验证
        ↓
向 Let's Encrypt 申请新证书
        ↓
申请新证书成功
        ↓
复制新证书到 --key-file 和 --fullchain-file 指定路径
        ↓
执行 --reloadcmd 命令（systemctl reload nginx）
        ↓
发送通知邮件（如果配置了）
        ↓
✅ 完成！全程无人值守
```

#### 关键时间节点

```
证书生命周期（90天）：

Day 0:    首次签发
         ↓
Day 1-59: 正常使用（acme.sh 每天检查但不动作）
         ↓
Day 60:   ⚠️ 到期前30天
         ↓
         acme.sh 自动触发续期
         ↓
         DNS验证 → 签发新证书 → 部署 → reload Nginx
         ↓
Day 61:   ✅ 新证书生效（又可以用90天）
         ↓
...循环...
```

---

## 4. 影响分析与风险评估

### 4.1 各阶段对线上服务的影响

| 操作阶段 | 服务中断时长 | 用户感知 | 风险等级 | 是否需要停服 |
|---------|-------------|---------|----------|-------------|
| **安装 acme.sh** | 0秒 | 无 | 🟢 安全 | ❌ 否 |
| **配置 DNS API 密钥** | 0秒 | 无 | 🟢 安全 | ❌ 否 |
| **测试签发 (--test)** | 0秒 | 无 | 🟢 安全 | ❌ 否 |
| **正式签发 (--issue)** | 0秒 | 无 | 🟢 安全 | ❌ 否 |
| **安装证书+重载 Nginx** | **<1秒** | **几乎无** | 🟡 低风险 | ❌ **否** |
| **后续自动续期** | <1秒/次 | 无 | 🟡 低风险 | ❌ 否 |

### 4.2 Nginx reload vs restart 的区别

```bash
# ❌ 错误做法：restart（会中断所有连接）
systemctl restart nginx
# 影响：所有当前连接被强制断开
# 用户感知：正在加载的页面可能失败

# ✅ 正确做法：reload（优雅重载）
systemctl reload nginx
# 影响：处理完当前请求后再切换配置
# 用户感知：几乎无感知（<1秒）
```

**acme.sh 默认使用 reload，所以影响极小！**

### 4.3 风险缓解措施

#### 措施1：备份旧证书

```bash
# 在执行 install-cert 前
BACKUP_DIR="/etc/nginx/ssl/aity88.online/backup-$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"
cp /etc/nginx/ssl/aity88.online/*.crt "$BACKUP_DIR/"
cp /etc/nginx/ssl/aity88.online/*.key "$BACKUP_DIR/"
echo "✅ 已备份到: $BACKUP_DIR"
```

#### 措施2：先 dry-run 测试

```bash
# 测试 install-cert 流程（不真正执行）
~/.acme.sh/acme.sh --install-cert -d aity88.online \
  --key-file       /etc/nginx/ssl/aity88.online/aity88.online.key \
  --fullchain-file /etc/nginx/ssl/aity88.online/aity88.online_bundle.crt \
  --reloadcmd      "systemctl reload nginx" \
  --dry-run
```

#### 措施3：实时监控日志

```bash
# 终端1：监控 Nginx 日志
tail -f /var/log/nginx/error.log /var/log/nginx/access.log

# 终端2：执行 acme.sh 命令
~/.acme.sh/acme.sh --install-cert ...
```

#### 措施4：准备回滚方案

```bash
# 如果出现问题，10秒内回滚
ROLLBACK_LATEST=$(ls -dt /etc/nginx/ssl/aity88.online/backup-* | head -1)
cp "$ROLLBACK_LATEST"/* /etc/nginx/ssl/aity88.online/
systemctl reload nginx
echo "✅ 已回滚到: $ROLLBACK_LATEST"
```

### 4.4 最佳执行时机

```
理想时间窗口：
┌─────────────────────────────────────┐
│ 凌晨 02:00 - 05:00                  │
│ • 用户量最少（小程序夜间使用率低）    │
│ • 即使有1秒中断也几乎无人感知        │
│ • 出问题有时间回滚和处理             │
│ • 运维人员容易安排时间               │
└─────────────────────────────────────┘

备选时间：
┌─────────────────────────────────────┐
│ 工作日上午 10:00-11:00              │
│ • 你在线，可以实时监控               │
│ • 如有问题可以立即处理               │
│ • 团队成员可以协助                  │
└─────────────────────────────────────┘

避免时段：
┌─────────────────────────────────────┐
│ 工作日 19:00-22:00（高峰期）        │
│ 周一上午（业务开始）                 │
│ 大促/活动期间                       │
└─────────────────────────────────────┘
```

---

## 5. 完整操作清单

### 5.1 紧急续期清单（现在执行）

```
阶段1：腾讯云控制台操作（5分钟）
☐ 1.1 登录 https://console.cloud.tencent.com/ssl
☐ 1.2 找到证书 W9xH9oxm（OpenCloud HTTPS证书）
☐ 1.3 点击「快速续期」
☐ 1.4 选择「续费成免费证书」（90天免费）
☐ 1.5 填写域名：aity88.online
☐ 1.6 选择验证方式：自动DNS验证
☐ 1.7 点击「提交申请，进行域名验证」
☐ 1.8 等待审核通过（5-30分钟）

阶段2：下载并部署证书（10分钟）
☐ 2.1 收到签发成功通知
☐ 2.2 在控制台点击「下载」→ 选择 Nginx 格式
☐ 2.3 解压得到 .crt 和 .key 文件
☐ 2.4 SCP 上传到服务器：scp *.zip root@124.221.119.134:/tmp/
☐ 2.5 SSH 登录服务器：ssh root@124.221.119.134
☐ 2.6 备份旧证书：cp /etc/nginx/ssl/aity88.online/* backup-$(date +%Y%m%d)/
☐ 2.7 替换新证书：cp new-cert.* /etc/nginx/ssl/aity88.online/
☐ 2.8 设置权限：chmod 600 .key && chmod 644 .crt
☐ 2.9 测试配置：nginx -t
☐ 2.10 重载 Nginx：systemctl reload nginx

阶段3：验证结果（5分钟）
☐ 3.1 查询证书：openssl x509 ... （确认新日期）
☐ 3.2 浏览器访问：https://aity88.online （无警告）
☐ 3.3 测试 API：curl https://aity88.online/api/health
☐ 3.4 小程序测试：打开小程序，测试核心功能
☐ 3.5 SSL Labs 评分：https://www.ssllabs.com/ssltest/ （≥A）

结果确认：
□ 全部通过 → ✅ 紧急问题解决，进入长期方案
□ 有问题 → 检查故障排查章节
```

### 5.2 acme.sh 自动化配置清单（本周内执行）

```
准备阶段（随时可做，0影响）
☐ 准备1: 获取腾讯云 DNS API 密钥（SecretId + SecretKey）
☐ 准备2: 确认服务器 root 权限和 SSH 连接
☐ 准备3: 备份当前证书（防止意外）

安装阶段（低峰期执行）
☐ 步骤1: 安装 acme.sh
       curl https://get.acme.sh | sh -s email=admin@aity88.online
       source ~/.bashrc
       acme.sh --version

☐ 步骤2: 配置 DNS API
       export Tencent_SecretId="你的SecretId"
       export Tencent_SecretKey="你的SecretKey"

☐ 步骤3: 测试签发（staging 环境）
       ~/.acme.sh/acme.sh --issue --dns dns_tencent -d aity88.online --test --debug
       ~/.acme.sh/acme.sh --remove -d aity88.online --staging

☐ 步骤4: 正式签发证书
       ~/.acme.sh/acme.sh --issue --dns dns_tencent -d aity88.online -d www.aity88.online --keylength ec-256 --force

☐ 步骤5: 安装证书到 Nginx（关键！会有 <1秒 影响）
       ~/.acme.sh/acme.sh --install-cert -d aity88.online \
         --key-file /etc/nginx/ssl/aity88.online/aity88.online.key \
         --fullchain-file /etc/nginx/ssl/aity88.online/aity88.online_bundle.crt \
         --reloadcmd "systemctl reload nginx"

验证阶段（立即检查）
☐ 验证1: 查看 cron 任务
       crontab -l | grep acme

☐ 验证2: 查看证书信息
       ~/.acme.sh/acme.sh --info -d aity88.online

☐ 验证3: 手动测试续期流程
       ~/.acme.sh/acme.sh --renew -d aity88.online --force

☐ 验证4: 检查新证书生效
       echo | openssl s_client -servername aity88.online -connect aity88.online:443 | openssl x509 -noout -dates

☐ 验证5: 功能测试
       curl https://aity88.online/api/health
       小程序功能测试

最终确认：
□ 全部通过 → ✅ 永久解决证书问题！
□ 有问题 → 查看故障排查指南
```

---

## 6. 故障排查指南

### 6.1 常见问题及解决方案

#### 问题1：DNS 验证失败

**错误信息**：
```
[Error] Can not resolve DNS entry
```

**原因及解决**：
```bash
# 原因1：API 密钥错误或权限不足
# 解决：检查 SecretId 和 SecretKey 是否正确
# 腾讯云控制台 → 访问管理 → API密钥管理 → 确认密钥状态正常

# 原因2：DNS API 请求被限制
# 解决：稍后重试，或联系腾讯云提高限额

# 原因3：域名不在腾讯云 DNS 管理
# 解决：将域名的 DNS 服务器改为腾讯云的，
#       或改用其他验证方式（如 HTTP 验证）
```

#### 问题2：证书安装后 Nginx 报错

**错误信息**：
```
nginx: [emerg] cannot load certificate
```

**原因及解决**：
```bash
# 原因1：证书路径错误
# 解决：检查 --key-file 和 --fullchain-file 路径是否存在
ls -la /etc/nginx/ssl/aity88.online/
# 应该看到 .key 和 .crt 文件

# 原因2：文件权限不对
# 解决：
chmod 600 /etc/nginx/ssl/aity88.online/aity88.online.key
chmod 644 /etc/nginx/ssl/aity88.online/aity88.online_bundle.crt

# 原因3：证书格式不匹配
# 解决：确认是 Nginx 格式的证书（不是 Apache/IIS 格式）
```

#### 问题3：自动续期没有触发

**排查步骤**：
```bash
# 1. 检查 cron 任务是否存在
crontab -l | grep acme
# 如果没有，手动添加或重新运行 install-cert

# 2. 手动触发续期看看报错
~/.acme.sh/acme.sh --renew -d aity88.online --force --debug
# 查看详细日志输出

# 3. 检查 acme.sh 日志
cat ~/.acme.sh/logs/
# 或
tail -100 ~/.acme.sh/logs/*.log

# 4. 检查 DNS API 密钥是否仍然有效
# 可能密钥已过期或被撤销
```

#### 问题4：续期成功但网站仍显示旧证书

**原因及解决**：
```bash
# 原因1：Nginx 没有成功 reload
# 解决：手动重载
systemctl reload nginx
systemctl status nginx

# 原因2：浏览器缓存了旧证书
# 解决：
#   - 清除浏览器缓存
#   - 使用隐私/无痕模式访问
#   - 或用 curl 测试：curl -I https://aity88.online

# 原因3：CDN/负载均衡器缓存了证书
# 解决：如果有使用 CDN（如腾讯云 CDN），需要在 CDN 控制台更新证书
```

#### 问题5：Let's Encrypt 速率限制

**错误信息**：
```
Error: too many certificates issued for domain
```

**原因及解决**：
```bash
# Let's Encrypt 限制：
# - 每个注册域名：每周最多 50 个证书
# - 每个证书域名组合：每周最多 5 个重复证书

# 解决方法：
# 1. 等待一周后重试
# 2. 使用 --test 或 --staging 模式调试（不计入限额）
# 3. 检查是否有脚本在频繁申请证书（误操作）
# 4. 联系 Let's Encrypt 支持申请提升限额（仅特殊情况）
```

### 6.2 紧急回滚流程

如果部署新证书后出现严重问题：

```bash
#!/bin/bash
# 紧急回滚脚本（保存为 rollback-ssl.sh）

echo "=========================================="
echo "  SSL 证书紧急回滚"
echo "=========================================="

# 1. 查找最新的备份
LATEST_BACKUP=$(ls -dt /etc/nginx/ssl/aity88.online/backup-* 2>/dev/null | head -1)

if [ -z "$LATEST_BACKUP" ]; then
    echo "❌ 错误: 找不到备份目录"
    exit 1
fi

echo "找到最新备份: $LATEST_BACKUP"
ls -la "$LATEST_BACKUP"

read -p "确认回滚到此备份？(y/n) " confirm
if [ "$confirm" != "y" ]; then
    echo "取消回滚"
    exit 0
fi

# 2. 回滚证书文件
cp "$LATEST_BACKUP"/*.crt /etc/nginx/ssl/aity88.online/
cp "$LATEST_BACKUP"/*.key /etc/nginx/ssl/aity88.online/

# 3. 设置权限
chmod 600 /etc/nginx/ssl/aity88.online/aity88.online.key
chmod 644 /etc/nginx/ssl/aity88.online/aity88.online_bundle.crt

# 4. 测试配置
if nginx -t; then
    echo "✅ Nginx 配置正确"
else
    echo "❌ Nginx 配置错误，请检查备份文件"
    exit 1
fi

# 5. 重载 Nginx
systemctl reload nginx

# 6. 验证
echo ""
echo "=========================================="
echo "✅ 回滚完成！"
echo "=========================================="
echo "已恢复到备份: $LATEST_BACKUP"
echo ""

echo | openssl s_client -servername aity88.online -connect aity88.online:443 2>/dev/null | openssl x509 -noout -dates
```

**使用方法**：
```bash
chmod +x rollback-ssl.sh
./rollback-ssl.sh
```

---

## 7. 监控与维护

### 7.1 证书状态检查脚本

项目已有现成的检查脚本：`scripts/check-cert-expiry.sh`

**使用方法**：
```bash
# 手动执行
bash /root/aity-vip/scripts/check-cert-expiry.sh

# 输出示例：
# ==========================================
#   SSL证书状态检查
# ==========================================
# 域名: aity88.online
# 证书类型: Let's Encrypt
# 过期日期: Sep 12 07:59:59 2026 GMT
# 剩余天数: 89 天
# ==========================================
# ✅ 证书状态良好
```

### 7.2 添加定时监控（推荐）

```bash
# 编辑 crontab
crontab -e

# 添加以下行（每周一上午9点检查）
0 9 * * 1 /root/aity-vip/scripts/check-cert-expiry.sh >> /var/log/ssl-check.log 2>&1

# 可选：每天检查一次（更严格）
0 9 * * * /root/aity-vip/scripts/check-cert-expiry.sh >> /var/log/ssl-check.log 2>&1
```

### 7.3 邮件告警（可选）

修改 `check-cert-expiry.sh`，在检测到即将过期时发送邮件：

```bash
# 在脚本的 if 判断中添加邮件发送
if [ $DAYS_LEFT -lt 30 ]; then
    echo "⚠️ 警告：证书将在 $DAYS_LEFT 天后过期" | mail -s "SSL证书即将过期" admin@aity88.online
    
    # 或使用企业微信/钉钉 webhook
    curl -X POST 'https://qyapi.weixin.qq.com/cgi-bin/webhook?key=YOUR_KEY' \
      -H 'Content-Type: application/json' \
      -d '{"msgtype": "text", "text": {"content": "SSL证书警告：aity88.online 证书将在 '$DAYS_LEFT' 天后过期"}}'
fi
```

### 7.4 定期维护清单

```
每月检查一次：
☐ 运行 check-cert-expiry.sh 查看证书状态
☐ 检查 crontab 中的 acme.sh 任务是否正常运行
☐ 查看 acme.sh 日志有无错误：tail -100 ~/.acme.sh/logs/*
☐ 测试 HTTPS 访问：curl -I https://aity88.online
☐ 小程序核心功能冒烟测试

每季度检查一次：
☐ 更新 acme.sh 到最新版本：acme.sh --upgrade
☐ 检查 DNS API 密钥是否需要轮换（安全最佳实践）
☐ 备份证书配置信息
☐ SSL Labs 评分复查（目标保持 A 或 A+）

每年检查一次：
☐ 审计整个 SSL/TLS 配置
☐ 评估是否需要升级加密算法或协议
☐ 检查是否符合最新的安全标准（如 PCI-DSS、GDPR 等）
☐ 文档更新（本文档）
```

---

## 附录

### A. 参考链接

- **acme.sh 官方文档**：https://github.com/acmesh-official/acme.sh/wiki
- **Let's Encrypt 官网**：https://letsencrypt.org/
- **腾讯云 SSL 证书文档**：https://cloud.tencent.com/document/product/400
- **SSL Labs 测试工具**：https://www.ssllabs.com/ssltest/
- **DigiCert 根证书信息**：https://www.digicert.com/digicert-root-certificates.htm

### B. 项目相关文件位置

```
AITY_VIP/
├── scripts/
│   ├── check-cert-expiry.sh          # 证书检查脚本
│   ├── deploy-with-ssl.sh            # Let's Encrypt 一键部署
│   └── deploy-docker.sh / .ps1       # Docker 部署（含SSL配置）
├── ssl-certs/
│   ├── README.md                     # SSL 目录说明
│   └── deploy-ssl.sh                 # 手动证书部署脚本
├── AITY_VIP项目运维部署指南.md        # 含 SSL 章节
└── docs/_archive/
    ├── SSL_CERTIFICATE_SECURITY_ALERT.md  # SSL 安全警告
    └── PRAGMATIC_SSL_SOLUTION.md          # SSL 便捷方案
```

### C. 服务器关键路径

```
/etc/nginx/ssl/aity88.online/           # 生产证书目录
├── aity88.online.key                   # 私钥（绝密！权限600）
├── aity88.online_bundle.crt            # 证书链（权限644）
└── backup-YYYYMMDD_HHMMSS/            # 历史备份

/etc/nginx/sites-available/aity-vip    # Nginx 配置文件
/var/log/nginx/                         # Nginx 日志

/root/.acme.sh/                        # acme.sh 安装目录
├── account.conf                       # 账户配置（含API密钥）
├── aity88.online/                     # 该域名证书目录
└── logs/                              # 日志文件
```

### D. 快速命令参考卡

```bash
# 检查证书状态
echo | openssl s_client -servername aity88.online -connect aity88.online:443 | openssl x509 -noout -dates

# 检查 acme.sh 状态
crontab -l | grep acme
~/.acme.sh/acme.sh --list
~/.acme.sh/acme.sh --info -d aity88.online

# 手动续期
~/.acme.sh/acme.sh --renew -d aity88.online --force

# 重载 Nginx
systemctl reload nginx

# 查看日志
journalctl -u nginx -f
tail -f /var/log/nginx/error.log
```

---

## 文档结束

**最后更新**：2026-06-14  
**维护者**：AITY_VIP 运维团队  
**反馈建议**：如有问题或改进建议，请在项目 Issue 中提出

> 💡 **提示**：建议将此文档加入团队知识库，并在每次证书操作前后查阅。
