const fs = require('node:fs');
const cp = require('node:child_process');
const crypto = require('node:crypto');
const { pathToFileURL } = require('node:url');
const dotenv = require('/root/aity-vip/current/backend/node_modules/dotenv');
const mysql = require('/root/aity-vip/current/backend/node_modules/mysql2/promise');
const jwt = require('/root/aity-vip/current/backend/node_modules/jsonwebtoken');
const nodemailer = require('/root/aity-vip/current/backend/node_modules/nodemailer');
const stamp = process.argv[2];
if (!/^\d{8}T\d{6}Z$/.test(stamp || '')) throw Error('Invalid timestamp');
const backup = `/root/aity-migration/${stamp}`;
const summary = [];
function check(name, condition, detail) {
  summary.push({ name, passed: Boolean(condition), ...(detail === undefined ? {} : { detail }) });
  if (!condition) throw Error(`Verification failed: ${name}`);
}
async function http(name, url, token, expected = 200) {
  const result = await fetch(url, { headers: token ? { Authorization: `Bearer ${token}` } : {}, signal: AbortSignal.timeout(15000) });
  const text = await result.text();
  let json;
  try { json = JSON.parse(text); } catch { /* HTML and binary responses are checked elsewhere. */ }
  check(name, result.status === expected && (!json || json.code === undefined || json.code === 200 || expected !== 200), { status: result.status });
  return json;
}
function curl(url, output) {
  const result = cp.spawnSync('curl', ['-fsS', '--max-time', '15', '--resolve', 'aity88.online:443:127.0.0.1', ...(output ? ['-o', output] : []), url], { encoding: 'utf8', timeout: 20000 });
  check(`HTTPS ${new URL(url).pathname}`, result.status === 0);
  return result.stdout;
}
(async () => {
  const e = dotenv.parse(fs.readFileSync('/root/aity-vip/shared/backend.env'));
  const old = dotenv.parse(fs.readFileSync(`${backup}/aity-production.env`));
  check('AITY JWT and encryption configuration preserved', ['JWT_SECRET', 'ENCRYPTION_KEY', 'AGENT_CONFIG_ENCRYPTION_KEY'].every(k => e[k] === old[k]));
  check('Staging mail disabled', e.MAIL_ENABLED === 'false' && e.MAIL_AUTO_PROCESS === 'false');
  const db = await mysql.createConnection({ host: e.DB_HOST, user: e.DB_USER, password: e.DB_PASSWORD, database: e.DB_NAME });
  try {
    const [admins] = await db.query("SELECT id, email, role FROM users WHERE role IN ('admin','super_admin') AND status='active' ORDER BY id LIMIT 1");
    check('Existing active administrator restored', admins.length === 1);
    const admin = admins[0];
    const token = jwt.sign({ userId: admin.id, email: admin.email, role: admin.role }, e.JWT_SECRET, { expiresIn: '5m' });
    for (const endpoint of ['/api/messages?page=1&limit=5', '/api/discussions?page=1&limit=5', '/api/users?page=1&limit=5', '/api/messages/unread-count', '/api/messages/notifications/status']) await http(endpoint.split('?')[0], `http://127.0.0.1:3001${endpoint}`, token);
    await http('Missing session refused', 'http://127.0.0.1:3001/api/messages', null, 401);
    const [images] = await db.query('SELECT id, filename, discussion_id AS discussionId FROM discussion_images WHERE discussion_id IS NOT NULL LIMIT 1');
    if (images.length) {
      const image = images[0];
      const policy = require('/root/aity-vip/current/backend/src/utils/discussionImagePolicy');
      const expires = Math.floor(Date.now() / 1000) + 120;
      const signature = policy.createImageSignature({ discussionId: image.discussionId, imageId: image.id, expiresAt: expires, key: e.JWT_SECRET });
      const res = await fetch(`http://127.0.0.1:3001/api/discussions/images/${image.id}?discussionId=${image.discussionId}&expires=${expires}&signature=${signature}`);
      const bytes = Buffer.from(await res.arrayBuffer());
      check('Private discussion image signed access', res.status === 200 && bytes.equals(fs.readFileSync(`/root/aity-vip/shared/uploads/discussion-images/${image.filename}`)));
    } else { summary.push({ name: 'Private discussion image signed access', skipped: 'No existing attached discussion images in production snapshot' }); }
  } finally { await db.end(); }
  const ai = dotenv.parse(fs.readFileSync('/root/ai-expo/shared/server.env'));
  const aiOld = dotenv.parse(fs.readFileSync(`${backup}/ai-expo-production.env`));
  check('AI experience authentication and encryption preserved', ['JWT_SECRET', 'ENCRYPTION_KEY', 'WECHAT_APP_ID', 'WECHAT_APP_SECRET'].every(k => ai[k] === aiOld[k]));
  await http('AI capability list', 'http://127.0.0.1:3008/ai-experience-api/api/capabilities');
  const aiDb = await mysql.createConnection({ host: ai.DB_HOST, user: ai.DB_USER, password: ai.DB_PASSWORD, database: ai.DB_NAME });
  try {
    const [users] = await aiDb.query('SELECT id FROM users LIMIT 1');
    if (users.length) {
      const security = await import(pathToFileURL('/root/ai-expo/current/server/src/security.js').href);
      const token = security.signSession(users[0].id, ai.JWT_SECRET);
      await http('AI restored user session', 'http://127.0.0.1:3008/ai-experience-api/api/me', token);
    } else { summary.push({ name: 'AI restored user session', skipped: 'No existing users; real wx.login still needs device validation' }); }
  } finally { await aiDb.end(); }
  for (const endpoint of ['/api/health', '/ai-experience-api/health', '/ai-experience-api/api/capabilities']) curl(`https://aity88.online${endpoint}`);
  const html = curl('https://aity88.online/');
  check('H5 index and asset links served', /<html/i.test(html));
  const assets = [...html.matchAll(/(?:src|href)=["'](\/assets\/[^"']+)["']/g)].map(m => m[1]);
  for (const asset of assets.slice(0, 4)) curl(`https://aity88.online${asset}`, '/dev/null');
  const sourceUploads = `${backup}/extracted/root/aity-vip/shared/uploads`;
  let fileCount = 0;
  const hash = p => crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
  function walk(dir, relative = '') {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const rel = `${relative}${entry.name}`;
      if (entry.isDirectory()) walk(`${dir}/${entry.name}`, rel + '/');
      else if (entry.isFile()) {
        if (hash(`${sourceUploads}/${rel}`) !== hash(`/root/aity-vip/shared/uploads/${rel}`)) throw Error('Upload hash mismatch');
        fileCount++;
      }
    }
  }
  walk(sourceUploads);
  check('All upload files match snapshot SHA256', true, { files: fileCount });
  if (old.SMTP_HOST && old.SMTP_USER && old.SMTP_PASS) {
    const transport = nodemailer.createTransport({ host: old.SMTP_HOST, port: Number(old.SMTP_PORT || 465), secure: old.SMTP_SECURE !== 'false', auth: { user: old.SMTP_USER, pass: old.SMTP_PASS }, connectionTimeout: 10000, greetingTimeout: 10000, socketTimeout: 15000 });
    try { await transport.verify(); check('SMTP authentication without sending mail', true); }
    catch (err) { summary.push({ name: 'SMTP authentication without sending mail', passed: false, code: err.code || 'SMTP_ERROR' }); }
    finally { transport.close(); }
  }
  fs.writeFileSync(`${backup}/verification.json`, JSON.stringify({ at: new Date().toISOString(), results: summary }, null, 2), { mode: 0o600 });
  console.log(JSON.stringify(summary, null, 2));
  if (summary.some(item => item.passed === false)) process.exitCode = 1;
})().catch(err => { console.error(err.code || err.message); console.log(JSON.stringify(summary)); process.exitCode = 1; });
