param(
  [switch]$Dev
)

$ErrorActionPreference = 'Stop'
$repoRoot = Split-Path $PSScriptRoot -Parent
$miniappRoot = Join-Path $repoRoot 'aity-uni-app-v2'

Push-Location $miniappRoot
try {
  if ($Dev) {
    npm run dev:mp-weixin
  } else {
    npm run build:mp-weixin
    Write-Host "微信小程序构建产物: $miniappRoot\dist\build\mp-weixin"
  }
}
finally {
  Pop-Location
}
