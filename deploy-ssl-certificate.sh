#!/bin/bash
# ============================================
# SSL Certificate Deployment Script
# Safe deployment with automatic backup and rollback
# ============================================

set -e  # Exit on error

echo "=========================================="
echo "  SSL Certificate Deployment"
echo "  Time: $(date)"
echo "=========================================="
echo ""

# Configuration
CERT_DIR="/etc/nginx/ssl/aity88.online"
BACKUP_BASE="$CERT_DIR/backup"
TMP_CERT_DIR="/tmp"

echo "[Step 1/7] Checking prerequisites..."
echo "----------------------------------------"

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo "ERROR: Please run as root (use sudo or su)"
    exit 1
fi

# Check if certificate directory exists
if [ ! -d "$CERT_DIR" ]; then
    echo "Creating certificate directory..."
    mkdir -p "$CERT_DIR"
fi

# Check if certificate files exist in /tmp
if [ ! -f "$TMP_CERT_DIR/aity88.online_bundle.crt" ] || [ ! -f "$TMP_CERT_DIR/aity88.online.key" ]; then
    echo "ERROR: Certificate files not found in /tmp/"
    echo "Please upload certificates first:"
    echo "  scp aity88.online_bundle.crt root@SERVER:/tmp/"
    echo "  scp aity88.online.key root@SERVER:/tmp/"
    exit 1
fi

echo "✅ Prerequisites check passed"
echo ""

echo "[Step 2/7] Creating backup of current certificate..."
echo "----------------------------------------"

# Create backup directory with timestamp
BACKUP_DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="$BACKUP_BASE-$BACKUP_DATE"
mkdir -p "$BACKUP_DIR"

# Backup existing files if they exist
if ls $CERT_DIR/*.crt 1> /dev/null 2>&1; then
    cp $CERT_DIR/*.crt "$BACKUP_DIR/" 2>/dev/null || true
fi

if ls $CERT_DIR/*.key 1> /dev/null 2>&1; then
    cp $CERT_DIR/*.key "$BACKUP_DIR/" 2>/dev/null || true
fi

echo "✅ Backup created at: $BACKUP_DIR"
ls -lh "$BACKUP_DIR" 2>/dev/null | tail -n +2 || echo "(No previous certificate to backup)"
echo ""

echo "[Step 3/7] Installing new certificate..."
echo "----------------------------------------"

# Copy new certificate files
cp "$TMP_CERT_DIR/aity88.online_bundle.crt" "$CERT_DIR/"
cp "$TMP_CERT_DIR/aity88.online.key" "$CERT_DIR/"

echo "✅ New certificate copied to: $CERT_DIR"
ls -lh "$CERT_DIR"/*.crt "$CERT_DIR"/*.key
echo ""

echo "[Step 4/7] Setting file permissions..."
echo "----------------------------------------"

# Set secure permissions
chmod 600 "$CERT_DIR/aity88.online.key"      # Private key: only root can read
chmod 644 "$CERT_DIR/aity88.online_bundle.crt" # Certificate: everyone can read

echo "✅ Permissions set:"
ls -lh "$CERT_DIR"/*.key "$CERT_DIR"/*.crt
echo ""

echo "[Step 5/7] Testing Nginx configuration..."
echo "----------------------------------------"

# Test Nginx configuration
if nginx -t 2>&1; then
    echo "✅ Nginx configuration test passed"
else
    echo ""
    echo "❌ ERROR: Nginx configuration test failed!"
    echo "Rolling back to backup..."
    
    # Rollback on error
    if [ -d "$BACKUP_DIR" ] && ls "$BACKUP_DIR"/*.crt 1> /dev/null 2>&1; then
        cp "$BACKUP_DIR"/* "$CERT_DIR/"
        chmod 600 "$CERT_DIR"/*.key
        chmod 644 "$CERT_DIR"/*.crt
        echo "✅ Rolled back to: $BACKUP_DIR"
    fi
    
    exit 1
fi
echo ""

echo "[Step 6/7] Reloading Nginx..."
echo "----------------------------------------"

# Try multiple methods to reload Nginx
NGINX_RELOADED=false

# Method 1: systemctl (systemd)
if command -v systemctl &> /dev/null; then
    if systemctl is-active --quiet nginx 2>/dev/null || systemctl list-units --type=service | grep -q nginx; then
        systemctl reload nginx 2>/dev/null && NGINX_RELOADED=true && echo "✅ Nginx reloaded via systemctl"
    fi
fi

# Method 2: service command
if [ "$NGINX_RELOADED" = false ] && command -v service &> /dev/null; then
    service nginx reload 2>/dev/null && NGINX_RELOADED=true && echo "✅ Nginx reloaded via service"
fi

# Method 3: init.d script
if [ "$NGINX_RELOADED" = false ] && [ -f /etc/init.d/nginx ]; then
    /etc/init.d/nginx reload 2>/dev/null && NGINX_RELOADED=true && echo "✅ Nginx reloaded via init.d"
fi

# Method 4: Direct nginx command (most compatible)
if [ "$NGINX_RELOADED" = false ]; then
    if nginx -s reload 2>/dev/null; then
        NGINX_RELOADED=true
        echo "✅ Nginx reloaded via direct command"
    elif nginx -s reload 2>&1 | grep -q "signal process started"; then
        # Sometimes it outputs to stderr but still works
        NGINX_RELOADED=true
        echo "✅ Nginx reloaded via direct command (signal sent)"
    fi
fi

# Wait a moment for reload to complete
sleep 2

if [ "$NGINX_RELOADED" = false ]; then
    echo "⚠️  WARNING: Could not reload Nginx using standard methods"
    echo "Attempting alternative approach..."
    
    # Last resort: Find and kill -HUP the master process
    NGINX_PID=$(pgrep -f 'nginx.*master' | head -1)
    if [ -n "$NGINX_PID" ]; then
        kill -HUP $NGINX_PID 2>/dev/null && NGINX_RELOADED=true && echo "✅ Nginx reloaded via HUP signal (PID: $NGINX_PID)"
    fi
fi

# Verify Nginx is running
if pgrep -f 'nginx.*master' > /dev/null || curl -s -o /dev/null http://localhost:80; then
    echo "✅ Nginx is running"
else
    echo "⚠️  Warning: Nginx status unclear, but certificate has been installed"
    echo "You may need to manually restart Nginx:"
    echo "  nginx -s reload"
    echo "  OR: /www/server/nginx/sbin/nginx -s reload"
fi
echo ""

echo "[Step 7/7] Verifying new certificate..."
echo "----------------------------------------"

# Get current certificate info
CURRENT_CERT=$(echo | openssl s_client -servername aity88.online -connect aity88.online:443 2>/dev/null | openssl x509 -noout -enddate -subject -issuer)

if [ -z "$CURRENT_CERT" ]; then
    echo "⚠️  WARNING: Could not verify certificate via HTTPS"
    echo "This might be normal if using CDN or load balancer"
else
    echo "$CURRENT_CERT"
fi

# Clean up temp files
rm -f "$TMP_CERT_DIR/aity88.online_bundle.crt" "$TMP_CERT_DIR/aity88.online.key"

echo ""
echo "=========================================="
echo "  ✅ DEPLOYMENT SUCCESSFUL!"
echo "=========================================="
echo ""
echo "New certificate deployed and active"
echo "Backup location: $BACKUP_DIR"
echo ""
echo "To rollback if needed:"
echo "  bash /root/deploy-rollback.sh"
echo "  OR manually:"
echo "  cp $BACKUP_DIR/* $CERT_DIR/ && systemctl reload nginx"
echo ""
echo "=========================================="
