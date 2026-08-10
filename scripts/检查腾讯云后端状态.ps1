param(
  [string]$Server = 'root@124.221.119.134',
  [string]$KeyPath = 'D:\your-mcp-proxy\99-个人探索\AITY_VIP\_运维配置_敏感\AITY0127.pem',
  [string]$SshExe = 'C:\Program Files\Git\usr\bin\ssh.exe'
)

$ErrorActionPreference = 'Stop'

$remoteScript = @'
set -euo pipefail

echo "=== current ==="
readlink -f /root/aity-vip/current

echo "=== pm2 ==="
pm2 show aity-backend | grep -E "status|script path|exec cwd|node env|restarts|uptime" || true

echo "=== health ==="
curl -fsS http://127.0.0.1:3001/api/health
echo

echo "=== mail config ==="
grep -En "^(MAIL_DRY_RUN|MAIL_NOTIFY_COOLDOWN_MINUTES|BUSINESS_TIMEZONE_OFFSET_MINUTES)=" /root/aity-vip/shared/backend.env || true

echo "=== notification status ==="
cd /root/aity-vip/current/backend
node -e "require('dotenv').config(); const {getEmailNotificationStatus}=require('./src/services/notificationOutboxService'); getEmailNotificationStatus().then(s=>{console.log(JSON.stringify({lastSentAt:s.lastSentAt,nextAvailableAt:s.nextAvailableAt,remainingSeconds:s.remainingSeconds,inCooldown:s.inCooldown,lastStatus:s.lastStatus})); process.exit(0)}).catch(e=>{console.error(e.stack||e.message); process.exit(1)})"
'@

$scriptBase64 = [Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes($remoteScript))
$remoteCommand = "printf '%s' '$scriptBase64' | base64 -d > /tmp/aity-backend-status-check.sh && bash /tmp/aity-backend-status-check.sh"

& $SshExe -i $KeyPath -o StrictHostKeyChecking=no $Server $remoteCommand
