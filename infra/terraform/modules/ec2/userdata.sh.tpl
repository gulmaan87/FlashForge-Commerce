#!/bin/bash
# ─────────────────────────────────────────────────────────────────────────────
# FlashForge Commerce — EC2 Bootstrap (Amazon Linux 2023)
# Run once on first boot. Installs Docker, fetches secrets from SSM,
# writes the env file, and starts the Docker Compose production stack.
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail
exec > >(tee /var/log/flashforge-init.log | logger -t flashforge-init -s 2>/dev/console) 2>&1

echo "=== FlashForge bootstrap starting ==="

# ── 1. Install Docker ─────────────────────────────────────────────────────────
dnf update -y
dnf install -y docker git

systemctl enable docker
systemctl start docker
usermod -aG docker ec2-user

# ── 2. Install Docker Compose v2 plugin ──────────────────────────────────────
mkdir -p /usr/local/lib/docker/cli-plugins
curl -SL https://github.com/docker/compose/releases/download/v2.27.0/docker-compose-linux-x86_64 \
     -o /usr/local/lib/docker/cli-plugins/docker-compose
chmod +x /usr/local/lib/docker/cli-plugins/docker-compose

# ── 3. Fetch secrets from SSM Parameter Store ─────────────────────────────────
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

EC2_PUBLIC_IP=$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)
EOF
chmod 600 /etc/flashforge.env

# ── 4. Clone the repo to get the compose files ────────────────────────────────
REPO_DIR=/opt/flashforge
mkdir -p $REPO_DIR

# We only need the infra/docker-compose folder; copy from a public or private repo.
# For now write compose files inline — they are copied here by the deploy workflow.
# The CI/CD pipeline (deploy.yml) will scp the latest compose files on each deploy.

echo "Bootstrap complete. Waiting for CI/CD to push compose files and start services."
echo "=== Bootstrap finished ==="
