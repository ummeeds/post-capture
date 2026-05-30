#!/bin/bash
set -e

echo "=== PostCapture VPS Setup ==="
echo ""

read -p "MongoDB URI: " MONGODB_URI
read -p "DB Name [postcapture]: " DB_NAME
DB_NAME=${DB_NAME:-postcapture}
read -p "RapidAPI Key: " TWITTER_API_RAPID
RAPIDAPI_HOST=${RAPIDAPI_HOST:-twitter283.p.rapidapi.com}

APT_GET="DEBIAN_FRONTEND=noninteractive apt-get -y -qq"

echo ""
echo "[1/6] Updating system..."
$APT_GET update > /dev/null 2>&1
echo "  Done."

echo "[2/6] Installing packages..."
$APT_GET install nginx python3 python3-pip python3-venv git certbot python3-certbot-nginx > /dev/null 2>&1
echo "  Done."

echo "[3/6] Cloning repository..."
if [ -d /opt/postcapture ]; then
    cd /opt/postcapture && git pull origin main
else
    git clone https://github.com/ummeeds/post-capture.git /opt/postcapture
fi
echo "  Done."

echo "[4/6] Setting up environment..."
cat > /opt/postcapture/.env << EOF
MONGODB_URI="${MONGODB_URI}"
DB_NAME="${DB_NAME}"
TWITTER_API_RAPID="${TWITTER_API_RAPID}"
RAPIDAPI_HOST="${RAPIDAPI_HOST}"
EOF
chmod 600 /opt/postcapture/.env
echo "  .env created."

echo "[5/6] Installing Python dependencies..."
python3 -m pip install --break-system-packages -r /opt/postcapture/backend/requirements.txt > /dev/null 2>&1
echo "  Done."

echo "[6/6] Configuring services..."

cp /opt/postcapture/deploy/nginx.conf /etc/nginx/sites-available/postcapture
rm -f /etc/nginx/sites-enabled/default
ln -sf /etc/nginx/sites-available/postcapture /etc/nginx/sites-enabled/

cp /opt/postcapture/deploy/postcapture-api.service /etc/systemd/system/

mkdir -p /var/log/nginx

systemctl daemon-reload
systemctl enable postcapture-api
systemctl restart postcapture-api

nginx -t && systemctl restart nginx || systemctl start nginx

echo ""
echo "=== Setup Complete ==="
echo ""
echo "Next steps:"
echo "  1. Get SSL: certbot --nginx -d postcapture.co -d www.postcapture.co"
echo "  2. Update DNS to point to this server's IP"
echo "  3. Test: curl -X POST http://localhost:8000/api/waitlist -H 'Content-Type: application/json' -d '{\"email\":\"test@example.com\"}'"
echo ""
