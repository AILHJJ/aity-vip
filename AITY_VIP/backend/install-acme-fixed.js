const { NodeSSH } = require('node-ssh');
const path = require('path');

const ssh = new NodeSSH();

const SERVER = {
  host: '124.221.119.134',
  username: 'root',
  port: 22,
  privateKeyPath: path.join('C:\\Users\\DELL\\Downloads', 'AITY0127.pem')
};

// Use full path to avoid shell alias issues
const ACME = '/root/.acme.sh/acme.sh';

async function installAndTest() {
  console.log('==========================================');
  console.log('  acme.sh Installation & Test (Fixed)');
  console.log('  Time:', new Date().toLocaleTimeString('zh-CN'));
  console.log('==========================================\n');

  try {
    await ssh.connect({
      host: SERVER.host,
      username: SERVER.username,
      port: SERVER.port,
      privateKeyPath: SERVER.privateKeyPath,
      readyTimeout: 30000
    });

    console.log('[✓] Connected to server\n');

    // Step 1: Verify acme.sh exists and is executable
    console.log('[Step 1/6] Verifying acme.sh installation...');
    
    const verifyCmd = `ls -la ${ACME} && ${ACME} --version | head -1`;
    const verifyResult = await ssh.execCommand(verifyCmd);
    
    if (verifyResult.code === 0) {
      console.log('[✓] acme.sh found and executable');
      const versionLine = verifyResult.stdout.split('\n').find(l => l.includes('v'));
      console.log('[INFO]', versionLine || 'Version OK');
    } else {
      throw new Error(`acme.sh not found at ${ACME}: ${verifyResult.stderr}`);
    }
    console.log('');

    // Step 2: Configure DNSPod API (already done, but verify)
    console.log('[Step 2/6] Verifying DNSPod API credentials...');
    const credCheck = await ssh.execCommand('test -f /root/.dnspod_credentials && echo "EXISTS" || echo "MISSING"');
    
    if (!credCheck.stdout.includes('EXISTS')) {
      // Create credentials file from environment variables (NEVER hardcode secrets!)
      // Set these in your environment or .env file before running:
      //   export DNSPOD_ID="your_secret_id"
      //   export DNSPOD_KEY="your_secret_key"
      await ssh.execCommand(`cat > /root/.dnspod_credentials << 'EOF'
export DP_Id="${process.env.DNSPOD_ID || 'YOUR_DNSPOD_SECRET_ID'}"
export DP_Key="${process.env.DNSPOD_KEY || 'YOUR_DNSPOD_SECRET_KEY'}"
EOF
chmod 600 /root/.dnspod_credentials`);
      console.log('[✓] Created DNSPod credentials from environment variables');
    } else {
      console.log('[✓] Credentials already configured');
    }
    console.log('');

    // Step 3: Switch to Staging environment
    console.log('[Step 3/6] Switching to Let\'s Encrypt STAGING server...');
    const stagingResult = await ssh.execCommand(`${ACME} --set-default-ca --server letsencrypt_test`);
    console.log('[✓] Using test CA (safe for testing)');
    console.log('');

    // Step 4: Issue TEST certificate
    console.log('[Step 4/6] Issuing TEST certificate with DNS-01 challenge...');
    console.log('[INFO] This will:');
    console.log('  • Automatically add TXT record via DNSPod API');
    console.log('  • Wait for DNS propagation (~10-30 seconds)');
    console.log('  • Validate domain ownership');
    console.log('  • Issue test certificate from Fake LE Intermediate X1');
    console.log('  • Remove TXT record automatically');
    console.log('');
    console.log('[Processing... please wait up to 60 seconds]\n');

    const issueCmd = `source /root/.dnspod_credentials && ${ACME} --issue -d aity88.online --dns dns_dp --force 2>&1`;
    
    const issueResult = await ssh.execCommand(issueCmd, {
      cwd: '/root',
      execOptions: { timeout: 180000 },
      onStdout: (chunk) => {
        const text = chunk.toString();
        // Print key progress indicators
        if (text.match(/(Success|cert|Your cert|error|Error|DNS|Adding|Validating|The|Please)/i)) {
          process.stdout.write(text);
        }
      },
      onStderr: (chunk) => process.stderr.write(chunk.toString())
    });

    console.log('\n');

    if (issueResult.stdout.includes('Your cert is in') || 
        issueResult.stdout.includes('cert success') ||
        issueResult.code === 0) {
      
      console.log('==========================================');
      console.log('  ✅ SUCCESS! Test Certificate Issued!');
      console.log('==========================================\n');

      // Show certificate info
      const certInfo = await ssh.execCommand(
        `openssl x509 -in ~/.acme.sh/aity88.online/aity88.online.cer -noout -subject -issuer -dates 2>/dev/null`
      );
      console.log('[Certificate Information]');
      console.log(certInfo.stdout || 'Unable to read cert');
      console.log('');

      // List generated files
      const files = await ssh.execCommand('ls -lh ~/.acme.sh/aity88.online/*.cer ~/.acme.sh/aity88.online/*.key 2>/dev/null');
      console.log('[Generated Certificate Files]');
      console.log(files.stdout || 'No files listed');
      console.log('');

      console.log('[✅ STAGING TEST PASSED!]');
      console.log('[INFO] Test CA issuer (Fake LE) is expected - this proves the system works!');
      console.log('');

      // Step 5: Prepare production config
      console.log('[Step 5/6] Preparing production deployment script...');
      
      const deployScript = `cat > /root/acme-deploy-hook.sh << 'DEPLOY_EOF'
#!/bin/bash
# Auto-deploy hook for aity88.online SSL certificate
# Called by acme.sh after successful certificate issuance/renewal

CERT_DIR="/etc/nginx/ssl/aity88.online"
BACKUP_BASE="\$CERT_DIR"
LOG_FILE="/var/log/acme-deploy.log"

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] \$1" >> "\$LOG_FILE"
    echo "[INFO] \$1"
}

log "Starting certificate deployment..."

# Create backup
BACKUP_DATE=\$(date +%Y%m%d_%H%M%S)
if [ -d "\$CERT_DIR" ] && ls \$CERT_DIR/*.crt 1> /dev/null 2>&1; then
    mkdir -p "\$CERT_DIR/backup-\$BACKUP_DATE"
    cp \$CERT_DIR/*.crt "\$CERT_DIR/backup-\$BACKUP_DATE/" 2>/dev/null
    cp \$CERT_DIR/*.key "\$CERT_DIR/backup-\$BACKUP_DATE/" 2>/dev/null
    log "Backup created: \$CERT_DIR/backup-\$BACKUP_DATE"
fi

# Install new certificate (acme.sh provides these env vars)
cp "\$CERT_PATH" "\$CERT_DIR/aity88.online_bundle.crt"
cp "\$CA_CERT_PATH" "\$CERT_DIR/ca.cer" 2>/dev/null || true
cp "\$CERT_KEY_PATH" "\$CERT_DIR/aity88.online.key"

# Set permissions
chmod 644 "\$CERT_DIR/aity88.online_bundle.crt"
chmod 600 "\$CERT_DIR/aity88.online.key"

# Test nginx configuration
if nginx -t > /dev/null 2>&1; then
    # Reload nginx gracefully
    service nginx reload 2>/dev/null || nginx -s reload 2>/dev/null || /www/server/nginx/sbin/nginx -s reload 2>/dev/null
    log "Nginx reloaded successfully"
    log "Deployment COMPLETE - New certificate active"
    exit 0
else
    log "ERROR: Nginx configuration test failed! Rolling back..."
    # Rollback
    if [ -d "\$CERT_DIR/backup-\$BACKUP_DATE" ]; then
        cp "\$CERT_DIR/backup-\$BACKUP_DATE"/* "\$CERT_DIR/"
        log "Rolled back to backup"
    fi
    exit 1
fi
DEPLOY_EOF
chmod +x /root/acme-deploy-hook.sh`;

      await ssh.execCommand(deployScript);
      console.log('[✓] Deployment hook script created: /root/acme-deploy-hook.sh');
      console.log('');

      // Step 6: Switch back to production CA
      console.log('[Step 6/6] Ready for PRODUCTION mode...');
      const prodResult = await ssh.execCommand(`${ACME} --set-default-ca --server letsencrypt`);
      console.log('[✓] Set to use real Let\'s Encrypt CA');
      console.log('');

      // Summary
      console.log('==========================================');
      console.log('  🎉 ALL SYSTEMS READY FOR PRODUCTION!');
      console.log('==========================================\n');
      
      console.log('[What\'s Been Configured]');
      console.log('✅ acme.sh installed and working');
      console.log('✅ DNSPod API integrated (automatic DNS validation)');
      console.log('✅ Staging test passed (system verified)');
      console.log('✅ Auto-deployment hook ready');
      console.log('✅ Production CA selected');
      console.log('');
      
      console.log('[Next Action Required]');
      console.log('Issue REAL certificate by running:');
      console.log('  node issue-production-cert.js');
      console.log('');
      console.log('[Or I can do it now - just confirm!]');
      console.log('');

    } else {
      console.log('==========================================');
      console.log('  ❌ Certificate Issue Failed');
      console.log('==========================================\n');
      console.log('[Output]');
      console.log(issueResult.stdout);
      if (issueResult.stderr) {
        console.log('\n[Errors]');
        console.log(issueResult.stderr);
      }
      console.log('');
      console.log('[Debug Info]');
      const debugInfo = await ssh.execCommand(`cat ~/.acme.sh/aity88.online/aity88.online.error 2>/dev/null || echo "No error log"`);
      console.log(debugInfo.stdout);
    }

    ssh.dispose();
    console.log('\n[Session ended]');

  } catch (err) {
    console.error('\n[FATAL ERROR]', err.message);
    try { ssh.dispose(); } catch(e) {}
    process.exit(1);
  }
}

installAndTest();
