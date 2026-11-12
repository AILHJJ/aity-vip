const fs = require('node:fs');
const cp = require('node:child_process');
const crypto = require('node:crypto');
const dotenv = require('/root/aity-vip/current/backend/node_modules/dotenv');
const mysql = require('/root/aity-vip/current/backend/node_modules/mysql2/promise');
process.umask(0o077);
const stamp = process.argv[2];
if (!/^\d{8}T\d{6}Z$/.test(stamp || '')) throw Error('Invalid timestamp');
const backup = `/root/aity-migration/${stamp}`;
const manifest = JSON.parse(fs.readFileSync(`${backup}/manifest.json`));

async function accounts() {
  for (const [name, file] of [['aity', '/root/aity-vip/shared/backend.env'], ['ai-expo', '/root/ai-expo/shared/server.env']]) {
    const e = dotenv.parse(fs.readFileSync(file));
    e.DB_NAME ||= manifest.databases.find(d => d.service === name)?.schema;
    if (!e.DB_NAME) throw Error('Explicit database name required');
    let user = e.DB_USER;
    let password = e.DB_PASSWORD;
    if (!user || user === 'root') { user = `${name.replace('-', '_')}_app`; password = crypto.randomBytes(32).toString('hex'); }
    if (typeof user !== 'string' || [...user].length > 32 || /[\x00-\x1f]/.test(user) || !password) throw Error('Invalid database account configuration');
    const identifier = '`' + e.DB_NAME.replace(/`/g, '``') + '`';
    const account = `${mysql.escape(user)}@'localhost'`;
    const text = `CREATE USER IF NOT EXISTS ${account} IDENTIFIED BY ${mysql.escape(password)}; ALTER USER ${account} IDENTIFIED BY ${mysql.escape(password)}; GRANT ALL PRIVILEGES ON ${identifier}.* TO ${account};`;
    const result = cp.spawnSync('mysql', ['--default-character-set=utf8mb4'], { input: text, encoding: 'utf8', timeout: 15000 });
    if (result.status !== 0) { fs.writeFileSync(`${backup}/account-error.log`, result.stderr || '', { mode: 0o600 }); throw Error('Target account creation failed'); }
    const original = fs.readFileSync(file, 'utf8');
    const lines = original.split(/\r?\n/).filter(line => !/^\s*DB_(NAME|HOST|USER|PASSWORD)\s*=/.test(line));
    fs.writeFileSync(file, `${lines.join('\n').trimEnd()}\nDB_HOST=127.0.0.1\nDB_NAME=${JSON.stringify(e.DB_NAME)}\nDB_USER=${user}\nDB_PASSWORD=${JSON.stringify(password)}\n`, { mode: 0o600 });
    const db = await mysql.createConnection({ host: '127.0.0.1', user, password, database: e.DB_NAME, connectTimeout: 10000 });
    try { const [rows] = await db.query('SELECT VERSION() AS version'); console.log(JSON.stringify({ application: name, connection: 'ok', mysql: rows[0].version })); } finally { await db.end(); }
  }
}

(async () => {
  await accounts();
  const aiRelease = fs.realpathSync('/root/ai-expo/current').split('/').pop();
  const ecosystem = {
    apps: [
      { name: 'aity-backend', script: '/root/aity-migration/runtime/aity-staging.cjs', cwd: '/root/aity-vip/current/backend', instances: 1, exec_mode: 'cluster', interpreter: '/usr/bin/node', env: { NODE_ENV: 'production', TZ: 'Asia/Shanghai', HOST: '127.0.0.1', MAIL_ENABLED: 'false', MAIL_AUTO_PROCESS: 'false' }, time: true, max_memory_restart: '512M', out_file: '/root/aity-vip/shared/logs/pm2-out.log', error_file: '/root/aity-vip/shared/logs/pm2-error.log' },
      { name: 'ai-expo-api', script: '/root/ai-expo/current/server/src/index.js', cwd: '/root/ai-expo/current/server', instances: 1, exec_mode: 'fork', interpreter: '/usr/bin/node', node_args: '--env-file=/root/ai-expo/shared/server.env', env: { NODE_ENV: 'production', TZ: 'Asia/Shanghai', APP_RELEASE: aiRelease }, time: true, max_memory_restart: '512M', out_file: '/root/ai-expo/shared/logs/pm2-out.log', error_file: '/root/ai-expo/shared/logs/pm2-error.log' },
    ],
  };
  fs.mkdirSync('/root/aity-migration/runtime', { recursive: true, mode: 0o700 });
  // Import the exact production app without starting its bot/expiry bootstrap a second time.
  fs.writeFileSync('/root/aity-migration/runtime/aity-staging.cjs', "const app = require('/root/aity-vip/current/backend/src/index.js'); app.listen(3001, '127.0.0.1', () => console.log('Migration staging ready; production background bootstrap disabled'));\n", { mode: 0o600 });
  fs.writeFileSync('/root/aity-migration/runtime/ecosystem.config.cjs', 'module.exports = ' + JSON.stringify(ecosystem, null, 2) + ';\n', { mode: 0o600 });
  const started = cp.spawnSync('pm2', ['startOrReload', '/root/aity-migration/runtime/ecosystem.config.cjs', '--update-env'], { stdio: 'inherit', timeout: 30000 });
  if (started.status !== 0) throw Error('PM2 startup failed');
  console.log('TARGET_APPS_STARTED_WITH_EMAIL_DISABLED');
})().catch(err => { console.error(err.code || err.message); process.exitCode = 1; });
