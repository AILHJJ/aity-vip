# install-skills-success.ps1
# 能够执行成功的 Skills 安装脚本
# 适用于 Windows PowerShell 5.1+ 和 PowerShell 7+

# 设置错误处理
$ErrorActionPreference = "Continue"

# 清屏
Clear-Host

# 显示标题
Write-Host "┌──────────────────────────────────────────┐"
Write-Host "│       TDX-AI 团队 Skills 安装脚本       │"
Write-Host "│          快速安装必备开发技能包          │"
Write-Host "│               made by fuli              │"
Write-Host "└──────────────────────────────────────────┘"
Write-Host ""

# 检查 Node.js
Write-Host "1. 检查 Node.js 环境..."
try {
    $nodeVersion = node -v
    Write-Host "   ✓ Node.js 版本: $nodeVersion"
} catch {
    Write-Host "   ✗ 未检测到 Node.js，请先安装 Node.js 16+"
    Write-Host "   下载地址: https://nodejs.org/"
    Write-Host ""
    Read-Host "按 Enter 键退出"
    exit 1
}

# 检查 npm
Write-Host ""
Write-Host "2. 检查 npm 环境..."
try {
    $npmVersion = npm -v
    Write-Host "   ✓ npm 版本: $npmVersion"
} catch {
    Write-Host "   ✗ 未检测到 npm"
    Write-Host ""
    Read-Host "按 Enter 键退出"
    exit 1
}

# 配置 npm 镜像
Write-Host ""
Write-Host "3. 配置 npm 镜像（加速下载）..."
try {
    npm config set registry https://registry.npmmirror.com
    Write-Host "   ✓ 已配置淘宝镜像"
} catch {
    Write-Host "   ⚠ 配置镜像失败: $_"
}

# 清除缓存
Write-Host ""
Write-Host "4. 清除 npm 缓存..."
try {
    npm cache clean --force
    Write-Host "   ✓ 缓存已清理"
} catch {
    Write-Host "   ⚠ 清理缓存失败: $_"
}

Write-Host ""
Write-Host "=========================================="
Write-Host "5. 开始安装 Skills"
Write-Host "=========================================="
Write-Host ""

# 安装函数
function Install-Skill {
    param(
        [string]$SkillName,
        [string]$SkillPath
    )
    
    Write-Host "   安装 $SkillName..."
    Write-Host "     路径: $SkillPath"
    Write-Host "     状态: 正在连接..."
    
    try {
        # 设置超时时间（30秒）
        $timeout = 30
        $timer = [System.Diagnostics.Stopwatch]::StartNew()
        
        # 执行安装命令，实时显示输出
        $process = Start-Process -FilePath "npx" -ArgumentList "skills", "add", $SkillPath, "-g", "-y" -NoNewWindow -PassThru -RedirectStandardOutput "output.txt" -RedirectStandardError "error.txt"
        
        # 显示进度
        while (!$process.HasExited) {
            if ($timer.Elapsed.TotalSeconds -gt $timeout) {
                $process.Kill()
                Write-Host "     ✗ 安装超时（超过 $timeout 秒）"
                return $false
            }
            
            # 显示进度点
            Write-Host "." -NoNewline
            Start-Sleep -Milliseconds 500
        }
        
        $timer.Stop()
        Write-Host ""
        
        # 读取输出
        $stdout = Get-Content "output.txt" -ErrorAction SilentlyContinue
        $stderr = Get-Content "error.txt" -ErrorAction SilentlyContinue
        
        # 清理临时文件
        Remove-Item "output.txt" -ErrorAction SilentlyContinue
        Remove-Item "error.txt" -ErrorAction SilentlyContinue
        
        # 检查退出码
        if ($process.ExitCode -eq 0) {
            Write-Host "   ✓ $SkillName 安装成功（耗时: $($timer.Elapsed.TotalSeconds.ToString('0.00'))s）"
            return $true
        } else {
            Write-Host "   ✗ $SkillName 安装失败"
            if ($stderr) {
                Write-Host "     错误: $($stderr | Select-Object -First 2)"
            } else {
                Write-Host "     错误: 安装过程中出现问题"
            }
            return $false
        }
    } catch {
        Write-Host ""
        Write-Host "   ✗ $SkillName 安装失败: $_"
        return $false
    }
}

# 定义要安装的 Skills
$skills = @(
    @{ Name = "PRD 编写"; Path = "refoundai/lenny-skills@writing-prds" },
    @{ Name = "内容策略"; Path = "coreyhaines31/marketingskills@content-strategy" },
    @{ Name = "头脑风暴"; Path = "obra/superpowers@brainstorming" },
    @{ Name = "编写计划"; Path = "obra/superpowers@writing-plans" },
    @{ Name = "执行计划"; Path = "obra/superpowers@executing-plans" },
    @{ Name = "系统化调试"; Path = "obra/superpowers@systematic-debugging" },
    @{ Name = "测试驱动开发"; Path = "obra/superpowers@test-driven-development" },
    @{ Name = "React 最佳实践"; Path = "vercel-labs/agent-skills@react-best-practices" },
    @{ Name = "组合模式"; Path = "vercel-labs/agent-skills@composition-patterns" },
    @{ Name = "MarkItDown"; Path = "microsoft/markitdown-skill" },
    @{ Name = "数据分析"; Path = "jupyter/data-analysis-skill" },
    @{ Name = "浏览器自动化"; Path = "vercel-labs/agent-skills@dev-browser" },
    @{ Name = "深度研究"; Path = "obra/superpowers@research" }
)

# 安装计数
$successCount = 0
$failCount = 0
$failedSkills = @()

# 开始安装
foreach ($skill in $skills) {
    $result = Install-Skill -SkillName $skill.Name -SkillPath $skill.Path
    if ($result) {
        $successCount++
    } else {
        $failCount++
        $failedSkills += $skill.Name
    }
    Write-Host ""
}

Write-Host "=========================================="
Write-Host "6. 安装完成"
Write-Host "=========================================="
Write-Host ""
Write-Host "统计结果:"
Write-Host "   成功: $successCount"
Write-Host "   失败: $failCount"
Write-Host ""

# 显示失败的 Skills
if ($failedSkills.Count -gt 0) {
    Write-Host "失败的 Skills:"
    foreach ($skill in $failedSkills) {
        Write-Host "   - $skill"
    }
    Write-Host ""
}

# 验证安装
Write-Host "7. 检查已安装的 Skills..."
Write-Host ""
try {
    $installedSkills = & npx skills ls -g 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "已安装的 Skills:"
        Write-Host ""
        $installedSkills | ForEach-Object {
            if ($_ -match "^✓|^\s*[✓]") {
                Write-Host "   $_"
            }
        }
    } else {
        Write-Host "   ⚠ 验证失败: $($installedSkills -join ' ' | Select-Object -First 1)"
    }
} catch {
    Write-Host "   ⚠ 验证失败: $_"
}

Write-Host ""
if ($failCount -gt 0) {
    Write-Host "⚠ 部分 Skills 安装失败"
    Write-Host ""
    Write-Host "可能的原因:"
    Write-Host "   1. 网络连接问题"
    Write-Host "   2. Skill 名称或路径错误"
    Write-Host "   3. npm 权限问题（请以管理员身份运行）"
    Write-Host ""
    Write-Host "解决方法:"
    Write-Host "   1. 检查网络连接"
    Write-Host "   2. 手动执行失败的安装命令"
    Write-Host "   3. 查看详细错误: npx skills add <skill> -g"
    Write-Host ""
} else {
    Write-Host "✓ 所有 Skills 安装成功！"
    Write-Host ""
    Write-Host "现在你可以使用 Skills 了，例如:"
    Write-Host "   - 使用 brainstorming skill 探索需求"
    Write-Host "   - 使用 writing-prds skill 编写 PRD"
    Write-Host "   - 使用 content-strategy skill 规划内容策略"
    Write-Host ""
}

Write-Host "常用命令:"
Write-Host "   查看所有 Skills: npx skills ls -g"
Write-Host "   搜索 Skills: npx skills find <关键词>"
Write-Host "   更新 Skills: npx skills update"
Write-Host ""
Read-Host "按 Enter 键退出"
