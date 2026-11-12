#!/usr/bin/env python3
"""Finish the frozen OpenClaw restore without replacing new-host service config."""
import hashlib
import json
from pathlib import Path
import subprocess

BASE = Path('/root/aity-migration/remainder-20261112')
for archive, marker in [('openclaw-compact.tar.gz', 'runtime-verified'),
                        ('user-files-compact.tar.gz', 'user-files-verified')]:
    if not (BASE / marker).exists():
        raise SystemExit('Required verified transfer is incomplete: ' + archive)
    info = json.loads((BASE / archive.replace('.tar.gz', '.json')).read_text())
    digest = hashlib.sha256()
    with (BASE / archive).open('rb') as stream:
        for chunk in iter(lambda: stream.read(4 * 1024**2), b''):
            digest.update(chunk)
    if digest.hexdigest() != info['sha256']:
        raise SystemExit('Archive checksum mismatch')
if (BASE / 'finalized').exists():
    raise SystemExit('Already finalized; use health checks instead')

subprocess.run(['systemctl', 'stop', 'openclaw-gateway.service'], check=True)
# The archive contains only these two runtime paths. Configuration, auth state,
# new-host certificates, Hermes and application databases are not overwritten.
subprocess.run(['tar', 'xzf', str(BASE / 'openclaw-compact.tar.gz'), '-C', '/root'], check=True)
unit = Path('/etc/systemd/system/openclaw-gateway.service')
unit.write_text(unit.read_text().replace('--max-old-space-size=512', '--max-old-space-size=768'))
subprocess.run(['systemctl', 'daemon-reload'], check=True)
subprocess.run(['systemctl', 'start', 'openclaw-gateway.service'], check=True)
historical = BASE / 'historical-user-files'
historical.mkdir(mode=0o700, exist_ok=True)
subprocess.run(['tar', 'xzf', str(BASE / 'user-files-compact.tar.gz'), '-C', str(historical)], check=True)
(BASE / 'finalized').touch()
print('REMAINDER_FINALIZED', flush=True)
