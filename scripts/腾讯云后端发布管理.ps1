param(
  [ValidateSet('status', 'prepare', 'switch', 'rollback')]
  [string]$Action = 'status',
  [string]$Version = '',
  [string]$Server = 'ubuntu@122.51.214.161',
  [string]$KeyPath = 'C:\Users\DELL\.ssh\aity_migration_ed25519',
  [string]$SshExe = 'C:\Program Files\Git\usr\bin\ssh.exe'
)

$ErrorActionPreference = 'Stop'
if ($Action -in @('prepare','switch') -and -not $Version) { $Version = git rev-parse --short HEAD }
if ($Version -and $Version -notmatch '^[a-f0-9]{7,40}$') { throw '发布版本必须是 Git 提交号' }
$remoteScript = @'
set -euo pipefail

ACTION="$1"
VERSION="${2:-}"
APP_ROOT="/root/aity-vip"
RELEASES="$APP_ROOT/releases"
SHARED="$APP_ROOT/shared"
CURRENT="$APP_ROOT/current"
APP_NAME="aity-backend"
if [ -n "$VERSION" ]; then [[ "$VERSION" =~ ^[a-f0-9]{7,40}$ ]]; fi
test "$(id -u)" = 0
test "$(hostname)" = VM-0-4-ubuntu
exec 9>"$APP_ROOT/shared/release.lock"
flock -n 9 || { echo '已有发布任务运行'; exit 1; }

show_status() {
  echo "=== current ==="
  readlink -f "$CURRENT" 2>/dev/null || true
  echo "=== pm2 ==="
  pm2 show "$APP_NAME" | grep -E "status|script path|exec cwd|node env|restarts|uptime" || true
  echo "=== health ==="
  curl -fsS http://127.0.0.1:3001/api/health || true
  echo
}

prepare_release() {
  test -n "$VERSION"
  local package="/tmp/aity-backend-$VERSION.tar.gz"
  local release="$RELEASES/$VERSION"

  test -f "$package"
  test -f "/tmp/aity-backend-$VERSION.sha256"
  (cd /tmp && sha256sum -c "aity-backend-$VERSION.sha256")
  test "$(readlink -f "$CURRENT")" != "$release"
  if [ -e "$release" ]; then echo '目标版本目录已存在，请核验后复用或使用新提交号'; exit 1; fi
  mkdir -p "$RELEASES" "$SHARED/logs" "$SHARED/uploads"

  if [ -d "$APP_ROOT/backend/uploads" ]; then
    cp -a "$APP_ROOT/backend/uploads/." "$SHARED/uploads/"
  fi

  if [ ! -f "$SHARED/backend.env" ] && [ -f "$APP_ROOT/backend/.env" ]; then
    cp "$APP_ROOT/backend/.env" "$SHARED/backend.env"
  fi

  mkdir -p "$release"
  tar xzf "$package" -C "$release"

  ln -sfn "$SHARED/backend.env" "$release/backend/.env"
  ln -sfn "$SHARED/backend.env" "$release/backend/.env.production"
  rm -rf "$release/backend/logs" "$release/backend/uploads"
  ln -sfn "$SHARED/logs" "$release/backend/logs"
  ln -sfn "$SHARED/uploads" "$release/backend/uploads"

  cd "$release/backend"
  npm ci --omit=dev --omit=optional --no-audit --no-fund
  node --check src/index.js
  node --check src/controllers/messageController.js
  node --check src/controllers/authController.js
  touch "$release/.prepared"

  echo "release prepared: $release"
}

switch_release() {
  test -n "$VERSION"
  local release="$RELEASES/$VERSION"
  test -d "$release/backend"
  test -f "$release/.prepared"
  activate_release "$release"
}

start_backend() {
  pm2 delete "$APP_NAME" >/dev/null 2>&1 || true
  NODE_ENV=production PORT=3001 pm2 start "$CURRENT/backend/src/index.js" --name "$APP_NAME" --cwd "$CURRENT/backend" -i 1 --time
}

wait_health() {
  for attempt in $(seq 1 30); do
    if curl -fsS --max-time 2 http://127.0.0.1:3001/api/health >/dev/null; then return 0; fi
    sleep 1
  done
  return 1
}

activate_release() {
  local target="$1" previous
  previous="$(readlink -f "$CURRENT")"
  test "$target" != "$previous"
  ln -sfn "$target" "$APP_ROOT/current.next"
  mv -Tf "$APP_ROOT/current.next" "$CURRENT"
  if ! start_backend || ! wait_health; then
    ln -sfn "$previous" "$APP_ROOT/current.next"
    mv -Tf "$APP_ROOT/current.next" "$CURRENT"
    start_backend
    wait_health || { echo '恢复旧代码后的健康检查失败，需立即排查'; exit 1; }
    pm2 save
    echo '新版本健康检查失败，已恢复原代码；未回滚数据库'
    exit 1
  fi
  printf '%s\n' "$previous" > "$SHARED/previous-release"
  pm2 save
  show_status
}

rollback_release() {
  local target="$VERSION"
  if [ -z "$target" ]; then
    local current_path
    current_path="$(readlink -f "$CURRENT" 2>/dev/null || true)"
    target="$(cat "$SHARED/previous-release" 2>/dev/null || true)"
  else
    target="$RELEASES/$target"
  fi

  test -n "$target"
  test -d "$target/backend"

  [[ "$target" =~ ^/root/aity-vip/releases/[a-f0-9]{7,40}$ ]]
  activate_release "$target"
}

case "$ACTION" in
  status) show_status ;;
  prepare) prepare_release ;;
  switch) switch_release ;;
  rollback) rollback_release ;;
esac
'@

$scriptBase64 = [Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes($remoteScript.Replace("`r", '')))
$runAs = if ($Server -like 'root@*') { 'bash' } else { 'sudo -n bash' }
$remoteCommand = "printf '%s' '$scriptBase64' | base64 -d | $runAs -s -- '$Action' '$Version'"

$tempKeyPath = Join-Path $env:TEMP "aity-vip-deploy-$PID.pem"
try {
  Copy-Item -LiteralPath $KeyPath -Destination $tempKeyPath -Force
  & $SshExe -n -T -i $tempKeyPath -o BatchMode=yes -o IdentitiesOnly=yes -o ConnectTimeout=10 $Server $remoteCommand
  if ($LASTEXITCODE) { throw '服务器发布操作失败，请查看输出' }
}
finally {
  Remove-Item -LiteralPath $tempKeyPath -Force -ErrorAction SilentlyContinue
}
