# Codex 开发执行规则

> **适用范围**: Codex 在 AITY_VIP 项目中的编码、测试、文档和提交任务  
> **核心原则**: 先读取项目规则，再执行本地验证；dev 版本连接本地后端和腾讯云 test 数据库；生产相关操作必须询问用户。

---

## 一、规则读取顺序

Codex 每次进入 AITY_VIP 开发任务时，必须按顺序读取：

1. `.codebuddy/rules/development-rules.md`
2. `.codebuddy/rules/iteration-management.md`
3. `.claude/WORKFLOW.md`

`.codebuddy/rules` 是当前项目的主规则；`.claude` 仅作为补充，不能覆盖 `.codebuddy` 中的环境和执行流程。

---

## 二、固定环境认知

- dev 小程序版本连接本地后端：`localhost:3001`
- 本地后端连接腾讯云 test 数据库：`投研图灵室_test`
- build/生产版本连接生产环境和生产数据库
- 测试数据库环境默认是正常的，不要先假设数据库配置错误
- 如果测试命令异常，先检查是否按项目命令和环境脚本执行

---

## 三、自动执行规则

无需询问用户即可执行：

- 修改后端后，检查或启动 `backend` 本地服务
- 修改前端后，运行 `aity-uni-app-v2` 的 dev 小程序编译
- 编译失败时，根据错误继续修复
- 更新迭代文档
- 本地验证通过后提交 Git

必须询问用户才能执行：

- 部署生产环境
- 修改生产环境配置
- 操作生产数据库

---

## 四、标准验证命令

后端本地服务：

```bash
cd D:\your-mcp-proxy\AITY_VIP\backend
npm run dev
```

dev 小程序编译：

```bash
cd D:\your-mcp-proxy\AITY_VIP\aity-uni-app-v2
npm run dev:mp-weixin:local
```

生产小程序构建仅用于发布前验证：

```bash
cd D:\your-mcp-proxy\AITY_VIP\aity-uni-app-v2
npm run build:mp-weixin:cloud
```

---

## 五、提交规则

- 只 stage 本次相关文件
- 不提交工作区中已有的无关删除、新增或修改
- 提交信息必须说明修改原因、测试情况、已知问题
- 提交前必须更新迭代记录或进度文档

---

## 六、错误处理

- 遇到测试失败时，先区分业务失败、编译失败、环境脚本失败
- 不要因为某个辅助测试命令失败就修改稳定的项目环境配置
- dev 版本验证优先级高于临时自造的测试命令
