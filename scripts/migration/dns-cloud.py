#!/usr/bin/env python3
"""List DNS records or change only explicitly named source-host A records."""
import argparse
import csv
import datetime
import hashlib
import hmac
import json
from pathlib import Path
import time
import urllib.request

parser = argparse.ArgumentParser()
parser.add_argument('--apply', nargs='*', default=[])
parser.add_argument('--dns-add', nargs=2)
parser.add_argument('--dns-remove', nargs=2)
parser.add_argument('--ensure-claw-alias', action='store_true')
args = parser.parse_args()
if set(args.apply) - {'www', 'ha', 'openclaw', '_dnsauth'}:
    raise SystemExit('Unsupported record name')
credentials = []
root = Path('/root/.tccli')
for p in root.glob('*.credentials'):
    try:
        d = json.loads(p.read_text())
        credentials.append((d.get('secretId', ''), d.get('secretKey', '')))
    except (ValueError, OSError):
        pass
if (root / 'credentials.csv').exists():
    with (root / 'credentials.csv').open() as f:
        for d in csv.DictReader(f):
            credentials.append((d.get('SecretId', ''), d.get('SecretKey', '')))
credentials = list(dict.fromkeys((i.strip(), k.strip()) for i, k in credentials
                                if i.strip().startswith('AKID') and k.strip()))


def call(action, payload, pair):
    sid, secret = pair
    host = 'dnspod.tencentcloudapi.com'
    stamp = int(time.time())
    date = datetime.datetime.fromtimestamp(stamp, datetime.timezone.utc).strftime('%Y-%m-%d')
    body = json.dumps(payload, separators=(',', ':')).encode()
    sha = lambda s: hashlib.sha256(s).hexdigest()
    canonical = 'POST\n/\n\ncontent-type:application/json; charset=utf-8\nhost:' + host
    canonical += '\n\ncontent-type;host\n' + sha(body)
    scope = date + '/dnspod/tc3_request'
    message = 'TC3-HMAC-SHA256\n' + str(stamp) + '\n' + scope + '\n' + sha(canonical.encode())
    sign = lambda key, text: hmac.new(key, text.encode(), hashlib.sha256).digest()
    key = sign(sign(sign(('TC3' + secret).encode(), date), 'dnspod'), 'tc3_request')
    signature = hmac.new(key, message.encode(), hashlib.sha256).hexdigest()
    auth = 'TC3-HMAC-SHA256 Credential=' + sid + '/' + scope
    auth += ', SignedHeaders=content-type;host, Signature=' + signature
    headers = {'Content-Type': 'application/json; charset=utf-8', 'Authorization': auth,
               'X-TC-Action': action, 'X-TC-Version': '2021-03-23', 'X-TC-Timestamp': str(stamp)}
    req = urllib.request.Request('https://' + host, data=body, headers=headers)
    with urllib.request.urlopen(req, timeout=20) as r:
        return json.load(r)['Response']


for pair in credentials:
    response = call('DescribeRecordList', {'Domain': 'aity88.online', 'Limit': 100}, pair)
    if 'Error' in response:
        print('DNS_CREDENTIAL_RESULT', response['Error']['Code'])
        continue
    records = response.get('RecordList', [])
    backup = Path('/root/aity-migration/remainder-20261112/dns-before.json')
    if not backup.exists():
        backup.write_text(json.dumps(response, ensure_ascii=False, indent=2))
        backup.chmod(0o600)
    challenge = args.dns_add or args.dns_remove
    if challenge:
        domain, value = challenge
        allowed = ['_acme-challenge.' + n + '.aity88.online' for n in ['www', 'ha', 'openclaw', 'claw']]
        if domain not in allowed:
            raise SystemExit('Unsupported certificate domain')
        subdomain = domain.removesuffix('.aity88.online')
        matches = [r for r in records if r['Name'] == subdomain
                   and r['Type'] == 'TXT' and r['Value'] == value]
        if args.dns_add and not matches:
            result = call('CreateRecord', {'Domain': 'aity88.online', 'SubDomain': subdomain,
                          'RecordType': 'TXT', 'RecordLine': '\u9ed8\u8ba4',
                          'Value': value, 'TTL': 600}, pair)
            if 'Error' in result:
                raise SystemExit('DNS_CHALLENGE_FAILED ' + result['Error']['Code'])
        elif args.dns_remove:
            for r in matches:
                result = call('DeleteRecord', {'Domain': 'aity88.online', 'RecordId': r['RecordId']}, pair)
                if 'Error' in result:
                    raise SystemExit('DNS_CHALLENGE_REMOVE_FAILED ' + result['Error']['Code'])
        print('DNS_CHALLENGE_OK', domain)
        break
    if args.ensure_claw_alias:
        matches = [r for r in records if r['Name'] == 'claw']
        if matches and not (len(matches) == 1 and matches[0]['Type'] == 'A'
                            and matches[0]['Value'] == '122.51.214.161'):
            raise SystemExit('Unexpected existing claw alias')
        if not matches:
            result = call('CreateRecord', {'Domain': 'aity88.online', 'SubDomain': 'claw',
                          'RecordType': 'A', 'RecordLine': '\u9ed8\u8ba4',
                          'Value': '122.51.214.161', 'TTL': 600}, pair)
            if 'Error' in result:
                raise SystemExit('DNS_ALIAS_FAILED ' + result['Error']['Code'])
        print('CLAW_ALIAS_READY')
        break
    for r in records:
        if r['Type'] not in ['A', 'AAAA', 'CNAME', 'NS']:
            continue
        print(json.dumps({k: r.get(k) for k in ['RecordId', 'Name', 'Type', 'Value', 'TTL', 'Status']},
                         ensure_ascii=False))
    for name in args.apply:
        matches = [r for r in records if r['Name'] == name and r['Type'] == 'A']
        if len(matches) != 1 or matches[0]['Value'] not in ['124.221.119.134', '122.51.214.161']:
            raise SystemExit('Unexpected DNS state for ' + name)
        r = matches[0]
        if r['Value'] == '122.51.214.161':
            continue
        result = call('ModifyRecord', {'Domain': 'aity88.online', 'RecordId': r['RecordId'],
                      'SubDomain': name, 'RecordType': 'A', 'RecordLine': r['Line'],
                      'Value': '122.51.214.161', 'TTL': r['TTL']}, pair)
        if 'Error' in result:
            raise SystemExit('DNS_UPDATE_FAILED ' + result['Error']['Code'])
        print('DNS_UPDATED', name)
    break
else:
    raise SystemExit('NO_WORKING_DNS_CREDENTIALS')
