const { NodeSSH } = require('node-ssh');
const fs = require('fs');
const path = require('path');

const ssh = new NodeSSH();
const privateKey = fs.readFileSync(path.join(__dirname, '..', 'AITY0127.pem'), 'utf8');

async function check() {
  await ssh.connect({ host: '124.221.119.134', username: 'root', privateKey, readyTimeout: 15000 });
  
  console.log('=== PM2 进程信息 ===');
  const pm2info = await ssh.execCommand('pm2 show aity-backend');
  console.log(pm2info.stdout);
  
  console.log('\n=== 查找后端代码 ===');
  const find = await ssh.execCommand('find / -name "index.js" -path "*/backend/src/*" 2>/dev/null | head -5');
  console.log(find.stdout);
  
  console.log('\n=== 查找 package.json ===');
  const pkg = await ssh.execCommand('find / -name "package.json" -path "*aity*" -not -path "*/node_modules/*" 2>/dev/null | head -10');
  console.log(pkg.stdout);
  
  ssh.dispose();
}

check().catch(e => console.error('Error:', e.message));
