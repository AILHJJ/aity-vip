// Restore into a fresh target only; never run against the source host.
const fs = require('node:fs');
const path = require('node:path');
const cp = require('node:child_process');
const crypto = require('node:crypto');
process.umask(0o077);
const stamp = process.argv[2];
if (!/^\d{8}T\d{6}Z$/.test(stamp || '')) throw Error('Invalid timestamp');
const backup = `/root/aity-migration/${stamp}`;
const stage = `${backup}/extracted`;
const manifest = JSON.parse(fs.readFileSync(`${backup}/manifest.json`));
const run = (bin, args, options = {}) => {
  const result = cp.spawnSync(bin, args, { encoding: 'utf8', timeout: 120000, maxBuffer: 4 * 1024 * 1024, ...options });
  if (result.status !== 0) {
    fs.writeFileSync(`${backup}/restore-error.log`, result.stderr || result.error?.code || '', { mode: 0o600 });
    throw Error(`Command failed: ${path.basename(bin)}; inspect protected restore-error.log`);
  }
  return result.stdout;
};
const sql = (text) => run('mysql', ['--default-character-set=utf8mb4', '-N', '-B'], { input: text });
const qi = (s) => '`' + s.replace(/`/g, '``') + '`';
const qs = (s) => "'" + s.replace(/\\/g, '\\\\').replace(/'/g, "''") + "'";

try {
  for (const f of manifest.files) {
    const actual = crypto.createHash('sha256').update(fs.readFileSync(`${backup}/${f.file}`)).digest('hex');
    if (actual !== f.sha256) throw Error(`Checksum mismatch: ${f.file}`);
  }
  for (const database of manifest.databases) {
    if (sql(`SELECT COUNT(*) FROM information_schema.schemata WHERE schema_name=${qs(database.schema)};`).trim() !== '0') throw Error('Target schema already exists; refusing to overwrite');
  }
  if (fs.existsSync('/root/aity-vip') || fs.existsSync('/root/ai-expo')) throw Error('Application directories exist; refusing to overwrite');
  const members = run('tar', ['-tzf', `${backup}/site-state.tar.gz`]).split('\n').filter(Boolean);
  if (members.some(p => p.startsWith('/') || p.split('/').includes('..'))) throw Error('Unsafe archive member');
  fs.mkdirSync(stage, { mode: 0o700 });
  run('tar', ['-xzf', `${backup}/site-state.tar.gz`, '-C', stage]);
  for (const name of ['aity-vip', 'ai-expo']) fs.cpSync(`${stage}/root/${name}`, `/root/${name}`, { recursive: true, verbatimSymlinks: true });
  const copyEnv = (name, file) => {
    const original = fs.readFileSync(file, 'utf8');
    fs.writeFileSync(`${backup}/${name}-production.env`, original, { mode: 0o600 });
    // Runtime credentials and encryption secrets stay unchanged; only migration safety flags differ.
    const flags = name === 'aity' ? { HOST: '127.0.0.1', MAIL_ENABLED: 'false', MAIL_AUTO_PROCESS: 'false' } : { HOST: '127.0.0.1' };
    const lines = original.split(/\r?\n/).filter(line => !Object.keys(flags).some(k => new RegExp(`^\\s*${k}\\s*=`).test(line)));
    fs.writeFileSync(file, lines.join('\n').trimEnd() + '\n' + Object.entries(flags).map(([k,v]) => `${k}=${v}`).join('\n') + '\n', { mode: 0o600 });
  };
  copyEnv('aity', '/root/aity-vip/shared/backend.env');
  copyEnv('ai-expo', '/root/ai-expo/shared/server.env');
  for (const dir of ['/root/aity-vip/shared/logs', '/root/ai-expo/shared/logs']) fs.mkdirSync(dir, { recursive: true, mode: 0o700 });
  for (const d of manifest.databases) {
    const dump = run('gzip', ['-dc', `${backup}/${d.dump}`]);
    sql(dump);
    const expectedTables = d.tables.length;
    const actualTables = Number(sql(`SELECT COUNT(*) FROM information_schema.tables WHERE table_schema=${qs(d.schema)};`).trim());
    if (actualTables !== expectedTables) throw Error(`Table count mismatch: ${d.service}`);
    for (const [table, count] of Object.entries(d.counts)) {
      const actual = Number(sql(`SELECT COUNT(*) FROM ${qi(d.schema)}.${qi(table)};`).trim());
      if (actual !== Number(count)) throw Error(`Row count mismatch: ${d.service}.${table}`);
    }
    console.log(JSON.stringify({ restored: d.service, tables: actualTables, rowCounts: 'matched' }));
  }
  fs.mkdirSync('/srv/aity-h5', { mode: 0o755 });
  fs.cpSync(`${stage}/www/wwwroot/www.aity88.online`, '/srv/aity-h5', { recursive: true, verbatimSymlinks: true });
  console.log('TARGET_RESTORED_DATABASES_AND_FILES');
} catch (err) { console.error(err.code || err.message); process.exitCode = 1; }
