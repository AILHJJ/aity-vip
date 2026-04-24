# API文档重构实施计划

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 重构API文档体系，解决版本混乱问题，建立统一的文档维护规范

**Architecture:** 采用统一整合策略，将重复的文档合并为单一真实来源，使用纯Markdown格式，建立标准模板和自动生成索引工具

**Tech Stack:** Node.js (用于自动生成索引脚本), Markdown, Git

---

## 前置准备

**假设执行者：**
- 熟悉Git基本操作
- 了解Markdown语法
- 不熟悉项目代码库结构
- 不了解API接口细节

**所需权限：**
- 读写 `docs/api/` 目录
- 执行Node.js脚本
- Git提交权限

---

## Task 1: 创建目录结构和模板

**Files:**
- Create: `docs/api/templates/api-doc-template.md`
- Create: `docs/api/scripts/generate-index.js`

### Step 1: 创建templates和scripts目录

**命令:**
```bash
mkdir -p docs/api/templates
mkdir -p docs/api/scripts
```

**预期结果:** 创建两个新目录

### Step 2: 编写文档模板文件

**文件路径:** `docs/api/templates/api-doc-template.md`

**内容:**
```markdown
# [模块名称] API文档

## 文档信息
- **版本**: v1.0.0
- **最后更新**: YYYY-MM-DD
- **维护人**: @姓名
- **变更日志**: 见文档底部

---

## 一、接口概览

| 接口名称 | 方法 | 路径 | 说明 |
|---------|------|------|------|
| 接口1 | POST | /api/path | 接口说明 |

---

## 二、接口详情

### 1. [接口名称]

**基本信息**
- **接口路径**: `http://example.com/api/path`
- **请求方法**: POST
- **Content-Type**: application/json
- **认证方式**: 无需认证 / Bearer Token

**请求参数**
```json
{
  "param1": "value1",
  "param2": "value2"
}
```

**参数说明**
| 参数名 | 类型 | 必填 | 说明 | 示例值 |
|--------|------|------|------|--------|
| param1 | String | 是 | 参数说明 | "value1" |
| param2 | Number | 否 | 参数说明 | 123 |

**响应示例**
```json
{
  "code": 200,
  "data": {
    "field1": "value1"
  }
}
```

**字段说明**
| 字段名 | 类型 | 说明 | 示例值 |
|--------|------|------|--------|
| code | Number | 响应码 | 200 |
| data.field1 | String | 字段说明 | "value1" |

**调用示例**
```javascript
const response = await fetch('http://example.com/api/path', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    param1: 'value1',
    param2: 123
  })
});
const data = await response.json();
console.log(data);
```

---

## 三、错误码说明

| 错误码 | 说明 | 处理建议 |
|--------|------|----------|
| 400 | 参数错误 | 检查请求参数格式 |
| 401 | 未授权 | 检查认证token |
| 404 | 资源不存在 | 检查请求路径 |
| 500 | 服务器错误 | 联系后端团队 |

---

## 四、变更日志

### v1.0.0 (YYYY-MM-DD)
- 🎉 初始版本
```

### Step 3: 编写自动生成索引脚本

**文件路径:** `docs/api/scripts/generate-index.js`

**内容:**
```javascript
#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const API_DIR = path.join(__dirname, '..');
const README_PATH = path.join(API_DIR, 'README.md');

// 扫描所有API文档
function scanApiDocs() {
  const files = fs.readdirSync(API_DIR);
  const apiDocs = [];

  for (const file of files) {
    if (!file.match(/^\d{2}-.*-api\.md$/)) continue;

    const filePath = path.join(API_DIR, file);
    const content = fs.readFileSync(filePath, 'utf-8');

    // 提取文档信息
    const moduleName = content.match(/^# (.+) API文档/m)?.[1] || '未知模块';
    const version = content.match(/\*\*版本\*\*:\s*(.+)/m)?.[1] || 'v1.0.0';
    const lastUpdate = content.match(/\*\*最后更新\*\*:\s*(.+)/m)?.[1] || '未知';
    const maintainer = content.match(/\*\*维护人\*\*:\s*(.+)/m)?.[1] || '未分配';

    // 计算接口数量（通过"接口概览"表格行数）
    const overviewMatch = content.match(/## 一、接口概览[\s\S]+?\n\n/m);
    const interfaceCount = overviewMatch
      ? (overviewMatch[0].match(/\|/g) || []).length / 4 - 1
      : 0;

    apiDocs.push({
      file,
      moduleName,
      version,
      lastUpdate,
      maintainer,
      interfaceCount: Math.max(0, Math.floor(interfaceCount))
    });
  }

  return apiDocs.sort((a, b) => a.file.localeCompare(b.file));
}

// 生成README内容
function generateReadme(apiDocs) {
  const today = new Date().toISOString().split('T')[0];

  let readme = `# API文档索引

> 最后更新：${today} | 维护人：后端团队

## 📚 文档列表

| 模块 | 文档 | 接口数量 | 最后更新 | 维护人 |
|------|------|----------|----------|--------|
`;

  for (const doc of apiDocs) {
    readme += `| ${doc.moduleName} | [${doc.file}](./${doc.file}) | ${doc.interfaceCount} | ${doc.lastUpdate} | ${doc.maintainer} |\n`;
  }

  readme += `
## 🔍 快速查找

### 按功能分类
`;

  // 根据模块名称生成快速查找（这里可以自定义）
  const categoryMap = {
    '金融数据': '市场概览、涨跌分布、指数行情、资金流向',
    '打板功能': '涨停池、跌停池、异动监控',
    'AI投顾': 'Dify工作流、AI对话',
    '核心业务': '用户管理、消息管理、认证',
    'SSE事件': '实时推送、事件流'
  };

  for (const doc of apiDocs) {
    const category = categoryMap[doc.moduleName] || '相关功能';
    readme += `- **${doc.moduleName}**: ${category} → [${doc.file}](./${doc.file})\n`;
  }

  readme += `
### 按场景分类
- **前端对接**: 查看各文档的"调用示例"章节
- **第三方集成**: 查看各文档的"接口概览"表格
- **自动化测试**: 查看各文档的"请求参数"和"响应示例"
`;

  return readme;
}

// 主函数
function main() {
  console.log('扫描API文档...');
  const apiDocs = scanApiDocs();

  console.log(`找到 ${apiDocs.length} 个API文档`);
  apiDocs.forEach(doc => {
    console.log(`  - ${doc.file}: ${doc.moduleName} (${doc.interfaceCount}个接口)`);
  });

  console.log('\n生成README.md...');
  const readmeContent = generateReadme(apiDocs);
  fs.writeFileSync(README_PATH, readmeContent, 'utf-8');

  console.log('✅ README.md已更新');
}

main();
```

### Step 4: 测试自动生成脚本

**命令:**
```bash
node docs/api/scripts/generate-index.js
```

**预期结果:** 脚本运行成功，但会提示找不到API文档（因为还未创建）

### Step 5: 提交模板和脚本

**命令:**
```bash
git add docs/api/templates/api-doc-template.md
git add docs/api/scripts/generate-index.js
git commit -m "feat(api-docs): 添加文档模板和自动生成索引脚本

- 创建标准文档模板，包含所有必填章节
- 编写自动生成README索引的Node.js脚本
- 支持自动提取接口数量、更新时间、维护人信息

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Task 2: 合并金融数据文档

**Files:**
- Read: `docs/api/连板天梯接口文档.md`
- Read: `docs/api/金融行情数据接口文档.md`
- Read: `docs/api/金融数据接口综合文档.md`
- Read: `docs/api/金融数据接口最终文档.md`
- Create: `docs/api/01-financial-data-api.md`

### Step 1: 读取所有金融数据文档

**目的:** 了解4个文档的内容，识别重复和差异

**命令:**
```bash
ls -lh docs/api/*.md | grep -E "(连板|金融)"
```

**预期结果:** 列出4个金融相关文档

### Step 2: 分析文档内容

**注意:** 这一步需要仔细对比，避免遗漏接口

**检查清单:**
- [ ] 统计每个文档包含的接口数量
- [ ] 识别重复的接口定义
- [ ] 找出每个文档独有的接口
- [ ] 对比同一接口的不同版本说明

### Step 3: 创建合并后的金融数据文档

**文件路径:** `docs/api/01-financial-data-api.md`

**说明:** 基于 `金融数据接口最终文档.md`（看起来是最完整的版本），进行以下优化：

1. **删除重复内容**
   - 移除其他3个文档中已有的接口
   - 保留最详细的接口说明

2. **统一格式**
   - 应用新的标准模板结构
   - 确保每个接口都有完整的章节

3. **补充缺失内容**
   - 从其他3个文档中提取独有的接口
   - 补充缺失的调用示例

4. **优化组织结构**
   - 按功能模块分组（市场概览、资金流向、连板天梯等）
   - 添加清晰的锚点导航

**操作提示:** 由于文档较长（约1000行），建议分批处理，每次处理一个功能模块

### Step 4: 验证合并结果

**检查项:**
- [ ] 所有接口都已包含
- [ ] 没有重复的接口定义
- [ ] 每个接口都有完整的参数说明
- [ ] JSON示例格式正确
- [ ] 调用示例可执行

### Step 5: 提交金融数据文档

**命令:**
```bash
git add docs/api/01-financial-data-api.md
git commit -m "feat(api-docs): 合并金融数据接口文档

- 合并连板天梯、金融行情、金融数据综合、金融数据最终4个文档
- 删除重复接口，保留最详细的说明
- 按功能模块重新组织（市场概览、资金流向、连板天梯等）
- 应用标准文档模板，统一格式
- 补充缺失的调用示例和字段说明

BREAKING CHANGE: 旧文档将在后续清理

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Task 3: 整理打板功能文档

**Files:**
- Read: `docs/api/打板功能API接口文档.md`
- Read: `docs/api/打板设计文档V1.3_何俊锋_20250306.xlsx`
- Create: `docs/api/02-trading-board-api.md`

### Step 1: 读取现有打板功能文档

**命令:**
```bash
cat docs/api/打板功能API接口文档.md | head -50
```

**目的:** 了解现有文档结构

### Step 2: 提取Excel中的详细定义

**说明:** 如果Excel包含Markdown中缺失的详细字段定义，需要手动提取

**操作提示:** 可以使用 markitdown-skill 转换Excel为Markdown

### Step 3: 应用标准模板创建新文档

**文件路径:** `docs/api/02-trading-board-api.md`

**基于:** `打板功能API接口文档.md`

**优化项:**
- 添加文档信息头部（版本、维护人等）
- 补充"接口概览"表格
- 统一接口详情格式
- 添加错误码说明
- 添加变更日志

### Step 4: 提交打板功能文档

**命令:**
```bash
git add docs/api/02-trading-board-api.md
git commit -m "feat(api-docs): 整理打板功能接口文档

- 基于打板功能API接口文档.md重新组织
- 应用标准文档模板
- 补充接口概览表格
- 统一接口详情格式
- 添加错误码说明和变更日志

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Task 4: 整理AI投顾文档

**Files:**
- Read: `docs/api/dify-workflow.md`
- Read: `docs/api/AI收评.xlsx` (如果存在)
- Create: `docs/api/03-ai-assistant-api.md`

### Step 1: 读取现有AI投顾文档

**命令:**
```bash
cat docs/api/dify-workflow.md
```

### Step 2: 应用标准模板创建新文档

**文件路径:** `docs/api/03-ai-assistant-api.md`

**内容组织:**
- Dify工作流接口
- AI对话接口
- AI收评接口（如果有）

### Step 3: 提交AI投顾文档

**命令:**
```bash
git add docs/api/03-ai-assistant-api.md
git commit -m "feat(api-docs): 整理AI投顾接口文档

- 基于dify-workflow.md重新组织
- 应用标准文档模板
- 补充接口概览和错误码说明

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Task 5: 整理核心业务文档

**Files:**
- Read: `docs/api/README.md` (查看核心业务接口列表)
- Read: `docs/core/API文档.md` (如果存在)
- Create: `docs/api/04-core-business-api.md`

### Step 1: 确认核心业务接口列表

**参考:** `docs/api/README.md` 中列出的模块
- 认证模块
- 消息模块
- 讨论模块
- 用户模块
- 统计模块
- 文件上传

### Step 2: 收集核心业务接口信息

**说明:** 如果核心业务接口文档在其他位置（如 `docs/core/API文档.md`），需要读取并整合

### Step 3: 应用标准模板创建新文档

**文件路径:** `docs/api/04-core-business-api.md`

**内容组织:** 按模块分组
- 认证接口（登录、注册、获取用户信息）
- 消息接口（CRUD、讨论、收藏）
- 用户接口（CRUD、分组管理）
- 统计接口（数据统计、趋势分析）
- 文件上传接口

### Step 4: 提交核心业务文档

**命令:**
```bash
git add docs/api/04-core-business-api.md
git commit -m "feat(api-docs): 整理核心业务接口文档

- 整合认证、消息、用户、统计、文件上传等模块
- 应用标准文档模板
- 补充接口概览和错误码说明

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Task 6: 整理SSE事件文档

**Files:**
- Read: `docs/api/sse-events.md`
- Create: `docs/api/05-sse-events.md`

### Step 1: 读取现有SSE文档

**命令:**
```bash
cat docs/api/sse-events.md
```

### Step 2: 应用标准模板创建新文档

**文件路径:** `docs/api/05-sse-events.md`

**说明:** SSE文档结构可能略有不同，但应尽量符合标准模板

### Step 3: 提交SSE文档

**命令:**
```bash
git add docs/api/05-sse-events.md
git commit -m "feat(api-docs): 整理SSE事件接口文档

- 重命名sse-events.md为05-sse-events.md
- 应用标准文档模板
- 补充接口概览和变更日志

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Task 7: 备份和清理旧文档

**Files:**
- Move: 所有旧的API文档到 `docs/api/backup/`

### Step 1: 创建备份目录

**命令:**
```bash
mkdir -p docs/api/backup
```

### Step 2: 移动旧文档到备份目录

**命令:**
```bash
# 移动旧的Markdown文档
mv docs/api/连板天梯接口文档.md docs/api/backup/
mv docs/api/金融行情数据接口文档.md docs/api/backup/
mv docs/api/金融数据接口综合文档.md docs/api/backup/
mv docs/api/打板功能API接口文档.md docs/api/backup/
mv docs/api/dify-workflow.md docs/api/backup/
mv docs/api/sse-events.md docs/api/backup/

# 移动Excel文档
mv docs/api/*.xlsx docs/api/backup/ 2>/dev/null || true

# 移动Python脚本
mv docs/api/extract_api_info.py docs/api/backup/ 2>/dev/null || true
```

### Step 3: 提交备份操作

**命令:**
```bash
git add docs/api/backup/
git commit -m "chore(api-docs): 备份旧文档到backup目录

- 移动所有旧版本文档到backup目录
- 保留Excel和Python脚本作为参考
- 新文档已替换旧文档

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Task 8: 生成README索引

**Files:**
- Modify: `docs/api/README.md`

### Step 1: 运行自动生成脚本

**命令:**
```bash
node docs/api/scripts/generate-index.js
```

**预期结果:** 脚本成功扫描5个新文档并生成README.md

### Step 2: 验证生成的README

**检查项:**
- [ ] 所有5个文档都已列出
- [ ] 接口数量正确
- [ ] 最后更新时间正确
- [ ] 快速查找链接有效

### Step 3: 提交README

**命令:**
```bash
git add docs/api/README.md
git commit -m "feat(api-docs): 自动生成README索引

- 运行generate-index.js脚本
- 自动提取文档信息
- 生成文档列表和快速查找索引

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Task 9: 编写文档维护指南

**Files:**
- Create: `docs/api/MAINTENANCE.md`

### Step 1: 创建维护指南文档

**文件路径:** `docs/api/MAINTENANCE.md`

**内容:**
```markdown
# API文档维护指南

## 文档结构

本目录包含以下API文档：

- `01-financial-data-api.md` - 金融数据接口
- `02-trading-board-api.md` - 打板功能接口
- `03-ai-assistant-api.md` - AI投顾接口
- `04-core-business-api.md` - 核心业务接口
- `05-sse-events.md` - SSE实时事件

## 如何更新文档

### 1. 修改现有接口

1. 打开对应的API文档
2. 修改接口详情
3. 更新文档顶部的"最后更新"日期
4. 在"变更日志"章节添加变更记录
5. 运行 `node docs/api/scripts/generate-index.js` 更新README
6. 提交代码和文档（同一commit）

### 2. 添加新接口

1. 在对应文档的"接口概览"表格添加新行
2. 在"接口详情"章节添加完整的接口说明
3. 更新文档版本号（次版本号+1）
4. 在"变更日志"添加记录（使用✨图标）
5. 运行 `node docs/api/scripts/generate-index.js` 更新README
6. 提交代码和文档

### 3. 废弃接口

1. 在接口说明中添加"⚠️ 已废弃"标记
2. 说明替代接口（如果有）
3. 在"变更日志"添加记录（使用🗑️图标）
4. 运行索引生成脚本
5. 提交

### 4. 删除接口

1. 确认接口已废弃至少1个月
2. 确认没有调用方使用
3. 从文档中删除接口说明
4. 更新主版本号（Major+1）
5. 在"变更日志"添加记录（使用❌图标）
6. 运行索引生成脚本
7. 提交

## 变更日志图标

- ✨ 新增功能
- 🐛 修复bug
- 📝 文档更新
- 🗑️ 废弃接口
- ❌ 删除接口
- 🔒 安全相关

## 文档模板

使用 `templates/api-doc-template.md` 作为新文档的起点

## 自动生成工具

### generate-index.js

自动扫描所有API文档，生成README.md索引

```bash
node docs/api/scripts/generate-index.js
```

**功能:**
- 扫描所有 `数字前缀-模块名-api.md` 文档
- 提取接口数量、更新时间、维护人
- 生成文档列表和快速查找索引

## 版本号规范

遵循语义化版本控制（Semantic Versioning）：

- **主版本（Major）**: 不兼容的API变更
  - 示例：v1.0.0 → v2.0.0
- **次版本（Minor）**: 向后兼容的功能新增
  - 示例：v2.0.0 → v2.1.0
- **修订号（Patch）**: 向后兼容的问题修复
  - 示例：v2.1.0 → v2.1.1

## Git提交规范

```bash
# 提交格式
docs(api): 简短描述

- 详细说明1
- 详细说明2

Refs: #issue编号
```

**示例:**
```bash
docs(api): 更新金融数据接口文档

- 新增板块异动接口说明
- 修复市场概览接口参数错误
- 补充指数行情接口调用示例

Refs: #123
```

## 常见问题

### Q: 如何确定接口属于哪个文档？

A: 参考以下分类：
- **金融数据**: 市场数据、指数行情、资金流向、连板天梯
- **打板功能**: 涨停池、跌停池、异动监控
- **AI投顾**: Dify工作流、AI对话、AI分析
- **核心业务**: 用户、消息、讨论、认证、统计、文件上传
- **SSE事件**: 实时推送、事件流

### Q: Excel文档还在使用吗？

A: 不再使用。所有接口文档已迁移到Markdown格式，便于Git版本控制和团队协作。旧的Excel文档保留在 `backup/` 目录作为参考。

### Q: 如何验证JSON示例格式？

A: 使用在线JSON验证工具或命令行：
```bash
cat example.json | python -m json.tool
```

### Q: README索引生成错误怎么办？

A: 检查以下几点：
1. 文档命名是否符合规范（`数字前缀-模块名-api.md`）
2. 文档头部是否包含必需字段（版本、最后更新、维护人）
3. 是否有"接口概览"章节和表格

## 联系方式

如有疑问，请联系对应的文档维护人。
```

### Step 2: 提交维护指南

**命令:**
```bash
git add docs/api/MAINTENANCE.md
git commit -m "docs(api-docs): 添加文档维护指南

- 详细说明如何更新、添加、废弃、删除接口
- 提供变更日志图标说明
- 说明版本号规范和Git提交规范
- 包含常见问题解答

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Task 10: 最终验证和提交

### Step 1: 验证文档结构

**命令:**
```bash
tree docs/api -L 1
```

**预期结果:**
```
docs/api/
├── 01-financial-data-api.md
├── 02-trading-board-api.md
├── 03-ai-assistant-api.md
├── 04-core-business-api.md
├── 05-sse-events.md
├── README.md
├── MAINTENANCE.md
├── backup/
├── scripts/
└── templates/
```

### Step 2: 验证所有链接

**手动检查:**
- [ ] README中的所有文档链接可点击
- [ ] 文档内的锚点链接可跳转
- [ ] 外部链接（如果有）可访问

### Step 3: 验证JSON示例

**手动检查:**
- [ ] 所有JSON示例格式正确
- [ ] 请求参数和响应示例匹配

### Step 4: 生成最终提交

**命令:**
```bash
git status
```

**确认:** 所有文件都已提交

### Step 5: 推送到远程仓库

**命令:**
```bash
git push origin feature/iteration-1
```

---

## 完成清单

### 必须完成
- [ ] Task 1: 创建目录结构和模板
- [ ] Task 2: 合并金融数据文档
- [ ] Task 3: 整理打板功能文档
- [ ] Task 4: 整理AI投顾文档
- [ ] Task 5: 整理核心业务文档
- [ ] Task 6: 整理SSE事件文档
- [ ] Task 7: 备份和清理旧文档
- [ ] Task 8: 生成README索引
- [ ] Task 9: 编写文档维护指南
- [ ] Task 10: 最终验证和提交

### 验收标准
- [ ] 所有旧文档已备份
- [ ] 5个新文档符合标准模板
- [ ] README索引自动生成成功
- [ ] 所有JSON示例格式正确
- [ ] 所有链接有效
- [ ] 维护指南完整清晰

---

## 预期成果

**文档数量:**
- 从10个混乱的文档 → 5个规范的文档
- 从混合格式（md + xlsx + py） → 纯Markdown

**维护效率:**
- 版本混乱问题 → 彻底解决
- 格式不统一 → 统一标准
- 缺少变更记录 → 强制变更日志

**团队协作:**
- 多人维护冲突 → 职责清晰分配
- 查找困难 → 自动生成索引
- 新人上手慢 → 维护指南完整

---

## 注意事项

1. **不要删除backup目录** - 保留至少1个月，以防需要回滚
2. **测试索引生成脚本** - 确保在添加新文档时脚本仍能正常工作
3. **通知团队** - 完成后通知所有相关开发人员新的文档位置
4. **更新CI/CD** - 如果有自动化流程依赖旧文档路径，需要更新

---

## 回滚方案

如果新方案出现严重问题：

```bash
# 1. 恢复旧文档
mv docs/api/backup/* docs/api/

# 2. 删除新文档
rm docs/api/0*.md
rm docs/api/README.md
rm docs/api/MAINTENANCE.md

# 3. 恢复旧的README（如果有备份）
git checkout HEAD~10 docs/api/README.md

# 4. 提交回滚
git add docs/api/
git commit -m "revert: 回滚API文档重构"
```
