const { NodeSSH } = require('node-ssh');
const fs = require('fs');
const path = require('path');

const ssh = new NodeSSH();
const pk = fs.readFileSync(path.join(__dirname, '..', 'AITY0127.pem'), 'utf8');

async function deploy() {
  await ssh.connect({ host: '124.221.119.134', username: 'root', privateKey: pk, readyTimeout: 30000 });
  console.log('SSH连接成功');

  // 清理并克隆
  console.log('正在克隆 develop 分支（预计1-3分钟）...');
  const clone = await ssh.execCommand('rm -rf /root/aity-vip && git clone -b develop https://${GITHUB_TOKEN}@github.com/AILHJJ/aity-vip.git /root/aity-vip 2>&1 | tail -3', { timeout: 600000 });
  console.log(clone.stdout);

  // 安装依赖
  console.log('安装依赖...');
  const install = await ssh.execCommand('cd /root/aity-vip/backend && npm install --production 2>&1 | tail -3', { timeout: 120000 });
  console.log(install.stdout);

  // 停止旧进程，启动新进程
  console.log('启动PM2...');
  await ssh.execCommand('pm2 delete aity-backend 2>/dev/null; cd /root/aity-vip/backend && pm2 start src/index.js --name aity-backend --env production && sleep 2');

  // 验证
  const health = await ssh.execCommand('curl -s http://localhost:3001/api/health');
  console.log('Health:', health.stdout);

  console.log('部署完成');
  ssh.dispose();
}

deploy().catch(e => console.error('失败:', e.message));
