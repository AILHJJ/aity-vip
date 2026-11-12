#!/usr/bin/env python3
"""Deduplicate identical package files while preserving exact installed versions."""
import hashlib
import json
import os
from pathlib import Path
import tarfile

os.umask(0o077)
base = Path('/root/aity-migration/remainder-20261112')
output = base / 'openclaw-compact.tar.gz'
seen = {}
saved = 0


def deduplicate(member):
    global saved
    if '/.cache/' in member.name or '/.git/' in member.name:
        return None
    if member.isfile() and member.size > 1024:
        source = Path('/root') / member.name
        digest = hashlib.sha256()
        with source.open('rb') as stream:
            for block in iter(lambda: stream.read(1024 * 1024), b''):
                digest.update(block)
        key = (member.size, digest.digest(), member.mode, member.uid, member.gid)
        if key in seen:
            saved += member.size
            member.type = tarfile.LNKTYPE
            member.linkname = seen[key]
            member.size = 0
        else:
            seen[key] = member.name
    return member


with tarfile.open(str(output) + '.part', 'w:gz', compresslevel=3) as archive:
    for path in ['.local/share/pnpm/global/5', '.openclaw/extensions']:
        archive.add('/root/' + path, arcname=path, filter=deduplicate)
Path(str(output) + '.part').rename(output)
digest = hashlib.sha256()
with output.open('rb') as stream:
    for block in iter(lambda: stream.read(4 * 1024**2), b''):
        digest.update(block)
info = {'bytes': output.stat().st_size, 'sha256': digest.hexdigest(), 'deduplicated_bytes': saved}
(base / 'openclaw-compact.json').write_text(json.dumps(info))
print('EXACT_RUNTIME_PACKED', json.dumps(info), flush=True)
