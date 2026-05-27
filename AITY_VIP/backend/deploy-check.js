const { NodeSSH } = require('node-ssh');
const fs = require('fs');
const path = require('path');

const ssh = new NodeSSH();
const privateKey = fs.readFileSync(path.join(__dirname, '..', 'AITY0127.pem'), 'utf8');

async function check() {
  await ssh.connect({ host: '124.221.119.134', username: 'root', privateKey, readyTimeout: 15000 });
  
  // 检查代码文件
  const r1 = await ssh.execCommand('cat /root/aity-vip/backend/src/controllers/messageTypeController.js | grep -n "replacementType" | head -5');
  console.log('replacementType 引用:', r1.stdout || '未找到');
  
  const r2 = await ssh.execCommand('cat /root/aity-vip/backend/src/controllers/messageTypeController.js | grep -n "reassign" | head -5');
  console.log('reassign 引用:', r2.stdout || '未找到');
  
  const r3 = await ssh.execCommand('cd /root/aity-vip/backend && git log --oneline -5 2>&1');
  console.log('Git 日志:\n', r3.stdout);
  
  const r4 = await ssh.execCommand('cd /root/aity-vip/backend && git branch 2>&1');
  console.log('当前分支:', r4.stdout);
  
  ssh.dispose();
}

check().catch(e => console.error('Error:', e.message));
