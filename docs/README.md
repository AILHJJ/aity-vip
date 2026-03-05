---
document_type: index
version: 2.0.0
last_updated: 2026-03-05
ai_generated: true
tags: [index, main, entry-point]
---

# AITY VIP - 投研图灵室

> **项目定位**: 金融知识学习平台
> **当前版本**: v1.8.0
> **最后更新**: 2026-03-05

## 快速导航（按角色）

### 我是新用户
快速了解项目并开始使用：
- [5分钟快速开始](./01-入门指南/quick-start.md) - 快速上手指南
- [项目概述](./01-入门指南/project-overview.md) - 了解项目全貌
- [用户操作手册](./02-用户手册/user-manual.md) - 详细使用说明
- [常见问题](./02-用户手册/faq.md) - FAQ解答

### 我是开发者
开发相关文档和资源：
- [开发环境搭建](./03-开发指南/README.md) - 开发环境配置
- [API文档](./03-开发指南/api/README.md) - 完整API接口文档
- [编码规范](./03-开发指南/coding-standards.md) - 代码风格和规范
- [系统架构](./03-开发指南/architecture.md) - 架构设计文档
- [Git工作流](./03-开发指南/git-workflow.md) - 版本管理规范

### 我是运维人员
部署和运维相关文档：
- [部署指南](./04-部署指南/README.md) - 完整部署流程
- [本地环境搭建](./04-部署指南/local-setup.md) - 本地开发环境
- [服务器部署](./04-部署指南/server-deployment.md) - 生产环境部署
- [小程序部署](./04-部署指南/miniprogram-deployment.md) - 小程序发布
- [配置说明](./04-部署指南/configuration.md) - 环境配置详解

### 我是项目管理者
项目规划和迭代管理：
- [需求文档](./08-项目规划/requirements.md) - 详细业务需求
- [项目路线图](./08-项目规划/roadmap.md) - 未来规划
- [发布清单](./08-项目规划/release-checklist.md) - 发布检查项
- [迭代记录](./08-项目规划/iterations/README.md) - 迭代历史

### 我是第三方集成
API集成和对接：
- [集成指南](./09-integration/integration-guide.md) - 集成流程说明
- [API文档](./03-开发指南/api/README.md) - 接口文档
- [API密钥管理](./09-integration/api-keys.md) - 密钥申请和管理

---

## 文档索引（按功能）

### 核心功能模块

#### AI投顾助手
基于大语言模型的智能投顾系统，支持流式对话和金融工具调用。
- [功能说明](./06-功能模块/AI投顾助手/README.md)
- [技术实现](./06-功能模块/AI投顾助手/technical-implementation.md)
- [数据格式](./06-功能模块/AI投顾助手/data-format.md)
- [API接口](./03-开发指南/api/03-ai-assistant-api.md)

**核心特性**：
- SSE流式对话，实时响应
- 上下文记忆，多轮对话
- 用户数据隔离，安全可靠
- 金融工具表格渲染
- 多模型配置和版本管理

#### 行情中心
实时行情数据展示和市场分析工具。
- [功能说明](./06-功能模块/行情中心/README.md)
- [设计理念](./06-功能模块/行情中心/design-philosophy.md)
- [API接口](./03-开发指南/api/02-financial-data-api.md)

**核心特性**：
- 市场温度计 - 市场情绪指标
- 连板天梯 - 涨停股票排行
- 实时行情数据
- 资金流向分析

#### 打板监控
涨停跌停实时监控和预警系统。
- [功能说明](./06-功能模块/打板监控/README.md)
- [API接口](./03-开发指南/api/02-trading-board-api.md)

**核心特性**：
- 实时监控涨跌停
- 打板成功率统计
- 历史数据查询

#### 消息推送系统
管理员向用户推送投研消息的核心系统。
- [API接口](./03-开发指南/api/04-core-business-api.md)

**核心特性**：
- 10种消息类型
- 消息标签和权限控制
- 定时发布
- 消息置顶和收藏
- 富文本和图片支持

### 技术文档

#### 架构与设计
- [系统架构](./03-开发指南/architecture.md) - 整体架构设计
- [数据库设计](./03-开发指南/database-design.md) - 数据模型设计
- [编码规范](./03-开发指南/coding-standards.md) - 代码风格指南

#### API文档
- [API文档总览](./03-开发指南/api/README.md)
- [金融数据接口](./03-开发指南/api/01-financial-data-api.md)
- [打板接口](./03-开发指南/api/02-trading-board-api.md)
- [AI助手接口](./03-开发指南/api/03-ai-assistant-api.md)
- [核心业务接口](./03-开发指南/api/04-core-business-api.md)
- [SSE事件说明](./03-开发指南/api/05-sse-events.md)

#### 测试文档
- [测试指南](./07-测试文档/test-guide.md) - 测试流程和规范
- [测试用例](./07-测试文档/test-cases.md) - 功能测试用例
- [自动化测试](./07-测试文档/automation/README.md) - Playwright自动化测试

### 部署运维

#### 部署指南
- [本地环境搭建](./04-部署指南/local-setup.md) - 开发环境配置
- [服务器部署](./04-部署指南/server-deployment.md) - 生产环境部署
- [小程序部署](./04-部署指南/miniprogram-deployment.md) - 微信小程序发布
- [配置说明](./04-部署指南/configuration.md) - 环境变量和配置

#### 运维手册
- [监控指南](./05-运维手册/monitoring.md) - 系统监控和告警
- [故障排查](./05-运维手册/troubleshooting.md) - 常见问题解决
- [维护手册](./05-运维手册/maintenance.md) - 日常维护指南

---

## 项目亮点

### 技术栈

**前端**：
- uni-app (Vue 3) - 支持多端部署（H5、微信小程序等）
- Pinia - 状态管理
- Vue Router - 路由管理
- Axios - HTTP客户端

**后端**：
- Node.js + Express - Web框架
- MySQL - 关系型数据库
- Sequelize - ORM框架
- JWT - 身份认证
- PM2 - 进程管理

**AI集成**：
- Dify工作流 - AI能力平台
- SSE流式响应 - 实时对话
- 多模型支持 - 灵活配置

**部署**：
- 云服务器 - 生产环境
- HTTPS - 安全传输
- PM2集群 - 进程管理

### 核心功能

- 消息推送系统（10种消息类型）
- AI投顾对话（上下文记忆、用户隔离）
- 行情数据展示（实时行情、资金流向）
- 打板监控（涨停跌停实时预警）
- 多端支持（H5、微信小程序）
- 用户权限管理（5种角色）
- 数据统计和导出

---

## 项目统计

| 指标 | 数值 | 说明 |
|------|------|------|
| API接口 | 65个 | 包含所有CRUD和AI接口 |
| 功能模块 | 15个 | 消息、讨论、AI、行情等 |
| 代码行数 | 50,000+ | 前后端代码总量 |
| 测试覆盖 | 80%+ | 核心功能测试覆盖 |
| 文档页数 | 200+ | 包含归档文档 |
| 支持平台 | 2个 | H5网页、微信小程序 |

---

## AI辅助开发说明

> 本项目主要采用AI编程模式开发，大部分文档由AI根据标准模板生成。

### 文档生成规范

**模板系统**：
- 所有文档遵循统一模板（见 `templates/` 目录）
- 文档元数据包含AI生成标记和标签系统
- 迭代过程生成摘要文档，不保留中间过程文档

**元数据标准**：
```yaml
---
document_type: feature|api|guide|test|iteration
module: [模块名]
version: 1.0.0
last_updated: YYYY-MM-DD
maintainer: [维护人]
ai_generated: true|false
tags: [标签1, 标签2]
related_docs:
  - [相关文档1]
  - [相关文档2]
---
```

### 给AI的提示

当AI需要生成或更新文档时，请按以下步骤操作：

1. **检查模板** - 查看 `templates/` 目录中的对应模板
2. **确定类型** - 选择正确的文档类型（feature/api/guide/test/iteration）
3. **填充元数据** - 填写完整的元数据块（特别是tags和related_docs）
4. **遵循结构** - 按照模板的章节结构生成内容
5. **添加链接** - 在related_docs中添加相关文档的链接
6. **验证格式** - 确保Markdown格式正确

**文档分类**：
- `feature` - 功能模块文档
- `api` - API接口文档
- `guide` - 使用指南文档
- `test` - 测试相关文档
- `iteration` - 迭代总结文档

**常用标签**：
- `ai` - AI相关功能
- `sse` - SSE流式响应
- `streaming` - 流式处理
- `financial-data` - 金融数据
- `market-center` - 行情中心
- `trading-board` - 打板功能
- `message` - 消息系统
- `user-management` - 用户管理

---

## 联系方式

**项目地址**：D:\your-mcp-proxy\AITY_VIP
**生产环境**：https://aity88.online:8443
**技术支持**：[待补充]
**项目负责人**：[待补充]

---

**文档版本**: v2.0.0
**维护团队**: AITY VIP Team
**最后更新**: 2026-03-05
