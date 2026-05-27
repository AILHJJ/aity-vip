const { NodeSSH } = require('node-ssh');
const fs = require('fs');
const path = require('path');
const ssh = new NodeSSH();
const pk = fs.readFileSync(path.join(__dirname, '../AITY0127.pem'), 'utf8');

(async () => {
  await ssh.connect({ host: '124.221.119.134', username: 'root', privateKey: pk, readyTimeout: 15000 });

  // 直接查 MySQL 获取附件信息
  const r = await ssh.execCommand(
    `mysql -uroot -p\$(grep DB_PASSWORD /root/aity-vip-new/.env.production | cut -d= -f2) aity_db -e "SELECT id, LEFT(attachments, 300) as att FROM messages WHERE attachments IS NOT NULL AND attachments != '[]' ORDER BY id DESC LIMIT 5;" 2>&1`
  );
  console.log('=== 数据库中的附件 ===\n' + r.stdout);

  // 检查上传目录中有哪些图片
  console.log('\n=== 服务器上传目录 ===');
  const r2 = await ssh.execCommand('ls -la /root/aity-vip-new/uploads/images/ | wc -l && ls -la /root/aity-vip-new/uploads/images/ | tail -5');
  console.log(r2.stdout);

  ssh.dispose();
})().catch(e => { console.error(e.message); process.exit(1); });
