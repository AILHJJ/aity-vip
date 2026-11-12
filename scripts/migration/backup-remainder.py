#!/usr/bin/env python3
"""Preserve the remaining source host workloads without printing credentials."""
import hashlib
import json
import os
from pathlib import Path
import shutil
import subprocess

DEST = Path('/root/aity-migration/remainder-20261112')
DEST.mkdir(mode=0o700, parents=True, exist_ok=True)
os.umask(0o077)
os.environ['XDG_RUNTIME_DIR'] = '/run/user/0'
os.environ['DBUS_SESSION_BUS_ADDRESS'] = 'unix:path=/run/user/0/bus'


def run(*args):
    return subprocess.check_output(args, text=True)


containers = [json.loads(run('docker', 'inspect', name))[0]
              for name in ('homeassistant', 'wyoming-piper', 'wyoming-whisper')]
(DEST / 'containers.json').write_text(json.dumps(containers, ensure_ascii=False))
(DEST / 'root.crontab').write_text(run('crontab', '-l'))

image_files = []
for container in containers:
    images = DEST / (container['Name'].lstrip('/') + '.image.tar.gz')
    image_files.append(images.name)
    if images.exists():
        continue
    if shutil.disk_usage(DEST).free < 3 * 1024**3:
        raise SystemExit('Insufficient source space for protected image backup')
    partial = images.with_suffix(images.suffix + '.part')
    with partial.open('wb') as output:
        save = subprocess.Popen(['docker', 'save', container['Image']],
                                stdout=subprocess.PIPE)
        compress = subprocess.Popen(['gzip', '-1'], stdin=save.stdout, stdout=output)
        save.stdout.close()
        if compress.wait() or save.wait():
            raise SystemExit('Image export failed; original services unchanged')
    partial.rename(images)
    print('IMAGE_SAVED', images.name, images.stat().st_size, flush=True)

state = DEST / 'state.tar.gz'
if not state.exists():
    if shutil.disk_usage(DEST).free < 2 * 1024**3:
        raise SystemExit('Insufficient source space; services not stopped')
    # Stop automation before copying SQLite/auth state, and keep it stopped after
    # success. Recovery on failure is limited to workloads stopped by this run.
    openclaw_active = subprocess.run(['systemctl', '--user', 'is-active', '--quiet',
                                     'openclaw-gateway.service']).returncode == 0
    running = [c['Name'].lstrip('/') for c in containers if c['State']['Running']]
    try:
        if openclaw_active:
            subprocess.run(['systemctl', '--user', 'stop', 'openclaw-gateway.service'], check=True)
        if running:
            subprocess.run(['docker', 'stop', '--time', '45'] + running, check=True)
        for name in running:
            subprocess.run(['docker', 'update', '--restart=no', name], check=True)
        if openclaw_active:
            subprocess.run(['systemctl', '--user', 'disable', 'openclaw-gateway.service'], check=True)
        (DEST / 'source-frozen').touch()
        excludes = ['root/aity-migration', 'root/.ssh', 'root/.cache', 'root/.npm',
                    'root/.pm2/logs', 'root/.acme.sh/acme.sh.log',
                    'root/.local/share/pnpm/store']
        args = ['tar', 'czf', str(DEST / 'state.tar.gz.part'), '--warning=no-file-changed']
        args += ['--exclude=' + p for p in excludes]
        args += ['-C', '/', 'root', 'etc/nginx', 'www/server/panel/vhost',
                 'www/server/cron', 'www/wwwroot', 'etc/systemd/system', 'etc/cron.d']
        result = subprocess.run(args)
        if result.returncode not in (0, 1):
            raise RuntimeError('State archive failed')
        subprocess.run(['tar', 'tzf', str(DEST / 'state.tar.gz.part')],
                       stdout=subprocess.DEVNULL, check=True)
        (DEST / 'state.tar.gz.part').rename(state)
    except BaseException:
        if running:
            for name in running:
                subprocess.run(['docker', 'update', '--restart=unless-stopped', name])
            subprocess.run(['docker', 'start'] + running)
        if openclaw_active:
            subprocess.run(['systemctl', '--user', 'enable', '--now', 'openclaw-gateway.service'])
        (DEST / 'source-frozen').unlink(missing_ok=True)
        raise

checksums = {}
for filename in ['state.tar.gz', 'containers.json', 'root.crontab'] + image_files:
    path = DEST / filename
    digest = hashlib.sha256()
    with path.open('rb') as stream:
        for block in iter(lambda: stream.read(4 * 1024**2), b''):
            digest.update(block)
    checksums[filename] = {'bytes': path.stat().st_size, 'sha256': digest.hexdigest()}
(DEST / 'manifest.json').write_text(json.dumps(checksums, indent=2))
print(json.dumps(checksums), flush=True)
