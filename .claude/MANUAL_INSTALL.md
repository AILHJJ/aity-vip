# 手动安装 Skills 指南

## 问题分析

批处理文件双击没反应通常是因为：
1. **编码问题** - 脚本中的中文显示乱码
2. **权限问题** - 需要管理员权限
3. **网络问题** - 无法连接到 GitHub
4. **环境问题** - Node.js 版本过低或未安装

## 解决方案：手动安装

### 步骤 1：检查环境

在 PowerShell 中执行：

```powershell
# 检查 Node.js 版本（需要 v16+）
node -v

# 检查 npm 版本
npm -v
```

### 步骤 2：配置镜像（解决网络问题）

```powershell
# 配置淘宝镜像
npm config set registry https://registry.npmmirror.com

# 清除缓存
npm cache clean --force
```

### 步骤 3：逐个安装 Skills

**产品经理必备：**

```powershell
# PRD 编写
npx skills add refoundai/lenny-skills@writing-prds -g -y

# 内容策略
npx skills add coreyhaines31/marketingskills@content-strategy -g -y
```

**研发自动化：**

```powershell
# 头脑风暴
npx skills add obra/superpowers@brainstorming -g -y

# 编写计划
npx skills add obra/superpowers@writing-plans -g -y

# 执行计划
npx skills add obra/superpowers@executing-plans -g -y

# 系统化调试
npx skills add obra/superpowers@systematic-debugging -g -y

# 测试驱动开发
npx skills add obra/superpowers@test-driven-development -g -y
```

**前端开发：**

```powershell
# React 最佳实践
npx skills add vercel-labs/agent-skills@react-best-practices -g -y

# 组合模式
npx skills add vercel-labs/agent-skills@composition-patterns -g -y
```

**文档处理：**

```powershell
# MarkItDown
npx skills add microsoft/markitdown-skill -g -y
```

**数据分析：**

```powershell
# 数据分析
npx skills add jupyter/data-analysis-skill -g -y
```

**浏览器自动化：**

```powershell
# 浏览器自动化
npx skills add vercel-labs/agent-skills@dev-browser -g -y
```

**研究工具：**

```powershell
# 深度研究
npx skills add obra/superpowers@research -g -y
```

## 验证安装

```powershell
# 查看已安装的 Skills
npx skills ls -g
```

## 常见问题解决

### 问题 1：网络超时

**症状：**
```
npm ERR! code ETIMEDOUT
npm ERR! errno ETIMEDOUT
```

**解决：**
- 检查网络连接
- 使用手机热点
- 配置代理：
  ```powershell
  npm config set proxy http://proxy.company.com:8080
  npm config set https-proxy http://proxy.company.com:8080
  ```

### 问题 2：权限错误

**症状：**
```
npm ERR! EACCES: permission denied
```

**解决：**
- 以管理员身份运行 PowerShell
- 或修改 npm 权限：
  ```powershell
  npm config set prefix ~/.npm-global
  $env:PATH += ";$HOME\.npm-global\bin"
  ```

### 问题 3：Skill 未找到

**症状：**
```
Error: Skill not found
```

**解决：**
- 检查 Skill 路径是否正确
- 使用 `npx skills find <关键词>` 搜索正确的路径

### 问题 4：Node.js 版本过低

**症状：**
```
Error: Cannot find module '@anthropic-ai/skills-cli'
```

**解决：**
- 升级 Node.js 到 v16+：https://nodejs.org/
- 升级 npm：
  ```powershell
  npm install -g npm@latest
  ```

## 快速安装命令（复制粘贴）

```powershell
# 配置环境
npm config set registry https://registry.npmmirror.com
npm cache clean --force

# 安装所有 Skills
npx skills add refoundai/lenny-skills@writing-prds -g -y
npx skills add coreyhaines31/marketingskills@content-strategy -g -y
npx skills add obra/superpowers@brainstorming -g -y
npx skills add obra/superpowers@writing-plans -g -y
npx skills add obra/superpowers@executing-plans -g -y
npx skills add obra/superpowers@systematic-debugging -g -y
npx skills add obra/superpowers@test-driven-development -g -y
npx skills add vercel-labs/agent-skills@react-best-practices -g -y
npx skills add vercel-labs/agent-skills@composition-patterns -g -y
npx skills add microsoft/markitdown-skill -g -y
npx skills add jupyter/data-analysis-skill -g -y
npx skills add vercel-labs/agent-skills@dev-browser -g -y
npx skills add obra/superpowers@research -g -y

# 验证
npx skills ls -g
```

## 离线安装方案

如果网络完全无法访问：

1. 从有网络的电脑导出：
   ```powershell
   # 进入 npm 全局目录
   cd C:\Users\$env:USERNAME\AppData\Roaming\npm\node_modules
   
   # 打包
   Compress-Archive -Path "@anthropic-ai" -DestinationPath "skills-backup.zip" -Force
   ```

2. 复制 `skills-backup.zip` 到离线电脑

3. 解压到：
   ```
   C:\Users\<用户名>\AppData\Roaming\npm\node_modules\
   ```

4. 验证：
   ```powershell
   npx skills ls -g
   ```
