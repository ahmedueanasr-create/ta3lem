#!/usr/bin/env bash
set -euo pipefail

# ─────────────────────────────────────────────────────────────────
# SSL Setup Script for ta3lem production
# - Installs certbot
# - Obtains SSL certificates for the specified domain
# - Configures auto-renewal via cron
#
# Usage:  ./scripts/setup-ssl.sh <domain> [email]
# Example: ./scripts/setup-ssl.sh live.ta3lem.com admin@ta3lem.com
# ─────────────────────────────────────────────────────────────────

DOMAIN="${1:-}"
EMAIL="${2:-}"

if [ -z "$DOMAIN" ]; then
  echo "Usage: $0 <domain> [email]"
  echo "Example: $0 live.ta3lem.com admin@ta3lem.com"
  exit 1
fi

# ── Install certbot ──────────────────────────────────────────────
if ! command -v certbot &>/dev/null; then
  echo "[+] Installing certbot..."
  if command -v apt-get &>/dev/null; then
    sudo apt-get update
    sudo apt-get install -y certbot
  elif command -v yum &>/dev/null; then
    sudo yum install -y epel-release
    sudo yum install -y certbot
  elif command -v apk &>/dev/null; then
    sudo apk add certbot
  else
    echo "ERROR: No supported package manager found. Install certbot manually."
    exit 1
  fi
else
  echo "[+] certbot already installed"
fi

# ── Stop nginx temporarily (certbot standalone needs port 80/443) ─
echo "[+] Stopping nginx for certificate issuance..."
sudo docker stop ta3lem_nginx 2>/dev/null || true

# ── Obtain certificate (standalone mode) ────────────────────────
CERTBOT_ARGS="certonly --standalone -d $DOMAIN --non-interactive --agree-tos"
if [ -n "$EMAIL" ]; then
  CERTBOT_ARGS="$CERTBOT_ARGS -m $EMAIL"
else
  CERTBOT_ARGS="$CERTBOT_ARGS --register-unsafely-without-email"
fi

echo "[+] Requesting SSL certificate for $DOMAIN..."
sudo certbot $CERTBOT_ARGS

# ── Restart nginx ───────────────────────────────────────────────
echo "[+] Restarting nginx..."
sudo docker start ta3lem_nginx 2>/dev/null || true
sudo docker restart ta3lem_nginx 2>/dev/null || true

# ── Set up auto-renewal cron job ────────────────────────────────
CRON_SCHEDULE="0 3 * * *"
CRON_CMD="sudo docker stop ta3lem_nginx 2>/dev/null; sudo certbot renew --quiet; sudo docker start ta3lem_nginx 2>/dev/null; sudo docker restart ta3lem_nginx 2>/dev/null"

EXISTING=$(sudo crontab -l 2>/dev/null || true)
if ! echo "$EXISTING" | grep -q 'certbot renew'; then
  echo "[+] Adding certbot renewal cron job..."
  (echo "$EXISTING"; echo "$CRON_SCHEDULE $CRON_CMD") | sudo crontab -
  echo "    Cron scheduled: daily at 3:00 AM"
else
  echo "[+] Certbot renewal cron job already exists"
fi

echo ""
echo "✅ SSL setup complete for $DOMAIN"
echo "   Certificate: /etc/letsencrypt/live/$DOMAIN/fullchain.pem"
echo "   Key:         /etc/letsencrypt/live/$DOMAIN/privkey.pem"
echo ""
echo "   Next step: uncomment the ssl_* lines in nginx.conf and restart nginx."
