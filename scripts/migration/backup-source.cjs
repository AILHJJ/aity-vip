// Run on the old host only. Credentials and backups must never enter Git.
const fs = require('node:fs');
const path = require('node:path');
const cp = require('node:child_process');
const crypto = require('node:crypto');
const dotenv = require('/root/aity-vip/current/backend/node_modules/dotenv');
const mysql = require('/root/aity-vip/current/backend/node_modules/mysql2/promise');

process.umask(0o077);
const stamp = process.argv[2];
if (!/^\d{8}T\d{6}Z$/.test(stamp || '')) throw Error('Invalid backup timestamp');
const out = `/root/aity-migration/${stamp}`;
if (fs.existsSync(out)) throw Error('Backup exists; use a new timestamp');
fs.mkdirSync(out, { recursive: true, mode: 0o700 });
const quote = (v) => `"${String(v).replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n').replace(/\r/g, '\\r')}"`;
const hash = (file) => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const manifest = { stamp, createdAt: new Date().toISOString(), databases: [], files: [] };

async function backupDatabase(service, envFile) {
  const e = dotenv.parse(fs.readFileSync(envFile));
  const schema = e.DB_NAME || (e.DB_ENV === 'production' ? '\u6295\u7814\u56fe\u7075\u5ba4' : '\u6295\u7814\u56fe\u7075\u5ba4_test');
  const db = await mysql.createConnection({ host: e.DB_HOST || 'localhost', port: Number(e.DB_PORT || 3306), user: e.DB_USER, password: e.DB_PASSWORD, database: schema, connectTimeout: 10000 });
  let entry;
  try {
    const [server] = await db.query('SELECT VERSION() AS version, @@sql_mode AS sqlMode, @@time_zone AS timeZone, @@character_set_server AS charset');
    const [tables] = await db.query('SELECT table_name AS name, engine, table_type AS type FROM information_schema.tables WHERE table_schema=DATABASE() ORDER BY table_name');
    const [schemaInfo] = await db.query('SELECT default_character_set_name AS charset, default_collation_name AS collation FROM information_schema.schemata WHERE schema_name=DATABASE()');
    const counts = {};
    for (const table of tables) {
      const [rows] = await db.query(`SELECT COUNT(*) AS count FROM ${db.escapeId(table.name)}`);
      counts[table.name] = rows[0].count;
    }
    const [routines] = await db.query('SELECT routine_name AS name FROM information_schema.routines WHERE routine_schema=DATABASE()');
    const [events] = await db.query('SELECT event_name AS name FROM information_schema.events WHERE event_schema=DATABASE()');
    entry = { service, schema, server: server[0], schemaInfo: schemaInfo[0], tables, counts, routines, events };
    if (tables.some(t => t.type === 'BASE TABLE' && t.engine !== 'InnoDB')) throw Error('Nontransactional table needs a separate backup plan');
  } finally { await db.end(); }
  const cnf = path.join(out, `${service}-client.cnf`);
  const sql = path.join(out, `${service}.sql`);
  fs.writeFileSync(cnf, `[client]\nhost=${quote(e.DB_HOST || 'localhost')}\nport=${Number(e.DB_PORT || 3306)}\nuser=${quote(e.DB_USER)}\npassword=${quote(e.DB_PASSWORD || '')}\n`, { mode: 0o600 });
  const fd = fs.openSync(sql, 'wx', 0o600);
  try {
    const args = [`--defaults-extra-file=${cnf}`, '--single-transaction', '--skip-lock-tables', '--quick', '--hex-blob', '--default-character-set=utf8mb4', '--set-gtid-purged=OFF', '--triggers'];
    if (entry.routines.length) args.push('--routines');
    if (entry.events.length) args.push('--events');
    args.push('--databases', schema);
    const result = cp.spawnSync('/usr/bin/mysqldump', args, { stdio: ['ignore', fd, 'pipe'], timeout: 120000 });
    if (result.status !== 0) {
      fs.writeFileSync(path.join(out, `${service}-dump-error.log`), result.stderr || '', { mode: 0o600 });
      throw Error(`Database dump failed for ${service}; inspect protected error log`);
    }
  } finally { fs.closeSync(fd); fs.unlinkSync(cnf); }
  const zipped = cp.spawnSync('gzip', ['-n', sql], { timeout: 120000 });
  if (zipped.status !== 0) throw Error('Compression failed');
  entry.dump = `${service}.sql.gz`;
  entry.sha256 = hash(`${sql}.gz`);
  manifest.databases.push(entry);
  console.log(JSON.stringify({ service, schema, tables: entry.tables.length, routines: entry.routines.length, events: entry.events.length, sha256: entry.sha256 }));
}

(async () => {
  await backupDatabase('aity', '/root/aity-vip/shared/backend.env');
  await backupDatabase('ai-expo', '/root/ai-expo/shared/server.env');
  const aity = fs.realpathSync('/root/aity-vip/current');
  const ai = fs.realpathSync('/root/ai-expo/current');
  if (!/^\/root\/aity-vip\/releases\/[a-f0-9]+$/.test(aity) || !/^\/root\/ai-expo\/releases\/[a-f0-9]+$/.test(ai)) throw Error('Unexpected release paths');
  manifest.releases = { aity, ai };
  const inputs = [aity, ai, '/root/aity-vip/current', '/root/aity-vip/shared', '/root/ai-expo/current', '/root/ai-expo/shared', '/root/ai-expo/manage.sh', '/www/wwwroot/www.aity88.online', '/www/server/panel/vhost/nginx', '/www/server/nginx/conf', '/etc/nginx/ssl', '/root/.acme.sh', '/var/spool/cron/root', '/www/server/cron'].filter(p => fs.existsSync(p));
  manifest.archiveInputs = inputs;
  const archive = path.join(out, 'site-state.tar.gz');
  const tar = cp.spawnSync('tar', ['-czf', archive, '--exclude=node_modules', '--exclude=logs', '--exclude=.git', '--exclude=shared/backups', '-C', '/', ...inputs.map(p => p.slice(1))], { timeout: 180000, maxBuffer: 1024 * 1024 });
  if (tar.status !== 0) {
    fs.writeFileSync(path.join(out, 'tar-error.log'), tar.stderr || '', { mode: 0o600 });
    throw Error('Site archive failed; inspect protected error log');
  }
  for (const file of ['aity.sql.gz', 'ai-expo.sql.gz', 'site-state.tar.gz']) manifest.files.push({ file, bytes: fs.statSync(path.join(out, file)).size, sha256: hash(path.join(out, file)) });
  fs.writeFileSync(path.join(out, 'manifest.json'), JSON.stringify(manifest, null, 2), { mode: 0o600 });
  fs.writeFileSync(path.join(out, 'sha256.txt'), manifest.files.map(f => `${f.sha256}  ${f.file}`).join('\n') + '\n', { mode: 0o600 });
  console.log(JSON.stringify({ backup: out, files: manifest.files }));
})().catch(err => { console.error(err.code || err.message); process.exitCode = 1; });
