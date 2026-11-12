// Final restore consumes only the two migrated databases after both ingress paths are frozen.
const fs = require('node:fs');
const cp = require('node:child_process');
const crypto = require('node:crypto');
const dotenv = require('/root/aity-vip/current/backend/node_modules/dotenv');
process.umask(0o077);
const [action, stamp] = process.argv.slice(2);
if (!/^\d{8}T\d{6}Z$/.test(stamp || '')) throw Error('Invalid timestamp');
const root = `/root/aity-migration/cutover-${stamp}`;
const snapshot = `/root/aity-migration/${stamp}`;
const gateway = '/etc/caddy/Caddyfile';
const maintenanceConfig = `{
    auto_https disable_certs
}
:80 {
    root * /usr/share/caddy
    file_server
}
http://aity88.online {
    handle /.well-known/acme-challenge/* {
        root * /var/www/html
        file_server
    }
    handle {
        redir https://aity88.online{uri} permanent
    }
}
https://aity88.online {
    tls /etc/caddy/tls/aity88.online.crt /etc/caddy/tls/aity88.online.key
    header Retry-After 60
    header Cache-Control no-store
    respond "Migration maintenance; retry shortly" 503
}
`;
const run = (bin, args, opts = {}) => {
  const r = cp.spawnSync(bin, args, { encoding: 'utf8', timeout: 90000, maxBuffer: 8 * 1024 * 1024, ...opts });
  if (r.status !== 0) { fs.writeFileSync(`${root}/error.log`, r.stderr || '', { mode: 0o600 }); throw Error(`${bin} failed; inspect protected error.log`); }
  return r.stdout;
};
const qi = s => '`' + s.replace(/`/g, '``') + '`';
const sql = s => run('mysql', ['--default-character-set=utf8mb4', '-N', '-B'], { input: s });
const gatewayFile = file => { run('caddy', ['validate', '--adapter', 'caddyfile', '--config', file]); fs.copyFileSync(file, gateway); fs.chmodSync(gateway, 0o644); run('systemctl', ['reload', 'caddy']); };
const envFiles = { aity: '/root/aity-vip/shared/backend.env', 'ai-expo': '/root/ai-expo/shared/server.env' };
try {
  if (['freeze', 'sync', 'activate'].includes(action) && (fs.existsSync(`${root}/production-started`) || fs.existsSync(`${root}/opened`))) {
    throw Error('Production already started; refusing to replay destructive migration stages');
  }
  if (action === 'prepare') {
    if (fs.existsSync(`${root}/prepared`)) throw Error('Cutover already prepared');
    fs.mkdirSync(root, { recursive: true, mode: 0o700 });
    fs.copyFileSync(gateway, `${root}/Caddyfile.live`);
    fs.writeFileSync(`${root}/Caddyfile.maintenance`, maintenanceConfig);
    run('caddy', ['validate', '--adapter', 'caddyfile', '--config', `${root}/Caddyfile.maintenance`]);
    for (const [name, file] of Object.entries(envFiles)) fs.copyFileSync(file, `${root}/${name}.before.env`);
    fs.copyFileSync('/root/aity-migration/runtime/ecosystem.config.cjs', `${root}/ecosystem.before.cjs`);
    const dumps = run('mysqldump', ['--single-transaction', '--set-gtid-purged=OFF', '--no-tablespaces', '--databases', '\u6295\u7814\u56fe\u7075\u5ba4', 'ai_expo']);
    fs.writeFileSync(`${root}/target-before-final.sql.gz`, require('node:zlib').gzipSync(dumps), { mode: 0o600 });
    fs.writeFileSync(`${root}/prepared`, new Date().toISOString());
    console.log('TARGET_CUTOVER_PREPARED');
  } else if (action === 'freeze') {
    fs.writeFileSync(`${root}/Caddyfile.maintenance`, maintenanceConfig);
    gatewayFile(`${root}/Caddyfile.maintenance`);
    run('pm2', ['stop', 'aity-backend', 'ai-expo-api']);
    console.log('TARGET_FROZEN');
  } else if (action === 'sync') {
    const processes = JSON.parse(run('pm2', ['jlist']));
    if (processes.some(p => ['aity-backend', 'ai-expo-api'].includes(p.name) && p.pm2_env?.status !== 'stopped')) throw Error('Application processes must be stopped before final restore');
    const m = JSON.parse(fs.readFileSync(`${snapshot}/manifest.json`));
    if (m.databases.length !== 2 || m.releases.aity !== fs.realpathSync('/root/aity-vip/current') || m.releases.ai !== fs.realpathSync('/root/ai-expo/current')) throw Error('Source release changed; stop and review');
    for (const f of m.files) {
      if (crypto.createHash('sha256').update(fs.readFileSync(`${snapshot}/${f.file}`)).digest('hex') !== f.sha256) throw Error('Backup checksum mismatch');
    }
    fs.mkdirSync(`${snapshot}/extracted`, { mode: 0o700 });
    run('tar', ['-xzf', `${snapshot}/site-state.tar.gz`, '-C', `${snapshot}/extracted`]);
    for (const d of m.databases) {
      if (!['\u6295\u7814\u56fe\u7075\u5ba4', 'ai_expo'].includes(d.schema)) throw Error('Unexpected schema');
      sql(run('gzip', ['-dc', `${snapshot}/${d.dump}`]));
      for (const [table, count] of Object.entries(d.counts)) {
        if (Number(sql(`SELECT COUNT(*) FROM ${qi(d.schema)}.${qi(table)};`).trim()) !== Number(count)) throw Error(`Row count mismatch: ${d.service}.${table}`);
      }
      const file = envFiles[d.service];
      const targetDb = dotenv.parse(fs.readFileSync(file));
      const source = fs.readFileSync(`${snapshot}/extracted${file}`, 'utf8');
      fs.writeFileSync(`${snapshot}/${d.service}-production.env`, source);
      const flags = { DB_HOST: '127.0.0.1', DB_NAME: d.schema, DB_USER: targetDb.DB_USER, DB_PASSWORD: targetDb.DB_PASSWORD, HOST: '127.0.0.1', ...(d.service === 'aity' ? { MAIL_ENABLED: 'false', MAIL_AUTO_PROCESS: 'false' } : {}) };
      const sourceLines = source.split(/\r?\n/).filter(line => !Object.keys(flags).some(k => new RegExp(`^\\s*${k}\\s*=`).test(line)));
      fs.writeFileSync(file, sourceLines.join('\n').trimEnd() + '\n' + Object.entries(flags).map(([k,v]) => `${k}=${JSON.stringify(v)}`).join('\n') + '\n', { mode: 0o600 });
      console.log(JSON.stringify({ database: d.service, tables: d.tables.length, counts: 'matched' }));
    }
    const incoming = `${snapshot}/extracted/root/aity-vip/shared/uploads`;
    // Only this application's upload directory is synchronized; the complete archive remains intact.
    run('rsync', ['-a', '--delete', incoming + '/', '/root/aity-vip/shared/uploads/']);
    run('rsync', ['-a', '--delete', `${snapshot}/extracted/www/wwwroot/www.aity88.online/`, '/srv/aity-h5/']);
    run('find', ['/srv/aity-h5', '-type', 'd', '-exec', 'chmod', '755', '{}', '+']);
    run('find', ['/srv/aity-h5', '-type', 'f', '-exec', 'chmod', '644', '{}', '+']);
    run('pm2', ['restart', 'aity-backend', 'ai-expo-api', '--update-env']);
    for (const url of ['http://127.0.0.1:3001/api/health', 'http://127.0.0.1:3008/ai-experience-api/health']) {
      run('curl', ['-fsS', '--retry', '15', '--retry-connrefused', '--retry-delay', '1', '--max-time', '5', url]);
    }
    fs.writeFileSync(`${root}/synced`, new Date().toISOString());
    console.log('TARGET_FINAL_SNAPSHOT_SYNCED_IN_STAGING_MODE');
  } else if (action === 'activate') {
    if (!fs.existsSync(`${root}/synced`)) throw Error('Final sync marker missing');
    const configPath = '/root/aity-migration/runtime/ecosystem.config.cjs';
    const config = require(configPath);
    const app = config.apps.find(a => a.name === 'aity-backend');
    app.script = '/root/aity-vip/current/backend/src/index.js';
    delete app.env.MAIL_ENABLED;
    delete app.env.MAIL_AUTO_PROCESS;
    const file = envFiles.aity;
    const e = dotenv.parse(fs.readFileSync(`${snapshot}/aity-production.env`));
    const flags = { MAIL_ENABLED: e.MAIL_ENABLED || 'false', MAIL_AUTO_PROCESS: e.MAIL_AUTO_PROCESS || 'true' };
    const lines = fs.readFileSync(file, 'utf8').split(/\r?\n/).filter(l => !/^\s*(MAIL_ENABLED|MAIL_AUTO_PROCESS)\s*=/.test(l));
    fs.writeFileSync(file, lines.join('\n').trimEnd() + '\n' + Object.entries(flags).map(([k,v]) => `${k}=${JSON.stringify(v)}`).join('\n') + '\n', { mode: 0o600 });
    fs.writeFileSync(configPath, 'module.exports = ' + JSON.stringify(config, null, 2) + ';\n', { mode: 0o600 });
    run('pm2', ['delete', 'aity-backend']);
    run('pm2', ['start', configPath, '--only', 'aity-backend', '--update-env']);
    run('pm2', ['save']);
    fs.writeFileSync(`${root}/production-started`, new Date().toISOString());
    console.log('TARGET_PRODUCTION_STARTED_GATEWAY_STILL_MAINTENANCE');
  } else if (action === 'open') {
    if (!fs.existsSync(`${root}/production-started`)) throw Error('Production marker missing');
    gatewayFile(`${root}/Caddyfile.live`);
    fs.writeFileSync(`${root}/opened`, new Date().toISOString());
    console.log('TARGET_GATEWAY_OPEN');
  } else { throw Error('Unknown action'); }
} catch (err) { console.error(err.code || err.message); process.exitCode = 1; }
