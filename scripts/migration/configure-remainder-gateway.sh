#!/usr/bin/env bash
set -euo pipefail
umask 077
backup=/root/aity-migration/remainder-20261112
test -s /etc/caddy/tls/ha.aity88.online.crt
test -s /etc/caddy/tls/extra.aity88.online.crt
test ! -f "$backup/Caddyfile.before-remainder"
cp -a /etc/caddy/Caddyfile "$backup/Caddyfile.before-remainder"
cp -a /etc/caddy/Caddyfile "$backup/Caddyfile.candidate"
cat >> "$backup/Caddyfile.candidate" <<'CADDY'

http://www.aity88.online, http://ha.aity88.online, http://openclaw.aity88.online {
    handle /.well-known/acme-challenge/* {
        root * /var/www/html
        file_server
    }
    handle {
        redir https://{host}{uri} permanent
    }
}

https://www.aity88.online {
    tls /etc/caddy/tls/extra.aity88.online.crt /etc/caddy/tls/extra.aity88.online.key
    redir https://aity88.online{uri} permanent
}

https://ha.aity88.online {
    tls /etc/caddy/tls/ha.aity88.online.crt /etc/caddy/tls/ha.aity88.online.key
    reverse_proxy 127.0.0.1:8123
}

https://openclaw.aity88.online {
    tls /etc/caddy/tls/extra.aity88.online.crt /etc/caddy/tls/extra.aity88.online.key
    reverse_proxy 127.0.0.1:18789
}
CADDY
caddy fmt --overwrite "$backup/Caddyfile.candidate"
caddy validate --config "$backup/Caddyfile.candidate" --adapter caddyfile
install -m 644 "$backup/Caddyfile.candidate" /etc/caddy/Caddyfile
if ! systemctl reload caddy; then
    cp -a "$backup/Caddyfile.before-remainder" /etc/caddy/Caddyfile
    systemctl reload caddy
    exit 1
fi
curl -fsS --max-time 10 --resolve aity88.online:443:127.0.0.1 https://aity88.online/api/health
curl -fsS --max-time 10 --resolve ha.aity88.online:443:127.0.0.1 https://ha.aity88.online/ -o /dev/null
echo REMAINDER_GATEWAY_READY
