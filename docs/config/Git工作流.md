# VIP投研内部分享系统 - Git工作流

## 📋 文档说明

本文档是VIP投研内部分享系统的Git工作流文档，包含Git分支管理、提交规范等信息，为开发人员提供详细的Git使用指导。

**文档版本：** v2.0.0
**更新日期：** 2026-01-30
**适用人群：** 开发人员

---

## 🎯 Git仓库配置

### 远程仓库

| 配置项 | 值 | 说明 |
|--------|-----|------|
| **远程仓库地址** | https://github.com/AILHJJ/aity-vip.git | 项目远程仓库 |
| **仓库类型** | GitHub | 代码托管平台 |
| **访问方式** | HTTPS/SSH | 支持两种访问方式 |

### 本地仓库配置

#### 1. 克隆仓库

```bash
# 使用HTTPS方式克隆
git clone https://github.com/AILHJJ/aity-vip.git

# 或使用SSH方式克隆
git clone git@github.com:AILHJJ/aity-vip.git
```

#### 2. 配置用户信息

```bash
# 配置全局用户信息
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"

# 或配置本地仓库用户信息
git config user.name "Your Name"
git config user.email "your.email@example.com"
```

#### 3. 配置SSH密钥（可选）

**生成SSH密钥：**

```bash
# 生成SSH密钥
ssh-keygen -t rsa -b 4096 -C "your.email@example.com"

# 查看公钥
cat ~/.ssh/id_rsa.pub
```

**添加SSH密钥到GitHub：**

1. 登录GitHub
2. 点击右上角头像 →「Settings」
3. 点击左侧菜单「SSH and GPG keys」
4. 点击「New SSH key」按钮
5. 粘贴公钥内容，点击「Add SSH key」按钮

---

## 🌿 分支管理

### 分支策略

#### 主要分支

| 分支名称 | 用途 | 说明 |
|---------|------|------|
| **main** | 主分支 | 稳定版本，用于生产环境部署 |
| **develop** | 开发分支 | 集成所有功能开发，用于测试 |

#### 辅助分支

| 分支名称 | 用途 | 说明 |
|---------|------|------|
| **feature/** | 特性分支 | 开发新功能，从develop分支创建 |
| **bugfix/** | 修复分支 | 修复bug，从main或develop分支创建 |
| **hotfix/** | 热修复分支 | 紧急修复生产环境问题，从main分支创建 |
| **release/** | 发布分支 | 准备发布版本，从develop分支创建 |

### 分支命名规范

#### 特性分支

```
feature/功能名称
```

**示例：**
- `feature/user-auth` - 用户认证功能
- `feature/message-push` - 消息推送功能
- `feature/discussion` - 讨论功能

#### 修复分支

```
bugfix/问题描述
```

**示例：**
- `bugfix/login-error` - 登录错误修复
- `bugfix/message-display` - 消息显示问题修复

#### 热修复分支

```
hotfix/问题描述
```

**示例：**
- `hotfix/server-crash` - 服务器崩溃修复
- `hotfix/data-leak` - 数据泄露修复

#### 发布分支

```
release/版本号
```

**示例：**
- `release/v1.0.0` - v1.0.0版本发布
- `release/v1.1.0` - v1.1.0版本发布

### 分支操作

#### 创建分支

```bash
# 创建特性分支
git checkout develop
git checkout -b feature/功能名称

# 创建修复分支
git checkout develop
git checkout -b bugfix/问题描述

# 创建热修复分支
git checkout main
git checkout -b hotfix/问题描述

# 创建发布分支
git checkout develop
git checkout -b release/版本号
```

#### 切换分支

```bash
# 切换到指定分支
git checkout 分支名称
```

#### 合并分支

```bash
# 合并特性分支到develop
git checkout develop
git merge feature/功能名称

# 合并修复分支到develop
git checkout develop
git merge bugfix/问题描述

# 合并热修复分支到main和develop
git checkout main
git merge hotfix/问题描述
git checkout develop
git merge hotfix/问题描述

# 合并发布分支到main和develop
git checkout main
git merge release/版本号
git checkout develop
git merge release/版本号
```

#### 删除分支

```bash
# 删除本地分支
git branch -d 分支名称

# 删除远程分支
git push origin --delete 分支名称
```

#### 查看分支

```bash
# 查看本地分支
git branch

# 查看远程分支
git branch -r

# 查看所有分支
git branch -a
```

---

## 📝 提交规范

### 提交信息格式

```
<类型>(<范围>): <描述>

<正文>

<脚注>
```

**示例：**

```
feat(user): 添加用户登录功能

- 实现邮箱和用户名双重登录
- 添加登录状态管理
- 集成JWT认证

Closes #123
```

### 类型说明

| 类型 | 含义 | 示例 |
|------|------|------|
| **feat** | 新功能 | feat(user): 添加用户注册功能 |
| **fix** | 修复bug | fix(message): 修复消息显示问题 |
| **docs** | 文档更新 | docs: 更新API文档 |
| **style** | 代码风格 | style: 格式化代码 |
| **refactor** | 代码重构 | refactor: 重构用户管理模块 |
| **test** | 测试相关 | test: 添加单元测试 |
| **chore** | 构建/依赖 | chore: 更新npm依赖 |
| **perf** | 性能优化 | perf: 优化数据库查询 |
| **revert** | 回滚代码 | revert: 回滚到v1.0.0 |

### 范围说明

**范围**：可选，指定修改的模块或文件

**示例：**
- `feat(user): 添加用户登录功能` - 修改用户模块
- `fix(message): 修复消息显示问题` - 修改消息模块
- `docs(api): 更新API文档` - 修改API文档

### 描述说明

**描述**：必填，简洁明了地描述本次提交的内容

**要求**：
- 不超过50个字符
- 首字母大写
- 使用祈使句（动词开头）
- 不要以句号结尾

**示例：**
- `添加用户登录功能` ✅
- `Add user login functionality` ❌（使用英文）
- `用户登录功能` ❌（缺少动词）
- `添加用户登录功能。` ❌（以句号结尾）

### 正文说明

**正文**：可选，详细描述本次提交的内容

**要求**：
- 每行不超过72个字符
- 详细说明修改的原因和影响
- 可以使用列表格式

**示例：**

```
- 实现邮箱和用户名双重登录
- 添加登录状态管理
- 集成JWT认证
- 修复登录失败的问题
```

### 脚注说明

**脚注**：可选，用于引用issue或PR

**示例：**
- `Closes #123` - 关闭issue #123
- `Fixes #456` - 修复issue #456
- `Resolves #789` - 解决issue #789

### 提交命令

#### 基本提交

```bash
# 添加文件
git add .

# 提交代码
git commit -m "feat(user): 添加用户登录功能"
```

#### 详细提交

```bash
# 添加文件
git add .

# 提交代码（打开编辑器填写详细信息）
git commit
```

#### 修正提交

```bash
# 修正上次提交
git add .
git commit --amend
```

---

## 🔄 工作流程

### 1. 功能开发流程

1. **更新开发分支**：
   ```bash
   git checkout develop
   git pull origin develop
   ```

2. **创建特性分支**：
   ```bash
   git checkout -b feature/功能名称
   ```

3. **开发功能**：
   - 编写代码
   - 运行测试
   - 提交代码

4. **推送分支**：
   ```bash
   git push origin feature/功能名称
   ```

5. **创建Pull Request**：
   - 登录GitHub
   - 点击「Pull requests」→「New pull request」
   - 选择 `feature/功能名称` → `develop`
   - 填写PR信息，点击「Create pull request」按钮

6. **代码审查**：
   - 团队成员审查代码
   - 解决审查意见

7. **合并分支**：
   - 审查通过后，合并PR到develop分支
   - 删除特性分支

### 2. Bug修复流程

1. **更新分支**：
   ```bash
   git checkout develop
   git pull origin develop
   ```

2. **创建修复分支**：
   ```bash
   git checkout -b bugfix/问题描述
   ```

3. **修复bug**：
   - 定位问题
   - 修复代码
   - 运行测试
   - 提交代码

4. **推送分支**：
   ```bash
   git push origin bugfix/问题描述
   ```

5. **创建Pull Request**：
   - 登录GitHub
   - 点击「Pull requests」→「New pull request」
   - 选择 `bugfix/问题描述` → `develop`
   - 填写PR信息，点击「Create pull request」按钮

6. **代码审查**：
   - 团队成员审查代码
   - 解决审查意见

7. **合并分支**：
   - 审查通过后，合并PR到develop分支
   - 删除修复分支

### 3. 热修复流程

1. **更新主分支**：
   ```bash
   git checkout main
   git pull origin main
   ```

2. **创建热修复分支**：
   ```bash
   git checkout -b hotfix/问题描述
   ```

3. **修复问题**：
   - 定位问题
   - 修复代码
   - 运行测试
   - 提交代码

4. **推送分支**：
   ```bash
   git push origin hotfix/问题描述
   ```

5. **创建Pull Request**：
   - 登录GitHub
   - 点击「Pull requests」→「New pull request」
   - 选择 `hotfix/问题描述` → `main`
   - 填写PR信息，点击「Create pull request」按钮

6. **代码审查**：
   - 团队成员审查代码
   - 解决审查意见

7. **合并分支**：
   - 审查通过后，合并PR到main分支
   - 同时合并PR到develop分支
   - 删除热修复分支

### 4. 发布流程

1. **更新开发分支**：
   ```bash
   git checkout develop
   git pull origin develop
   ```

2. **创建发布分支**：
   ```bash
   git checkout -b release/版本号
   ```

3. **准备发布**：
   - 更新版本号
   - 更新CHANGELOG.md
   - 运行测试
   - 提交代码

4. **推送分支**：
   ```bash
   git push origin release/版本号
   ```

5. **创建Pull Request**：
   - 登录GitHub
   - 点击「Pull requests」→「New pull request」
   - 选择 `release/版本号` → `main`
   - 填写PR信息，点击「Create pull request」按钮

6. **代码审查**：
   - 团队成员审查代码
   - 解决审查意见

7. **合并分支**：
   - 审查通过后，合并PR到main分支
   - 同时合并PR到develop分支
   - 删除发布分支

8. **创建标签**：
   ```bash
   git checkout main
   git tag -a v版本号 -m "版本号发布"
   git push origin v版本号
   ```

---

## 📚 常用命令

### 基本命令

| 命令 | 用途 | 示例 |
|------|------|------|
| **git init** | 初始化仓库 | `git init` |
| **git clone** | 克隆仓库 | `git clone https://github.com/AILHJJ/aity-vip.git` |
| **git add** | 添加文件 | `git add .` |
| **git commit** | 提交代码 | `git commit -m "feat: 添加新功能"` |
| **git push** | 推送代码 | `git push origin main` |
| **git pull** | 拉取代码 | `git pull origin main` |
| **git status** | 查看状态 | `git status` |
| **git log** | 查看日志 | `git log --oneline` |
| **git branch** | 管理分支 | `git branch -a` |
| **git checkout** | 切换分支 | `git checkout develop` |
| **git merge** | 合并分支 | `git merge feature/功能名称` |
| **git stash** | 暂存代码 | `git stash` |
| **git stash pop** | 恢复暂存 | `git stash pop` |
| **git reset** | 重置代码 | `git reset HEAD~1` |
| **git tag** | 管理标签 | `git tag -a v1.0.0 -m "v1.0.0发布"` |

### 高级命令

| 命令 | 用途 | 示例 |
|------|------|------|
| **git rebase** | 变基 | `git rebase develop` |
| **git cherry-pick** | 挑选提交 | `git cherry-pick commit-id` |
| **git bisect** | 二分查找 | `git bisect start` |
| **git blame** | 查看文件修改历史 | `git blame file.js` |
| **git diff** | 查看差异 | `git diff main develop` |
| **git show** | 查看提交详情 | `git show commit-id` |
| **git remote** | 管理远程仓库 | `git remote -v` |
| **git config** | 配置Git | `git config --global user.name "Your Name"` |

---

## 🚨 常见问题与解决方案

### 1. 冲突解决

**问题**：合并分支时出现冲突

**解决方案**：
1. **查看冲突文件**：
   ```bash
   git status
   ```

2. **编辑冲突文件**：
   - 找到冲突标记 `<<<<<<<`、`=======`、`>>>>>>>`
   - 编辑文件，保留需要的代码
   - 删除冲突标记

3. **提交解决**：
   ```bash
   git add .
   git commit -m "fix: 解决合并冲突"
   ```

### 2. 误操作恢复

**问题**：误删除文件或提交错误代码

**解决方案**：

**恢复删除的文件**：
```bash
# 恢复删除的文件
git checkout HEAD -- file.js
```

**回滚提交**：
```bash
# 回滚到上一次提交
git reset HEAD~1

# 强制回滚（谨慎使用）
git reset --hard HEAD~1
```

**撤销修改**：
```bash
# 撤销工作区修改
git checkout -- file.js

# 撤销暂存区修改
git reset HEAD file.js
```

### 3. 分支管理问题

**问题**：本地分支与远程分支不同步

**解决方案**：
```bash
# 拉取远程分支
git fetch origin

# 查看远程分支
git branch -r

# 同步远程分支
git checkout -b develop origin/develop
```

### 4. 推送失败

**问题**：推送代码时失败

**解决方案**：
```bash
# 先拉取远程代码
git pull origin main --rebase

# 解决冲突（如果有）

# 推送代码
git push origin main
```

### 5. 标签管理

**问题**：标签推送失败

**解决方案**：
```bash
# 推送标签
git push origin v1.0.0

# 推送所有标签
git push origin --tags
```

---

## 📚 相关文档

| 文档名称 | 描述 |
|---------|------|
| [项目概述.md](./项目概述.md) | 项目简介、核心功能、技术栈、快速开始 |
| [开发指南.md](./开发指南.md) | 开发规范、架构设计、代码风格 |
| [部署手册.md](./部署手册.md) | 部署流程、服务器配置、HTTPS设置 |
| [API文档.md](./API文档.md) | API接口说明、请求/响应格式 |
| [运维手册.md](./运维手册.md) | 系统维护、监控、故障排查 |
| [环境配置.md](./环境配置.md) | 本地开发环境、云服务器配置 |
| [小程序配置.md](./小程序配置.md) | 小程序申请、配置、发布 |
| [迭代记录.md](./迭代记录.md) | 项目优化历史、功能变更 |
| [测试报告.md](./测试报告.md) | 测试结果、问题修复 |

---

**项目维护者：** 开发团队
**最后更新：** 2026-01-30
**版本：** v2.0.0