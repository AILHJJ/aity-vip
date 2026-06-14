#!/bin/bash
# ============================================
# SSL Certificate Rollback Script
# Quick rollback to previous certificate
# Usage: bash deploy-rollback.sh
# ============================================

set -e

echo "=========================================="
echo "  SSL Certificate Rollback"
echo "  Time: $(date)"
echo "=========================================="
echo ""

CERT_DIR="/etc/nginx/ssl/aity88.online"

echo "[Step 1/3] Finding latest backup..."
echo "----------------------------------------"

# Find the latest backup directory
LATEST_BACKUP=$(ls -dt $CERT_DIR/backup-* 2>/dev/null | head -1)

if [ -z "$LATEST_BACKUP" ]; then
    echo "❌ ERROR: No backup found!"
    echo "Cannot rollback. No previous certificate backup exists."
    exit 1
fi

if [ ! -d "$LATEST_BACKUP" ]; then
    echo "❌ ERROR: Backup directory not valid: $LATEST_BACKUP"
    exit 1
fi

echo "Found latest backup: $LATEST_BACKUP"
ls -lh "$LATEST_BACKUP" 2>/dev/null || echo "(Empty or no files)"
echo ""

echo "[Step 2/3] Restoring from backup..."
echo "----------------------------------------"

# Copy backup files to certificate directory
cp "$LATEST_BACKUP"/*.crt "$CERT_DIR/" 2>/dev/null || true
cp "$LATEST_BACKUP"/*.key "$CERT_DIR/" 2>/dev/null || true

# Set correct permissions
chmod 600 "$CERT_DIR"/*.key 2>/dev/null || true
chmod 644 "$CERT_DIR"/*.crt 2>/dev/null || true

echo "✅ Files restored from: $LATEST_BACKUP"
ls -lh "$CERT_DIR"/*.crt "$CERT_DIR"/*.key 2>/dev/null
echo ""

echo "[Step 3/3] Reloading Nginx..."
echo "----------------------------------------"

# Test configuration first
if nginx -t 2>&1; then
    # Reload Nginx
    systemctl reload nginx
    sleep 2
    
    if systemctl is-active --quiet nginx; then
        echo "✅ Nginx reloaded successfully"
    else
        echo "⚠️  Warning: Nginx may not be running properly"
        systemctl status nginx
    fi
else
    echo "❌ ERROR: Nginx configuration test failed after restore!"
    echo "The backup might be corrupted."
    exit 1
fi

echo ""
echo "=========================================="
echo "  ✅ ROLLBACK COMPLETE!"
echo "=========================================="
echo ""
echo "Restored from: $LATEST_BACKUP"
echo "Old certificate is now active again"
echo ""
echo "To redeploy new certificate:"
echo "  Re-run the deployment script"
echo ""
echo "=========================================="
