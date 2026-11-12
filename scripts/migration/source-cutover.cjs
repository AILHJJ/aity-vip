// Source-host traffic control. Never resume the old database after new writes are possible.
const fs = require('node:fs');
const cp = require('node:child_process');
const crypto = require('node:crypto');
process.umask(0o077);
const [action, stamp] = process.argv.slice(2);
if (!/^\d{8}T\d{6}Z$/.test(stamp || '')) throw Error('Invalid timestamp');
const dir = `/root/aity-migration/cutover-${stamp}`;
const site = '/www/server/panel/vhost/nginx/aity88.online.conf';
const run = (cmd, args) => {
  const r = cp.spawnSync(cmd, args, { encoding: 'utf8', timeout: 30000 });
  if (r.status !== 0) throw Error(`Command failed: ${cmd}`);
  return r.stdout;
};
const writeSite = file => {
  fs.copyFileSync(file, site);
  try { run('nginx', ['-t']); run('nginx', ['-s', 'reload']); }
  catch (error) { fs.copyFileSync(`${dir}/original.conf`, site); run('nginx', ['-t']); run('nginx', ['-s', 'reload']); throw error; }
};
try {
  if (action === 'freeze' && (fs.existsSync(`${dir}/new-writes-possible`) || fs.existsSync(`${dir}/committed`))) throw Error('Production already promoted; refusing to freeze the old source again');
  if (action === 'prepare') {
    fs.mkdirSync(dir, { mode: 0o700 });
    fs.copyFileSync(site, `${dir}/original.conf`);
    fs.writeFileSync(`${dir}/original.sha256`, crypto.createHash('sha256').update(fs.readFileSync(site)).digest('hex'));
    const tls = `listen 443 ssl;\nserver_name aity88.online;\nssl_certificate /etc/nginx/ssl/aity88.online/aity88.online_bundle.crt;\nssl_certificate_key /etc/nginx/ssl/aity88.online/aity88.online.key;\nssl_protocols TLSv1.2 TLSv1.3;`;
    const http = `server { listen 80; server_name aity88.online; location ^~ /.well-known/acme-challenge/ { root /var/www/html; try_files $uri =404; } location / { return 301 https://aity88.online$request_uri; } }`;
    fs.writeFileSync(`${dir}/maintenance.conf`, `server { ${tls}\nadd_header Retry-After 60 always; add_header Cache-Control no-store always; return 503; }\n${http}\n`);
    fs.writeFileSync(`${dir}/forward.conf`, `server { ${tls}
client_max_body_size 12m;
location / {
    proxy_pass https://122.51.214.161;
    proxy_ssl_server_name on;
    proxy_ssl_name aity88.online;
    proxy_ssl_verify on;
    proxy_ssl_trusted_certificate /etc/pki/tls/certs/ca-bundle.crt;
    proxy_ssl_verify_depth 4;
    proxy_http_version 1.1;
    proxy_set_header Host aity88.online;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto https;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_buffering off;
    proxy_request_buffering off;
    proxy_read_timeout 180s;
    proxy_send_timeout 180s;
    add_header X-Aity-Migration upstream-new-server always;
}
}\n${http}\n`);
    if (!fs.existsSync('/etc/pki/tls/certs/ca-bundle.crt')) throw Error('Source CA bundle missing');
    console.log('SOURCE_PREPARED');
  } else if (action === 'freeze') {
    const expected = fs.readFileSync(`${dir}/original.sha256`, 'utf8');
    if (crypto.createHash('sha256').update(fs.readFileSync(site)).digest('hex') !== expected) throw Error('Source Nginx changed since preparation');
    run('systemd-run', ['--unit', `aity-cutover-watchdog-${stamp}`, '--on-active=12m', '--setenv', `PATH=${process.env.PATH}`, process.execPath, '/root/aity-migration/source-cutover.cjs', 'recover', stamp]);
    writeSite(`${dir}/maintenance.conf`);
    run('pm2', ['stop', 'aity-backend', 'ai-expo-api']);
    fs.writeFileSync(`${dir}/frozen`, new Date().toISOString());
    console.log('SOURCE_FROZEN');
  } else if (action === 'recover') {
    if (fs.existsSync(`${dir}/new-writes-possible`) || fs.existsSync(`${dir}/committed`)) {
      console.log('RECOVERY_REFUSED_NEW_WRITES_POSSIBLE; protect target data before any rollback');
      process.exit(0);
    }
    run('pm2', ['restart', 'aity-backend', 'ai-expo-api']);
    writeSite(`${dir}/original.conf`);
    console.log('SOURCE_RECOVERED_BEFORE_PROMOTION');
  } else if (action === 'mark-live') {
    if (!fs.existsSync(`${dir}/frozen`)) throw Error('Source not frozen');
    fs.writeFileSync(`${dir}/new-writes-possible`, new Date().toISOString());
    console.log('SOURCE_MARKED_TARGET_MAY_ACCEPT_WRITES');
  } else if (action === 'forward') {
    if (!fs.existsSync(`${dir}/new-writes-possible`)) throw Error('Target promotion marker missing');
    writeSite(`${dir}/forward.conf`);
    fs.writeFileSync(`${dir}/committed`, new Date().toISOString());
    run('pm2', ['save']);
    console.log('SOURCE_FORWARDS_TO_NEW_SERVER');
  } else { throw Error('Unknown action'); }
} catch (err) { console.error(err.code || err.message); process.exitCode = 1; }
