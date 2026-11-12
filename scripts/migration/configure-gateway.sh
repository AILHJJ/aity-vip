#!/usr/bin/env bash
set -euo pipefail
umask 077
stamp=${1:-}
[[ "$stamp" =~ ^[0-9]{8}T[0-9]{6}Z$ ]] || exit 2
backup="/root/aity-migration/$stamp"
stage="$backup/extracted"
test "$(id -u)" = 0
test -f "$stage/etc/nginx/ssl/aity88.online/aity88.online_bundle.crt"
test ! -f "$backup/Caddyfile.before-migration"
cp -a /etc/caddy/Caddyfile "$backup/Caddyfile.before-migration"
install -d -m 750 -o root -g caddy /etc/caddy/tls
install -m 640 -o root -g caddy "$stage/etc/nginx/ssl/aity88.online/aity88.online_bundle.crt" /etc/caddy/tls/aity88.online.crt
install -m 640 -o root -g caddy "$stage/etc/nginx/ssl/aity88.online/aity88.online.key" /etc/caddy/tls/aity88.online.key
test ! -d /root/.acme.sh
cp -a "$stage/root/.acme.sh" /root/.acme.sh
chmod 700 /root/.acme.sh
install -d -m 755 /var/www/html/.well-known/acme-challenge
find /srv/aity-h5 -type d -exec chmod 755 {} +
find /srv/aity-h5 -type f -exec chmod 644 {} +
cat > "$backup/Caddyfile.candidate" <<'CADDY'
{
    auto_https disable_certs
}

:80 {
    root * /usr/share/caddy
    file_server
}

http://aity88.online {
    handle /.well-known/acme-challenge/* {
        root * /var/www/html
        file_server
    }
    handle {
        redir https://aity88.online{uri} permanent
    }
}

https://aity88.online {
    tls /etc/caddy/tls/aity88.online.crt /etc/caddy/tls/aity88.online.key
    request_body {
        max_size 12MB
    }
    handle /ai-experience-api/* {
        reverse_proxy 127.0.0.1:3008 {
            flush_interval -1
        }
    }
    handle /api/* {
        reverse_proxy 127.0.0.1:3001
    }
    handle /uploads/* {
        reverse_proxy 127.0.0.1:3001
    }
    @health path /health /health/*
    handle @health {
        reverse_proxy 127.0.0.1:3001
    }
    @hidden path /.user.ini /.env /.git/*
    handle @hidden {
        respond 404
    }
    handle {
        root * /srv/aity-h5
        try_files {path} /index.html
        file_server
    }
}
CADDY
caddy fmt --overwrite "$backup/Caddyfile.candidate"
caddy validate --config "$backup/Caddyfile.candidate" --adapter caddyfile
install -m 644 "$backup/Caddyfile.candidate" /etc/caddy/Caddyfile
if ! systemctl reload caddy; then
    cp -a "$backup/Caddyfile.before-migration" /etc/caddy/Caddyfile
    systemctl reload caddy
    exit 1
fi
/root/.acme.sh/acme.sh --install-cert -d aity88.online --ecc \
    --key-file /etc/caddy/tls/aity88.online.key \
    --fullchain-file /etc/caddy/tls/aity88.online.crt \
    --reloadcmd 'chown root:caddy /etc/caddy/tls/aity88.online.key /etc/caddy/tls/aity88.online.crt && chmod 640 /etc/caddy/tls/aity88.online.key /etc/caddy/tls/aity88.online.crt && /usr/bin/caddy reload --config /etc/caddy/Caddyfile --adapter caddyfile'
cat > /etc/systemd/system/aity-cert-renew.service <<'SERVICE'
[Unit]
Description=Renew aity88.online certificate and reload Caddy
After=network-online.target caddy.service
Wants=network-online.target
[Service]
Type=oneshot
User=root
ExecStart=/root/.acme.sh/acme.sh --renew -d aity88.online --ecc --home /root/.acme.sh
SuccessExitStatus=2
SERVICE
cat > /etc/systemd/system/aity-cert-renew.timer <<'TIMER'
[Unit]
Description=Check aity88.online certificate renewal daily
[Timer]
OnCalendar=*-*-* 04:15:00 Asia/Shanghai
RandomizedDelaySec=1800
Persistent=true
[Install]
WantedBy=timers.target
TIMER
systemctl daemon-reload
systemctl enable --now aity-cert-renew.timer
curl -fsS --resolve aity88.online:443:127.0.0.1 https://aity88.online/api/health
curl -fsS --resolve aity88.online:443:127.0.0.1 https://aity88.online/ai-experience-api/health
echo TARGET_GATEWAY_READY
