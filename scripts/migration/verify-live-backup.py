#!/usr/bin/env python3
"""Verify a protected snapshot using disposable databases and a restricted user."""
import datetime
import gzip
import hashlib
import json
import os
from pathlib import Path
import re
import secrets
import socket
import sqlite3
import subprocess
import sys
import tempfile


def mysql(sql, options=()):
    result = subprocess.run(
        ['mysql', *options, '--batch', '--skip-column-names'], input=sql,
        text=True, encoding='utf-8', stdout=subprocess.PIPE, stderr=subprocess.PIPE,
        timeout=180)
    if result.returncode:
        raise RuntimeError('MySQL verification command failed; no SQL/data logged')
    return result.stdout.strip()


def verify(snapshot):
    if os.geteuid() != 0 or socket.gethostname() != 'VM-0-4-ubuntu':
        raise RuntimeError('Run as root on the new production host only')
    os.umask(0o077)
    snapshot = Path(snapshot).resolve(strict=True)
    if snapshot.parent not in (Path('/root/aity-migration'), Path('/root/aity-backups')) or not re.fullmatch(
            r'live-\d{8}T\d{6}Z', snapshot.name):
        raise RuntimeError('Expected a protected live snapshot directory')
    manifest = json.loads((snapshot / 'manifest.json').read_text())
    filenames = ['databases.sql.gz', 'home-assistant.sqlite', 'configuration.tar.gz']
    if 'applications.tar.gz' in manifest['files']:
        filenames.append('applications.tar.gz')
    for filename in filenames:
        path = snapshot / filename
        digest = hashlib.sha256()
        with path.open('rb') as stream:
            for chunk in iter(lambda: stream.read(4 * 1024**2), b''):
                digest.update(chunk)
        expected = manifest['files'][filename]
        if path.stat().st_size != expected['bytes'] or digest.hexdigest() != expected['sha256']:
            raise RuntimeError('Backup manifest mismatch: ' + filename)
        if filename.endswith('.tar.gz'):
            archive = subprocess.run(['tar', 'tzf', str(path)], stdout=subprocess.DEVNULL,
                                     stderr=subprocess.PIPE, timeout=180)
            if archive.returncode:
                raise RuntimeError('Backup archive integrity failure: ' + filename)
    connection = sqlite3.connect(
        (snapshot / 'home-assistant.sqlite').as_uri() + '?mode=ro', uri=True)
    try:
        if connection.execute('PRAGMA quick_check').fetchall() != [('ok',)]:
            raise RuntimeError('SQLite backup integrity failure')
    finally:
        connection.close()

    with gzip.open(snapshot / 'databases.sql.gz', 'rt', encoding='utf-8') as stream:
        sql = stream.read()
    # This rehearsal intentionally supports ordinary table dumps only.
    if re.search(r'\b(?:PROCEDURE|FUNCTION|EVENT|TRIGGER)\b', sql):
        raise RuntimeError('Dump needs a separate routine/event/trigger review')
    sources = ['\u6295\u7814\u56fe\u7075\u5ba4', 'ai_expo',
               '\u6295\u7814\u56fe\u7075\u5ba4_test']
    if manifest['databases'] != sources:
        raise RuntimeError('Unexpected source database list')
    nonce = secrets.token_hex(6)
    mapping = {source: 'aityrestore' + nonce + str(index)
               for index, source in enumerate(sources)}
    tables = {source: [] for source in sources}
    create_sql = {}
    rewritten = []
    current = None
    for line in sql.splitlines():
        if line.startswith('CREATE DATABASE '):
            matches = [source for source in sources if '`' + source + '`' in line]
            if len(matches) != 1 or matches[0] in create_sql:
                raise RuntimeError('Unexpected database definition')
            source = matches[0]
            create_sql[source] = line.replace('`' + source + '`', '`' + mapping[source] + '`')
            continue
        if line.startswith('USE '):
            match = re.fullmatch(r'USE `([^`]+)`;', line)
            if not match or match[1] not in mapping:
                raise RuntimeError('Unexpected database selection')
            current = match[1]
            line = 'USE `' + mapping[current] + '`;'
        match = re.match(r'^CREATE TABLE `([^`]+)`', line)
        if match:
            if current is None or not re.fullmatch(r'[A-Za-z0-9_]+', match[1]):
                raise RuntimeError('Unexpected table definition')
            tables[current].append(match[1])
        rewritten.append(line)
    if set(create_sql) != set(sources) or any(not names for names in tables.values()):
        raise RuntimeError('Incomplete dump structure')

    username = 'restorecheck' + nonce
    password = secrets.token_hex(24)
    created = []
    user_created = False
    report = {'snapshot': str(snapshot), 'verified_at': datetime.datetime.now(
        datetime.timezone.utc).isoformat(), 'hashes': 'ok', 'archives': 'ok',
        'sqlite': 'ok', 'databases': {}}
    try:
        for source, target in mapping.items():
            if not re.fullmatch(r'aityrestore[0-9a-f]{12}[0-2]', target):
                raise RuntimeError('Invalid temporary schema name')
            if mysql("SELECT SCHEMA_NAME FROM information_schema.SCHEMATA WHERE SCHEMA_NAME='"
                     + target + "';"):
                raise RuntimeError('Temporary schema already exists')
            mysql(create_sql[source])
            created.append(target)
        mysql("CREATE USER '" + username + "'@'localhost' IDENTIFIED BY '" + password + "';")
        user_created = True
        for target in created:
            mysql("GRANT ALL ON `" + target + "`.* TO '" + username + "'@'localhost';")
        with tempfile.TemporaryDirectory(prefix='aity-restore-') as tempdir:
            config = Path(tempdir) / 'client.cnf'
            config.write_text('[client]\nuser=' + username + '\npassword=' + password
                              + '\nprotocol=socket\ndefault-character-set=utf8mb4\n')
            config.chmod(0o600)
            options = ['--defaults-file=' + str(config)]
            denied = subprocess.run(
                ['mysql', *options, '--batch', '--skip-column-names'],
                input='USE `' + sources[0] + '`;', text=True, encoding='utf-8',
                stdout=subprocess.PIPE, stderr=subprocess.PIPE, timeout=10)
            if denied.returncode == 0:
                raise RuntimeError('Restore account unexpectedly has production access')
            mysql('\n'.join(rewritten), options)
            for source, target in mapping.items():
                actual = mysql("SELECT TABLE_NAME FROM information_schema.TABLES WHERE TABLE_SCHEMA='"
                               + target + "' ORDER BY TABLE_NAME;", options).splitlines()
                if sorted(tables[source]) != actual:
                    raise RuntimeError('Restored table list differs from dump')
                counts = {}
                for table in actual:
                    check = mysql('CHECK TABLE `' + target + '`.`' + table + '` QUICK;', options)
                    if not check.endswith('\tstatus\tOK'):
                        raise RuntimeError('Restored table integrity failure')
                    counts[table] = int(mysql('SELECT COUNT(*) FROM `' + target + '`.`'
                                              + table + '`;', options))
                report['databases'][source] = {'tables': len(actual), 'rows': counts}
    finally:
        for target in created:
            mysql('DROP DATABASE `' + target + '`;')
        if user_created:
            mysql("DROP USER '" + username + "'@'localhost';")
    report['temporary_resources_removed'] = True
    (snapshot / 'verification.json').write_text(
        json.dumps(report, indent=2, ensure_ascii=False), encoding='utf-8')
    print(json.dumps(report, ensure_ascii=False))


if __name__ == '__main__':
    if len(sys.argv) != 2:
        raise SystemExit('Usage: verify-live-backup.py /root/aity-migration/live-<UTCstamp>')
    verify(sys.argv[1])
