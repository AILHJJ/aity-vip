# 方案2: Git提交编译产物使用指南

**方案类型**: 备用方案
**适用场景**: SSH不可用、网络受限、紧急情况
**优先级**: 低（不推荐作为常规方案）

---

## ⚠️ 重要提示

**为什么这是备用方案？**

| 优点 | 缺点 |
|------|------|
| ✅ Git拉取后直接可用 | ❌ Git仓库体积急剧增大（几MB → 几十MB） |
| ✅ 不需要上传文件 | ❌ 每次提交包含大量二进制文件 |
| ✅ 操作简单 | ❌ 代码审查困难（大量diff） |
| ✅ 服务器不需要Node.js | ❌ Git拉取和推送变慢 |
| | ❌ 不同环境编译产物可能不同 |

**推荐**: 仅在SSH不可用等特殊情况下使用此方案。日常开发请使用方案1或方案3。

---

## 📋 使用步骤

### 第一次配置

#### 1. 切换.gitignore配置

```bash
# 备份当前配置
cp .gitignore .gitignore.backup

# 使用允许提交编译产物的配置
cp .gitignore.allow-dist .gitignore
```

#### 2. 编译并提交

```bash
# 编译H5和小程序
npm run build:h5
npm run build:mp-weixin

# 验证编译产物
ls dist/build/h5/index.html
ls dist/build/mp-weixin/app.js

# 提交到Git
git add dist/
git commit -m "chore: 添加编译产物到Git"

# 推送到远程
git push origin feature/iteration-1
```

#### 3. 服务器端拉取

```bash
# SSH到服务器
ssh root@111.48.74.245

# 拉取最新代码（包含编译产物）
cd /tmp/AITY/aity-uni-app-v2
git pull origin feature/iteration-1

# 部署前端
cp -r dist/build/h5/* /var/www/html/h5/
chown -R www-data:www-data /var/www/html/h5
chmod -R 755 /var/www/html/h5
```

---

### 日常使用

#### 修改代码后提交

```bash
# 1. 修改代码
# ... 编辑源代码 ...

# 2. 编译
npm run build:h5
npm run build:mp-weixin

# 3. 提交（包含源代码和编译产物）
git add .
git commit -m "feat: xxx功能"
git push origin feature/iteration-1

# 4. 服务器端拉取并部署
ssh root@111.48.74.245 "cd /tmp/AITY/aity-uni-app-v2 && git pull && cp -r dist/build/h5/* /var/www/html/h5/ && chown -R www-data:www-data /var/www/html/h5"
```

---

## 🔄 恢复到默认配置

**如果不再需要方案2，恢复默认配置**：

```bash
# 恢复默认.gitignore
cp .gitignore.backup .gitignore

# 从Git中移除已提交的编译产物
git rm -r --cached dist/
git commit -m "chore: 恢复默认.gitignore配置"
git push origin feature/iteration-1
```

---

## 📊 方案对比

| 特性 | 方案1 (本地编译+上传) | 方案2 (Git提交编译产物) | 方案3 (服务器端编译) |
|------|---------------------|---------------------|---------------------|
| **Git仓库大小** | 小（仅源代码） | 大（源码+编译产物） | 小（仅源代码） |
| **本地Node.js** | 需要 | 需要 | 不需要 |
| **服务器Node.js** | 不需要 | 不需要 | 需要 |
| **网络传输** | 上传编译产物 | Git push编译产物 | SSH触发编译 |
| **部署速度** | 快（2分钟） | 慢（Git push/pull慢） | 中等（3分钟） |
| **推荐度** | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐ |

---

## 🚑 紧急情况使用

**场景**: SSH不可用，需要快速部署

```bash
# Windows本地
cd D:\your-mcp-proxy\AITY_VIP\aity-uni-app-v2

# 1. 切换到方案2配置
copy .gitignore .gitignore.backup
copy .gitignore.allow-dist .gitignore

# 2. 编译
call npm run build:h5

# 3. 提交到Git
git add dist/
git commit -m "chore: 紧急部署 - 添加编译产物"
git push origin feature/iteration-1

# 4. 通知服务器管理员手动拉取
# （或其他方式触发服务器端git pull）
```

---

## ❓ 常见问题

### Q1: 为什么要备份.gitignore？

**A**: 方便日后恢复到默认配置。方案2仅用于特殊情况。

### Q2: 编译产物占用多少空间？

**A**:
- H5编译产物: 约5-10MB
- 小程序编译产物: 约2-5MB
- 总计: 约7-15MB 每次提交

### Q3: 是否需要每次都提交编译产物？

**A**: 使用方案2时，每次修改代码后都需要：
1. 重新编译
2. 提交新的编译产物
3. Git仓库会持续增大

### Q4: 如何减小Git仓库大小？

**A**:
```bash
# 使用git filter-branch清理历史（慎用）
git filter-branch --tree-filter 'rm -rf dist' --prune-empty HEAD

# 或者使用BFG Repo-Cleaner工具
```

---

## ✅ 总结

**方案2适用于**:
- ❌ SSH不可用
- ❌ 网络受限，无法上传文件
- ❌ 紧急情况需要快速部署

**方案2不适用于**:
- ✅ 日常开发（请使用方案1）
- ✅ 频繁部署（Git仓库会很大）
- ✅ 团队协作（Git同步变慢）

**建议**: 优先使用方案1或方案3，方案2仅作为备用方案。

---

**最后更新**: 2026-02-06
**维护者**: 开发团队
