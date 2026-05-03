# 文档结构优化实施计划

## 实施信息
- **创建日期**: 2026-03-05
- **基于设计**: `2026-03-05-documentation-optimization-design.md`
- **执行方式**: Subagent-Driven Development
- **预计总耗时**: 8-10小时

---

## 任务分解

### 批次1: 基础设施（并行执行，15分钟）

#### Task 1.1: 创建文档模板
**描述**: 创建3个标准文档模板
**文件**:
- `docs/templates/feature-doc-template.md`
- `docs/templates/iteration-summary-template.md`
- `docs/templates/test-report-template.md`

**验收标准**:
- [ ] 包含标准元数据块（document_type, tags, related_docs）
- [ ] 章节结构完整
- [ ] 包含填写示例

**预计耗时**: 5分钟

---

#### Task 1.2: 创建新目录结构
**描述**: 创建所有新的目录结构
**命令**:
```bash
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
mkdir -p docs/archived/versions
```

**验收标准**:
- [ ] 所有目录创建成功
- [ ] 目录权限正确

**预计耗时**: 2分钟

---

### 批次2: 核心文档整理（串行执行，90分钟）

#### Task 2.1: 整理入门文档
**描述**: 移动和整理入门相关文档
**操作**:
1. 移动 `core/项目概述.md` → `01-getting-started/project-overview.md`
2. 创建 `01-getting-started/quick-start.md`（基于项目概述提炼）
3. 创建 `01-getting-started/README.md`

**验收标准**:
- [ ] 文件移动成功，内容完整
- [ ] quick-start.md 包含5分钟快速开始指南
- [ ] README.md 包含模块导航

**预计耗时**: 15分钟

---

#### Task 2.2: 整理开发文档
**描述**: 移动和整理开发相关文档
**操作**:
1. 移动 `core/开发指南.md` → `03-development/coding-standards.md`
2. 移动 `core/API文档.md` → 保留（API文档已在api/目录）
3. 创建 `03-development/architecture.md`（基于项目概述提取）
4. 创建 `03-development/README.md`
5. 创建 `03-development/git-workflow.md`（移动 `config/Git工作流.md`）

**验收标准**:
- [ ] 所有文件移动成功
- [ ] README.md 包含开发文档索引
- [ ] architecture.md 包含系统架构图

**预计耗时**: 20分钟

---

#### Task 2.3: 整理部署文档
**描述**: 合并所有部署相关文档到 `04-deployment/`
**操作**:
1. 合并 `config/本地测试部署指南.md` + `config/快速开始-本地测试.md` → `04-deployment/local-setup.md`
2. 合并 `config/生产环境部署指南.md` + `config/服务器部署详细指令.md` → `04-deployment/server-deployment.md`
3. 合并 `config/微信小程序部署指南.md` + `config/小程序配置.md` + `config/小程序自动化部署指南.md` → `04-deployment/miniprogram-deployment.md`
4. 合并所有配置说明 → `04-deployment/configuration.md`
5. 创建 `04-deployment/README.md`

**验收标准**:
- [ ] 重复内容已合并，无冗余
- [ ] 每个文档包含完整的部署步骤
- [ ] README.md 包含部署文档索引

**预计耗时**: 30分钟

---

#### Task 2.4: 整理运维文档
**描述**: 创建运维文档模块
**操作**:
1. 移动 `core/运维手册.md` → `05-operations/maintenance.md`
2. 创建 `05-operations/monitoring.md`（基于部署文档提取）
3. 创建 `05-operations/troubleshooting.md`（基于archived/fix-reports提取）
4. 创建 `05-operations/README.md`

**验收标准**:
- [ ] 包含监控指标和告警规则
- [ ] 包含常见故障和解决方案
- [ ] README.md 包含运维文档索引

**预计耗时**: 15分钟

---

#### Task 2.5: 整理测试文档
**描述**: 整理测试相关文档
**操作**:
1. 移动 `testing/` 下所有文档到 `07-testing/`
2. 删除重复的测试方案文档
3. 创建 `07-testing/README.md`
4. 创建 `07-testing/automation/README.md`

**验收标准**:
- [ ] 所有测试文档已移动
- [ ] 重复文档已删除
- [ ] README.md 包含测试文档索引

**预计耗时**: 10分钟

---

### 批次3: 功能文档整理（串行执行，60分钟）

#### Task 3.1: 整理AI投顾文档
**描述**: 整理AI投顾功能文档
**操作**:
1. 移动 `ai-advisor/` 到 `06-features/ai-assistant/`
2. 移动 `AI-API-配置文档.md` → `06-features/ai-assistant/api-config.md`
3. 移动 `AI模型提示词速查表.md` → `06-features/ai-assistant/prompt-cheatsheet.md`
4. 创建 `06-features/ai-assistant/README.md`

**验收标准**:
- [ ] 所有AI相关文档已移动
- [ ] README.md 包含AI功能概述和使用指南
- [ ] 文档结构清晰

**预计耗时**: 15分钟

---

#### Task 3.2: 整理行情中心文档
**描述**: 整理行情中心功能文档
**操作**:
1. 移动 `market-center/README.md` → `06-features/market-center/README.md`
2. 移动 `design/行情中心*.md` → `06-features/market-center/`
3. 移动 `行情图嵌入文档.md` → `06-features/market-center/chart-embedding.md`
4. 补充 `design/market-center-design-philosophy.md` → `06-features/market-center/`

**验收标准**:
- [ ] 所有行情中心相关文档已移动
- [ ] README.md 包含功能概述
- [ ] 包含设计哲学说明

**预计耗时**: 15分钟

---

#### Task 3.3: 整理打板功能文档
**描述**: 整理打板功能文档
**操作**:
1. 创建 `06-features/trading-board/README.md`
2. 从API文档提取打板功能说明
3. 补充功能使用指南

**验收标准**:
- [ ] README.md 包含打板功能概述
- [ ] 包含功能使用指南
- [ ] 包含API依赖说明

**预计耗时**: 10分钟

---

#### Task 3.4: 整理用户指南
**描述**: 整理用户指南文档
**操作**:
1. 移动 `guides/user-guide.md` → `02-user-guide/user-manual.md`
2. 移动 `guides/faq.md` → `02-user-guide/faq.md`
3. 创建 `02-user-guide/README.md`

**验收标准**:
- [ ] 用户手册内容完整
- [ ] FAQ包含常见问题
- [ ] README.md 包含用户指南索引

**预计耗时**: 10分钟

---

#### Task 3.5: 整理项目管理文档
**描述**: 整理项目管理相关文档
**操作**:
1. 移动 `core/需求文档.md` → `08-planning/requirements.md`
2. 移动 `ROADMAP.md` → `08-planning/roadmap.md`
3. 移动 `release-checklist.md` → `08-planning/release-checklist.md`
4. 移动 `iteration/项目迭代记录.md` → `08-planning/iterations/README.md`
5. 移动 `iteration/后期迭代需求.md` → `08-planning/future-requirements.md`
6. 创建 `08-planning/README.md`

**验收标准**:
- [ ] 所有管理文档已移动
- [ ] README.md 包含项目管理文档索引
- [ ] iterations/README.md 包含迭代历史

**预计耗时**: 10分钟

---

### 批次4: 迭代文档摘要化（串行执行，120分钟）

#### Task 4.1: AI配置管理重构迭代摘要
**描述**: 合并AI配置管理相关的9个文档为1个迭代摘要
**源文档**:
- `AI配置管理UI重构对比.md`
- `AI配置管理页面UI重构说明.md`
- `AI配置管理页面重构实施指南.md`
- `AI配置管理页面重构完成清单.md`
- `AI配置管理页面重构文档索引.md`
- `AI配置管理页面重构项目总结.md`
- `AI配置管理页面重构验证报告.md`
- `README_AI配置管理重构.md`

**输出**: `08-planning/iterations/iteration-summaries/2026-02-ai-config-refactor.md`

**验收标准**:
- [ ] 包含迭代目标、设计决策、实施过程、验证结果
- [ ] 包含遇到的问题和解决方案
- [ ] 包含知识沉淀和可复用经验
- [ ] 符合迭代摘要模板格式

**预计耗时**: 30分钟

---

#### Task 4.2: AI提示词优化迭代摘要
**描述**: 合并AI提示词优化相关的3个文档为1个迭代摘要
**源文档**:
- `AI模型提示词优化-实施总结.md`
- `AI模型提示词速查表.md`（保留，不合并）
- `README-AI提示词优化.md`

**输出**: `08-planning/iterations/iteration-summaries/2026-02-prompt-optimization.md`

**验收标准**:
- [ ] 包含迭代目标、实施过程、验证结果
- [ ] 包含提示词优化技巧
- [ ] 符合迭代摘要模板格式

**预计耗时**: 20分钟

---

#### Task 4.3: 行情中心开发迭代摘要
**描述**: 合并行情中心开发相关的多个文档为1个迭代摘要
**源文档**:
- `market-center/README.md`（保留）
- `design/行情中心*.md`
- `reports/market-center-*.md`

**输出**: `08-planning/iterations/iteration-summaries/2026-03-market-center.md`

**验收标准**:
- [ ] 包含设计决策、实施过程、验证结果
- [ ] 包含UI设计哲学说明
- [ ] 符合迭代摘要模板格式

**预计耗时**: 30分钟

---

#### Task 4.4: 归档archived目录
**描述**: 分析和归档archived目录的107个文档
**操作**:
1. 分析 `archived/fix-reports/` (64个文档) - 删除临时报告，保留重要解决方案
2. 分析 `archived/test-reports/` (34个文档) - 删除临时报告，保留测试方案选型文档
3. 分析 `archived/v1.x/` (9个文档) - 移动到 `archived/versions/v1.x/`
4. 创建 `archived/README.md` - 归档索引和说明

**验收标准**:
- [ ] 归档文档从107个减少到30个左右
- [ ] 保留了有价值的设计决策和解决方案
- [ ] README.md 包含归档文档索引

**预计耗时**: 40分钟

---

### 批次5: 创建AI友好体系（并行执行，90分钟）

#### Task 5.1: 创建AI友好的主README
**描述**: 创建新的主README.md（AI友好格式）
**操作**:
1. 备份现有 README.md 和 INDEX.md
2. 创建新的 README.md（基于设计文档第五章）
3. 包含按角色导航、按功能导航、AI辅助开发说明

**验收标准**:
- [ ] 包含标准元数据块
- [ ] 包含按角色导航（用户/开发/运维/管理者/第三方）
- [ ] 包含按功能导航
- [ ] 包含AI辅助开发说明
- [ ] 包含项目统计信息

**预计耗时**: 20分钟

---

#### Task 5.2: 创建文档索引生成工具
**描述**: 创建 `scripts/generate-index.js`
**功能**:
- 扫描所有文档
- 提取元数据（document_type, tags, related_docs）
- 生成多维度索引（按角色、按功能、按模块）
- 更新README.md的索引部分

**验收标准**:
- [ ] 能正确提取元数据
- [ ] 生成多维度索引
- [ ] 输出格式清晰
- [ ] 包含错误处理

**预计耗时**: 30分钟

---

#### Task 5.3: 创建文档校验工具
**描述**: 创建 `scripts/validate-docs.js`
**功能**:
- 检查元数据完整性
- 验证文档结构
- 检查链接有效性
- 生成校验报告

**验收标准**:
- [ ] 能检测缺失的元数据
- [ ] 能检测无效链接
- [ ] 生成清晰的校验报告
- [ ] 包含错误处理

**预计耗时**: 20分钟

---

#### Task 5.4: 创建迭代归档工具
**描述**: 创建 `scripts/archive-iteration.js`
**功能**:
- 扫描迭代相关文档
- 生成迭代摘要（基于模板）
- 移动中间文档到archived/
- 更新迭代索引

**验收标准**:
- [ ] 能自动识别迭代相关文档
- [ ] 能生成符合模板的摘要
- [ ] 能正确移动和归档文档
- [ ] 包含错误处理

**预计耗时**: 20分钟

---

### 批次6: 清理和验证（串行执行，60分钟）

#### Task 6.1: 清理根目录散落文档
**描述**: 处理根目录的20个散落文档
**操作**:
1. 删除 `INDEX.md`（内容已合并到README）
2. 删除已合并的迭代过程文档（12个）
3. 移动剩余文档到对应目录
4. 确保根目录只保留 README.md

**验收标准**:
- [ ] 根目录只保留 README.md
- [ ] 所有有价值的文档已移动到对应目录
- [ ] 无效文档已删除

**预计耗时**: 20分钟

---

#### Task 6.2: 为现有文档添加元数据
**描述**: 为所有现有文档添加标准化元数据
**操作**:
1. 扫描所有Markdown文档
2. 添加标准元数据块（如果缺失）
3. 添加 related_docs 链接
4. 添加 tags 标签

**验收标准**:
- [ ] 所有文档包含元数据块
- [ ] related_docs 链接正确
- [ ] tags 标签合理

**预计耗时**: 30分钟

---

#### Task 6.3: 运行校验和生成索引
**描述**: 运行所有自动化工具，验证文档体系
**操作**:
1. 运行 `node scripts/validate-docs.js`
2. 修复校验发现的问题
3. 运行 `node scripts/generate-index.js`
4. 验证README.md索引正确

**验收标准**:
- [ ] 校验工具无错误
- [ ] 索引生成正确
- [ ] README.md 索引部分更新

**预计耗时**: 10分钟

---

## 执行顺序

### 阶段1: 基础设施（并行）
- Task 1.1: 创建文档模板
- Task 1.2: 创建新目录结构

### 阶段2: 核心文档整理（串行）
- Task 2.1 → 2.2 → 2.3 → 2.4 → 2.5

### 阶段3: 功能文档整理（串行）
- Task 3.1 → 3.2 → 3.3 → 3.4 → 3.5

### 阶段4: 迭代文档摘要化（串行）
- Task 4.1 → 4.2 → 4.3 → 4.4

### 阶段5: 创建AI友好体系（并行）
- Task 5.1: 创建主README
- Task 5.2: 创建索引生成工具
- Task 5.3: 创建文档校验工具
- Task 5.4: 创建迭代归档工具

### 阶段6: 清理和验证（串行）
- Task 6.1 → 6.2 → 6.3

---

## 验收标准

### 整体验收
- [ ] 文档总数从 233个 减少到 150个左右
- [ ] 根目录只保留 README.md
- [ ] 所有文档包含标准化元数据
- [ ] 所有迭代文档已摘要化
- [ ] 归档文档从 107个 减少到 30个左右
- [ ] 自动化工具可正常运行

### 文档质量
- [ ] 每个文档有清晰的模块归属
- [ ] 文档间链接正确
- [ ] AI可以快速理解和检索文档
- [ ] 新用户可以5分钟快速开始

### 自动化验证
- [ ] `node scripts/validate-docs.js` 无错误
- [ ] `node scripts/generate-index.js` 生成正确索引
- [ ] 所有链接有效

---

## 风险和应对

### 风险1: 文档迁移过程中断链接
**应对**: 创建链接映射表，迁移后批量更新
**验证**: 运行链接检查工具

### 风险2: 归档文档误删有价值内容
**应对**: 先备份，人工审核后再删除
**验证**: 保留30天观察期

### 风险3: 团队不适应新结构
**应对**: 提供详细的维护指南
**验证**: 试运行1周，收集反馈

---

**预计总耗时**: 8-10小时
**执行方式**: Subagent-Driven Development
**开始时间**: 2026-03-05
