param(
  [string]$Server = 'ubuntu@122.51.214.161',
  [string]$KeyPath = 'C:\Users\DELL\.ssh\aity_migration_ed25519',
  [string]$SshExe = 'C:\Program Files\Git\usr\bin\ssh.exe'
)
$ErrorActionPreference = 'Stop'
$remoteScript = @'
set -euo pipefail
for domain in aity88.online www.aity88.online ha.aity88.online openclaw.aity88.online claw.aity88.online; do
  echo "=== $domain ==="
  echo | openssl s_client -servername "$domain" -connect 127.0.0.1:443 2>/dev/null |
    openssl x509 -noout -subject -issuer -dates -checkend 1296000
done
echo '=== renewal service ==='
systemctl show aity-cert-renew.service -p Result -p ExecMainStatus
systemctl is-enabled aity-cert-renew.timer
systemctl list-timers aity-cert-renew.timer --no-pager
echo '=== Caddy ==='
caddy validate --config /etc/caddy/Caddyfile --adapter caddyfile
echo '=== API ==='
curl -fsS --max-time 10 --resolve aity88.online:443:127.0.0.1 https://aity88.online/api/health
'@
$encoded = [Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes($remoteScript.Replace("`r", '')))
& $SshExe -n -T -i $KeyPath -o BatchMode=yes -o IdentitiesOnly=yes -o ConnectTimeout=10 $Server "printf '%s' '$encoded' | base64 -d | sudo -n bash"
if ($LASTEXITCODE) { throw '证书或自动续期检查失败，请查看输出' }
