const { NodeSSH } = require('node-ssh');
const fs = require('fs');
const ssh = new NodeSSH();
const pk = fs.readFileSync(__dirname + '/../AITY0127.pem', 'utf8');

(async () => {
  await ssh.connect({ host: '124.221.119.134', username: 'root', privateKey: pk, readyTimeout: 15000 });

  // 检查新旧两个目录
  const r1 = await ssh.execCommand('ls /root/aity-vip/backend/uploads/images/ 2>&1 | head -5');
  console.log('旧目录图片:\n' + r1.stdout);
  const r2 = await ssh.execCommand('ls /root/aity-vip-new/uploads/images/ 2>&1 | head -5');
  console.log('新目录图片:\n' + r2.stdout);

  // 拷贝图片到新目录
  console.log('\n拷贝图片到新目录...');
  const cpResult = await ssh.execCommand(
    `mkdir -p /root/aity-vip-new/uploads && cp -r /root/aity-vip/backend/uploads/* /root/aity-vip-new/uploads/ 2>&1 && echo DONE`
  );
  console.log('拷贝结果: ' + cpResult.stdout);
  if (cpResult.stderr) console.error(cpResult.stderr);

  // 验证
  const r3 = await ssh.execCommand('ls /root/aity-vip-new/uploads/images/ 2>&1 | wc -l');
  console.log('\n新目录图片数量: ' + r3.stdout.trim());
  const total = await ssh.execCommand('du -sh /root/aity-vip-new/uploads/');
  console.log('新目录大小: ' + total.stdout.trim());

  // 重启后端（让新的 express static 配置生效）
  console.log('\n重启后端...');
  await ssh.execCommand('pm2 restart aity-vip');
  console.log('重启完成');

  ssh.dispose();
})().catch(e => { console.error(e.message); process.exit(1); });
