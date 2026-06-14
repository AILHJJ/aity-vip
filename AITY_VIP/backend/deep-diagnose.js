const { NodeSSH } = require('node-ssh');
const path = require('path');

const ssh = new NodeSSH();

const SERVER = {
  host: '124.221.119.134',
  username: 'root',
  port: 22,
  privateKeyPath: path.join('C:\\Users\\DELL\\Downloads', 'AITY0127.pem')
};

async function deepDiagnose() {
  console.log('==========================================');
  console.log('  Deep Nginx Configuration Analysis');
  console.log('==========================================\n');

  try {
    await ssh.connect({
      host: SERVER.host,
      username: SERVER.username,
      port: SERVER.port,
      privateKeyPath: SERVER.privateKeyPath,
      readyTimeout: 30000
    });

    console.log('[✓] Connected\n');

    // 1. Get full nginx config and search for aity88 or port 3001
    console.log('[1] Searching for aity88.online or backend proxy config...');
    const configSearch = await ssh.execCommand(
      "nginx -T 2>&1 | grep -B5 -A10 'aity88\\|3001\\|proxy_pass.*3001\\|location /api'"
    );
    console.log(configSearch.stdout || 'No matching configuration found!');
    if (configSearch.stderr && !configSearch.stdout) {
      console.log('Error:', configResult.stderr);
    }
    console.log('');

    // 2. Check main nginx.conf includes
    console.log('[2] Checking nginx.conf include directives...');
    const includes = await ssh.execCommand(
      "grep -E 'include' /www/server/nginx/conf/nginx.conf 2>/dev/null || grep -E 'include' /etc/nginx/nginx.conf"
    );
    console.log(includes.stdout);
    console.log('');

    // 3. List ALL nginx conf files
    console.log('[3] Listing all Nginx configuration files...');
    const allConfigs = await ssh.execCommand(
      "find /www/server/nginx/conf /etc/nginx -name '*.conf' -type f 2>/dev/null | head -20"
    );
    console.log(allConfigs.stdout || 'No .conf files found');
    console.log('');

    // 4. Check if there's a default server block catching the request
    console.log('[4] Looking for default_server directive...');
    const defaultServer = await ssh.execCommand(
      "nginx -T 2>&1 | grep -B3 -A15 'default_server'"
    );
    console.log(defaultServer.stdout || 'No default_server found');
    console.log('');

    // 5. Test API endpoint directly (bypass nginx)
    console.log('[5] Testing backend API directly on port 3001...');
    const apiTest = await ssh.execCommand(
      "curl -s http://localhost:3001/api/health 2>/dev/null || echo 'API not responding on port 3001'"
    );
    console.log('Response:', apiTest.stdout || 'No response');
    console.log('');

    // 6. Check what ports are listening
    console.log('[6] Checking listening ports...');
    const ports = await ssh.execCommand("netstat -tlnp | grep -E '(80|443|3001)'");
    console.log(ports.stdout || 'No matching ports found');
    console.log('');

    ssh.dispose();
    
  } catch (err) {
    console.error('\n[ERROR]', err.message);
    try { ssh.dispose(); } catch(e) {}
    process.exit(1);
  }
}

deepDiagnose();
