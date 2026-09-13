param(
  [string]$Server = 'root@124.221.119.134',
  [string]$KeyPath = 'D:\your-mcp-proxy\99-个人探索\AITY_VIP\_运维配置_敏感\AITY0127.pem',
  [string]$SshExe = 'C:\Program Files\Git\usr\bin\ssh.exe'
)

$ErrorActionPreference = 'Stop'

# 检查线上 SSL 证书状态与自动续期健康度
# 用法: .\scripts\检查SSL证书状态.ps1
# 详见 docs/01-部署指南/SSL证书与自动续期说明.md

$remoteScript = @'
set -euo pipefail

echo "=== 1.线上证书(nginx实际加载) ==="
echo | openssl s_client -servername aity88.online -connect 127.0.0.1:443 2>/dev/null | openssl x509 -noout -subject -issuer -dates

echo
echo "=== 2.证书剩余天数 ==="
END_DATE=$(echo | openssl s_client -servername aity88.online -connect 127.0.0.1:443 2>/dev/null | openssl x509 -noout -enddate | cut -d= -f2)
END_TS=$(date -d "$END_DATE" +%s)
NOW_TS=$(date +%s)
DAYS=$(( (END_TS - NOW_TS) / 86400 ))
echo "剩余: ${DAYS} 天"
if [ "$DAYS" -lt 15 ]; then
  echo "⚠️ 警告: 证书剩余不足15天！acme.sh 应在60天时自动续期，请检查续期任务:"
  echo "   查看 /root/.acme.sh/acme.sh.log 尾部是否有 Skipping/错误"
  echo "   手动测试: /root/.acme.sh/acme.sh --cron --home /root/.acme.sh"
else
  echo "✅ 状态正常"
fi

echo
echo "=== 3.acme.sh 自动续期任务 ==="
crontab -l 2>/dev/null | grep acme || echo "⚠️ 未找到 acme.sh 的 crontab 定时任务！"

echo
echo "=== 4.最近一次续期日志 ==="
tail -5 /root/.acme.sh/acme.sh.log

echo
echo "=== 5.acme.sh 证书签发配置(应为正式环境而非staging) ==="
grep -E "Le_API|Le_Webroot" /root/.acme.sh/aity88.online_ecc/aity88.online.conf 2>/dev/null || echo "⚠️ 无 aity88.online 证书配置"

echo
echo "=== 6.证书部署路径与nginx引用一致性 ==="
grep ssl_certificate /www/server/panel/vhost/nginx/aity88.online.conf
ls -la /etc/nginx/ssl/aity88.online/aity88.online_bundle.crt /etc/nginx/ssl/aity88.online/aity88.online.key

echo
echo "=== 7.业务可用性 ==="
echo -n "首页: "; curl -s -o /dev/null -w '%{http_code}\n' -k https://127.0.0.1/ --max-time 5
echo -n "API: "; curl -s -o /dev/null -w '%{http_code}\n' -k https://127.0.0.1/api/health --max-time 5
'@

$remoteScript = $remoteScript -replace "`r`n", "`n"
$scriptBase64 = [Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes($remoteScript))
$remoteCommand = "printf '%s' '$scriptBase64' | base64 -d > /tmp/aity-ssl-check.sh && bash /tmp/aity-ssl-check.sh"

& $SshExe -i $KeyPath -o StrictHostKeyChecking=no $Server $remoteCommand
