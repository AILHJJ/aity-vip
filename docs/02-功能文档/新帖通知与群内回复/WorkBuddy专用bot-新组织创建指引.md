# WorkBuddy 专用 bot · 新组织创建指引

> 用途：在新组织创建一个**专供 WorkBuddy** 使用的飞书应用（与小程序的「AITY智能助手」分开，不可共用）
> 你的身份：新组织管理员，审核自己批
> 来源：WorkBuddy 官方文档 https://www.workbuddy.cn/docs/workbuddy/Feishu-Guide
> 生成时间：2026-09-16

## 一、创建应用（2 分钟）

open.feishu.cn → 开发者后台（确认右上角是新组织）→ 创建企业自建应用
- 名称：`AITY办公助手`（随意）
- 创建后进入应用详情

## 二、添加机器人能力

左侧「应用能力」→ 添加「机器人」

## 三、批量导入权限（1 分钟，官方 JSON 直接粘贴）

左侧「权限管理」→「批量导入」→ 清空输入框 → 粘贴以下 JSON → 确定新增：

```json
{
  "scopes": {
    "tenant": [
      "contact:contact.base:readonly",
      "docx:document:readonly",
      "im:chat:read",
      "im:chat:update",
      "im:message.group_at_msg:readonly",
      "im:message.p2p_msg:readonly",
      "im:message.pins:read",
      "im:message.pins:write_only",
      "im:message.reactions:read",
      "im:message.reactions:write_only",
      "im:message:readonly",
      "im:message:recall",
      "im:message:send_as_bot",
      "im:message:send_multi_users",
      "im:message:send_sys_msg",
      "im:message:update",
      "im:resource",
      "application:application:self_manage",
      "cardkit:card:write",
      "cardkit:card:read"
    ],
    "user": [
      "contact:user.employee_id:readonly",
      "offline_access",
      "base:app:copy",
      "base:field:create",
      "base:field:delete",
      "base:field:read",
      "base:field:update",
      "base:record:create",
      "base:record:delete",
      "base:record:retrieve",
      "base:record:update",
      "base:table:create",
      "base:table:delete",
      "base:table:read",
      "base:table:update",
      "base:view:read",
      "base:view:write_only",
      "base:app:create",
      "base:app:update",
      "base:app:read",
      "board:whiteboard:node:create",
      "board:whiteboard:node:read",
      "calendar:calendar:read",
      "calendar:calendar.event:create",
      "calendar:calendar.event:delete",
      "calendar:calendar.event:read",
      "calendar:calendar.event:reply",
      "calendar:calendar.event:update",
      "calendar:calendar.free_busy:read",
      "contact:contact.base:readonly",
      "contact:user.base:readonly",
      "contact:user:search",
      "docs:document.comment:create",
      "docs:document.comment:read",
      "docs:document.comment:update",
      "docs:document.media:download",
      "docs:document:copy",
      "docx:document:create",
      "docx:document:readonly",
      "docx:document:write_only",
      "drive:drive.metadata:readonly",
      "drive:file:download",
      "drive:file:upload",
      "im:chat.members:read",
      "im:chat:read",
      "im:message",
      "im:message.group_msg:get_as_user",
      "im:message.p2p_msg:get_as_user",
      "im:message:readonly",
      "search:docs:read",
      "search:message",
      "space:document:delete",
      "space:document:move",
      "space:document:retrieve",
      "task:comment:read",
      "task:comment:write",
      "task:task:read",
      "task:task:write",
      "task:task:writeonly",
      "task:tasklist:read",
      "task:tasklist:write",
      "wiki:node:copy",
      "wiki:node:create",
      "wiki:node:move",
      "wiki:node:read",
      "wiki:node:retrieve",
      "wiki:space:read",
      "wiki:space:retrieve",
      "wiki:space:write_only"
    ]
  }
}
```

## 四、事件与回调（缺一不可）

左侧「事件与回调」：

1. **订阅方式**：选「使用长连接接收事件」→ 验证 → 连接成功
   （注意：WorkBuddy「注册」成功后此处才会显示连接成功）
2. **事件配置** → 添加事件 → 搜「**接收消息**」→ 添加 `im.message.receive_v1`
3. **回调配置** → 搜「**卡片回传交互**」→ 添加（WorkBuddy 用交互卡片，缺了不响应）

## 五、获取三个凭证

1. 「凭证与基础信息」→ App ID、App Secret
2. 「事件与回调」→ 加密策略 → 生成 **Encrypt Key**（和 Verification Token）

## 六、填入 WorkBuddy

WorkBuddy → 助理设置 → 快捷方式 → 连接飞书 → WebSocket 模式：
- 飞书 App ID：粘贴
- 飞书 App Secret：粘贴
- Encrypt Key：粘贴（弹窗里如无此项，先点「连接」看是否要求补充）
- 点「连接」→ 显示「已连接」

## 七、发布版本

版本管理与发布 → 创建版本 1.0.0 → 提交 → 自己在 go.feishu.cn/admin 批 → 状态变「已启用」

## 八、测试

飞书搜索你的机器人 → 进对话 → 发「帮我写一个待办清单」→ WorkBuddy 在电脑端执行并回传。
（WorkBuddy 是单聊机器人，不需要拉群）
