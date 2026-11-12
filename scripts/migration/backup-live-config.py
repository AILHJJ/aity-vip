#!/usr/bin/env python3
"""Capture the new host's final database/configuration recovery material privately."""
import argparse
import datetime
import fcntl
import hashlib
import json
import os
from pathlib import Path
import re
import shutil
import socket
import sqlite3
import subprocess

if os.geteuid() != 0 or socket.gethostname() != 'VM-0-4-ubuntu':
    raise SystemExit('Run as root on the new production host only')
os.umask(0o077)
parser = argparse.ArgumentParser()
parser.add_argument('--daily', action='store_true', help='Keep seven successful daily snapshots')
args = parser.parse_args()
lock = open('/root/aity-migration/backup.lock', 'a')
fcntl.flock(lock, fcntl.LOCK_EX | fcntl.LOCK_NB)
backup_root = Path('/root/aity-backups' if args.daily else '/root/aity-migration')
backup_root.mkdir(mode=0o700, exist_ok=True)
backup_root.chmod(0o700)
if shutil.disk_usage(backup_root).free < 1024**3:
    raise SystemExit('Less than 1 GiB available; backup aborted without pruning existing snapshots')
stamp = datetime.datetime.now(datetime.timezone.utc).strftime('%Y%m%dT%H%M%SZ')
dest = backup_root / ('live-' + stamp)
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
    compressed = compress.wait()
    dumped = dump.wait()
    if compressed or dumped:
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
inputs += [name for name in [
    'etc/systemd/system/aity-backup.service', 'etc/systemd/system/aity-backup.timer',
    'root/aity-migration/runtime/backup-live-config.py',
    'root/aity-migration/runtime/verify-live-backup.py'] if Path('/' + name).is_file()]
excludes = ['*/node_modules', '*/deps', '*/.cache', '*/.git', '*.log', '*.log.*',
            'root/homeassistant/home-assistant_v2.db*']
result = subprocess.run(['tar', 'czf', str(dest / 'configuration.tar.gz'),
                         '--warning=no-file-changed'] + ['--exclude=' + x for x in excludes]
                        + ['-C', '/'] + inputs, stderr=(dest / 'archive.log').open('wb'))
if result.returncode not in (0, 1):
    raise SystemExit('Live configuration archive failed; see protected log')
application_inputs = ['root/aity-vip/shared/uploads', 'srv/aity-h5']
releases = {}
for app in ['aity-vip', 'ai-expo']:
    release = Path('/root/' + app + '/current').resolve(strict=True)
    if release.parent != Path('/root/' + app + '/releases'):
        raise SystemExit('Unexpected application release location')
    releases[app] = str(release)
    application_inputs.append(str(release.relative_to('/')))
with (dest / 'applications.log').open('wb') as archive_log:
    result = subprocess.run(
        ['tar', 'czf', str(dest / 'applications.tar.gz'), '--warning=no-file-changed',
         '--exclude=*/node_modules', '--exclude=*/.git', '--exclude=*/logs',
         '-C', '/'] + application_inputs, stderr=archive_log)
if result.returncode not in (0, 1):
    raise SystemExit('Application archive failed; see protected log')
manifest = {'stamp': stamp, 'databases': databases, 'releases': releases, 'files': {}}
for filename in ['databases.sql.gz', 'home-assistant.sqlite', 'configuration.tar.gz',
                 'applications.tar.gz']:
    path = dest / filename
    digest = hashlib.sha256()
    with path.open('rb') as stream:
        for chunk in iter(lambda: stream.read(4 * 1024**2), b''):
            digest.update(chunk)
    manifest['files'][filename] = {'bytes': path.stat().st_size, 'sha256': digest.hexdigest()}
(dest / 'manifest.json').write_text(json.dumps(manifest, indent=2, ensure_ascii=False))
if args.daily:
    snapshots = sorted(path for path in backup_root.iterdir()
                       if not path.is_symlink() and path.is_dir()
                       and re.fullmatch(r'live-\d{8}T\d{6}Z', path.name)
                       and (path / 'manifest.json').is_file())
    for expired in snapshots[:-7]:
        if expired.resolve().parent != backup_root:
            raise SystemExit('Refusing to remove a backup outside the daily backup root')
        shutil.rmtree(expired)
print(json.dumps({'backup': str(dest), 'files': manifest['files']}), flush=True)
