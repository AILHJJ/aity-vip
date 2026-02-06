# AITY VIP 项目 - AI编码交互规范与最佳实践

**文档目的**: 规范AI辅助编程的交互流程，确保代码质量和部署效率
**适用范围**: 所有使用Claude Code进行AITY VIP项目开发的场景
**版本**: v1.0
**最后更新**: 2026-02-06

---

## 📋 核心原则

### 1. 提交即编译原则
**规则**: ✅ **每次Git提交后必须编译生产版本**

**原因**:
- 确保代码可以正常编译，避免语法错误
- 及时发现编译警告和兼容性问题
- 保证编译产物随时可以部署
- 避免积累多个提交后一次性编译导致的问题排查困难

**执行流程**:
```bash
# 1. 提交代码
git add .
git commit -m "feat: xxx"

# 2. 推送到远程
git push origin feature/iteration-1

# 3. 立即编译H5
npm run build:h5

# 4. 立即编译小程序
npm run build:mp-weixin

# 5. 验证编译结果
ls dist/build/h5/index.html
ls dist/build/mp-weixin/app.js
```

**检查清单**:
- [ ] H5编译成功（无ERROR级别错误）
- [ ] 小程序编译成功（无ERROR级别错误）
- [ ] 编译产物存在（index.html, app.js等）
- [ ] 无新增的严重警告（如Sass legacy API警告可以忽略）

---

### 2. 分阶段提交原则
**规则**: ✅ **按功能阶段提交，而非批量提交**

**推荐**:
```bash
# ✅ 好的做法：分步提交
git commit -m "fix: 修复AI投顾fetch错误"
git push
npm run build:h5
npm run build:mp-weixin

git commit -m "docs: 添加部署文档"
git push
npm run build:h5  # 可能不需要编译，但执行更保险
```

**避免**:
```bash
# ❌ 不好的做法：批量提交
git add .  # 添加10个文件的修改
git commit -m "update: 更新了很多东西"
git push
npm run build:h5
# 如果编译失败，难以定位是哪个文件的问题
```

---

### 3. 文档同步更新原则
**规则**: ✅ **每次重要修改后立即更新相关文档**

**文档类型**:
1. **需求文档**: 记录功能需求和设计决策
2. **技术文档**: 记录实现方案和技术细节
3. **部署文档**: 记录部署步骤和注意事项
4. **规范文档**: 记录开发规范和最佳实践（本文档）

**更新时机**:
- 新增功能 → 更新需求文档
- 修复Bug → 更新问题修复报告
- 优化流程 → 更新开发流程文档
- 部署变更 → 更新部署文档

---

## 🔄 完整开发流程

### 阶段1: 需求理解与确认

#### 1.1 明确需求
```
用户提出需求 → AI理解并复述 → 用户确认 → 开始实施
```

**关键点**:
- ✅ 不确定的地方及时提问
- ✅ 复杂需求要求用户提供参考
- ✅ 确认理解无误后再编码

**示例对话**:
```
用户: 优化消息筛选功能
AI: 我理解您想优化消息筛选，是指：
1. 筛选UI交互优化？
2. 筛选逻辑优化？
3. 还是两者都要？
用户: 主要是UI交互，让它更方便使用
AI: 好的，我会从UI/UX角度优化筛选栏设计
```

#### 1.2 查看现有代码
```
接收需求 → 查看相关文件 → 理解当前实现 → 规划修改方案
```

**必读文件**:
- **AI编程交互关键规范.md**: 核心概念和易混淆点
- **消息筛选栏需求文档.md**: 功能需求说明
- **相关源码文件**: 当前实现

---

### 阶段2: 代码修改

#### 2.1 遵循代码规范
```javascript
// ✅ 使用常量定义，避免硬编码
import { MESSAGE_TYPES, MESSAGE_TYPE_LABELS } from '@/utils/constants'

const options = MESSAGE_TYPES.map(type => ({
  label: MESSAGE_TYPE_LABELS[type],
  value: type
}))

// ❌ 避免硬编码
const options = [
  { label: '早盘关注', value: 'morning_focus' }  // 硬编码
]
```

#### 2.2 保持代码一致性
- 与现有代码风格保持一致
- 与项目架构保持一致
- 与命名规范保持一致

#### 2.3 添加必要注释
```javascript
// 复杂逻辑必须添加注释
// 计算增量内容（避免重复渲染）
const newContent = fullContent.substring(
  lastContent.length,  // 上次结束位置
  fullContent.length   // 当前总长度
)
```

---

### 阶段3: 提交与编译

#### 3.1 规范的Commit Message
```
格式: <type>: <subject>

类型(type):
- feat: 新功能
- fix: Bug修复
- docs: 文档更新
- refactor: 重构
- style: 样式修改
- test: 测试相关
- chore: 构建/工具相关

示例:
feat: 添加消息筛选快速组合功能
fix: 修复AI投顾SSE流式处理错误
docs: 更新部署文档
```

#### 3.2 提交前检查清单
```bash
# 1. 查看修改内容
git status
git diff

# 2. 确认无敏感信息
git diff | grep -i "password\|token\|secret"

# 3. 添加文件
git add <files>

# 4. 提交（使用详细message）
git commit -m "feat: xxx

**原因**: 解决xxx问题

**方案**:
1. 修改了xxx
2. 新增了xxx

**影响**:
- 正面影响：xxx
- 注意事项：xxx

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"

# 5. 推送
git push origin feature/iteration-1

# 6. 编译H5
npm run build:h5

# 7. 编译小程序
npm run build:mp-weixin

# 8. 验证编译结果
ls dist/build/h5/index.html
ls dist/build/mp-weixin/app.js
```

---

### 阶段4: 部署准备

#### 4.1 创建部署文档
每次重要的功能更新后，创建相应的部署文档：

```markdown
# v1.8.x 更新报告

## 更新内容
- 新增：xxx功能
- 修复：xxx问题
- 优化：xxx体验

## 编译结果
- H5: ✅ 编译成功
- 小程序: ✅ 编译成功

## 部署步骤
1. 本地编译已完成
2. 运行部署脚本: scripts\full-deploy.bat
3. 访问测试: http://111.48.74.245/h5/

## 测试清单
- [ ] 功能1正常
- [ ] 功能2正常
```

#### 4.2 更新版本号
在 `package.json` 中更新版本号：
```json
{
  "name": "aity-vip-uni-app",
  "version": "1.8.3"  // 递增版本号
}
```

---

### 阶段5: 测试与验证

#### 5.1 本地测试
```bash
# 启动开发服务器
npm run dev:h5
# 访问 http://localhost:5173
# 测试新功能
```

#### 5.2 生产版本测试
```bash
# 编译后检查
npm run build:h5
# 检查编译产物
ls dist/build/h5/

# 如果有本地预览服务器，部署后测试
```

---

## 🎯 关键概念与易混淆点

### 消息标签 vs 消息类型（最重要！）

**核心规则**: **"消息标签表示推送给谁，消息类型表示什么内容"**

| 维度 | 消息标签 (Message Tags) | 消息类型 (Message Types) |
|------|----------------------|----------------------|
| **用途** | 权限控制，推送范围 | 内容分类，检索筛选 |
| **可见性** | 仅管理员 | 所有用户 |
| **筛选位置** | filter-bar.vue | message-filter-bar.vue |
| **代码常量** | MESSAGE_TAGS | MESSAGE_TYPES |
| **示例值** | short_term, mid_term | pre_market_comment, morning_focus |

**判断方法**:
```
看到"短线VIP/中线VIP" → 这是推送范围 → filter-bar.vue → 仅管理员
看到"盘前点评/早盘关注" → 这是消息类型 → message-filter-bar.vue → 所有用户
```

**代码位置**:
```javascript
// src/utils/constants.js
export const MESSAGE_TAGS = {
  SHORT_TERM: 'short_term',      // 推送范围
  MID_TERM: 'mid_term',          // 推送范围
  ALL_USERS: 'all_users'         // 推送范围
}

export const MESSAGE_TYPES = {
  PRE_MARKET_COMMENT: 'pre_market_comment',  // 消息类型
  MORNING_FOCUS: 'morning_focus',            // 消息类型
  // ...
}
```

---

### SSE流式处理关键点

**SSE协议**: Server-Sent Events，服务端推送事件流

**核心规则**:
1. **事件分隔**: 使用 `\n\n` 分隔SSE事件，不是 `\n`
2. **字段解析**: `event:` 和 `data:` 两个关键字段
3. **增量计算**: 记录上次位置，计算新增内容
4. **事件类型**:
   - `messages/partial`: 增量更新
   - `messages/complete`: 块完成
   - `messages/metadata`: 元数据

**代码示例**:
```javascript
// ✅ 正确的SSE事件分隔
const events = sseText.split('\n\n')  // 双换行

// ❌ 错误的分隔
const events = sseText.split('\n')   // 单换行
```

---

### API兼容性

**规则**: ✅ **使用uni.request替代fetch**

**原因**:
- H5和小程序环境兼容性
- uni.request自动解析JSON
- 避免fetch API在H5编译后不可用的问题

**示例**:
```javascript
// ✅ 使用uni.request
uni.request({
  url: url,
  method: 'POST',
  data: body,
  success: (res) => {
    // 处理响应
  }
})

// ❌ 不使用fetch
fetch(url, options)  // H5编译后可能不可用
```

---

## 📁 项目文件结构规范

### 核心目录
```
aity-uni-app-v2/
├── src/
│   ├── api/              # API接口
│   │   ├── ai-advisor.js      # AI投顾API
│   │   ├── auth.js            # 认证API
│   │   ├── discussion.js      # 讨论API
│   │   └── messages.js        # 消息API
│   ├── components/       # 公共组件
│   │   ├── message-filter-bar.vue   # 基础筛选（所有人）
│   │   └── filter-bar.vue          # 推送范围筛选（管理员）
│   ├── pages/             # 页面
│   │   ├── messages/           # 消息列表
│   │   ├── ai-advisor/         # AI投顾
│   │   └── discussions/        # 讨论列表
│   └── utils/            # 工具函数
│       ├── constants.js         # 常量定义（重要！）
│       └── ai-advisor-config.js # AI投顾配置
├── docs/                # 文档目录
│   ├── AI编程交互关键规范.md        # 核心规范（必读！）
│   ├── 消息筛选栏需求文档.md
│   ├── 统一部署脚本使用指南.md
│   └── ...
├── scripts/             # 脚本目录
│   ├── full-deploy.bat           # 完整部署
│   ├── deploy-backend.bat        # 后端更新
│   └── upload-h5-to-server.bat   # 前端上传
└── dist/build/         # 编译输出
    ├── h5/               # H5编译产物
    └── mp-weixin/        # 小程序编译产物
```

---

## 🔧 常见错误与预防

### 错误1: 概念混淆
**症状**: 消息类型筛选包含了"短线VIP"等推送范围选项

**原因**: 混淆了"消息类型"和"推送范围"

**预防**:
- 开发前先阅读 `AI编程交互关键规范.md`
- 使用MESSAGE_TYPES和MESSAGE_TAGS常量，不硬编码
- 代码审查时检查组件职责

### 错误2: 编译失败
**症状**: 提交后编译失败

**原因**: 语法错误或依赖问题

**预防**:
- 每次提交后立即编译
- 使用ESLint检查代码
- 检查导入路径是否正确

### 错误3: SSE处理错误
**症状**: AI投顾功能失败，"响应格式错误"

**原因**: SSE事件分隔符错误

**预防**:
- 使用 `\n\n` 分隔SSE事件
- 参考tdx-wenda-ai项目的实现
- 记录上次位置，计算增量内容

### 错误4: 权限问题
**症状**: 部署后页面403或404

**原因**: 文件权限不正确

**预防**:
- 部署时设置正确的权限
- `chown -R www-data:www-data /var/www/html/h5`
- `chmod -R 755 /var/www/html/h5`

---

## ✅ 代码审查检查清单

### 提交前检查
- [ ] 代码符合项目规范
- [ ] 使用常量定义，避免硬编码
- [ ] 添加必要的注释
- [ ] 无console.log调试代码
- [ ] 无敏感信息（密码、token等）
- [ ] Commit Message清晰规范

### 编译后检查
- [ ] H5编译成功
- [ ] 小程序编译成功
- [ ] 编译产物完整
- [ ] 无新增的严重警告

### 功能测试
- [ ] 核心功能正常
- [ ] 无明显性能问题
- [ ] 兼容性测试（H5 + 小程序）

---

## 📝 文档维护规范

### 文档更新规则

| 文档类型 | 更新频率 | 负责人 | 触发条件 |
|---------|---------|--------|---------|
| **AI编程交互关键规范.md** | 每次发现新问题时 | AI + 用户 | 发现新的易混淆点 |
| **需求文档** | 每次新增功能时 | AI | 功能开发前 |
| **技术文档** | 每次技术方案变更时 | AI | 实施方案确定后 |
| **部署文档** | 每次部署流程变更时 | AI | 部署脚本更新后 |
| **版本报告** | 每次重要版本发布时 | AI | 版本发布后 |

### 文档命名规范

```
格式: <功能/模块><文档类型>.md

示例:
- 消息筛选栏需求文档.md
- AI投顾修复完成报告.md
- 统一部署脚本使用指南.md
```

---

## 🚀 推荐工作流

### 日常开发流程
```
1. 需求确认
   ↓
2. 查看相关文档和代码
   ↓
3. 编写代码
   ↓
4. 本地测试
   ↓
5. 提交代码 (git commit)
   ↓
6. 推送到远程 (git push)
   ↓
7. 编译H5 (npm run build:h5)
   ↓
8. 编译小程序 (npm run build:mp-weixin)
   ↓
9. 更新文档
   ↓
10. 部署测试 (可选)
```

### 快速修复流程
```
1. 定位问题
   ↓
2. 修复代码
   ↓
3. 提交并编译
   ↓
4. 测试验证
```

---

## 🎓 学习路径

### 新手必读文档（按顺序）
1. **本文档**: AI编码交互规范与最佳实践
2. **AI编程交互关键规范.md**: 核心概念和易混淆点
3. **消息筛选栏需求文档.md**: 功能需求示例
4. **统一部署脚本使用指南.md**: 部署流程

### 进阶阅读
- **H5部署指南.md**: 部署技术细节
- **Git代码同步与部署总结.md**: Git同步流程
- **各种完成报告**: 了解历史问题和解决方案

---

## 📞 问题解决流程

### 遇到问题时
```
1. 查看相关文档
   ↓
2. 搜索历史问题（docs目录）
   ↓
3. 查看参考项目（tdx-wenda-ai）
   ↓
4. 向AI提问时提供上下文
   ↓
5. 记录新问题到文档
```

### 向AI提问的最佳实践

✅ **好的提问**:
```
我在修改消息筛选功能，发现筛选结果不对。
我修改了message-filter-bar.vue的messageTypeOptions，
现在筛选"早盘关注"时返回0条消息。

相关代码：
[粘贴代码]

相关文档：
- 我已经阅读了"AI编程交互关键规范.md"
- 确认了消息类型和推送范围的区别

请帮我分析问题。
```

❌ **不好的提问**:
```
筛选功能坏了，帮我看看
```

---

## 📊 持续改进

### 定期审查
- 每周审查文档完整性
- 每月更新规范和流程
- 收集团队反馈并改进

### 文档版本管理
- 每次重要更新后在文档顶部记录
- 保留历史版本以备查考
- 重大变更创建新的文档版本

---

**文档版本**: v1.0
**创建日期**: 2026-02-06
**最后更新**: 2026-02-06
**维护者**: AI + 用户协作

**核心原则**: **"提交即编译，文档同步更新，概念清晰明确"**

---

## 附录：快速参考

### 常用命令
```bash
# 提交并编译
git add . && git commit -m "xxx" && git push && npm run build:h5 && npm run build:mp-weixin

# 完整部署
cd scripts && full-deploy.bat

# 仅更新后端
cd scripts && deploy-backend.bat
```

### 关键文件位置
```
常量定义: src/utils/constants.js
AI投顾API: src/api/ai-advisor.js
核心规范: docs/AI编程交互关键规范.md
部署指南: docs/统一部署脚本使用指南.md
```

### 紧急联系
- 遇到服务器问题: 查看部署文档
- 遇到编译问题: 查看本规范文档
- 遇到概念混淆: 查看"AI编程交互关键规范.md"
