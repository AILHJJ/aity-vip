param(
  [string]$Version = (git rev-parse --short HEAD),
  [switch]$Switch,
  [switch]$Rollback,
  [string]$RollbackVersion = '',
  [switch]$SkipTests,
  [switch]$AllowDirty,
  [switch]$RequireClean
)

$ErrorActionPreference = 'Stop'
$repoRoot = Split-Path $PSScriptRoot -Parent

function Invoke-Step {
  param(
    [string]$Name,
    [scriptblock]$Script
  )
  Write-Host "=== $Name ==="
  & $Script
}

Push-Location $repoRoot
try {
  if ($Rollback) {
    Invoke-Step "回滚腾讯云后端" {
      if ($RollbackVersion) {
        & "$PSScriptRoot\腾讯云后端发布管理.ps1" -Action rollback -Version $RollbackVersion
      } else {
        & "$PSScriptRoot\腾讯云后端发布管理.ps1" -Action rollback
      }
    }
    exit 0
  }

  Invoke-Step "确认 Git 状态" {
    $dirty = git status --short
    if ($dirty) {
      Write-Host $dirty
      if ($RequireClean) {
        throw "工作区存在未提交内容。请先清理后再发布，或不要使用 -RequireClean。"
      }
      if (-not $AllowDirty) {
        Write-Host "提示：当前工作区存在未提交内容，但发布包使用 HEAD 生成，不会打入未提交改动。"
      }
    }
  }

  if (-not $SkipTests) {
    Invoke-Step "后端单元测试" {
      node backend\tests\accountAndMessageQuery.unit.cjs
    }
    Invoke-Step "后端语法检查" {
      node --check backend/src/index.js
      node --check backend/src/controllers/messageController.js
      node --check backend/src/controllers/authController.js
      node --check backend/src/services/notificationOutboxService.js
    }
  }

  Invoke-Step "生成并上传发布包 $Version" {
    & "$PSScriptRoot\发布腾讯云后端.ps1" -Version $Version
  }

  Invoke-Step "服务器 prepare $Version" {
    & "$PSScriptRoot\腾讯云后端发布管理.ps1" -Action prepare -Version $Version
  }

  if ($Switch) {
    Invoke-Step "服务器 switch $Version" {
      & "$PSScriptRoot\腾讯云后端发布管理.ps1" -Action switch -Version $Version
    }
    Invoke-Step "业务状态校验" {
      & "$PSScriptRoot\检查腾讯云后端状态.ps1"
    }
  } else {
    Write-Host "已完成 prepare，尚未切换线上。确认后执行："
    Write-Host ".\scripts\腾讯云后端发布管理.ps1 -Action switch -Version $Version"
  }
}
finally {
  Pop-Location
}
