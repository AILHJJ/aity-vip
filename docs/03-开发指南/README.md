# 开发文档

> **元数据**
> - 文档版本：v2.0.0
> - 更新日期：2026-01-30
> - 适用人群：开发人员
> - 文档分类：导航索引

---

## 文档导航

本目录包含VIP投研内部分享系统的开发文档，为开发人员提供详细的开发指导和规范说明。

---

## 文档列表

### 1. [编码规范](./coding-standards.md)

**适合人群**：所有开发人员

**内容概览**：
- 技术栈说明
- 代码风格规范
- 文件结构规范
- 命名规范
- 开发流程
- 最佳实践

**阅读时间**：20分钟

---

### 2. [Git工作流](./git-workflow.md)

**适合人群**：所有开发人员

**内容概览**：
- Git仓库配置
- 分支管理策略
- 提交信息规范
- 工作流程
- 常用命令
- 常见问题解决

**阅读时间**：15分钟

---

### 3. [系统架构](./architecture.md)

**适合人群**：开发人员、架构师

**内容概览**：
- 整体架构设计
- 前端架构
- 后端架构
- 数据库设计
- 安全架构
- 性能优化
- 部署架构

**阅读时间**：25分钟

---

## 推荐阅读路径

### 新手开发者

```
1. 编码规范（20分钟）
   ↓
2. Git工作流（15分钟）
   ↓
3. 系统架构（25分钟）
```

### 有经验的开发者

```
1. 系统架构（25分钟）
   ↓
2. 编码规范（选择性阅读）
   ↓
3. Git工作流（15分钟）
```

### 架构师/技术负责人

```
1. 系统架构（25分钟）
   ↓
2. 编码规范（了解标准）
   ↓
3. 其他技术文档
```

---

## 快速链接

### 核心概念

- **前端技术栈**：Vue 3 + Vite + Element Plus + Pinia
- **后端技术栈**：Node.js + Express.js + MySQL + Sequelize
- **移动端框架**：uni-app（支持H5和小程序）
- **认证方式**：JWT Token
- **数据库**：MySQL 5.7.0+

### 开发工具

- **IDE**：VS Code
- **API测试**：Postman
- **版本控制**：Git + GitHub
- **数据库管理**：MySQL Workbench
- **小程序开发**：微信开发者工具

### 相关文档

- [项目概述](../01-getting-started/project-overview.md) - 项目介绍
- [快速开始](../01-getting-started/quick-start.md) - 环境搭建
- [部署手册](../02-deployment/) - 部署运维
- [API文档](../04-api/) - 接口文档

---

## 开发规范速查

### Git提交规范

```bash
# 格式
<类型>(<范围>): <描述>

# 示例
feat(user): 添加用户登录功能
fix(message): 修复消息显示问题
docs: 更新API文档
```

### 分支命名规范

```bash
feature/功能名称    # 新功能开发
bugfix/问题描述     # Bug修复
hotfix/问题描述     # 紧急修复
release/版本号      # 版本发布
```

### 代码风格

- **缩进**：2个空格
- **引号**：单引号优先
- **分号**：使用分号
- **命名**：camelCase（变量/函数）、PascalCase（类名）

---

## 常见任务

### 创建新功能

1. 从develop创建feature分支
2. 开发功能并测试
3. 提交代码并推送
4. 创建Pull Request
5. 代码审查
6. 合并到develop分支

### 修复Bug

1. 从develop创建bugfix分支
2. 定位并修复问题
3. 测试修复
4. 提交代码并推送
5. 创建Pull Request
6. 合并到develop分支

### 发布版本

1. 从develop创建release分支
2. 更新版本号
3. 测试验证
4. 合并到main分支
5. 创建版本标签
6. 部署到生产环境

---

## 开发资源

### 官方文档

- [Vue 3 官方文档](https://cn.vuejs.org/)
- [Element Plus 官方文档](https://element-plus.org/zh-CN/)
- [Vite 官方文档](https://vitejs.dev/guide/)
- [uni-app 官方文档](https://uniapp.dcloud.net.cn/)
- [Express.js 官方文档](https://expressjs.com/zh-cn/)
- [Sequelize 官方文档](https://sequelize.org/docs/v6/)

### 学习资源

- [Vue 3 教程](https://cn.vuejs.org/guide/introduction.html)
- [uni-app 教程](https://uniapp.dcloud.net.cn/tutorial/)
- [Node.js 最佳实践](https://github.com/goldbergyoni/nodebestpractices)
- [JavaScript 编码规范](https://github.com/airbnb/javascript)

### 工具文档

- [ESLint 配置](https://eslint.org/docs/latest/)
- [Prettier 配置](https://prettier.io/docs/en/)
- [Git 参考手册](https://git-scm.com/docs)

---

## 获取帮助

### 遇到问题？

1. **查看文档**：先查阅相关文档
2. **搜索Issue**：在GitHub仓库搜索类似问题
3. **提问**：创建新的Issue
4. **联系团队**：直接联系项目成员

### 贡献代码

1. 阅读开发规范
2. 遵循Git工作流
3. 编写清晰的提交信息
4. 创建Pull Request
5. 参与代码审查

---

## 文档版本说明

| 文档 | 版本 | 更新日期 | 维护者 |
|------|------|----------|--------|
| 编码规范 | v2.0.0 | 2026-01-30 | 开发团队 |
| Git工作流 | v2.0.0 | 2026-01-30 | 开发团队 |
| 系统架构 | v2.0.0 | 2026-01-30 | 开发团队 |

---

## 文档反馈

如果你发现文档中的错误或有改进建议：

- 提交Pull Request修复文档
- 创建Issue反馈问题
- 联系文档维护者

你的反馈帮助我们改进文档质量！

---

**文档维护者：** 开发团队
**最后更新：** 2026-01-30
**版本：** v2.0.0
