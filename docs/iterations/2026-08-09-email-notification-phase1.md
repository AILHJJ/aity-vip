# 邮件提醒一期

## 目标

管理员发布消息时，可选择“邮件提醒”。系统按现有策略推送范围选择用户邮箱，写入 `notification_outbox`，再异步发送简短邮件提醒用户打开小程序查看。

## 范围

- 后端支持 163 SMTP。
- 默认 dry-run，不配置授权码也能验证 outbox。
- 复用消息 `tags` 的权限规则选择目标用户。
- 跳过 inactive 用户、发布者本人、空邮箱、占位邮箱 `@users.aity.vip`、非法邮箱。
- 小程序发布页新增“邮件提醒”开关。

## 发送规则

| 消息标签 | 邮件目标 |
| --- | --- |
| `short_term` | active 的 `vip_short` 用户 |
| `mid_term` | active 的 `vip_mid` 用户 |
| `all_users` | active 的 `vip_short`、`vip_mid`、`trial` 用户 |

默认不发给管理员。如需让管理员也收到 `all_users` 邮件，设置：

```env
MAIL_NOTIFY_ADMINS=true
```

## 配置

测试期 163 SMTP 配置：

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

注意：`SMTP_PASS` 是邮箱客户端授权码，不是邮箱登录密码，不得提交到 Git。

## 数据库

新增表：`notification_outbox`。

迁移文件：

```text
backend/migrations/20260809-create-notification-outbox.sql
```

默认 `NOTIFICATION_OUTBOX_AUTO_SYNC=true` 时，后端会自动创建缺失的 outbox 表；正式环境仍建议执行 SQL 迁移。

## 验收

- 发布页默认不勾选邮件提醒。
- 勾选邮件提醒发布消息后，消息发布成功不等待邮件发送完成。
- `MAIL_DRY_RUN=true` 时，outbox 记录进入 `dry_run`，不真实发送。
- `MAIL_ENABLED=true` 且 `MAIL_DRY_RUN=false` 且 SMTP 配置正确时，目标用户收到简短提醒邮件。
- 邮件失败不影响消息发布，失败原因记录到 outbox。

## 已知限制

- 当前没有管理端发送日志页面，可直接查 `notification_outbox`。
- 当前只支持文本邮件，不做 HTML 模板。
- 短信和微信订阅消息不在一期范围。
- 发件前会再次过滤空邮箱、占位邮箱 `@users.aity.vip` 和非法邮箱，避免历史 outbox 或脏数据触发真实发送。
