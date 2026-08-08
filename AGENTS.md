# AITY VIP 仓库协作规则

> 本仓库规则入口。团队通用 Git、MR、影响分析规范以 `tdx-ai-engineering-standards` 为权威来源；本文件只记录 AITY VIP 项目特有约束。

## 权威规范

- 本地规范仓库：`D:\your-mcp-proxy\team-work-projects\01-通达信AI产品\代码仓库\tdx-ai-engineering-standards`
- 重点入口：
  - `git/分支与提交规范.md`
  - `git/多仓库协作规范.md`
  - `templates/merge_request_template.md`
  - `skills/ai-dev-closed-loop/references/development-checklist.md`
  - `skills/ai-dev-closed-loop/references/change-impact-analysis.md`

## 仓库范围

- `backend/`：Node.js 后端 API、数据库模型、迁移、上传和 PM2 配置。
- `aity-uni-app-v2/`：uni-app 前端源码，同时产出微信小程序和 H5。
- `docs/operations/`：线上基线、部署、回滚、持续迭代维护说明。

## 分支与提交

- 使用短生命周期分支：`<type>/<work-item>-<short-description>`。
- 无正式工单时，本项目可临时使用 `AITY-<date>-<topic>` 作为 `work-item`，例如 `feat/AITY-20260808-email-notification`。
- 每个提交只包含一个可审查主题；前端、后端、数据库迁移可独立回滚时分开提交。
- 不提交 `.env*`、PEM/key、token、压缩包、`node_modules`、`dist`、logs、uploads。

## 修改前门禁

开始任何修改前执行：

```powershell
git status --short --branch
git remote -v
```

如已配置远端，再执行：

```powershell
git fetch origin
```

然后分类本地改动：当前任务、历史改动、临时生成物、无法判断。无法安全分离时先停止，不继续叠加新改动。

## 验证命令

### 小程序

```powershell
cd aity-uni-app-v2
npm run build:mp-weixin
```

### H5

```powershell
cd aity-uni-app-v2
npm run build:h5
```

### 后端

```powershell
cd backend
node --check src/index.js
npm test
```

如果本地没有完整测试数据库，`npm test` 可暂缓，但必须在 MR/提交说明中写明原因，并至少完成入口语法检查和受影响接口的手工验证。

## 高风险区域

| 区域 | 风险 | 额外要求 |
| --- | --- | --- |
| `backend/src/routes/**`、`backend/src/controllers/**` | API 契约变化 | 搜索 `aity-uni-app-v2/src/api/**` 调用方，说明兼容性 |
| `backend/migrations/**`、`backend/src/models/**` | 数据结构变化 | 写清迁移、回滚和线上执行顺序 |
| `backend/src/config/db.js`、`.env.example` | 环境和数据库 | 不提交真实密钥，区分本地/测试/生产 |
| `aity-uni-app-v2/src/utils/request.js`、`src/utils/config.js` | 所有前端请求 | 同时验证小程序和 H5 构建 |
| `aity-uni-app-v2/src/pages.json`、`src/pages/**` | 页面路由与多端适配 | 修改页面时至少验证小程序构建；影响 H5 时验证 H5 构建 |
| 通知推送相关模块 | 用户触达和合规 | 必须有开关、失败记录、退订/关闭策略和发送日志 |

## 前端多端原则

- 小程序和 H5 共用 `aity-uni-app-v2` 源码。
- 不再以服务器 `/var/www/frontend` 旧 H5 源码作为新功能开发主线。
- 小程序发布通过微信开发者工具或 `miniprogram-ci`；腾讯云服务器只在后端、数据库、H5 静态产物、域名证书变更时参与。

## 仓库特有例外

| 规则/范围 | 原因 | 负责人 | 生效日期 | 到期日期 |
| --- | --- | --- | --- | --- |
| `npm test` 可在无测试数据库时暂缓 | 当前基线优先恢复可维护性，测试库接入待补齐 | 项目维护人 | 2026-08-08 | 2026-09-30 |
