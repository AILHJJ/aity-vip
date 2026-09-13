# SSL 证书与自动续期说明

> 2026-09-13 事故复盘与修复记录。域名 `aity88.online`，服务器 `124.221.119.134`（腾讯云）。

## 一、事故：证书过期导致线上不可访问（2026-09-13 修复）

线上 SSL 证书 2026-09-11 到期（TrustAsia 免费证书，2026-06-14 签发，3 个月有效期），到期后浏览器拒绝访问。**服务器上从未存在过真正可用的自动续期**，看似有自动化实际全是空转。

### 根因（三套互相矛盾的"自动化"痕迹，全都无效）

| 痕迹 | 实际情况 |
|---|---|
| 文档写的 certbot 方案（deployment.md） | certbot **根本没安装**，从未实施 |
| 线上 TrustAsia 证书 | 手动从腾讯云下载部署，**没有任何自动续期通道** |
| acme.sh + 每日 cron | 2026-06-15 搭建时**配置指向 Let's Encrypt staging 测试环境**，且签发从未完成（云凭据失效 `secretId is invalid`），目录里只有 CSR/key 没有证书；每日 13:24 的 cron `acme.sh --cron` 天天跑、天天 `Skipping invalid cert` 空转 |

### 附带发现的更严重隐患（已一并修复）

1. **nginx 配置引用了不存在的证书路径**：当前 `aity88.online.conf` 写的是宝塔路径 `/www/server/panel/vhost/cert/aity88.online/fullchain.pem`，该目录不存在 → `nginx -t` 直接失败。nginx 靠 6-15 最后一次成功 reload 的内存状态在跑，**任何触发 reload 的操作都会失败；服务器一旦重启，nginx 直接起不来，全站宕机**。
2. **代理端口写错**：conf 里 `proxy_pass 3000`，但 3000 端口无任何服务，后端真实端口是 **3001**（pm2 `aity-backend`）。

## 二、修复内容（2026-09-13）

1. 重建 `aity-uni-app-v2` nginx 配置（备份：`aity88.online.conf.bak_fixssl_20260913_104755`）：
   - 证书路径回到 `/etc/nginx/ssl/aity88.online/`
   - 代理修正：`/api/`、`/uploads/`、`/health` → `127.0.0.1:3001`；静态 → `/www/wwwroot/www.aity88.online`
   - 80 端口增加 `/.well-known/acme-challenge/` webroot 验证支持（其余 301 跳 https）
2. 清理 acme.sh staging 半成品，用 **webroot HTTP-01 验证**（不依赖云凭据）正式签发 Let's Encrypt 证书
3. `acme.sh --install-cert` 部署到 `/etc/nginx/ssl/aity88.online/`，并注册 `--reloadcmd "nginx -s reload"`（续期成功后自动重载）
4. 修复结果：线上证书 = Let's Encrypt（2026-09-13 ~ **2026-12-12**），首页/API 均 200

## 三、现在的自动续期机制（真正的闭环）

```
每日 13:24 crontab: acme.sh --cron --home /root/.acme.sh
  └─ 证书有效期 ≤60 天时自动续期（Let's Encrypt 正式环境，webroot 验证）
       └─ 续期成功 → 自动 install-cert 到 /etc/nginx/ssl/aity88.online/ → 自动 nginx reload
```

- acme.sh 默认在证书剩 30 天时续期，无需人工干预
- 续期日志：`/root/.acme.sh/acme.sh.log`
- 证书配置：`/root/.acme.sh/aity88.online_ecc/aity88.online.conf`（`Le_API` 应为 `https://acme-v02.api.letsencrypt.org/directory`，**绝不能是 acme-staging**）

## 四、日常巡检

```powershell
# 一键检查证书剩余天数 + 自动续期健康度 + nginx 引用一致性 + 业务可用性
.\scripts\检查SSL证书状态.ps1
```

建议每月跑一次；发布后端/前端后也建议跑一次确认 nginx 正常。

## 五、自动告警（2026-09-13 已接入，无需人工巡检）

续期失败等异常会**主动推送到企业微信群**（机器人 `AITY通知助手`），无需人工盯：

| 告警项 | 触发方式 | 说明 |
|---|---|---|
| 证书续期失败 | acme.sh `--set-notify`（weixin_work hook，level 2） | 续期失败即时推送 |
| 证书剩余 <15 天 | 每周一 09:00 crontab 巡检 | 兜底，防通知机制本身失效 |
| nginx 配置校验失败 | 同上巡检脚本 | 防"引用不存在路径导致 reload/重启失败"复发 |
| HTTPS 健康检查异常 | 同上巡检脚本 | 首页/API 不可用告警 |

- 巡检脚本：`/root/aity-vip/ssl_check_weekly.sh`（cron：`0 9 * * 1`）
- acme.sh 通知配置：`account.conf` 中 `NOTIFY_HOOK='weixin_work'`、`NOTIFY_LEVEL='2'`、`SAVED_WEIXIN_WORK_WEBHOOK=...`

## 六、注意事项（勿再踩坑）

1. **不要在腾讯云/宝塔手动下载证书覆盖 `/etc/nginx/ssl/`**——会绕开 acme.sh 管理，续期链断裂，90 天后再次过期
2. **不要改 nginx conf 里的证书路径**，必须保持 `/etc/nginx/ssl/aity88.online/aity88.online_bundle.crt`（acme.sh install-cert 的目标路径）
3. 改动 nginx 配置后必须 `nginx -t` 通过再 reload；`/www/server/nginx/sbin/nginx -t`
4. Let's Encrypt 有速率限制（同一域名每周 5 次签发），测试用 `--test` 参数
5. 若未来需要 DNS 验证（泛域名），需先准备有效的腾讯云 SecretId/Key（当前服务器上的 tccli 凭据已失效）
