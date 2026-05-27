const { NodeSSH } = require('node-ssh');
const fs = require('fs');
const ssh = new NodeSSH();
const pk = fs.readFileSync(__dirname + '/../AITY0127.pem', 'utf8');

(async () => {
  await ssh.connect({ host: '124.221.119.134', username: 'root', privateKey: pk, readyTimeout: 15000 });

  // 直接查数据库获取图片 URL
  console.log('=== 查询有图片的消息 ===');
  const messages = await ssh.execCommand(
    'cd /root/aity-vip-new && node -e "const db=require(\\'./models\\'); (async()=>{const ms=await db.Message.findAll({where:{},limit:5,order:[[\\'id\\',\\'DESC\\']]});for(const m of ms){const data=m.toJSON();console.log(\\'ID:\\'+data.id+\\' images:\\'+JSON.stringify(data.attachments?data.attachments.filter(a=>a.type===\\'image\\').map(a=>a.url):[]))}})()" 2>&1'
  );
  console.log(messages.stdout);
  if (messages.stderr) console.error('STDERR:', messages.stderr.substring(0, 500));

  // 测试一个具体图片
  console.log('\n=== 测试具体图片文件 ===');
  const imgFiles = await ssh.execCommand('ls -la /root/aity-vip-new/uploads/images/ | head -20');
  console.log(imgFiles.stdout);

  ssh.dispose();
})().catch(e => { console.error(e.message); process.exit(1); });
