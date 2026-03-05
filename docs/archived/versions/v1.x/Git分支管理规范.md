# Git分支管理规范

> 项目名称：AITY0123 - VIP投研内部分享系统
> 文档目的：规范Git分支管理，确保团队协作顺畅
> 创建日期：2026-01-25
> 版本：v1.0.0

---

## 📋 文档说明

本文档定义了项目的Git分支管理规范，包括：
- 分支策略
- 分支命名规范
- 分支使用流程
- 代码合并规范
- 版本发布流程

**相关文档：**
- [项目使用指南.md](./项目使用指南.md) - 完整的项目使用指南
- [部署指南.md](./部署指南.md) - 部署流程和运维指南
- [项目迭代记录.md](./项目迭代记录.md) - 项目优化迭代历史

---

## 🌿 分支策略

### 分支类型

| 分支类型 | 分支名称 | 说明 | 保护状态 |
|----------|----------|------|----------|
| **主分支** | main | 生产环境分支，保持稳定 | ✅ 受保护 |
| **开发分支** | develop | 开发环境分支，日常开发 | ✅ 受保护 |
| **功能分支** | feature/* | 新功能开发 | ❌ 不受保护 |
| **修复分支** | fix/* | Bug修复 | ❌ 不受保护 |
| **热修复分支** | hotfix/* | 紧急修复 | ❌ 不受保护 |

### 分支说明

#### 1. main分支（主分支）

**用途：**
- 生产环境代码
- 保持稳定，只合并经过测试的代码
- 定期打标签（Tag）标记版本

**规则：**
- ✅ 只接受从develop分支合并的代码
- ✅ 每次合并需要经过代码审查
- ✅ 每次合并需要通过所有测试
- ❌ 禁止直接提交到main分支
- ❌ 禁止从其他分支直接合并到main分支

**操作：**
```bash
# 切换到main分支
git checkout main

# 拉取最新代码
git pull origin main

# 合并develop分支
git merge develop --no-ff

# 推送到远程
git push origin main

# 打标签
git tag -a v1.0.0 -m "Release version 1.0.0"
git push origin v1.0.0
```

#### 2. develop分支（开发分支）

**用途：**
- 开发环境代码
- 日常开发的主分支
- 集成新功能和Bug修复

**规则：**
- ✅ 接受从feature分支合并的代码
- ✅ 接受从fix分支合并的代码
- ✅ 接受从hotfix分支合并的代码
- ❌ 禁止直接提交到develop分支（紧急修复除外）

**操作：**
```bash
# 切换到develop分支
git checkout develop

# 拉取最新代码
git pull origin develop

# 合并feature分支
git merge feature/new-feature --no-ff

# 推送到远程
git push origin develop
```

#### 3. feature分支（功能分支）

**用途：**
- 开发新功能
- 从develop分支创建
- 完成后合并回develop分支

**命名规范：**
```
feature/<功能名称>
```

**示例：**
- `feature/user-login` - 用户登录功能
- `feature/message-push` - 消息推送功能
- `feature/statistics-dashboard` - 统计仪表盘

**规则：**
- ✅ 从develop分支创建
- ✅ 完成后合并回develop分支
- ✅ 合并后删除feature分支
- ❌ 禁止从main分支创建
- ❌ 禁止直接推送到远程（除非需要协作）

**操作：**
```bash
# 从develop分支创建feature分支
git checkout develop
git pull origin develop
git checkout -b feature/new-feature

# 开发新功能
# ... 修改代码 ...

# 提交代码
git add .
git commit -m "feat: 添加新功能"

# 推送到远程（如果需要协作）
git push origin feature/new-feature

# 合并回develop分支
git checkout develop
git merge feature/new-feature --no-ff
git push origin develop

# 删除feature分支
git branch -d feature/new-feature
git push origin --delete feature/new-feature
```

#### 4. fix分支（修复分支）

**用途：**
- 修复Bug
- 从develop分支创建
- 完成后合并回develop分支

**命名规范：**
```
fix/<问题描述>
```

**示例：**
- `fix/login-error` - 修复登录错误
- `fix/message-display` - 修复消息显示问题
- `fix/database-connection` - 修复数据库连接问题

**规则：**
- ✅ 从develop分支创建
- ✅ 完成后合并回develop分支
- ✅ 合并后删除fix分支
- ❌ 禁止从main分支创建
- ❌ 禁止直接推送到远程（除非需要协作）

**操作：**
```bash
# 从develop分支创建fix分支
git checkout develop
git pull origin develop
git checkout -b fix/login-error

# 修复Bug
# ... 修改代码 ...

# 提交代码
git add .
git commit -m "fix: 修复登录错误"

# 推送到远程（如果需要协作）
git push origin fix/login-error

# 合并回develop分支
git checkout develop
git merge fix/login-error --no-ff
git push origin develop

# 删除fix分支
git branch -d fix/login-error
git push origin --delete fix/login-error
```

#### 5. hotfix分支（热修复分支）

**用途：**
- 紧急修复生产环境问题
- 从main分支创建
- 完成后合并回main和develop分支

**命名规范：**
```
hotfix/<问题描述>
```

**示例：**
- `hotfix/security-vulnerability` - 修复安全漏洞
- `hotfix/critical-bug` - 修复严重Bug
- `hotfix/data-loss` - 修复数据丢失问题

**规则：**
- ✅ 从main分支创建
- ✅ 完成后合并回main分支
- ✅ 完成后合并回develop分支
- ✅ 合并后删除hotfix分支
- ❌ 禁止从develop分支创建

**操作：**
```bash
# 从main分支创建hotfix分支
git checkout main
git pull origin main
git checkout -b hotfix/critical-bug

# 修复Bug
# ... 修改代码 ...

# 提交代码
git add .
git commit -m "hotfix: 修复严重Bug"

# 推送到远程（如果需要协作）
git push origin hotfix/critical-bug

# 合并回main分支
git checkout main
git merge hotfix/critical-bug --no-ff
git push origin main

# 打标签
git tag -a v1.0.1 -m "Hotfix version 1.0.1"
git push origin v1.0.1

# 合并回develop分支
git checkout develop
git merge hotfix/critical-bug --no-ff
git push origin develop

# 删除hotfix分支
git branch -d hotfix/critical-bug
git push origin --delete hotfix/critical-bug
```

---

## 📝 提交规范

### 提交信息格式

```
<type>(<scope>): <subject>

<body>

<footer>
```

### 提交类型（type）

| 类型 | 说明 | 示例 |
|------|------|------|
| **feat** | 新功能 | feat: 添加用户登录功能 |
| **fix** | Bug修复 | fix: 修复登录错误 |
| **docs** | 文档更新 | docs: 更新部署指南 |
| **style** | 代码格式调整 | style: 统一代码缩进 |
| **refactor** | 代码重构 | refactor: 重构用户模块 |
| **test** | 测试相关 | test: 添加登录测试 |
| **chore** | 构建/工具相关 | chore: 更新依赖包 |
| **perf** | 性能优化 | perf: 优化数据库查询 |
| **ci** | CI/CD相关 | ci: 添加自动化部署 |
| **build** | 构建系统 | build: 更新webpack配置 |
| **revert** | 回退提交 | revert: 回退登录功能 |

### 提交示例

**简单提交：**
```
feat: 添加用户登录功能

- 添加登录页面
- 实现登录API
- 添加JWT认证
```

**详细提交：**
```
fix: 修复登录错误

问题描述：
用户登录时，如果密码错误超过3次，账号会被锁定，
但前端没有显示锁定提示信息。

解决方案：
1. 添加账号锁定状态检查
2. 显示账号锁定提示
3. 添加解锁倒计时

影响范围：
- 登录页面
- 登录API
- 用户状态管理

Closes #123
```

---

## 🔄 工作流程

### 1. 新功能开发流程

```
develop → feature/new-feature → develop → main
```

**步骤：**
1. 从develop分支创建feature分支
2. 在feature分支上开发新功能
3. 提交代码并推送到远程
4. 创建Pull Request（PR）到develop分支
5. 代码审查（Code Review）
6. 通过审查后合并到develop分支
7. 删除feature分支
8. 定期将develop分支合并到main分支

### 2. Bug修复流程

```
develop → fix/bug-description → develop → main
```

**步骤：**
1. 从develop分支创建fix分支
2. 在fix分支上修复Bug
3. 提交代码并推送到远程
4. 创建Pull Request（PR）到develop分支
5. 代码审查（Code Review）
6. 通过审查后合并到develop分支
7. 删除fix分支
8. 定期将develop分支合并到main分支

### 3. 紧急修复流程

```
main → hotfix/critical-bug → main
                         ↓
                      develop
```

**步骤：**
1. 从main分支创建hotfix分支
2. 在hotfix分支上修复问题
3. 提交代码并推送到远程
4. 创建Pull Request（PR）到main分支
5. 代码审查（Code Review）
6. 通过审查后合并到main分支
7. 打标签（Tag）标记版本
8. 合并到develop分支
9. 删除hotfix分支

### 4. 版本发布流程

```
develop → main (tag: v1.0.0)
```

**步骤：**
1. 确保develop分支稳定
2. 将develop分支合并到main分支
3. 打标签（Tag）标记版本
4. 推送到远程
5. 部署到生产环境

---

## 🎯 最佳实践

### 1. 分支管理

- ✅ 保持分支简洁，不要在分支上停留太久
- ✅ 定期同步develop分支的最新代码
- ✅ 合并前先拉取最新代码
- ✅ 使用`--no-ff`参数合并，保留分支历史
- ❌ 不要在main分支上直接开发
- ❌ 不要在develop分支上直接开发（紧急修复除外）

### 2. 提交管理

- ✅ 提交前先拉取最新代码
- ✅ 提交信息清晰描述修改内容
- ✅ 一次提交只做一件事
- ✅ 提交前运行测试
- ❌ 不要提交敏感信息（密码、密钥等）
- ❌ 不要提交调试代码
- ❌ 不要提交大文件（二进制文件等）

### 3. 代码审查

- ✅ 所有合并都需要代码审查
- ✅ 审查时关注代码质量、安全性、性能
- ✅ 审查通过后才能合并
- ❌ 不要跳过代码审查
- ❌ 不要合并未经测试的代码

### 4. 版本管理

- ✅ 使用语义化版本（Semantic Versioning）
- ✅ 每次发布到main分支都打标签
- ✅ 标签格式：v1.0.0
- ✅ 版本号格式：主版本.次版本.修订版本
  - 主版本：不兼容的API修改
  - 次版本：向下兼容的功能性新增
  - 修订版本：向下兼容的问题修正

---

## 📊 分支状态

### 当前分支状态

| 分支名称 | 状态 | 最后更新 | 说明 |
|----------|------|----------|------|
| **main** | ✅ 活跃 | 2026-01-25 | 生产环境分支 |
| **develop** | ✅ 活跃 | 2026-01-25 | 开发环境分支 |
| **feature/frontend-refactor** | ⏸️ 暂停 | 2026-01-25 | 前端重构功能分支 |

### 分支保护规则

| 分支名称 | 保护状态 | 需要审查 | 需要测试 |
|----------|----------|----------|----------|
| **main** | ✅ 受保护 | ✅ 是 | ✅ 是 |
| **develop** | ✅ 受保护 | ✅ 是 | ✅ 是 |
| **feature/*** | ❌ 不受保护 | ❌ 否 | ❌ 否 |
| **fix/*** | ❌ 不受保护 | ❌ 否 | ❌ 否 |
| **hotfix/*** | ❌ 不受保护 | ❌ 否 | ❌ 否 |

---

## 🔧 常用命令

### 分支操作

```bash
# 查看所有分支
git branch -a

# 创建新分支
git checkout -b feature/new-feature

# 切换分支
git checkout develop

# 删除本地分支
git branch -d feature/new-feature

# 删除远程分支
git push origin --delete feature/new-feature

# 重命名分支
git branch -m old-name new-name
```

### 合并操作

```bash
# 合并分支（保留分支历史）
git merge feature/new-feature --no-ff

# 合并分支（不保留分支历史）
git merge feature/new-feature --ff

# 取消合并
git merge --abort

# 解决冲突后继续合并
git add .
git commit
```

### 标签操作

```bash
# 创建标签
git tag -a v1.0.0 -m "Release version 1.0.0"

# 查看所有标签
git tag

# 推送标签到远程
git push origin v1.0.0

# 推送所有标签
git push origin --tags

# 删除本地标签
git tag -d v1.0.0

# 删除远程标签
git push origin --delete v1.0.0
```

---

## 📚 参考资料

- [Git官方文档](https://git-scm.com/doc)
- [语义化版本](https://semver.org/lang/zh-CN/)
- [Conventional Commits](https://www.conventionalcommits.org/zh-hans/)
- [GitHub Flow](https://guides.github.com/introduction/flow/)
- [GitLab Flow](https://docs.gitlab.com/ee/topics/gitlab_flow.html)

---

**文档维护者：** 开发团队
**最后更新：** 2026-01-25
**版本：** v1.0.0
