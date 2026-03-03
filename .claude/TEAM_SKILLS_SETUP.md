# 团队 Skills 安装指南

> 最后更新: 2026-03-02
> 适用团队: AITY VIP 项目组

---

## 快速安装（一键脚本）

### Windows 用户

创建 `install-skills.bat` 文件：

```batch
@echo off
chcp 65001 >nul
echo ==========================================
echo   AITY VIP 团队 Skills 安装脚本
echo ==========================================
echo.

REM 检查 Node.js
node -v >nul 2>&1
if errorlevel 1 (
    echo [错误] 未检测到 Node.js，请先安装 Node.js 16+
    echo 下载地址: https://nodejs.org/
    pause
    exit /b 1
)

echo [1/3] 检查 Node.js 版本...
node -v

echo.
echo [2/3] 配置 npm 镜像（加速下载）...
npm config set registry https://registry.npmmirror.com

echo.
echo [3/3] 开始安装 Skills...
echo.

REM 产品经理必备
npx skills add refoundai/lenny-skills@writing-prds -g -y
npx skills add coreyhaines31/marketingskills@content-strategy -g -y

REM 研发自动化
npx skills add obra/superpowers@brainstorming -g -y
npx skills add obra/superpowers@writing-plans -g -y
npx skills add obra/superpowers@executing-plans -g -y
npx skills add obra/superpowers@systematic-debugging -g -y
npx skills add obra/superpowers@test-driven-development -g -y

REM 前端开发
npx skills add vercel-labs/agent-skills@react-best-practices -g -y
npx skills add vercel-labs/agent-skills@composition-patterns -g -y

REM 文档处理
npx skills add microsoft/markitdown-skill -g -y

REM 数据分析
npx skills add jupyter/data-analysis-skill -g -y

echo.
echo ==========================================
echo   安装完成！
echo ==========================================
echo.
echo 验证安装: npx skills ls -g
pause
```

### Mac/Linux 用户

创建 `install-skills.sh` 文件：

```bash
#!/bin/bash

echo "=========================================="
echo "  AITY VIP 团队 Skills 安装脚本"
echo "=========================================="
echo ""

# 检查 Node.js
if ! command -v node &> /dev/null; then
    echo "[错误] 未检测到 Node.js，请先安装 Node.js 16+"
    echo "下载地址: https://nodejs.org/"
    exit 1
fi

echo "[1/3] 检查 Node.js 版本..."
node -v

echo ""
echo "[2/3] 配置 npm 镜像（加速下载）..."
npm config set registry https://registry.npmmirror.com

echo ""
echo "[3/3] 开始安装 Skills..."
echo ""

# 产品经理必备
npx skills add refoundai/lenny-skills@writing-prds -g -y
npx skills add coreyhaines31/marketingskills@content-strategy -g -y

# 研发自动化
npx skills add obra/superpowers@brainstorming -g -y
npx skills add obra/superpowers@writing-plans -g -y
npx skills add obra/superpowers@executing-plans -g -y
npx skills add obra/superpowers@systematic-debugging -g -y
npx skills add obra/superpowers@test-driven-development -g -y

# 前端开发
npx skills add vercel-labs/agent-skills@react-best-practices -g -y
npx skills add vercel-labs/agent-skills@composition-patterns -g -y

# 文档处理
npx skills add microsoft/markitdown-skill -g -y

# 数据分析
npx skills add jupyter/data-analysis-skill -g -y

echo ""
echo "=========================================="
echo "  安装完成！"
echo "=========================================="
echo ""
echo "验证安装: npx skills ls -g"
```

赋予执行权限：
```bash
chmod +x install-skills.sh
./install-skills.sh
```

---

## 手动安装指南

如果自动脚本失败，请按以下步骤手动安装：

### 步骤1：环境检查

```bash
# 检查 Node.js 版本（需要 v16+）
node -v

# 检查 npm
npm -v

# 如果版本过低，请升级
npm install -g npm@latest
```

### 步骤2：配置镜像（国内用户必做）

```bash
# 使用淘宝镜像
npm config set registry https://registry.npmmirror.com

# 或使用腾讯云镜像
npm config set registry https://mirrors.cloud.tencent.com/npm/
```

### 步骤3：逐个安装 Skills

**产品经理必备：**
```bash
# PRD 编写
npx skills add refoundai/lenny-skills@writing-prds -g -y

# 内容策略
npx skills add coreyhaines31/marketingskills@content-strategy -g -y
```

**研发自动化：**
```bash
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
```bash
# React 最佳实践
npx skills add vercel-labs/agent-skills@react-best-practices -g -y

# 组合模式
npx skills add vercel-labs/agent-skills@composition-patterns -g -y
```

**文档处理：**
```bash
# MarkItDown
npx skills add microsoft/markitdown-skill -g -y
```

**数据分析：**
```bash
# 数据分析
npx skills add jupyter/data-analysis-skill -g -y
```

---

## 常见问题解决

### 问题1：网络超时

**现象**：
```
npm ERR! code ETIMEDOUT
npm ERR! errno ETIMEDOUT
```

**解决**：
```bash
# 1. 配置代理（如果有公司代理）
npm config set proxy http://proxy.company.com:8080
npm config set https-proxy http://proxy.company.com:8080

# 2. 或使用镜像
npm config set registry https://registry.npmmirror.com

# 3. 重试安装
npx skills add <skill> -g -y
```

### 问题2：权限错误

**现象**：
```
npm ERR! EACCES: permission denied
```

**解决**：
```bash
# Windows: 以管理员身份运行 PowerShell
# Mac/Linux:
sudo npx skills add <skill> -g -y

# 或修改 npm 全局目录权限
npm config set prefix ~/.npm-global
export PATH=~/.npm-global/bin:$PATH
```

### 问题3：找不到模块

**现象**：
```
Error: Cannot find module '@anthropic-ai/skills-cli'
```

**解决**：
```bash
# 清除缓存并重新安装
npm cache clean --force
npm install -g @anthropic-ai/skills-cli
npx skills add <skill> -g -y
```

### 问题4：Skill 名称错误

**现象**：
```
Error: Skill not found
```

**解决**：
```bash
# 先搜索正确的 skill 名称
npx skills find brainstorming

# 然后使用完整路径安装
npx skills add obra/superpowers@brainstorming -g -y
```

---

## 验证安装

```bash
# 列出已安装的 skills
npx skills ls -g

# 预期输出示例：
# ✓ brainstorming (obra/superpowers@brainstorming)
# ✓ writing-prds (refoundai/lenny-skills@writing-prds)
# ✓ content-strategy (coreyhaines31/marketingskills@content-strategy)
```

---

## 离线安装方案（终极方案）

如果网络完全无法访问，可以使用离线安装：

### 步骤1：有网络的电脑导出（Windows）

```powershell
# 找到安装目录
npm root -g
# 输出: C:\Users\<用户名>\AppData\Roaming\npm\node_modules

# 进入目录
cd C:\Users\$env:USERNAME\AppData\Roaming\npm\node_modules

# 打包 skills 目录（Windows 使用 Compress-Archive）
Compress-Archive -Path "@anthropic-ai" -DestinationPath "skills-backup.zip" -Force

# 查看打包结果
ls skills-backup.zip
```

### 步骤1：有网络的电脑导出（Mac/Linux）

```bash
# 找到安装目录
cd $(npm root -g)

# 打包 skills 目录
cd $(npm root -g)
zip -r skills-backup.zip @anthropic-ai/
```

### 步骤2：离线电脑导入（Windows）

```powershell
# 方法1：使用 PowerShell 解压
Expand-Archive -Path "skills-backup.zip" -DestinationPath "C:\Users\$env:USERNAME\AppData\Roaming\npm\node_modules" -Force

# 方法2：使用 7-Zip（如果已安装）
7z x skills-backup.zip -o"C:\Users\$env:USERNAME\AppData\Roaming\npm\node_modules" -y

# 方法3：右键解压到指定目录
# 右键 skills-backup.zip → 解压到 → C:\Users\<用户名>\AppData\Roaming\npm\node_modules

# 验证
npx skills ls -g
```

### 步骤2：离线电脑导入（Mac/Linux）

```bash
# 解压到全局 node_modules
unzip skills-backup.zip -d $(npm root -g)

# 验证
npx skills ls -g
```

### 完整 Windows 导出脚本

创建 `export-skills.ps1`：

```powershell
# export-skills.ps1
# Skills 导出脚本（Windows）

$ErrorActionPreference = "Stop"

Write-Host "==========================================" -ForegroundColor Green
Write-Host "  Skills 导出脚本" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green
Write-Host ""

# 获取 npm 全局目录
$globalModules = npm root -g
Write-Host "[1/3] npm 全局目录: $globalModules" -ForegroundColor Yellow

# 进入目录
Set-Location $globalModules

# 检查 @anthropic-ai 目录
if (-not (Test-Path "@anthropic-ai")) {
    Write-Host "[错误] 未找到 @anthropic-ai 目录，请先安装 skills" -ForegroundColor Red
    exit 1
}

Write-Host "[2/3] 找到 Skills 目录，开始打包..." -ForegroundColor Yellow

# 打包
$outputFile = "skills-backup.zip"
Compress-Archive -Path "@anthropic-ai" -DestinationPath $outputFile -Force

# 获取文件大小
$fileInfo = Get-Item $outputFile
$sizeMB = [math]::Round($fileInfo.Length / 1MB, 2)

Write-Host "[3/3] 打包完成！" -ForegroundColor Green
Write-Host ""
Write-Host "文件: $outputFile" -ForegroundColor Cyan
Write-Host "大小: $sizeMB MB" -ForegroundColor Cyan
Write-Host "路径: $(Get-Location)\$outputFile" -ForegroundColor Cyan
Write-Host ""
Write-Host "==========================================" -ForegroundColor Green
Write-Host "  导出成功！请将文件分享给同事" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green
```

运行：
```powershell
.\export-skills.ps1
```

### 完整 Windows 导入脚本

创建 `import-skills.ps1`：

```powershell
# import-skills.ps1
# Skills 导入脚本（Windows）

$ErrorActionPreference = "Stop"

Write-Host "==========================================" -ForegroundColor Green
Write-Host "  Skills 导入脚本" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green
Write-Host ""

# 检查文件
$zipFile = Read-Host "请输入 skills-backup.zip 文件路径"

if (-not (Test-Path $zipFile)) {
    Write-Host "[错误] 文件不存在: $zipFile" -ForegroundColor Red
    exit 1
}

# 获取 npm 全局目录
$globalModules = npm root -g
Write-Host "[1/3] npm 全局目录: $globalModules" -ForegroundColor Yellow

Write-Host "[2/3] 解压文件..." -ForegroundColor Yellow

# 解压
Expand-Archive -Path $zipFile -DestinationPath $globalModules -Force

Write-Host "[3/3] 导入完成！" -ForegroundColor Green
Write-Host ""

# 验证
try {
    $skills = npx skills ls -g 2>&1
    Write-Host "已安装的 Skills:" -ForegroundColor Cyan
    Write-Host $skills -ForegroundColor White
} catch {
    Write-Host "验证失败，请手动运行: npx skills ls -g" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "==========================================" -ForegroundColor Green
Write-Host "  导入成功！" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green
```

运行：
```powershell
.\import-skills.ps1
```

---

## 团队共享配置

### 使用 Git 共享

将以下文件提交到 Git：

```
.claude/
├── SKILLS_CATALOG.md      # Skills 清单
├── TEAM_SKILLS_SETUP.md   # 本文件
├── install-skills.bat     # Windows 安装脚本
├── install-skills.sh      # Mac/Linux 安装脚本
└── .skillsrc              # Skills 配置文件（可选）
```

### 使用 Docker（高级）

创建团队统一的开发环境：

```dockerfile
FROM node:18-alpine

# 安装 skills
RUN npm install -g @anthropic-ai/skills-cli

# 安装团队 skills
RUN npx skills add obra/superpowers@brainstorming -g -y
RUN npx skills add refoundai/lenny-skills@writing-prds -g -y
# ... 其他 skills

WORKDIR /workspace
```

---

## 联系支持

如果以上方法都无法解决问题：

1. 查看官方文档：https://docs.anthropic.com/
2. 提交 Issue：https://github.com/obra/superpowers/issues
3. 联系团队技术负责人

---

## 更新日志

- **2026-03-02**: 初始版本，包含 15 个核心 Skills
