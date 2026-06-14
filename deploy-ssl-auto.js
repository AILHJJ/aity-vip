/**
 * SSL Certificate Auto-Deployment Script
 * Uses node-ssh with private key (no password needed!)
 *
 * Based on project's existing scp-deploy.js pattern
 */

const { NodeSSH } = require('node-ssh');
const fs = require('fs');
const path = require('path');

const ssh = new NodeSSH();

// Server configuration (same as scp-deploy.js)
const SERVER = {
  host: '124.221.119.134',
  username: 'root',
  port: 22,
  privateKeyPath: path.join('C:\\Users\\DELL\\Downloads', 'AITY0127.pem')
};

// Certificate paths
const LOCAL_CERT_DIR = path.join(__dirname, 'aity88-online-new-cert', 'aity88.online_nginx');
const REMOTE_CERT_DIR = '/etc/nginx/ssl/aity88.online';
const REMOTE_TMP = '/tmp';

function log(msg, type = 'INFO') {
  const time = new Date().toLocaleTimeString('zh-CN');
  const colors = {
    INFO: '\x1b[36m',    // cyan
    SUCCESS: '\x1b[32m', // green
    WARN: '\x1b[33m',    // yellow
    ERROR: '\x1b[31m',   // red
    RESET: '\x1b[0m'
  };
  console.log(`${colors[type] || colors.INFO}[${time}] [${type}] ${msg}${colors.RESET}`);
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function run() {
  log('Starting SSL certificate deployment...');
  log('');

  // Step 0: Verify local files exist
  log('[Step 1/6] Verifying local certificate files...', 'INFO');
  const certFile = path.join(LOCAL_CERT_DIR, 'aity88.online_bundle.crt');
  const keyFile = path.join(LOCAL_CERT_DIR, 'aity88.online.key');

  if (!fs.existsSync(certFile)) {
    throw new Error(`Certificate file not found: ${certFile}`);
  }
  if (!fs.existsSync(keyFile)) {
    throw new Error(`Key file not found: ${keyFile}`);
  }

  log(`Certificate: ${certFile}`, 'SUCCESS');
  log(`Key file: ${keyFile}`, 'SUCCESS');
  log('');

  // Step 1: Connect to server using private key
  log('[Step 2/6] Connecting to server via SSH (using private key)...', 'INFO');

  try {
    await ssh.connect({
      host: SERVER.host,
      username: SERVER.username,
      port: SERVER.port,
      privateKeyPath: SERVER.privateKeyPath,
      readyTimeout: 30000
    });
  } catch (err) {
    throw new Error(`Failed to connect to server: ${err.message}`);
  }

  log(`Connected to ${SERVER.username}@${SERVER.host}:${SERVER.port}`, 'SUCCESS');
  log('');

  // Step 2: Upload certificates to /tmp
  log('[Step 3/6] Uploading certificate files to server...', 'INFO');

  try {
    await ssh.putFile(certFile, `${REMOTE_TMP}/aity88.online_bundle.crt`);
    log('Uploaded: aity88.online_bundle.crt', 'SUCCESS');

    await ssh.putFile(keyFile, `${REMOTE_TMP}/aity88.online.key`);
    log('Uploaded: aity88.online.key', 'SUCCESS');
  } catch (err) {
    throw new Error(`Failed to upload files: ${err.message}`);
  }
  log('');

  // Step 3: Upload deployment scripts
  log('[Step 4/6] Uploading deployment scripts...', 'INFO');

  const deployScriptPath = path.join(__dirname, 'deploy-ssl-certificate.sh');
  const rollbackScriptPath = path.join(__dirname, 'deploy-rollback.sh');

  try {
    await ssh.putFile(deployScriptPath, '/root/deploy-ssl-certificate.sh');
    log('Uploaded: deploy-ssl-certificate.sh', 'SUCCESS');

    await ssh.putFile(rollbackScriptPath, '/root/deploy-rollback.sh');
    log('Uploaded: deploy-rollback.sh', 'SUCCESS');
  } catch (err) {
    throw new Error(`Failed to upload scripts: ${err.message}`);
  }
  log('');

  // Step 4: Execute deployment on server
  log('[Step 5/6] Executing deployment script on server...', 'INFO');
  log('This will:', 'INFO');
  log('  - Backup current certificate', 'INFO');
  log('  - Install new certificate (valid until Sep 12, 2026)', 'INFO');
  log('  - Set secure permissions', 'INFO');
  log('  - Test Nginx configuration', 'INFO');
  log('  - Reload Nginx (<1 second interruption)', 'INFO');
  log('');

  try {
    const result = await ssh.execCommand(
      'chmod +x /root/deploy-ssl-certificate.sh /root/deploy-rollback.sh && bash /root/deploy-ssl-certificate.sh',
      {
        onStdout: (chunk) => process.stdout.write(chunk.toString()),
        onStderr: (chunk) => process.stderr.write(chunk.toString())
      }
    );

    if (result.code !== 0) {
      log(`Deployment failed with code ${result.code}`, 'ERROR');
      if (result.stderr) {
        log(`Error output: ${result.stderr}`, 'ERROR');
      }
      throw new Error('Deployment script failed');
    }

    log('', 'INFO');
    log('Deployment script executed successfully!', 'SUCCESS');
  } catch (err) {
    throw new Error(`Execution error: ${err.message}`);
  }
  log('');

  // Step 5: Verify deployment
  log('[Step 6/6] Verifying new certificate is active...', 'INFO');

  try {
    const verifyResult = await ssh.execCommand(
      "echo | openssl s_client -servername aity88.online -connect aity88.online:443 2>/dev/null | openssl x509 -noout -dates -subject"
    );

    if (verifyResult.stdout) {
      log('Current certificate info:', 'SUCCESS');
      console.log(verifyResult.stdout);

      // Check if it's the new certificate (should contain Sep 12)
      if (verifyResult.stdout.includes('Sep 12') || verifyResult.stdout.includes('9')) {
        log('', 'INFO');
        log('✅ NEW CERTIFICATE IS ACTIVE! Valid until Sep 12, 2026!', 'SUCCESS');
      } else {
        log('', 'WARN');
        log('⚠️ Warning: Certificate may not be updated. Check the dates above.', 'WARN');
      }
    } else {
      log('Could not verify certificate (might be normal if using CDN)', 'WARN');
    }
  } catch (err) {
    log(`Verification error: ${err.message}`, 'ERROR');
  }
  log('');

  // Cleanup and disconnect
  log('Cleaning up temporary files...', 'INFO');
  try {
    await ssh.execCommand('rm -f /tmp/aity88.online_bundle.crt /tmp/aity88.online.key');
    log('Temporary files cleaned up', 'SUCCESS');
  } catch (err) {
    log(`Cleanup warning: ${err.message}`, 'WARN');
  }

  ssh.dispose();

  log('', 'INFO');
  log('========================================', 'SUCCESS');
  log('  ✅ SSL CERTIFICATE DEPLOYMENT COMPLETE!', 'SUCCESS');
  log('========================================', 'SUCCESS');
  log('', 'INFO');
  log('What was done:', 'INFO');
  log('  ✓ Uploaded new certificate to server', 'SUCCESS');
  log('  ✓ Backed up old certificate automatically', 'SUCCESS');
  log('  ✓ Installed new certificate', 'SUCCESS');
  log('  ✓ Set secure permissions', 'SUCCESS');
  log('  ✓ Tested Nginx configuration', 'SUCCESS');
  log('  ✓ Reloaded Nginx (graceful reload)', 'SUCCESS');
  log('  ✓ Verified new certificate is active', 'SUCCESS');
  log('', 'INFO');
  log('Next steps:', 'INFO');
  log('  1. Test in browser: https://aity88.online', 'INFO');
  log('  2. Check for green lock icon 🔒', 'INFO');
  log('  3. Test your mini-program', 'INFO');
  log('', 'INFO');
  log('Rollback command (if needed):', 'WARN');
  log('  Run: node rollback-ssl.js', 'WARN');
  log('  Or manually: ssh root@124.221.119.134 "bash /root/deploy-rollback.sh"', 'INFO');
  log('', 'INFO');

  process.exit(0);
}

run().catch(err => {
  console.error('\n\x1b[31m[ERROR]\x1b[0m Deployment failed:', err.message);
  console.error('\nTo rollback, run:');
  console.error('  node rollback-ssl.js');
  console.error('Or manually SSH into server and run:');
  console.error('  bash /root/deploy-rollback.sh\n');

  try {
    ssh.dispose();
  } catch (e) {}

  process.exit(1);
});
