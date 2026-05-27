const { NodeSSH } = require('node-ssh');
const fs = require('fs');
const ssh = new NodeSSH();
const pk = fs.readFileSync(__dirname + '/../AITY0127.pem', 'utf8');

(async () => {
  await ssh.connect({ host: '124.221.119.134', username: 'root', privateKey: pk, readyTimeout: 15000 });

  // 获取 Nginx 配置
  console.log('=== Nginx 配置查找 ===');
  const configs = await ssh.execCommand('find /etc/nginx -name "*.conf" -path "*vip*" -o -path "*aity*" -o -path "*88*" 2>/dev/null | head -10');
  console.log(configs.stdout);
  
  // 读 Nginx 配置
  const nginx = await ssh.execCommand('cat /etc/nginx/conf.d/aity88.online.conf 2>/dev/null || cat /etc/nginx/sites-enabled/aity88.online 2>/dev/null || cat /etc/nginx/nginx.conf 2>/dev/null | head -80');
  console.log('\n=== Nginx 配置 ===\n' + nginx.stdout.substring(0, 2000));

  // 测试后端端口
  console.log('\n=== 测试后端端口 ===');
  const port = await ssh.execCommand('ss -tlnp | grep -E "300[01]" 2>&1');
  console.log(port.stdout);

  // 测试图片可达性（从服务器本地 curl）
  console.log('\n=== 测试图片 ===');
  const img = await ssh.execCommand('ls /root/aity-vip-new/uploads/images/ | tail -1');
  if (img.stdout.trim()) {
    const test = await ssh.execCommand(`curl -s -o /dev/null -w "%{http_code} %{size_download}" http://localhost:3001/uploads/images/${img.stdout.trim()} 2>&1`);
    console.log(`本地后端: ${test.stdout}`);
    const test2 = await ssh.execCommand(`curl -s -o /dev/null -w "%{http_code}" --max-time 5 https://aity88.online/uploads/images/${img.stdout.trim()} 2>&1`);
    console.log(`通过 Nginx: ${test2.stdout}`);
  }

  ssh.dispose();
})().catch(e => { console.error(e.message); process.exit(1); });
