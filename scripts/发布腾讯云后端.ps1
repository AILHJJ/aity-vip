param(
  [string]$Version = (git rev-parse --short HEAD),
  [string]$Server = 'root@124.221.119.134',
  [string]$KeyPath = 'D:\your-mcp-proxy\99-个人探索\AITY_VIP\_运维配置_敏感\AITY0127.pem',
  [string]$ScpExe = 'C:\Program Files\Git\usr\bin\scp.exe'
)

$repoRoot = Split-Path $PSScriptRoot -Parent
$artifactDir = Join-Path $repoRoot "deploy/releases/$Version"
$artifact = Join-Path $artifactDir "aity-backend-$Version.tar.gz"
$shaFile = Join-Path $artifactDir 'sha256.txt'
$tempKeyPath = Join-Path $env:TEMP "aity-vip-deploy-$PID.pem"

New-Item -ItemType Directory -Force -Path $artifactDir | Out-Null

Push-Location $repoRoot
try {
  git archive --format=tar.gz -o "$artifact" HEAD backend
  $hash = Get-FileHash -Algorithm SHA256 -Path $artifact
  Set-Content -LiteralPath $shaFile -Value ("{0}  {1}" -f $hash.Hash, (Split-Path $artifact -Leaf))
  Copy-Item -LiteralPath $KeyPath -Destination $tempKeyPath -Force
  & $ScpExe -i $tempKeyPath -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null $artifact "${Server}:/tmp/"
  Write-Host "发布包已生成: $artifact"
  Write-Host "SHA256: $($hash.Hash)"
  Write-Host "已上传到服务器 /tmp/"
}
finally {
  Remove-Item -LiteralPath $tempKeyPath -Force -ErrorAction SilentlyContinue
  Pop-Location
}
