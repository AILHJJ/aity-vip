param(
  [ValidateSet('status', 'verify')][string]$Action = 'status',
  [string]$Server = 'ubuntu@122.51.214.161',
  [string]$KeyPath = 'C:\Users\DELL\.ssh\aity_migration_ed25519',
  [string]$BackupStamp = '20261112T055254Z'
)
$ErrorActionPreference = 'Stop'
$sshExe = 'C:\Program Files\Git\usr\bin\ssh.exe'
$scpExe = 'C:\Program Files\Git\usr\bin\scp.exe'
if ($BackupStamp -notmatch '^\d{8}T\d{6}Z$') { throw '备份时间戳格式不正确' }
if (!(Test-Path -LiteralPath $KeyPath)) { throw '请指定有效的本机SSH密钥路径' }
if ($Action -eq 'verify') {
  & $scpExe -i $KeyPath -o BatchMode=yes -o ConnectTimeout=10 (Join-Path $PSScriptRoot 'migration/verify-target.cjs') "${Server}:/tmp/aity-verify-target.cjs"
  if ($LASTEXITCODE) { throw '验证脚本上传失败' }
  $remoteScript = "sudo node /tmp/aity-verify-target.cjs $BackupStamp"
} else {
  $remoteScript = @'
set -eu
echo '=== versions ==='
sudo readlink -f /root/aity-vip/current
sudo readlink -f /root/ai-expo/current
echo '=== processes ==='
sudo pm2 list
echo '=== local HTTPS ==='
curl -fsS --max-time 10 --resolve aity88.online:443:127.0.0.1 https://aity88.online/api/health
echo
curl -fsS --max-time 10 --resolve aity88.online:443:127.0.0.1 https://aity88.online/ai-experience-api/health
echo
echo '=== renewal ==='
sudo systemctl list-timers aity-cert-renew.timer --no-pager
echo '=== Hermes ==='
systemctl --user is-active hermes-gateway.service
echo '=== storage ==='
df -h /
free -h
'@
}
$encoded = [Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes($remoteScript.Replace("`r", '')))
& $sshExe -n -T -i $KeyPath -o BatchMode=yes -o IdentitiesOnly=yes -o ConnectTimeout=10 $Server "printf '%s' '$encoded' | base64 -d | bash"
if ($LASTEXITCODE) { throw '服务器检查失败，请查看输出；未自动执行线上切换' }
if ($Action -eq 'status') {
  & curl.exe -fsS --connect-timeout 5 --max-time 10 --resolve aity88.online:443:122.51.214.161 https://aity88.online/api/health
  if ($LASTEXITCODE) { throw '新机本地服务检查已完成，但公网HTTPS尚不可达；禁止切换DNS' }
}
