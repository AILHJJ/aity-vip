# 文档结构优化设计文档

## 文档信息
- **创建日期**: 2026-03-05
- **设计者**: Claude Code
- **状态**: 待实施
- **目标**: 建立AI友好的、产品交付导向的文档体系

---

## 一、背景和目标

### 1.1 现状分析

**当前文档规模**:
- 总文件数: 233个
- Markdown文档: 215个
- 目录数: 30个
- 根目录散落文档: 20个
- 归档文档: 108个

**核心问题**:
1. **目录职责重叠**: `config/` vs `deployment/` vs `getting-started/`
2. **迭代文档冗余**: 同一功能多个过程文档（如AI配置管理有9个文档）
3. **根目录混乱**: 20个文档未分类
4. **归档管理缺失**: 108个归档文档缺乏分类标准
5. **AI生成文档缺乏规范**: 文档格式和结构不统一

### 1.2 优化目标

**主要目标**:
- ✅ **产品交付导向** - 为最终用户提供清晰简洁的文档
- ✅ **版本管理导向** - 建立清晰的版本归档机制
- ✅ **AI友好格式** - 优化文档结构让AI更容易理解和生成

**服务对象**:
- 最终用户（使用指南）
- 前端/后端开发者（API文档、开发指南）
- 运维人员（部署手册、配置指南）
- 项目管理者（需求文档、迭代记录）
- 第三方集成（API文档、集成指南）

### 1.3 关键策略

1. **模板标准化** - 为不同类型文档建立标准模板
2. **分级版本管理** - 核心文档保留版本历史，过程文档只保留最新版
3. **迭代摘要化** - 每次迭代保留综合总结文档，删除中间过程文档
4. **AI友好结构** - 标准化章节命名、标签系统、元数据

---

## 二、目标文档结构

### 2.1 目录架构设计

```
docs/
├── README.md                          # 项目主入口（AI友好）
│
├── 01-getting-started/                # 新用户入门
│   ├── README.md
│   ├── quick-start.md                 # 5分钟快速开始
│   └── project-overview.md            # 项目概述
│
├── 02-user-guide/                     # 用户手册
│   ├── README.md
│   ├── user-manual.md                 # 用户操作手册
│   └── faq.md                         # 常见问题
│
├── 03-development/                    # 开发文档
│   ├── README.md
│   ├── api/                           # API文档（已优化）
│   │   ├── README.md
│   │   ├── 01-financial-data-api.md
│   │   ├── 02-trading-board-api.md
│   │   ├── 03-ai-assistant-api.md
│   │   ├── 04-core-business-api.md
│   │   └── 05-sse-events.md
│   ├── architecture.md                # 架构设计
│   ├── coding-standards.md            # 编码规范
│   └── git-workflow.md                # Git工作流
│
├── 04-deployment/                     # 部署文档
│   ├── README.md
│   ├── local-setup.md                 # 本地环境搭建
│   ├── server-deployment.md           # 服务器部署
│   ├── miniprogram-deployment.md      # 小程序部署
│   └── configuration.md               # 配置说明
│
├── 05-operations/                     # 运维文档
│   ├── README.md
│   ├── monitoring.md                  # 监控指南
│   ├── troubleshooting.md             # 故障排查
│   └── maintenance.md                 # 维护手册
│
├── 06-features/                       # 功能模块文档
│   ├── README.md
│   ├── ai-assistant/                  # AI投顾
│   │   ├── README.md
│   │   ├── technical-implementation.md
│   │   └── data-format.md
│   ├── market-center/                 # 行情中心
│   │   ├── README.md
│   │   └── design-philosophy.md
│   └── trading-board/                 # 打板功能
│       └── README.md
│
├── 07-testing/                        # 测试文档
│   ├── README.md
│   ├── test-guide.md                  # 测试指南
│   ├── test-cases.md                  # 测试用例
│   └── automation/                    # 自动化测试
│       └── README.md
│
├── 08-planning/                       # 项目管理
│   ├── README.md
│   ├── requirements.md                # 需求文档
│   ├── roadmap.md                     # 路线图
│   ├── release-checklist.md           # 发布清单
│   └── iterations/                    # 迭代记录
│       ├── README.md
│       └── iteration-summaries/       # 迭代摘要（按时间）
│           ├── 2026-02-ai-config-refactor.md
│           ├── 2026-02-prompt-optimization.md
│           └── 2026-03-market-center.md
│
├── 09-integration/                    # 第三方集成
│   ├── README.md
│   ├── integration-guide.md           # 集成指南
│   └── api-keys.md                    # API密钥管理
│
├── templates/                         # 文档模板
│   ├── feature-doc-template.md        # 功能文档模板
│   ├── api-doc-template.md            # API文档模板
│   ├── iteration-summary-template.md  # 迭代摘要模板
│   └── test-report-template.md        # 测试报告模板
│
├── scripts/                           # 自动化工具
│   ├── generate-index.js              # 生成索引
│   ├── validate-docs.js               # 文档校验
│   └── archive-iteration.js           # 归档工具
│
└── archived/                          # 归档文档
    ├── README.md                      # 归档说明
    ├── versions/                      # 核心文档版本历史
    │   ├── api-v1.0/
    │   └── deployment-v1.0/
    └── deprecated/                    # 已废弃文档
        └── README.md
```

### 2.2 命名规范

**目录命名**:
- 格式: `数字前缀-模块名`
- 示例: `01-getting-started`, `03-development`
- 原因: 数字前缀控制排序，便于AI理解目录优先级

**文件命名**:
- 格式: `小写字母-连字符分隔.md`
- 示例: `quick-start.md`, `api-documentation.md`
- 原因: 兼容URL编码，便于跨文档引用

**锚点命名**:
- 格式: `小写字母-短横线`
- 示例: `#quick-start`, `#api-endpoints`
- 原因: 兼容Markdown链接，便于AI生成引用

---

## 三、文档模板标准

### 3.1 AI友好的文档元数据

每个文档必须在开头包含标准化元数据块：

```markdown
---
document_type: feature|api|guide|test|iteration
module: ai-assistant|market-center|trading-board|core
version: 1.0.0
last_updated: 2026-03-05
maintainer: 后端开发团队
ai_generated: true|false
tags: [ai, sse, streaming, financial-data]
related_docs:
  - ./api/03-ai-assistant-api.md
  - ./technical-implementation.md
---
```

**元数据说明**:
- `document_type`: 文档类型，帮助AI快速分类
- `module`: 所属模块，便于AI理解文档归属
- `version`: 文档版本号
- `ai_generated`: 标记是否由AI生成
- `tags`: 标签数组，便于AI检索相关文档
- `related_docs`: 相关文档链接，建立文档关系图

### 3.2 功能文档模板

**文件**: `templates/feature-doc-template.md`

```markdown
---
document_type: feature
module: [模块名]
version: 1.0.0
last_updated: YYYY-MM-DD
maintainer: [维护人]
ai_generated: true
tags: [标签1, 标签2]
related_docs:
  - [相关文档1]
  - [相关文档2]
---

# [功能名称]

## 一、功能概述

### 1.1 功能简介
[一句话描述功能的作用]

### 1.2 使用场景
- 场景1: [描述]
- 场景2: [描述]

### 1.3 核心价值
[为用户解决什么问题]

## 二、功能详情

### 2.1 功能列表
| 功能点 | 说明 | 状态 |
|--------|------|------|
| [功能1] | [说明] | ✅ |
| [功能2] | [说明] | ✅ |

### 2.2 交互流程
[流程图或步骤说明]

### 2.3 关键技术点
- 技术点1: [说明]
- 技术点2: [说明]

## 三、使用指南

### 3.1 快速开始
[3-5步快速使用指南]

### 3.2 详细操作
[分步骤详细说明]

### 3.3 常见问题
**Q1: [问题]**
A: [答案]

## 四、技术实现

### 4.1 架构设计
[架构图和说明]

### 4.2 数据流程
[数据流向图]

### 4.3 API依赖
- [API接口1]: [用途]
- [API接口2]: [用途]

## 五、测试验证

### 5.1 测试用例
- [ ] 用例1: [描述]
- [ ] 用例2: [描述]

### 5.2 验证结果
[测试结果摘要]

## 六、变更记录

### v1.0.0 (YYYY-MM-DD)
- ✨ 初始版本
- [变更说明]

---

**文档维护**: [维护团队]
**最后更新**: YYYY-MM-DD
```

### 3.3 迭代摘要模板

**文件**: `templates/iteration-summary-template.md`

```markdown
---
document_type: iteration
module: [模块名]
version: 1.0.0
last_updated: YYYY-MM-DD
maintainer: [维护人]
ai_generated: true
tags: [iteration, refactor, optimization]
related_docs:
  - [相关功能文档]
  - [相关API文档]
---

# [迭代名称] - 迭代摘要

## 迭代信息
- **迭代周期**: YYYY-MM-DD ~ YYYY-MM-DD
- **负责人**: [姓名]
- **状态**: ✅ 已完成

## 一、迭代目标

### 1.1 业务目标
[本次迭代要解决的业务问题]

### 1.2 技术目标
[本次迭代要实现的技术优化]

### 1.3 成功指标
- 指标1: [目标值]
- 指标2: [目标值]

## 二、设计方案

### 2.1 设计决策
**决策1: [决策内容]**
- 背景: [为什么需要这个决策]
- 方案: [选择了什么方案]
- 原因: [为什么选择这个方案]
- 影响: [对系统的影响]

**决策2: [决策内容]**
- 背景: [说明]
- 方案: [说明]
- 原因: [说明]
- 影响: [说明]

### 2.2 技术方案
[技术实现要点]

### 2.3 影响范围
- 影响模块1: [影响说明]
- 影响模块2: [影响说明]

## 三、实施过程

### 3.1 实施步骤
1. [步骤1] - 耗时: X小时
2. [步骤2] - 耗时: X小时
3. [步骤3] - 耗时: X小时

**总耗时**: X小时

### 3.2 遇到的问题
**问题1: [问题描述]**
- 原因: [原因分析]
- 解决: [解决方案]
- 教训: [经验总结]

**问题2: [问题描述]**
- 原因: [原因分析]
- 解决: [解决方案]
- 教训: [经验总结]

### 3.3 代码变更
- 新增文件: X个
- 修改文件: X个
- 删除文件: X个
- 代码行数: +XXX -XXX

## 四、验证结果

### 4.1 功能验证
- [ ] 功能点1: ✅ 通过
- [ ] 功能点2: ✅ 通过
- [ ] 性能测试: ✅ 通过

### 4.2 用户反馈
[用户测试反馈摘要]

### 4.3 遗留问题
- 问题1: [描述] - 优先级: 高/中/低
- 问题2: [描述] - 优先级: 高/中/低

## 五、成果总结

### 5.1 交付成果
- ✅ [成果1]
- ✅ [成果2]
- ✅ 文档更新: [文档列表]

### 5.2 后续计划
- [ ] [后续任务1]
- [ ] [后续任务2]

### 5.3 知识沉淀
**可复用经验**:
1. [经验1]
2. [经验2]

**避免踩坑**:
1. [坑点1]
2. [坑点2]

## 六、相关资源

### 6.1 文档链接
- [设计文档](./design-doc.md)
- [API文档](./api-doc.md)
- [测试报告](./test-report.md)

### 6.2 代码仓库
- PR链接: [链接]
- Commit范围: [commit范围]

---

**文档维护**: [维护团队]
**最后更新**: YYYY-MM-DD
```

---

## 四、主README设计（AI友好）

### 4.1 README.md 结构

```markdown
---
document_type: index
version: 1.0.0
last_updated: 2026-03-05
ai_generated: false
tags: [index, main, entry-point]
---

# AITY VIP - 投研图灵室

> **项目定位**: 金融知识学习平台
> **当前版本**: v1.8.0
> **最后更新**: 2026-03-05

## 🎯 快速导航（按角色）

### 👤 我是新用户
👉 [5分钟快速开始](./01-getting-started/quick-start.md)

### 👨‍💻 我是开发者
- [开发环境搭建](./03-development/README.md)
- [API文档](./03-development/api/README.md)
- [编码规范](./03-development/coding-standards.md)

### 🔧 我是运维人员
- [部署指南](./04-deployment/README.md)
- [运维手册](./05-operations/README.md)

### 📋 我是项目管理者
- [需求文档](./08-planning/requirements.md)
- [项目路线图](./08-planning/roadmap.md)
- [迭代记录](./08-planning/iterations/README.md)

### 🔗 我是第三方集成
👉 [集成指南](./09-integration/README.md)

---

## 📚 文档索引（按功能）

### 核心功能
- [AI投顾助手](./06-features/ai-assistant/README.md) - SSE流式对话、金融工具
- [行情中心](./06-features/market-center/README.md) - 市场温度计、连板天梯
- [打板监控](./06-features/trading-board/README.md) - 涨跌停监控

### 技术文档
- [系统架构](./03-development/architecture.md)
- [API接口](./03-development/api/README.md) - 65个接口
- [数据库设计](./03-development/database-design.md)

### 部署运维
- [本地环境](./04-deployment/local-setup.md)
- [服务器部署](./04-deployment/server-deployment.md)
- [小程序部署](./04-deployment/miniprogram-deployment.md)

---

## 🚀 项目亮点

### 技术栈
- **前端**: uni-app (Vue 3) - 支持多端部署
- **后端**: Node.js + Express + MySQL
- **AI集成**: Dify工作流 + SSE流式对话
- **部署**: PM2 + HTTPS + 云服务器

### 核心功能
- ✅ 消息推送系统（10种消息类型）
- ✅ AI投顾对话（上下文记忆、用户隔离）
- ✅ 行情数据展示（实时行情、资金流向）
- ✅ 多端支持（H5、微信小程序）

---

## 📊 项目统计

| 指标 | 数值 |
|------|------|
| API接口 | 65个 |
| 功能模块 | 15个 |
| 代码行数 | 50,000+ |
| 测试覆盖 | 80%+ |
| 文档页数 | 200+ |

---

## 🤖 AI辅助开发说明

> 本项目主要采用AI编程模式开发，大部分文档由AI根据标准模板生成。

### 文档生成规范
- 所有文档遵循统一模板（见 `templates/` 目录）
- 文档元数据包含AI生成标记和标签系统
- 迭代过程生成摘要文档，不保留中间过程文档

### 给AI的提示
当AI需要生成或更新文档时，请：
1. 检查 `templates/` 目录中的对应模板
2. 填充标准元数据（document_type, tags, related_docs）
3. 遵循文档章节结构
4. 添加相关文档链接

---

## 📞 联系方式

- **生产环境**: https://aity88.online:8443
- **技术支持**: [联系方式]
- **项目负责人**: [负责人]

---

**文档版本**: v2.0.0
**维护团队**: AITY VIP Team
```

---

## 五、实施计划

### 5.1 第一阶段：核心文档整理（优先级最高）

**目标**: 建立标准化的核心文档体系

**任务清单**:

#### 1. 创建新目录结构（15分钟）
```bash
# 创建新的目录结构
mkdir -p docs/01-getting-started
mkdir -p docs/02-user-guide
mkdir -p docs/03-development/api
mkdir -p docs/04-deployment
mkdir -p docs/05-operations
mkdir -p docs/06-features/ai-assistant
mkdir -p docs/06-features/market-center
mkdir -p docs/06-features/trading-board
mkdir -p docs/07-testing/automation
mkdir -p docs/08-planning/iterations/iteration-summaries
mkdir -p docs/09-integration
mkdir -p docs/templates
mkdir -p docs/scripts
mkdir -p docs/archived/versions
```

#### 2. 创建文档模板（30分钟）
- [ ] `templates/feature-doc-template.md` - 功能文档模板
- [ ] `templates/api-doc-template.md` - API文档模板（已有）
- [ ] `templates/iteration-summary-template.md` - 迭代摘要模板
- [ ] `templates/test-report-template.md` - 测试报告模板

#### 3. 整理核心文档（60分钟）
- [ ] 将 `core/项目概述.md` → `01-getting-started/project-overview.md`
- [ ] 将 `core/需求文档.md` → `08-planning/requirements.md`
- [ ] 将 `core/开发指南.md` → `03-development/coding-standards.md`
- [ ] 将 `core/部署手册.md` → `04-deployment/server-deployment.md`
- [ ] 将 `core/运维手册.md` → `05-operations/maintenance.md`
- [ ] API文档已整理好，保持现状

#### 4. 合并配置文档（30分钟）
- [ ] 合并 `config/` 下的所有部署相关文档到 `04-deployment/`
- [ ] 合并 `config/` 下的所有环境配置文档到 `04-deployment/configuration.md`

#### 5. 整理功能文档（30分钟）
- [ ] 将 `ai-advisor/` 移动到 `06-features/ai-assistant/`
- [ ] 将 `market-center/` 移动到 `06-features/market-center/`
- [ ] 创建 `06-features/trading-board/README.md`

#### 6. 整理测试文档（20分钟）
- [ ] 将 `testing/` 下的所有文档移动到 `07-testing/`
- [ ] 删除重复的测试方案文档

#### 7. 创建新的README（20分钟）
- [ ] 创建根目录 `README.md`（AI友好格式）
- [ ] 创建各子目录的 `README.md`

**预计耗时**: 3小时

---

### 5.2 第二阶段：历史文档归档（优先级中等）

**目标**: 清理107个归档文档，保留有价值内容

#### 1. 分析归档文档（60分钟）
- [ ] 扫描 `archived/` 目录下的108个文档
- [ ] 分类:
  - **保留**: 设计决策、问题解决方案、重要技术文档
  - **删除**: 临时过程文档、重复文档、过时文档
  - **合并**: 同一功能的多个文档合并为一个摘要

#### 2. 创建归档索引（30分钟）
- [ ] 创建 `archived/README.md` - 归档文档索引和说明
- [ ] 为每个归档子目录创建 `README.md`

#### 3. 处理迭代文档（60分钟）
**AI配置管理重构相关文档（9个）**:
- [ ] 合并为一个迭代摘要: `08-planning/iterations/iteration-summaries/2026-02-ai-config-refactor.md`
- [ ] 删除中间过程文档（9个 → 1个）

**AI提示词优化相关文档（3个）**:
- [ ] 合并为一个迭代摘要: `08-planning/iterations/iteration-summaries/2026-02-prompt-optimization.md`
- [ ] 删除中间过程文档（3个 → 1个）

**行情中心相关文档（多个）**:
- [ ] 合并为一个迭代摘要: `08-planning/iterations/iteration-summaries/2026-03-market-center.md`

#### 4. 处理归档目录（60分钟）
- [ ] `archived/fix-reports/` (64个) - 保留重要的修复方案，删除临时报告
- [ ] `archived/test-reports/` (34个) - 保留测试方案选型文档，删除临时测试报告
- [ ] `archived/v1.x/` (9个) - 移动到 `archived/versions/v1.x/`

**预计耗时**: 3.5小时

---

### 5.3 第三阶段：建立AI友好体系（优先级中等）

**目标**: 建立自动化工具和AI友好的文档体系

#### 1. 创建自动化工具（60分钟）

**工具1: 文档索引生成器**
- [ ] 创建 `scripts/generate-index.js`
- 功能:
  - 扫描所有文档
  - 提取元数据
  - 生成多维度索引（按角色、按功能、按模块）
  - 更新README.md

**工具2: 文档校验器**
- [ ] 创建 `scripts/validate-docs.js`
- 功能:
  - 检查元数据完整性
  - 验证文档结构
  - 检查链接有效性
  - 生成校验报告

**工具3: 迭代归档工具**
- [ ] 创建 `scripts/archive-iteration.js`
- 功能:
  - 扫描迭代相关文档
  - 生成迭代摘要
  - 归档中间文档
  - 更新迭代索引

#### 2. 创建AI指导文档（30分钟）
- [ ] 创建 `.claude/DOCUMENTATION-GUIDE.md`
- 内容:
  - 文档生成规范
  - 模板使用说明
  - 命名规范
  - 元数据填写指南

#### 3. 优化现有文档（60分钟）
- [ ] 为所有现有文档添加标准化元数据
- [ ] 添加 `related_docs` 链接
- [ ] 添加 `tags` 标签

**预计耗时**: 2.5小时

---

### 5.4 第四阶段：清理根目录（优先级高）

**目标**: 清理根目录散落的20个文档

#### 处理方案

**根目录文档分类**:

1. **合并到 01-getting-started/**
   - `DELIVERY-GUIDE.md` → `delivery-guide.md`

2. **合并到 04-deployment/**
   - `H5部署方案指南.md` → `h5-deployment.md`
   - `部署指南.md` → （合并到 server-deployment.md）

3. **合并到 06-features/**
   - `AI-API-配置文档.md` → `ai-assistant/api-config.md`
   - `行情图嵌入文档.md` → `market-center/chart-embedding.md`

4. **合并到 08-planning/iterations/**
   - `AI模型提示词优化-实施总结.md` → （合并到迭代摘要）
   - `AI模型提示词速查表.md` → `ai-assistant/prompt-cheatsheet.md`
   - `README-AI提示词优化.md` → （删除，内容已在迭代摘要中）
   - `README_AI配置管理重构.md` → （删除，内容已在迭代摘要中）
   - 所有 `AI配置管理页面重构*.md` → （合并到迭代摘要）

5. **保留在根目录**
   - `README.md` - 主入口（重写）
   - `INDEX.md` - 删除（内容合并到README）
   - `ROADMAP.md` → `08-planning/roadmap.md`
   - `release-checklist.md` → `08-planning/release-checklist.md`

**预计耗时**: 1小时

---

## 六、文档维护规范

### 6.1 AI生成文档流程

```
1. AI接收任务
2. 检查 templates/ 目录中的对应模板
3. 确定文档类型和目标目录
4. 填充标准元数据（包含tags和related_docs）
5. 按模板结构生成内容
6. 运行校验脚本验证
7. 运行索引生成脚本更新README
8. 提交代码和文档
```

### 6.2 迭代文档归档流程

```
1. 迭代完成
2. AI生成迭代摘要文档（使用模板）
3. 运行归档脚本：
   - 扫描迭代相关文档
   - 生成摘要
   - 移动中间文档到 archived/
4. 更新迭代索引
5. 提交归档
```

### 6.3 版本管理规则

**核心文档（保留版本历史）**:
- API文档
- 部署手册
- 架构设计文档
- 需求文档

**过程文档（只保留最新版）**:
- 功能实现报告
- 测试报告
- 迭代过程文档

---

## 七、预期效果

### 7.1 解决的问题

| 问题 | 解决方案 | 效果 |
|------|----------|------|
| 目录职责不清 | 数字前缀+功能分类 | ✅ 清晰明了 |
| 根目录混乱 | 20个文档分类归档 | ✅ 根目录只保留README |
| 迭代文档冗余 | 迭代摘要化 | ✅ 9个文档 → 1个摘要 |
| 归档管理缺失 | 分类归档标准 | ✅ 108个 → 30个有价值文档 |
| AI生成无规范 | 标准模板+元数据 | ✅ 统一格式 |

### 7.2 带来的收益

**对新用户**:
- 5分钟快速开始指南
- 按角色导航的文档入口
- 清晰的功能文档

**对开发者**:
- 标准化的API文档
- AI友好的文档结构
- 自动化工具辅助

**对运维人员**:
- 完整的部署指南
- 故障排查手册
- 配置说明集中

**对AI**:
- 标准化模板
- 元数据标签系统
- 文档关系图（related_docs）

---

## 八、风险和应对

### 8.1 潜在风险

1. **文档迁移过程中断链接**
   - **应对**: 创建链接映射表，迁移后批量更新
   - **验证**: 运行链接检查工具

2. **归档文档误删有价值内容**
   - **应对**: 先备份，人工审核后再删除
   - **验证**: 保留30天观察期

3. **团队不适应新结构**
   - **应对**: 提供详细的维护指南和培训
   - **验证**: 试运行1周，收集反馈

### 8.2 回滚方案

如果新方案不适用：
1. Git回退到重构前版本
2. 保留新文档作为参考
3. 收集团队反馈后调整

---

## 九、后续优化方向

### 9.1 短期优化（1个月内）

1. **文档搜索增强**
   - 全文搜索功能
   - 按标签筛选
   - 按模块筛选

2. **文档版本对比**
   - 核心文档版本对比工具
   - 变更高亮显示

### 9.2 长期优化（3个月内）

1. **在线文档站点**
   - 使用VitePress/Docusaurus
   - 更好的阅读体验
   - 全文搜索

2. **文档自动化测试**
   - API文档与实际接口一致性检查
   - 示例代码可执行性验证

---

## 十、批准记录

- **设计评审**: 待评审
- **批准人**: 待定
- **批准日期**: 待定
- **实施开始日期**: 待定

---

**文档版本**: v1.0.0
**维护团队**: AITY VIP Team
**最后更新**: 2026-03-05
