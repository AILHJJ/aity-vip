#!/bin/bash
# 检查SSL证书有效期
# 用于监控证书是否即将过期

DOMAIN="aity88.online"

# Let's Encrypt证书路径
LETSENCRYPT_CERT="/etc/letsencrypt/live/$DOMAIN/fullchain.pem"
# 手动安装的证书路径
MANUAL_CERT="/etc/nginx/ssl/aity88.online_bundle.crt"

# 检测使用哪种证书
if [ -f "$LETSENCRYPT_CERT" ]; then
    CERT_FILE="$LETSENCRYPT_CERT"
    CERT_TYPE="Let's Encrypt"
elif [ -f "$MANUAL_CERT" ]; then
    CERT_FILE="$MANUAL_CERT"
    CERT_TYPE="手动安装"
else
    echo "❌ 未找到SSL证书文件"
    echo "请确认证书已安装"
    exit 1
fi

# 获取证书过期日期
EXPIRY_DATE=$(openssl x509 -in "$CERT_FILE" -noout -enddate | cut -d= -f2)
EXPIRY_EPOCH=$(date -d "$EXPIRY_DATE" +%s)
CURRENT_EPOCH=$(date +%s)
DAYS_LEFT=$(( ($EXPIRY_EPOCH - $CURRENT_EPOCH) / 86400 ))

echo "=========================================="
echo "  SSL证书状态检查"
echo "=========================================="
echo "域名: $DOMAIN"
echo "证书类型: $CERT_TYPE"
echo "过期日期: $EXPIRY_DATE"
echo "剩余天数: $DAYS_LEFT 天"
echo "=========================================="

# 根据剩余天数显示不同消息
if [ $DAYS_LEFT -lt 0 ]; then
    echo "❌ 证书已过期！"
    echo "请立即更新证书"
    exit 1
elif [ $DAYS_LEFT -lt 7 ]; then
    echo "🚨 严重警告：证书将在 $DAYS_LEFT 天后过期"
    echo ""
    if [ "$CERT_TYPE" = "Let's Encrypt" ]; then
        echo "Let's Encrypt证书应该自动续期"
        echo "请检查自动续期配置："
        echo "  crontab -l | grep certbot"
    else
        echo "请立即更新证书："
        echo "1. 购买新证书或重新申请"
        echo "2. 替换证书文件"
        echo "3. 在服务器执行部署脚本"
    fi
    exit 1
elif [ $DAYS_LEFT -lt 30 ]; then
    echo "⚠️  警告：证书将在 $DAYS_LEFT 天后过期"
    echo ""
    if [ "$CERT_TYPE" = "Let's Encrypt" ]; then
        echo "Let's Encrypt证书应该会自动续期"
        echo "可以手动测试续期："
        echo "  certbot renew --dry-run"
    else
        echo "建议尽快更新证书"
    fi
    exit 0
else
    echo "✅ 证书状态良好"
    exit 0
fi
