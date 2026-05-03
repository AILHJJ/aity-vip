const { NodeSSH } = require('node-ssh');
const fs = require('fs');
const path = require('path');

const ssh = new NodeSSH();
const privateKey = fs.readFileSync(path.join(__dirname, '..', 'AITY0127.pem'), 'utf8');

async function deploy() {
  await ssh.connect({ host: '124.221.119.134', username: 'root', privateKey, readyTimeout: 15000 });
  console.log('SSH 连接成功');

  // 停掉之前慢的克隆进程
  await ssh.execCommand('pkill -f "git clone.*aity-vip" 2>/dev/null; echo DONE');

  // 用 git pull 更新 develop 分支
  console.log('更新代码 (git pull)...');
  const r1 = await ssh.execCommand('cd /root/aity-vip/backend && git fetch origin && git checkout develop && git pull origin develop 2>&1 | tail -5');
  console.log(r1.stdout);

  // 安装依赖
  console.log('安装依赖...');
  const r2 = await ssh.execCommand('cd /root/aity-vip/backend && npm install --production 2>&1 | tail -5');
  console.log(r2.stdout);

  // 重启
  console.log('重启PM2...');
  await ssh.execCommand('cd /root/aity-vip/backend && pm2 restart aity-backend --env production && sleep 2');
  
  // 验证
  console.log('验证服务...');
  const health = await ssh.execCommand('curl -s http://localhost:3001/api/health');
  console.log('Health:', health.stdout);

  console.log('部署完成');
  ssh.dispose();
}

deploy().catch(e => console.error('失败:', e.message));
