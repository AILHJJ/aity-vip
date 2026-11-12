param(
  [string]$Version = (git rev-parse --short HEAD),
  [string]$Server = 'ubuntu@122.51.214.161',
  [string]$KeyPath = 'C:\Users\DELL\.ssh\aity_migration_ed25519',
  [string]$ScpExe = 'C:\Program Files\Git\usr\bin\scp.exe'
)

$ErrorActionPreference = 'Stop'
if ($Version -notmatch '^[a-f0-9]{7,40}$') { throw '发布版本必须是 Git 提交号' }
$repoRoot = Split-Path $PSScriptRoot -Parent
$artifactDir = Join-Path $repoRoot "deploy/releases/$Version"
$artifact = Join-Path $artifactDir "aity-backend-$Version.tar.gz"
$shaFile = Join-Path $artifactDir 'sha256.txt'
$tempKeyPath = Join-Path $env:TEMP "aity-vip-deploy-$PID.pem"

New-Item -ItemType Directory -Force -Path $artifactDir | Out-Null

Push-Location $repoRoot
try {
  git archive --format=tar.gz -o "$artifact" HEAD backend
  if ($LASTEXITCODE) { throw '发布包生成失败' }
  $hash = Get-FileHash -Algorithm SHA256 -Path $artifact
  Set-Content -LiteralPath $shaFile -Value ("{0}  {1}" -f $hash.Hash, (Split-Path $artifact -Leaf))
  Copy-Item -LiteralPath $KeyPath -Destination $tempKeyPath -Force
  & $ScpExe -i $tempKeyPath -o BatchMode=yes -o ConnectTimeout=10 $artifact "${Server}:/tmp/"
  if ($LASTEXITCODE) { throw '发布包上传失败' }
  & $ScpExe -i $tempKeyPath -o BatchMode=yes -o ConnectTimeout=10 $shaFile "${Server}:/tmp/aity-backend-$Version.sha256"
  if ($LASTEXITCODE) { throw '发布包校验文件上传失败' }
  Write-Host "发布包已生成: $artifact"
  Write-Host "SHA256: $($hash.Hash)"
  Write-Host "已上传到服务器 /tmp/"
}
finally {
  Remove-Item -LiteralPath $tempKeyPath -Force -ErrorAction SilentlyContinue
  Pop-Location
}
