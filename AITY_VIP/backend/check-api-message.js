const { NodeSSH } = require('node-ssh');
const fs = require('fs');
const path = require('path');
const ssh = new NodeSSH();
const pk = fs.readFileSync(path.join(__dirname, '../AITY0127.pem'), 'utf8');

(async () => {
  await ssh.connect({ host: '124.221.119.134', username: 'root', privateKey: pk, readyTimeout: 15000 });

  // 通过 API 获取消息详情（免认证方式）
  const r = await ssh.execCommand(
    `curl -s http://localhost:3001/api/messages/49 2>&1 | python3 -c "
import sys,json
d = json.load(sys.stdin)
data = d.get('data', {})
print('ID:', data.get('id'))
print('Title:', data.get('title'))
print('Attachments count:', len(data.get('attachments') or []))
for a in (data.get('attachments') or []):
    if a.get('type') == 'image':
        print('Image URL:', repr(a.get('url')))
print('Images array:', data.get('images'))
" 2>&1`
  );
  console.log(r.stdout);
  if (r.stderr) console.error('ERR:', r.stderr.substring(0, 500));

  // 直接用 python 测试图片 URL 是否可达
  console.log('\n=== 测试图片实际可达性 ===');
  const test = await ssh.execCommand(
    `curl -s -o /dev/null -w "%{http_code} %{size_download}" --max-time 5 https://aity88.online/uploads/images/img-1777823200596-i9cuhg54yv.png 2>&1`
  );
  console.log('HTTPS 图片: ' + test.stdout);

  ssh.dispose();
})().catch(e => { console.error(e.message); process.exit(1); });
