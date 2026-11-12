#!/usr/bin/env python3
"""Capture the new host's final database/configuration recovery material privately."""
import datetime
import gzip
import hashlib
import json
import os
from pathlib import Path
import socket
import sqlite3
import subprocess

if os.geteuid() != 0 or socket.gethostname() != 'VM-0-4-ubuntu':
    raise SystemExit('Run as root on the new production host only')
os.umask(0o077)
stamp = datetime.datetime.now(datetime.timezone.utc).strftime('%Y%m%dT%H%M%SZ')
dest = Path('/root/aity-migration') / ('live-' + stamp)
dest.mkdir(mode=0o700)
databases = ['\u6295\u7814\u56fe\u7075\u5ba4', 'ai_expo',
             '\u6295\u7814\u56fe\u7075\u5ba4_test']
with (dest / 'databases.sql.gz').open('wb') as output:
    dump = subprocess.Popen(['mysqldump', '--single-transaction', '--quick', '--hex-blob',
                             '--no-tablespaces', '--routines', '--events', '--triggers',
                             '--databases'] + databases, stdout=subprocess.PIPE,
                            stderr=(dest / 'dump.log').open('wb'))
    compress = subprocess.Popen(['gzip', '-n'], stdin=dump.stdout, stdout=output)
    dump.stdout.close()
    if compress.wait() or dump.wait():
        raise SystemExit('Live database backup failed; see protected log')
source = sqlite3.connect('file:/root/homeassistant/home-assistant_v2.db?mode=ro', uri=True)
target = sqlite3.connect(dest / 'home-assistant.sqlite')
try:
    source.backup(target)
    if target.execute('PRAGMA quick_check').fetchone()[0] != 'ok':
        raise SystemExit('Home Assistant backup integrity failure')
finally:
    target.close()
    source.close()
inputs = ['etc/caddy', 'etc/systemd/system/aity-cert-renew.service',
          'etc/systemd/system/aity-cert-renew.timer', 'etc/systemd/system/openclaw-gateway.service',
          'etc/systemd/system/ha-health-check.service', 'etc/systemd/system/ha-health-check.timer',
          'etc/mysql/mysql.conf.d/aity-migration.cnf', 'root/.acme.sh',
          'root/aity-vip/shared/backend.env', 'root/ai-expo/shared/server.env',
          'root/ai-expo/manage.sh', 'root/aity-migration/runtime/ecosystem.config.cjs',
          'root/.openclaw', 'root/homeassistant', 'root/bin', 'root/.ha_wecom_key']
excludes = ['*/node_modules', '*/deps', '*/.cache', '*/.git', '*.log', '*.log.*',
            'root/homeassistant/home-assistant_v2.db*']
result = subprocess.run(['tar', 'czf', str(dest / 'configuration.tar.gz'),
                         '--warning=no-file-changed'] + ['--exclude=' + x for x in excludes]
                        + ['-C', '/'] + inputs, stderr=(dest / 'archive.log').open('wb'))
if result.returncode not in (0, 1):
    raise SystemExit('Live configuration archive failed; see protected log')
manifest = {'stamp': stamp, 'databases': databases, 'files': {}}
for filename in ['databases.sql.gz', 'home-assistant.sqlite', 'configuration.tar.gz']:
    path = dest / filename
    digest = hashlib.sha256()
    with path.open('rb') as stream:
        for chunk in iter(lambda: stream.read(4 * 1024**2), b''):
            digest.update(chunk)
    manifest['files'][filename] = {'bytes': path.stat().st_size, 'sha256': digest.hexdigest()}
(dest / 'manifest.json').write_text(json.dumps(manifest, indent=2, ensure_ascii=False))
print(json.dumps({'backup': str(dest), 'files': manifest['files']}), flush=True)
