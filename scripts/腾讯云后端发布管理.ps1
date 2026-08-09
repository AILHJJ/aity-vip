param(
  [ValidateSet('status', 'prepare', 'switch', 'rollback')]
  [string]$Action = 'status',
  [string]$Version = (git rev-parse --short HEAD),
  [string]$Server = 'root@124.221.119.134',
  [string]$KeyPath = 'D:\your-mcp-proxy\99-个人探索\AITY_VIP\_运维配置_敏感\AITY0127.pem',
  [string]$SshExe = 'C:\Program Files\Git\usr\bin\ssh.exe'
)

$remoteScript = @'
set -euo pipefail

ACTION="$1"
VERSION="${2:-}"
APP_ROOT="/root/aity-vip"
RELEASES="$APP_ROOT/releases"
SHARED="$APP_ROOT/shared"
CURRENT="$APP_ROOT/current"
APP_NAME="aity-backend"

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
  mkdir -p "$RELEASES" "$SHARED/logs" "$SHARED/uploads"

  if [ -d "$APP_ROOT/backend/uploads" ]; then
    cp -a "$APP_ROOT/backend/uploads/." "$SHARED/uploads/"
  fi

  if [ ! -f "$SHARED/backend.env" ] && [ -f "$APP_ROOT/backend/.env" ]; then
    cp "$APP_ROOT/backend/.env" "$SHARED/backend.env"
  fi

  rm -rf "$release"
  mkdir -p "$release"
  tar xzf "$package" -C "$release"

  ln -sfn "$SHARED/backend.env" "$release/backend/.env"
  ln -sfn "$SHARED/backend.env" "$release/backend/.env.production"
  rm -rf "$release/backend/logs" "$release/backend/uploads"
  ln -sfn "$SHARED/logs" "$release/backend/logs"
  ln -sfn "$SHARED/uploads" "$release/backend/uploads"

  cd "$release/backend"
  npm ci --omit=dev
  node --check src/index.js
  node --check src/controllers/messageController.js
  node --check src/controllers/authController.js

  echo "release prepared: $release"
}

switch_release() {
  test -n "$VERSION"
  local release="$RELEASES/$VERSION"
  test -d "$release/backend"

  ln -sfn "$release" "$CURRENT"
  pm2 delete "$APP_NAME" || true
  cd "$CURRENT/backend"
  NODE_ENV=production PORT=3001 pm2 start src/index.js --name "$APP_NAME" --cwd "$CURRENT/backend" -i 1 --time
  pm2 save
  show_status
}

rollback_release() {
  local target="$VERSION"
  if [ -z "$target" ]; then
    local current_path
    current_path="$(readlink -f "$CURRENT" 2>/dev/null || true)"
    target="$(ls -1dt "$RELEASES"/* 2>/dev/null | grep -v "^$current_path$" | head -1 || true)"
  else
    target="$RELEASES/$target"
  fi

  test -n "$target"
  test -d "$target/backend"

  ln -sfn "$target" "$CURRENT"
  pm2 delete "$APP_NAME" || true
  cd "$CURRENT/backend"
  NODE_ENV=production PORT=3001 pm2 start src/index.js --name "$APP_NAME" --cwd "$CURRENT/backend" -i 1 --time
  pm2 save
  show_status
}

case "$ACTION" in
  status) show_status ;;
  prepare) prepare_release ;;
  switch) switch_release ;;
  rollback) rollback_release ;;
esac
'@

$scriptBase64 = [Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes($remoteScript))
$remoteCommand = "printf '%s' '$scriptBase64' | base64 -d > /tmp/aity-backend-release-manager.sh && bash /tmp/aity-backend-release-manager.sh '$Action' '$Version'"

& $SshExe -i $KeyPath -o StrictHostKeyChecking=no $Server $remoteCommand
