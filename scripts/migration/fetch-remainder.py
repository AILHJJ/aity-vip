#!/usr/bin/env python3
"""Resume downloading only fixed source backup files through a restricted key."""
import hashlib
import argparse
import json
import os
from pathlib import Path
import subprocess
import time

os.umask(0o077)
dest = Path('/root/aity-migration/remainder-20261112')
ssh = ['ssh', '-T', '-i', str(dest / 'transfer-key'), '-o', 'BatchMode=yes',
       '-o', 'IdentitiesOnly=yes', '-o', 'StrictHostKeyChecking=accept-new',
       '-o', 'ConnectTimeout=10', '-o', 'ServerAliveInterval=15', 'root@124.221.119.134']
parser = argparse.ArgumentParser()
group = parser.add_mutually_exclusive_group()
group.add_argument('--runtime', action='store_true')
group.add_argument('--user-files', action='store_true')
args = parser.parse_args()
files = (['user-files-compact.json', 'user-files-compact.tar.gz'] if args.user_files else
         ['openclaw-compact.json', 'openclaw-compact.tar.gz'] if args.runtime else
         ['containers.json', 'homeassistant.image.tar.gz', 'wyoming-piper.image.tar.gz',
          'wyoming-whisper.image.tar.gz', 'state.tar.gz', 'root.crontab', 'manifest.json'])
for name in files:
    target = dest / name
    if target.exists():
        continue
    partial = dest / (name + '.part')
    deadline = time.monotonic() + 2400
    while time.monotonic() < deadline:
        offset = partial.stat().st_size if partial.exists() else 0
        with partial.open('ab') as output:
            p = subprocess.run(ssh + ['get ' + name + ' ' + str(offset)], stdout=output)
        if p.returncode == 0:
            partial.rename(target)
            print('TRANSFERRED', name, target.stat().st_size, flush=True)
            break
        if p.returncode not in (3, 255):
            raise SystemExit('Restricted transfer failed: ' + name)
        time.sleep(5)
    else:
        raise SystemExit('Source backup not ready: ' + name)

manifest = ({'user-files-compact.tar.gz': json.loads((dest / 'user-files-compact.json').read_text())}
            if args.user_files else
            {'openclaw-compact.tar.gz': json.loads((dest / 'openclaw-compact.json').read_text())}
            if args.runtime else json.loads((dest / 'manifest.json').read_text()))
for name, expected in manifest.items():
    digest = hashlib.sha256()
    with (dest / name).open('rb') as f:
        for block in iter(lambda: f.read(4 * 1024**2), b''):
            digest.update(block)
    if digest.hexdigest() != expected['sha256']:
        raise SystemExit('Checksum mismatch: ' + name)
    print('SHA256_OK', name, flush=True)
(dest / ('user-files-verified' if args.user_files else
         'runtime-verified' if args.runtime else 'transferred-verified')).touch()
