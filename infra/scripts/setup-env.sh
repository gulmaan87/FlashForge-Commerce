#!/bin/bash
set -euo pipefail

SSM=/flashforge
REGION=ap-south-1

get() {
  aws ssm get-parameter --name "$SSM/$1" --with-decryption \
    --query Parameter.Value --output text --region $REGION
}

echo "Fetching secrets from SSM..."

cat > /etc/flashforge.env <<ENVFILE
GHCR_OWNER=gulmaan87
IMAGE_TAG=latest

DATABASE_URL_PRODUCT=$(get DATABASE_URL_PRODUCT)
DATABASE_URL_INVENTORY=$(get DATABASE_URL_INVENTORY)
DATABASE_URL_CHECKOUT=$(get DATABASE_URL_CHECKOUT)
DATABASE_URL_PAYMENT=$(get DATABASE_URL_PAYMENT)
DATABASE_URL_ORDER=$(get DATABASE_URL_ORDER)

REDIS_URL=$(get REDIS_URL)
RABBITMQ_URL=$(get RABBITMQ_URL)

METRICS_TOKEN=$(get METRICS_TOKEN)
EC2_PUBLIC_IP=dw7pv6mehop5x.cloudfront.net
ENVFILE

chmod 600 /etc/flashforge.env
echo "Env file written successfully."
cat /etc/flashforge.env | grep -v "URL\|TOKEN\|PASS" || true
