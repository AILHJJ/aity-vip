# API文档维护指南

> 最后更新：2026-03-04 | 维护人：后端开发团队
>
> 本指南详细说明如何维护和更新API文档，确保文档的准确性和一致性。

---

## 目录

1. [文档结构说明](#一文档结构说明)
2. [如何更新文档](#二如何更新文档)
3. [变更日志图标说明](#三变更日志图标说明)
4. [文档模板使用说明](#四文档模板使用说明)
5. [自动生成工具说明](#五自动生成工具说明)
6. [版本号规范](#六版本号规范)
7. [Git提交规范](#七git提交规范)
8. [常见问题解答](#八常见问题解答)
9. [联系方式](#九联系方式)

---

## 一、文档结构说明

### 当前文档结构

```
docs/api/
├── README.md                    # 文档索引和快速查找指南
├── MAINTENANCE.md              # 本文档 - 维护指南
├── 01-financial-data-api.md    # 金融数据接口文档
├── 02-trading-board-api.md     # 打板功能接口文档
├── 03-ai-assistant-api.md      # AI助手接口文档
├── 04-core-business-api.md     # 核心业务接口文档
├── 05-sse-events.md            # SSE事件文档
├── backup/                     # 历史版本备份
│   ├── old-readme.md
│   ├── v1.0-2025-02-xx/
│   └── ...
├── scripts/                    # 文档生成工具
│   ├── generate-index.js       # README索引生成脚本
│   └── ...
└── templates/                  # 文档模板
    ├── api-doc-template.md     # 标准API文档模板
    └── ...
```

### 文档命名规范

- **格式**: `序号-模块名-api.md`
- **序号**: 两位数字，从01开始递增
- **模块名**: 小写英文，用连字符分隔
- **示例**:
  - `01-financial-data-api.md` ✅
  - `02-trading-board-api.md` ✅
  - `03-ai-assistant-api.md` ✅

### 文档元数据

每个文档必须包含以下元数据信息：

```markdown
## 文档信息
- **版本**: v1.0.0
- **最后更新**: 2026-03-04
- **维护人**: 后端开发团队
- **变更日志**: 见文档底部
```

---

## 二、如何更新文档

### 场景1: 修改现有接口

**适用情况**: 接口参数变化、响应字段调整、说明更新等

**操作步骤**:

1. **定位文档**
   ```bash
   # 确定要修改的文档文件
   # 例如：修改金融数据接口
   vim docs/api/01-financial-data-api.md
   ```

2. **更新接口详情**
   - 修改对应的接口章节
   - 更新"请求参数"、"响应示例"、"字段说明"
   - 修正调用示例代码

3. **更新版本信息**
   ```markdown
   ## 文档信息
   - **版本**: v1.0.1  # 递增修订号
   - **最后更新**: 2026-03-04  # 当前日期
   ```

4. **添加变更记录**
   ```markdown
   ### v1.0.1 (2026-03-04)
   - 🔄 修改XXX接口参数格式
   - 📝 更新YYY字段说明
   - 🐛 修复响应示例错误
   ```

5. **提交代码**
   ```bash
   git add docs/api/01-financial-data-api.md
   git commit -m "docs: 更新金融数据接口文档 - 修改XXX参数格式"
   ```

**变更图标使用**:
- 🔄 接口参数变更
- 📝 说明文字更新
- 🐛 修复错误
- ✨ 新增功能
- ⚠️ 重要变更

---

### 场景2: 添加新接口

**适用情况**: 在现有模块中新增接口

**操作步骤**:

1. **定位并打开文档**
   ```bash
   # 在对应的模块文档中添加
   vim docs/api/01-financial-data-api.md
   ```

2. **更新接口概览表格**
   ```markdown
   | 接口名称 | 方法 | 路径 | 说明 |
   |---------|------|------|------|
   | 接口1 | GET | /api/path1 | 说明1 |
   | 接口2 | POST | /api/path2 | 说明2 |  # 新增
   ```

3. **添加接口详情章节**
   ```markdown
   ### 2. [新接口名称]

   **基本信息**
   - **接口路径**: `http://localhost:3001/api/path2`
   - **请求方法**: POST
   - **Content-Type**: application/json
   - **认证方式**: Bearer Token

   **请求参数**
   ...

   **响应示例**
   ...

   **字段说明**
   ...

   **调用示例**
   ...
   ```

4. **更新版本和变更日志**
   ```markdown
   ## 文档信息
   - **版本**: v1.1.0  # 递增次版本号（新增功能）

   ### v1.1.0 (2026-03-04)
   - ✨ 新增XXX接口
   ```

5. **更新README索引**
   ```bash
   node docs/api/scripts/generate-index.js
   ```

6. **提交代码**
   ```bash
   git add docs/api/
   git commit -m "docs: 添加XXX接口到金融数据模块"
   ```

---

### 场景3: 废弃接口

**适用情况**: 接口不再推荐使用，但暂时保留

**操作步骤**:

1. **在接口详情中添加废弃标记**
   ```markdown
   ### 3. [废弃接口名称] ⚠️ 已废弃

   > ⚠️ **废弃说明**: 该接口已废弃，请使用新接口 [新接口链接](#xxx)
   > **废弃时间**: 2026-03-04
   > **计划移除**: v2.0.0

   **基本信息**
   - **接口路径**: `http://localhost:3001/api/old-path`
   - **状态**: ⚠️ 已废弃
   ```

2. **更新变更日志**
   ```markdown
   ### v1.2.0 (2026-03-04)
   - ⚠️ 废弃XXX接口，推荐使用YYY接口
   ```

3. **提交代码**
   ```bash
   git add docs/api/xx-api.md
   git commit -m "docs: 标记XXX接口为废弃状态"
   ```

---

### 场景4: 删除接口

**适用情况**: 接口已彻底移除，不再维护

**操作步骤**:

1. **从接口概览表格中删除**
   ```markdown
   | 接口名称 | 方法 | 路径 | 说明 |
   |---------|------|------|------|
   | 接口1 | GET | /api/path1 | 说明1 |
   # 删除接口2的行
   ```

2. **删除接口详情章节**
   ```markdown
   # 完全删除对应的 ### X. [接口名称] 章节
   ```

3. **更新变更日志**
   ```markdown
   ### v1.3.0 (2026-03-04)
   - 🗑️ 移除XXX接口（已不再使用）
   ```

4. **更新README索引**
   ```bash
   node docs/api/scripts/generate-index.js
   ```

5. **提交代码**
   ```bash
   git add docs/api/
   git commit -m "docs: 移除XXX接口文档"
   ```

---

### 场景5: 创建新模块文档

**适用情况**: 新增独立的业务模块

**操作步骤**:

1. **使用模板创建新文档**
   ```bash
   # 复制模板
   cp docs/api/templates/api-doc-template.md docs/api/06-xxx-api.md

   # 或者直接创建
   vim docs/api/06-xxx-api.md
   ```

2. **填写文档内容**
   - 更新文档信息（版本、日期、维护人）
   - 填写接口概览表格
   - 添加所有接口详情
   - 编写错误码说明
   - 创建初始变更日志

3. **更新README索引**
   ```bash
   node docs/api/scripts/generate-index.js
   ```

4. **提交代码**
   ```bash
   git add docs/api/
   git commit -m "docs: 添加XXX模块API文档"
   ```

---

## 三、变更日志图标说明

### 标准图标集

| 图标 | 含义 | 使用场景 | 示例 |
|-----|------|---------|------|
| 🎉 | 重大更新 | 首次发布、重大版本升级 | 🎉 初始版本发布 |
| ✨ | 新增功能 | 添加新接口、新参数、新字段 | ✨ 新增用户管理接口 |
| 🔄 | 接口变更 | 修改参数格式、路径变化 | 🔄 修改请求参数结构 |
| 📝 | 文档更新 | 修正说明、补充文档 | 📝 完善接口说明 |
| 🐛 | 错误修复 | 修正文档错误、示例代码bug | 🐛 修复响应示例错误 |
| ⚠️ | 重要提示 | 废弃警告、破坏性变更 | ⚠️ 废弃旧版接口 |
| 🗑️ | 删除 | 移除接口、参数 | 🗑️ 移除已下线接口 |
| 🔒 | 安全 | 认证相关变更 | 🔒 添加token验证 |
| 🚀 | 性能 | 性能优化相关 | 🚀 优化响应速度 |
| 💡 | 提示 | 使用建议、最佳实践 | 💡 建议使用批量接口 |
| 🔗 | 链接 | 添加引用、跳转链接 | 🔗 添加相关接口链接 |

### 使用规范

1. **每个变更前添加适当的图标**
   ```markdown
   - ✨ 新增XXX接口
   - 🔄 修改YYY参数
   - 📝 更新ZZZ说明
   ```

2. **同一类型变更可合并**
   ```markdown
   - ✨ 新增3个管理接口（用户、消息、分组）
   ```

3. **重要变更需突出显示**
   ```markdown
   ### v2.0.0 (2026-03-04)
   - ⚠️ **破坏性变更**: 认证方式从Basic改为Bearer Token
   - 🎉 全新架构升级
   ```

---

## 四、文档模板使用说明

### 标准模板结构

模板文件：`docs/api/templates/api-doc-template.md`

**必需章节**:

1. **文档信息**
   ```markdown
   ## 文档信息
   - **版本**: v1.0.0
   - **最后更新**: YYYY-MM-DD
   - **维护人**: @姓名
   - **变更日志**: 见文档底部
   ```

2. **接口概览**
   ```markdown
   ## 一、接口概览

   | 接口名称 | 方法 | 路径 | 说明 |
   |---------|------|------|------|
   ```
   - 快速查看所有接口
   - 包含HTTP方法、路径、简短说明

3. **接口详情**
   ```markdown
   ## 二、接口详情

   ### 1. [接口名称]

   **基本信息**
   - **接口路径**: 完整URL
   - **请求方法**: GET/POST/PUT/DELETE
   - **Content-Type**: application/json
   - **认证方式**: 无需认证 / Bearer Token

   **请求参数**
   ...

   **响应示例**
   ...

   **字段说明**
   ...

   **调用示例**
   ...
   ```

4. **错误码说明**
   ```markdown
   ## 三、错误码说明

   | 错误码 | 说明 | 处理建议 |
   |--------|------|----------|
   ```

5. **变更日志**
   ```markdown
   ## 四、变更日志

   ### v1.0.0 (YYYY-MM-DD)
   - 🎉 初始版本
   ```

### 接口详情填写规范

**基本信息**
- 必须包含完整的接口路径（包括基础URL）
- 明确HTTP方法
- 说明Content-Type
- 标注是否需要认证

**请求参数**
```markdown
**请求参数**
\```json
{
  "param1": "value1",
  "param2": 123
}
\```
```
- 使用JSON格式
- 提供真实的示例值
- 复杂对象可嵌套展示

**参数说明表格**
```markdown
| 参数名 | 类型 | 必填 | 说明 | 示例值 |
|--------|------|------|------|--------|
| param1 | String | 是 | 参数详细说明 | "value1" |
| param2 | Number | 否 | 可选参数说明 | 123 |
```
- 类型：String/Number/Boolean/Array/Object
- 必填：是/否/条件（说明条件）
- 说明：清晰简洁
- 示例值：符合类型定义

**响应示例**
```markdown
**响应示例**
\```json
{
  "code": 200,
  "message": "Success",
  "data": {
    "result": []
  }
}
\```
```
- 展示完整响应结构
- 包含code和message
- data字段展示真实数据
- 使用合理的缩进

**字段说明**
```markdown
| 字段名 | 类型 | 说明 | 示例值 |
|--------|------|------|--------|
| code | Number | 响应码（200成功） | 200 |
| data.result | Array | 结果列表 | [] |
```
- 嵌套字段用点号表示：data.result
- 说明要清晰
- 包含示例值

**调用示例**
```markdown
**调用示例**
\```javascript
const response = await fetch('http://localhost:3001/api/path', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer <token>'
  },
  body: JSON.stringify({
    param1: 'value1'
  })
});
const data = await response.json();
console.log(data);
\```
```
- 使用JavaScript/TypeScript
- 包含完整的请求配置
- 展示如何处理响应
- 添加必要的注释

---

## 五、自动生成工具说明

### README索引生成工具

**脚本路径**: `docs/api/scripts/generate-index.js`

**功能**:
- 自动扫描所有`XX-*-api.md`格式文档
- 提取文档元数据（版本、更新时间、维护人）
- 统计每个文档的接口数量
- 生成README.md索引文件
- 自动更新接口统计表格

**使用方法**:

```bash
# 方式1: 直接运行
node docs/api/scripts/generate-index.js

# 方式2: 使用npm脚本（如果配置了）
npm run generate-api-index
```

**执行流程**:
1. 读取`docs/api/`目录下所有`.md`文件
2. 过滤出`XX-*-api.md`格式的文档
3. 解析每个文档的"接口概览"表格
4. 统计接口数量
5. 提取文档信息（版本、更新时间、维护人）
6. 生成README.md内容
7. 写入`docs/api/README.md`

**生成内容**:
- 文档列表表格（模块名、文档链接、接口数量、更新时间、维护人）
- 快速查找指南（按功能、按场景）
- 接口统计（类型分布、数量统计）
- 环境配置说明
- 维护指南

**注意事项**:
- 文档必须遵循标准模板格式
- 接口概览表格必须包含"接口名称、方法、路径、说明"列
- 文档信息必须包含"版本、最后更新、维护人"
- 执行前请确保已提交当前修改，避免覆盖

**自定义配置**:

脚本开头包含配置项：
```javascript
const config = {
  docsDir: './docs/api',
  outputFile: './docs/api/README.md',
  filePattern: /^\d+-[\w-]+-api\.md$/,
  // ...
};
```

---

## 六、版本号规范

### 语义化版本 2.0.0

版本号格式：`v主版本号.次版本号.修订号`

示例：`v1.2.3`

### 版本号规则

| 版本号类型 | 说明 | 变更场景 | 示例 |
|-----------|------|---------|------|
| **主版本号** | 不兼容的API修改 | 接口路径变更、删除接口、破坏性更新 | v1.0.0 → v2.0.0 |
| **次版本号** | 向下兼容的功能性新增 | 添加新接口、新增参数、新增字段 | v1.0.0 → v1.1.0 |
| **修订号** | 向下兼容的问题修正 | 修正文档错误、更新说明、格式调整 | v1.0.0 → v1.0.1 |

### 版本号升级决策树

```
开始
  │
  ├─ 是否删除了接口？
  │   └─ YES → 主版本号+1 (v1.0.0 → v2.0.0)
  │
  ├─ 是否修改了接口路径？
  │   └─ YES → 主版本号+1 (v1.0.0 → v2.0.0)
  │
  ├─ 是否修改了必需参数？
  │   └─ YES → 主版本号+1 (v1.0.0 → v2.0.0)
  │
  ├─ 是否添加了新接口？
  │   └─ YES → 次版本号+1 (v1.0.0 → v1.1.0)
  │
  ├─是否添加了可选参数？
  │   └─ YES → 次版本号+1 (v1.0.0 → v1.1.0)
  │
  └─ 仅文档修正？
      └─ YES → 修订号+1 (v1.0.0 → v1.0.1)
```

### 版本号示例

**场景1: 修正文档错误**
```markdown
### v1.0.1 (2026-03-04)
- 🐛 修复响应示例字段名错误
- 📝 更新参数说明
```

**场景2: 添加新接口**
```markdown
### v1.1.0 (2026-03-04)
- ✨ 新增用户管理接口（5个）
- ✨ 新增消息订阅功能
```

**场景3: 删除旧接口**
```markdown
### v2.0.0 (2026-03-04)
- ⚠️ **破坏性变更**: 移除旧版认证接口
- 🎉 全面升级到新架构
- ✨ 新增批量操作接口
```

### 预发布版本

开发中版本可添加预发布标识：

- `v1.0.0-alpha.1` - 内部测试版
- `v1.0.0-beta.1` - 公开测试版
- `v1.0.0-rc.1` - 候选发布版

示例：
```markdown
### v1.2.0-beta.1 (2026-03-04)
- ✨ 新增XXX功能（测试中）
- ⚠️ 此版本为测试版，不建议生产环境使用
```

---

## 七、Git提交规范

### 提交信息格式

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Type类型

| Type | 说明 | 示例 |
|------|------|------|
| `docs` | 文档变更 | docs: 更新API文档 |
| `feat` | 新功能 | feat(api): 添加用户接口 |
| `fix` | 错误修复 | fix: 修复认证bug |
| `refactor` | 重构 | refactor(api): 重构响应格式 |
| `style` | 格式调整 | style: 统一文档格式 |
| `test` | 测试相关 | test: 添加接口测试 |
| `chore` | 构建/工具 | chore: 更新生成脚本 |

### Scope范围

| Scope | 说明 |
|-------|------|
| `api` | API文档 |
| `financial` | 金融数据模块 |
| `trading` | 打板功能模块 |
| `ai` | AI助手模块 |
| `core` | 核心业务模块 |
| `scripts` | 生成工具 |

### Subject主题

- 简洁描述做了什么
- 不超过50个字符
- 首字母小写
- 不加句号
- 使用祈使句

**示例**:
```bash
docs: 更新金融数据接口文档
docs(api): 添加用户管理接口
fix: 修复README生成错误
refactor(scripts): 优化索引生成逻辑
```

### Body正文（可选）

详细描述变更内容，每行不超过72个字符

```bash
docs(api): 更新认证接口文档

- 修改认证方式从Basic改为Bearer Token
- 更新所有接口的认证说明
- 添加token获取示例
- 更新调用示例代码

Closes #123
```

### Footer脚注（可选）

关联Issue或PR

```bash
docs: 添加AI助手接口文档

- 添加Dify工作流接口
- 添加流式响应接口
- 添加会话管理接口

Refs #456
Related #789
```

### 完整提交示例

**场景1: 添加新接口文档**
```bash
git add docs/api/03-ai-assistant-api.md
git commit -m "docs(ai): 添加Dify工作流接口

- 添加工作流触发接口
- 添加参数说明和响应示例
- 提供JavaScript调用示例
- 更新接口概览表格

Refs #456"
```

**场景2: 修改现有文档**
```bash
git add docs/api/01-financial-data-api.md
git commit -m "docs(financial): 修改连板股票接口参数

- 调整请求参数结构
- 更新字段说明
- 修正响应示例
- 版本号升级到v1.1.0"
```

**场景3: 更新生成工具**
```bash
git add docs/api/scripts/generate-index.js
git commit -m "refactor(scripts): 优化README生成逻辑

- 添加接口数量统计
- 优化表格格式
- 添加更新时间排序
- 修复文件过滤bug"
```

**场景4: 删除废弃文档**
```bash
git add docs/api/
git commit -m "docs: 移除旧版API文档

- 删除backup目录下v1.0版本
- 更新README索引
- 清理冗余文件"
```

### 批量提交最佳实践

**原子性提交**: 每个提交只做一件事

❌ **不推荐**:
```bash
git add docs/api/
git commit -m "docs: 更新所有文档"
# 包含了多个变更，难以追踪
```

✅ **推荐**:
```bash
git add docs/api/01-financial-data-api.md
git commit -m "docs(financial): 修改连板股票接口参数"

git add docs/api/02-trading-board-api.md
git commit -m "docs(trading): 新增异动监控接口"

git add docs/api/README.md
git commit -m "docs: 更新README索引"
```

---

## 八、常见问题解答

### Q1: 如何确定应该在哪个文档中添加接口？

**A**: 根据接口的业务模块归属：

| 接口类型 | 文档 |
|---------|------|
| 市场行情、行业数据、板块数据 | 01-financial-data-api.md |
| 涨停池、跌停池、板块池 | 02-trading-board-api.md |
| AI对话、Dify工作流、流式响应 | 03-ai-assistant-api.md |
| 用户、消息、讨论、统计 | 04-core-business-api.md |
| SSE事件、实时推送 | 05-sse-events.md |

如果不确定，创建新的模块文档（序号递增）。

---

### Q2: 接口数量统计不准确怎么办？

**A**: 检查以下几点：

1. **检查接口概览表格格式**
   ```markdown
   | 接口名称 | 方法 | 路径 | 说明 |
   |---------|------|------|------|
   ```
   必须包含这4列，且列名完全一致。

2. **运行生成脚本**
   ```bash
   node docs/api/scripts/generate-index.js
   ```

3. **检查是否有格式错误**
   - 表格是否完整
   - 是否有多余的空格
   - 是否使用了错误的分隔符

4. **手动修正**
   如果脚本无法识别，手动更新README中的统计数字。

---

### Q3: 如何处理接口废弃但代码仍在使用的情况？

**A**: 分阶段处理：

**第一阶段**: 标记为废弃（当前版本）
```markdown
### 3. [旧接口名称] ⚠️ 已废弃

> ⚠️ **废弃说明**: 该接口将于v2.0.0移除，请使用新接口 [XXX](#xxx)
> **废弃时间**: 2026-03-04
> **迁移指南**: 参考新接口文档
```

**第二阶段**: 添加迁移指引
```markdown
**迁移示例**

旧接口调用：
```javascript
GET /api/old-endpoint
```

新接口调用：
```javascript
POST /api/new-endpoint
{
  "param": "value"
}
```
```

**第三阶段**: 代码迁移完成后删除

---

### Q4: 如何处理同一接口有多个版本的情况？

**A**: 使用版本标识

**方式1: 路径版本标识**
```markdown
### 1. 获取用户信息 v1

**接口路径**: `http://localhost:3001/api/v1/user/info`

### 2. 获取用户信息 v2

**接口路径**: `http://localhost:3001/api/v2/user/info`

> ✨ **推荐**: v2版本增加了手机号和邮箱字段
```

**方式2: 在文档中标注**
```markdown
### 1. 获取用户信息（v2）

**基本信息**
- **接口路径**: `http://localhost:3001/api/user/info`
- **版本**: v2.0（推荐）
- **旧版本**: v1.0（已废弃，见下方）

#### v1.0版本信息 ⚠️ 已废弃

**接口路径**: `http://localhost:3001/api/v1/user/info`
> ⚠️ v1.0将于2026-06-01停止维护
```

---

### Q5: 如何编写复杂的请求参数示例？

**A**: 分层展示复杂结构

**嵌套对象示例**:
```markdown
**请求参数**
\```json
{
  "userInfo": {
    "name": "张三",
    "age": 30,
    "address": {
      "province": "广东省",
      "city": "深圳市",
      "district": "南山区"
    }
  },
  "preferences": {
    "language": "zh-CN",
    "theme": "dark"
  }
}
\```

**参数说明**
| 参数名 | 类型 | 必填 | 说明 | 示例值 |
|--------|------|------|------|--------|
| userInfo | Object | 是 | 用户信息 | - |
| userInfo.name | String | 是 | 用户姓名 | "张三" |
| userInfo.age | Number | 是 | 用户年龄 | 30 |
| userInfo.address | Object | 是 | 地址信息 | - |
| userInfo.address.province | String | 是 | 省份 | "广东省" |
| preferences | Object | 否 | 偏好设置 | - |
```

**数组示例**:
```markdown
**请求参数**
\```json
{
  "ids": [1, 2, 3, 4, 5],
  "users": [
    {
      "id": 1,
      "name": "张三",
      "role": "admin"
    },
    {
      "id": 2,
      "name": "李四",
      "role": "user"
    }
  ]
}
\```
```

---

### Q6: 如何处理可选参数和条件必填？

**A**: 在说明中详细标注

**方式1: 表格备注**
```markdown
| 参数名 | 类型 | 必填 | 说明 | 示例值 |
|--------|------|------|------|--------|
| type | String | 是 | 类型（user/admin） | "user" |
| userId | Number | 条件 | type=user时必填 | 123 |
| adminId | Number | 条件 | type=admin时必填 | 456 |
```

**方式2: 文字说明**
```markdown
**参数说明**
- `type` (必填): 类型，可选值：user/admin
- `userId` (条件必填): 当type=user时必填
- `adminId` (条件必填): 当type=admin时必填
- `token` (可选): 未登录时需要传递

**示例1: 普通用户**
\```json
{
  "type": "user",
  "userId": 123
}
\```

**示例2: 管理员**
\```json
{
  "type": "admin",
  "adminId": 456
}
\```
```

---

### Q7: 响应示例应该展示成功还是失败的情况？

**A**: 都应该展示

**成功响应**:
```markdown
**成功响应**
\```json
{
  "code": 200,
  "message": "Success",
  "data": {
    "id": 1,
    "name": "张三"
  }
}
\```
```

**错误响应**:
```markdown
**错误响应示例**

1. 参数错误（400）
\```json
{
  "code": 400,
  "message": "参数错误",
  "data": {
    "error": "userId is required"
  }
}
\```

2. 未授权（401）
\```json
{
  "code": 401,
  "message": "未授权",
  "data": null
}
\```

3. 资源不存在（404）
\```json
{
  "code": 404,
  "message": "用户不存在",
  "data": null
}
\```
```

---

### Q8: 如何保持文档和代码同步？

**A**: 建立文档更新流程

**流程1: 接口变更时**
```
1. 开发修改接口代码
2. 同步更新文档（接口文档、参数、示例）
3. 更新版本号和变更日志
4. 代码审查时检查文档是否同步
5. 测试验证文档示例是否正确
6. 提交代码和文档
```

**流程2: 定期检查**
```
1. 每周检查文档版本和代码版本
2. 使用自动化测试验证示例
3. 对比实际接口响应和文档示例
4. 收集前端反馈，修正文档错误
```

**工具建议**:
- 使用Swagger/OpenAPI自动生成文档
- 集成Postman测试用例
- 设置CI检查文档示例的有效性

---

### Q9: 如何处理敏感信息（token、密钥）？

**A**: 使用占位符

**不推荐**:
```markdown
**请求头**
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**推荐**:
```markdown
**请求头**
Authorization: Bearer <your_token>

说明: <your_token> 替换为实际获取的token
```

**示例代码**:
```javascript
// 不推荐
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';

// 推荐
const token = localStorage.getItem('authToken'); // 从登录接口获取
```

---

### Q10: README生成脚本无法正常工作怎么办？

**A**: 按步骤排查

**检查1: Node.js环境**
```bash
node --version  # 确保已安装Node.js
```

**检查2: 脚本路径**
```bash
ls -la docs/api/scripts/generate-index.js  # 确认文件存在
```

**检查3: 运行权限**
```bash
chmod +x docs/api/scripts/generate-index.js  # 添加执行权限
```

**检查4: 查看错误信息**
```bash
node docs/api/scripts/generate-index.js
# 查看详细错误输出
```

**检查5: 手动更新README**
如果脚本无法使用，手动更新README：
1. 检查所有文档文件
2. 统计接口数量
3. 更新表格数据
4. 保存文件

---

## 九、联系方式

### 文档维护团队

| 角色 | 姓名 | 联系方式 | 负责范围 |
|-----|------|---------|---------|
| 文档负责人 | 后端开发团队 | [邮箱] | 文档整体维护 |
| 金融数据模块 | @开发者1 | [邮箱] | 01-financial-data-api.md |
| 打板功能模块 | @开发者2 | [邮箱] | 02-trading-board-api.md |
| AI助手模块 | @开发者3 | [邮箱] | 03-ai-assistant-api.md |
| 核心业务模块 | @开发者4 | [邮箱] | 04-core-business-api.md |
| SSE事件模块 | @开发者5 | [邮箱] | 05-sse-events.md |

### 反馈渠道

**文档问题反馈**:
- 邮箱: [团队邮箱]
- Issue: [GitHub Issue链接]
- 即时通讯: [企业微信/钉钉群]

**功能咨询**:
- 技术支持: [技术支持邮箱]
- 产品咨询: [产品经理联系方式]

**紧急联系**:
- 值班电话: [电话号码]
- 值班时间: 工作日 9:00-18:00

### 相关资源

**内部文档**:
- [开发规范](../docs/开发规范.md)
- [接口设计指南](../docs/接口设计指南.md)
- [测试文档](../tests/README.md)

**外部参考**:
- [Markdown语法指南](https://www.markdownguide.org/)
- [API文档最佳实践](https://docs.apiary.io/)
- [RESTful API设计规范](https://restfulapi.net/)

---

## 附录

### A. 文档检查清单

在提交文档前，请确认：

- [ ] 文档信息完整（版本、日期、维护人）
- [ ] 接口概览表格正确
- [ ] 所有接口都有详情章节
- [ ] 请求参数和响应示例格式正确
- [ ] 字段说明表格完整
- [ ] 调用示例代码可运行
- [ ] 错误码说明清晰
- [ ] 变更日志已更新
- [ ] 版本号符合规范
- [ ] 链接有效性已验证
- [ ] README索引已更新

### B. 快速参考卡片

**常用图标**
- ✨ 新增
- 🔄 修改
- 📝 更新
- 🐛 修复
- ⚠️ 警告
- 🗑️ 删除

**版本号规则**
- v1.0.0 → v1.0.1 (修订)
- v1.0.0 → v1.1.0 (新增)
- v1.0.0 → v2.0.0 (重大变更)

**Git提交**
- `docs: 文档变更`
- `docs(scope): 具体变更`

---

**最后更新**: 2026-03-04
**文档版本**: v1.0.0
**维护团队**: 后端开发团队
