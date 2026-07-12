





set -euo pipefail
exec > >(tee /var/log/flashforge-init.log | logger -t flashforge-init -s 2>/dev/console) 2>&1

echo "=== FlashForge bootstrap starting ==="


dnf update -y
dnf install -y docker git

systemctl enable docker
systemctl start docker
usermod -aG docker ec2-user


mkdir -p /usr/local/lib/docker/cli-plugins
curl -SL https://github.com/docker/compose/releases/download/v2.27.0/docker-compose-linux-x86_64 \
     -o /usr/local/lib/docker/cli-plugins/docker-compose
chmod +x /usr/local/lib/docker/cli-plugins/docker-compose


SSM=/flashforge
get() { aws ssm get-parameter --name "$SSM/$1" --with-decryption --query Parameter.Value --output text --region ${aws_region}; }

cat > /etc/flashforge.env <<EOF
GHCR_OWNER=${ghcr_owner}
IMAGE_TAG=latest

DATABASE_URL_PRODUCT=$(get DATABASE_URL_PRODUCT)
DATABASE_URL_INVENTORY=$(get DATABASE_URL_INVENTORY)
DATABASE_URL_CHECKOUT=$(get DATABASE_URL_CHECKOUT)
DATABASE_URL_PAYMENT=$(get DATABASE_URL_PAYMENT)
DATABASE_URL_ORDER=$(get DATABASE_URL_ORDER)

REDIS_URL=$(get REDIS_URL)
RABBITMQ_URL=$(get RABBITMQ_URL)

CLOUDFRONT_DOMAIN=$(get CLOUDFRONT_DOMAIN)
METRICS_TOKEN=$(get METRICS_TOKEN)

EC2_PUBLIC_IP=$CLOUDFRONT_DOMAIN
METRICS_TOKEN=$METRICS_TOKEN
EOF
chmod 600 /etc/flashforge.env


REPO_DIR=/opt/flashforge
mkdir -p $REPO_DIR





echo "Bootstrap complete. Waiting for CI/CD to push compose files and start services."
echo "=== Bootstrap finished ==="
