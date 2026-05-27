const { NodeSSH } = require('node-ssh');
const fs = require('fs');
const path = require('path');
const ssh = new NodeSSH();
const pk = fs.readFileSync(path.join(__dirname, '../AITY0127.pem'), 'utf8');

(async () => {
  await ssh.connect({ host: '124.221.119.134', username: 'root', privateKey: pk, readyTimeout: 15000 });

  // 写一个临时脚本到服务器
  const script = `
const db = require('./models');
(async () => {
  const msgs = await db.Message.findAll({ limit: 5, order: [['id', 'DESC']] });
  for (const m of msgs) {
    const data = m.toJSON();
    const imgs = (data.attachments || []).filter(a => a.type === 'image').map(a => ({ url: a.url }));
    if (imgs.length > 0) {
      console.log('Msg #' + data.id + ': ' + JSON.stringify(imgs));
    }
  }
  process.exit(0);
})();
`.trim();

  // 写文件到服务器
  const localTmp = path.join(__dirname, '_tmp_query.js');
  fs.writeFileSync(localTmp, script);
  // 放到 src/ 目录下，便于 require models
  await ssh.putFile(localTmp, '/root/aity-vip-new/src/_tmp_query.js');
  fs.unlinkSync(localTmp);

  // 运行查询
  const r = await ssh.execCommand('cd /root/aity-vip-new && node src/_tmp_query.js 2>&1');
  console.log('API 返回的图片 URL:\n' + r.stdout);
  if (r.stderr) console.error('STDERR: ' + r.stderr);

  // 测试图片是否存在
  const urls = r.stdout.match(/"\/uploads\/[^"]+"/g) || [];
  for (const url of urls) {
    const clean = url.replace(/"/g, '');
    const test = await ssh.execCommand(`test -f /root/aity-vip-new${clean} && echo "EXISTS" || echo "NOT FOUND"`);
    console.log(`${clean}: ${test.stdout.trim()}`);
  }

  await ssh.execCommand('rm -f /root/aity-vip-new/_tmp_query.js');
  ssh.dispose();
})().catch(e => { console.error(e.message); process.exit(1); });
