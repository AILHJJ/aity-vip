# 未读消息与邮件账户闭环迭代

## 目标

- 未读消息入口不再只过滤已加载分页，改为服务端分页查询。
- 管理员自己发布的消息不计入自己的未读数。
- 用户可自行修改邮箱，确保邮件提醒能投递到真实邮箱。
- 邮件推送部署时可在腾讯云后端配置 163 SMTP 并验证。

## 本次变更

### 未读消息

- `GET /api/messages` 新增支持：
  - `readStatus=unread`：只返回当前用户未读消息。
  - `readStatus=read`：只返回当前用户已读消息。
  - `tag=<tag>`：按消息标签筛选，支持和未读状态组合。
- 消息列表返回每条消息的 `isRead` 字段，前端以服务端阅读记录为准。
- `GET /api/messages/unread-count` 复用同一套可见性和已读查询规则。
- 自己发布的消息不会进入自己的未读列表和未读角标。

### 小程序交互

- 消息页点击“未读”后重新请求服务端未读分页，而不是只过滤当前已加载列表。
- 未读空态改为“暂无未读消息”，不再提示分页缺陷。
- 未读说明改为服务端筛选语义。

### 修改邮箱

- 新增 `POST /api/auth/change-email`。
- 新增小程序页面 `pages/change-email/change-email`。
- “我的”页展示当前邮箱，并提供“修改邮箱”入口。
- 拒绝空邮箱、非法邮箱、系统占位邮箱 `@users.aity.vip`、已被其他用户使用的邮箱。

## 腾讯云后端部署

本次包含后端代码和前端小程序代码变更。后端不部署时，小程序的未读分页和修改邮箱接口不可用。

推荐后端部署路径：

```bash
cd /root/aity-vip-source
git fetch origin
git checkout <release-branch-or-sha>

cd backend
npm ci --omit=dev
pm2 restart aity-backend --update-env
pm2 status aity-backend
curl https://aity88.online/api/health
```

如果服务器仍使用 `/root/aity-vip/backend` 无 Git 运行目录，短期只能用打包上传覆盖；长期应迁移到 Git/SHA 可追踪部署。

## 163 SMTP 配置验证

服务器 `backend/.env` 需要配置：

```env
MAIL_ENABLED=true
MAIL_DRY_RUN=false
MAIL_AUTO_PROCESS=true
MAIL_NOTIFY_ADMINS=false
NOTIFICATION_OUTBOX_AUTO_SYNC=true
SMTP_HOST=smtp.163.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=lhdms88@163.com
SMTP_PASS=163邮箱客户端授权码
MAIL_FROM_NAME=AITY投研提醒
MAIL_FROM=lhdms88@163.com
```

注意：`SMTP_PASS` 是 163 邮箱客户端授权码，不是登录密码，不得提交到 Git。

验证步骤：

1. 后端部署并重启后，确认 `notification_outbox` 表存在。
2. 先用 `MAIL_DRY_RUN=true` 发布一条勾选“邮件提醒”的消息，确认 outbox 生成 `dry_run` 记录。
3. 设置 `MAIL_DRY_RUN=false` 并重启 PM2。
4. 使用一个真实邮箱用户发布目标范围内消息，确认收到邮件。
5. 如果未收到，优先查 `notification_outbox.last_error` 和 PM2 日志。

## 验收

- 消息页未读角标有数量时，点击“未读”能看到跨分页未读消息。
- 管理员自己发布的消息不显示为自己的未读。
- 用户可在“我的 -> 修改邮箱”更新真实邮箱。
- 发布消息勾选“邮件提醒”后，目标用户邮箱收到简短提醒。
