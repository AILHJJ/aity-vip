# install-skills.ps1
# Skills 安装脚本（PowerShell 版本）
# 适用于 Windows PowerShell 5.1+ 和 PowerShell 7+

$ErrorActionPreference = "Stop"

Write-Host "==========================================" -ForegroundColor Green
Write-Host "  AITY VIP 团队 Skills 安装脚本" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green
Write-Host ""

# 检查 Node.js
Write-Host "[检查] Node.js 环境..." -ForegroundColor Yellow
try {
    $nodeVersion = node -v
    Write-Host "  ✓ Node.js 版本: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "  ✗ 未检测到 Node.js，请先安装 Node.js 16+" -ForegroundColor Red
    Write-Host "  下载地址: https://nodejs.org/" -ForegroundColor Yellow
    Write-Host ""
    Read-Host "按 Enter 键退出"
    exit 1
}

# 检查 npm
Write-Host ""
Write-Host "[检查] npm 环境..." -ForegroundColor Yellow
try {
    $npmVersion = npm -v
    Write-Host "  ✓ npm 版本: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "  ✗ 未检测到 npm" -ForegroundColor Red
    Write-Host ""
    Read-Host "按 Enter 键退出"
    exit 1
}

# 配置 npm 镜像
Write-Host ""
Write-Host "[配置] 设置 npm 镜像（加速下载）..." -ForegroundColor Yellow
try {
    npm config set registry https://registry.npmmirror.com
    Write-Host "  ✓ 已配置淘宝镜像" -ForegroundColor Green
} catch {
    Write-Host "  ⚠ 配置镜像失败: $_" -ForegroundColor Yellow
}

# 清除缓存
Write-Host ""
Write-Host "[清理] 清除 npm 缓存..." -ForegroundColor Yellow
try {
    npm cache clean --force
    Write-Host "  ✓ 缓存已清理" -ForegroundColor Green
} catch {
    Write-Host "  ⚠ 清理缓存失败: $_" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "==========================================" -ForegroundColor Green
Write-Host "  开始安装 Skills" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green
Write-Host ""

# 统计变量
$successCount = 0
$failCount = 0
$failedSkills = @()

# 安装函数
function Install-Skill {
    param(
        [string]$SkillName,
        [string]$SkillPath
    )
    
    Write-Host ""
    Write-Host "[安装] $SkillName..." -ForegroundColor Cyan
    
    try {
        $output = & npx skills add $SkillPath -g -y 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host "  ✓ 安装成功" -ForegroundColor Green
            $global:successCount++
        } else {
            Write-Host "  ✗ 安装失败" -ForegroundColor Red
            $global:failCount++
            $global:failedSkills += "$SkillName ($SkillPath)"
            Write-Host "  错误: $($output -join ' ')" -ForegroundColor DarkRed
        }
    } catch {
        Write-Host "  ✗ 安装失败: $_" -ForegroundColor Red
        $global:failCount++
        $global:failedSkills += "$SkillName ($SkillPath)"
    }
}

# 产品经理必备
Install-Skill "PRD 编写" "refoundai/lenny-skills@writing-prds"
Install-Skill "内容策略" "coreyhaines31/marketingskills@content-strategy"

# 研发自动化
Install-Skill "头脑风暴" "obra/superpowers@brainstorming"
Install-Skill "编写计划" "obra/superpowers@writing-plans"
Install-Skill "执行计划" "obra/superpowers@executing-plans"
Install-Skill "系统化调试" "obra/superpowers@systematic-debugging"
Install-Skill "测试驱动开发" "obra/superpowers@test-driven-development"

# 前端开发
Install-Skill "React 最佳实践" "vercel-labs/agent-skills@react-best-practices"
Install-Skill "组合模式" "vercel-labs/agent-skills@composition-patterns"

# 文档处理
Install-Skill "MarkItDown" "microsoft/markitdown-skill"

# 数据分析
Install-Skill "数据分析" "jupyter/data-analysis-skill"

# 浏览器自动化
Install-Skill "浏览器自动化" "vercel-labs/agent-skills@dev-browser"

# 研究工具
Install-Skill "深度研究" "obra/superpowers@research"

Write-Host ""
Write-Host "==========================================" -ForegroundColor Green
Write-Host "  安装完成" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green
Write-Host ""
Write-Host "统计结果:" -ForegroundColor Cyan
Write-Host "  成功: $successCount" -ForegroundColor Green
Write-Host "  失败: $failCount" -ForegroundColor Red
Write-Host ""

# 显示失败的 Skills
if ($failedSkills.Count -gt 0) {
    Write-Host "失败的 Skills:" -ForegroundColor Yellow
    foreach ($skill in $failedSkills) {
        Write-Host "  - $skill" -ForegroundColor White
    }
    Write-Host ""
}

# 验证安装
Write-Host "[验证] 检查已安装的 Skills..." -ForegroundColor Yellow
Write-Host ""
try {
    $skills = & npx skills ls -g 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "已安装的 Skills:" -ForegroundColor Cyan
        Write-Host ""
        $skills | ForEach-Object {
            if ($_ -match "^✓|^\s*[✓]") {
                Write-Host "  $_" -ForegroundColor Green
            } elseif ($_ -match "^✗|^\s*[✗]") {
                Write-Host "  $_" -ForegroundColor Red
            } else {
                Write-Host "  $_" -ForegroundColor White
            }
        }
    } else {
        Write-Host "  ⚠ 验证失败: $($skills -join ' ')" -ForegroundColor Yellow
    }
} catch {
    Write-Host "  ⚠ 验证失败: $_" -ForegroundColor Yellow
}

Write-Host ""
if ($failCount -gt 0) {
    Write-Host "[警告] 部分 Skills 安装失败" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "可能的原因:" -ForegroundColor Cyan
    Write-Host "  1. 网络连接问题" -ForegroundColor White
    Write-Host "  2. Skill 名称或路径错误" -ForegroundColor White
    Write-Host "  3. npm 权限问题（请以管理员身份运行）" -ForegroundColor White
    Write-Host ""
    Write-Host "解决方法:" -ForegroundColor Cyan
    Write-Host "  1. 检查网络连接" -ForegroundColor White
    Write-Host "  2. 手动执行失败的安装命令" -ForegroundColor White
    Write-Host "  3. 查看详细错误: npx skills add <skill> -g" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host "[成功] 所有 Skills 安装成功！" -ForegroundColor Green
    Write-Host ""
    Write-Host "现在你可以使用 Skills 了，例如:" -ForegroundColor Cyan
    Write-Host "  - 使用 brainstorming skill 探索需求" -ForegroundColor White
    Write-Host "  - 使用 writing-prds skill 编写 PRD" -ForegroundColor White
    Write-Host "  - 使用 content-strategy skill 规划内容策略" -ForegroundColor White
    Write-Host ""
}

Write-Host "常用命令:" -ForegroundColor Cyan
Write-Host "  查看所有 Skills: npx skills ls -g" -ForegroundColor White
Write-Host "  搜索 Skills: npx skills find <关键词>" -ForegroundColor White
Write-Host "  更新 Skills: npx skills update" -ForegroundColor White
Write-Host ""
Read-Host "按 Enter 键退出"
