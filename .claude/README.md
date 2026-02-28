# AITY VIP AI 协作指南

> **项目**: AITY VIP - 投研图灵室（金融知识学习平台）
> **版本**: v2.0.0
> **更新**: 2026-02-28

---

## 快速参考

| 项目 | 值 |
|------|-----|
| **项目路径** | `D:\your-mcp-proxy\AITY_VIP` |
| **前端目录** | `aity-uni-app-v2` |
| **后端目录** | `backend` |
| **前端端口** | 5173 (H5) |
| **后端端口** | 3001 |
| **生产环境** | https://aity88.online:8443 |
| **当前分支** | `feature/iteration-1` |

---

## 核心规则

### 1. 自动执行原则
AI 在执行任务时**自动处理**以下事项，无需用户额外提醒：
- 启动服务（后端 + H5）
- 提交代码到 Git
- 更新相关文档
- 编译小程序（如需要）

### 2. 生产环境优先
- API 默认连接生产环境 `https://aity88.online:8443`
- 本地调试时临时切换，调试完改回

### 3. 文档同步更新
- 代码变更必须同步更新相关文档
- 新功能必须更新需求清单

---

## 常用命令

### 启动服务
```bash
# 后端
cd backend && npm run dev

# H5 前端
cd aity-uni-app-v2 && npm run dev:h5

# 小程序编译
cd aity-uni-app-v2 && npm run build:mp-weixin
```

### 部署命令
```bash
# 后端部署（SSH到服务器）
cd /root/AITY_VIP/backend && git pull && pm2 restart aity-vip-backend

# H5 部署（本地编译后上传）
cd aity-uni-app-v2/scripts && full-deploy.bat
```

### Git 提交
```bash
git add .
git commit -m "feat(module): 描述"
git push origin feature/iteration-1
```

---

## 测试账号

| 用户名 | 邮箱 | 密码 | 角色 |
|--------|------|------|------|
| admin | admin@example.com | 123456 | super_admin |
| 等风来 | 625668823@qq.com | 112044 | vip_short |
| vip_test | vip_test@example.com | 123456 | vip_mid |

> 详细账户信息见 [测试账户参考](../docs/testing/测试账户参考.md)

---

## 文档导航

### 快速参考
- [快速参考卡](skills/quick-reference.md) - 精简版核心信息

### 开发指南
- [后端开发指南](skills/backend-guide.md) - 后端规范和示例
- [前端开发指南](skills/frontend-guide.md) - uni-app 开发规范
- [部署命令参考](skills/deployment-commands.md) - 常用部署命令

### 项目文档
- [需求文档](../docs/core/需求文档.md)
- [API文档](../docs/core/API文档.md)
- [部署手册](../docs/core/部署手册.md)
- [运维手册](../docs/core/运维手册.md)

### 特殊配置
- [浏览器测试配置](rules/browser-config.md) - Playwright 自动化测试

---

## 标准工作流程

```
1. 接收任务 → 创建 Todo 列表
2. 分析需求 → 确认理解正确
3. 启动服务 → 后端 + H5
4. 执行任务 → 按步骤完成
5. 自测验证 → 确保功能正常
6. 提交代码 → Git commit + push
7. 更新文档 → 记录修改内容
8. 汇报结果 → 总结完成情况
```

---

## 注意事项

1. **不要询问是否需要启动服务** - 直接启动
2. **不要询问是否需要提交代码** - 直接提交
3. **不要询问是否需要更新文档** - 直接更新
4. **只有在不确定需求时才询问用户**
5. **保持主动，减少用户操作步骤**

---

**维护者**: AI Coding Assistant
**最后更新**: 2026-02-28
