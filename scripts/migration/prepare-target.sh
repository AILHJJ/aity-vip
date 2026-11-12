#!/usr/bin/env bash
set -euo pipefail
test "$(id -u)" = 0
command -v mysql >/dev/null
command -v node >/dev/null
command -v pm2 >/dev/null
install -d -m 700 /root/aity-migration
cat > /etc/mysql/mysql.conf.d/aity-migration.cnf <<'MYSQL'
[mysqld]
bind-address = 127.0.0.1
mysqlx-bind-address = 127.0.0.1
innodb_buffer_pool_size = 512M
max_connections = 60
default-time-zone = '+08:00'
sql-mode = 'STRICT_TRANS_TABLES,NO_ENGINE_SUBSTITUTION'
MYSQL
mysqld --validate-config
systemctl restart mysql
mysql -N -e 'SELECT VERSION(), @@time_zone, @@sql_mode;'
echo TARGET_PREPARED
