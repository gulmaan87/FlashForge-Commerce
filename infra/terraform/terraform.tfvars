# ─────────────────────────────────────────────────────────────────────────────
# FlashForge Commerce — Terraform variable values
# THIS FILE IS GITIGNORED — never commit secrets.
# ─────────────────────────────────────────────────────────────────────────────

# AWS
aws_region   = "ap-south-1"
project_name = "flashforge"
environment  = "prod"

# Network — single AZ, no NAT, free tier
vpc_cidr           = "10.0.0.0/16"
az_count           = 1
enable_nat_gateway = false

# ── Service credentials (stored in SSM Parameter Store) ───────────────────────
mongo_base_url = "mongodb+srv://gulmanm8787:GvHj63dOUgzpPl6T@flash87.fwbephb.mongodb.net"
mongo_options  = "retryWrites=true&w=majority&appName=flash87"

redis_url    = "rediss://default:ASNjAAImcDIxMjU1NTg4MmM2YjI0NTgwYmY3NjQxYzJmNDQ2NTQwM3AyOTA1OQ@quality-hamster-9059.upstash.io:6379"
rabbitmq_url = "amqps://ikmgzgea:E9MAkuQbLKZH-BDCF0JIQPRdFWyV-g99@lionfish.rmq.cloudamqp.com/ikmgzgea"

# ── EC2 SSH key ────────────────────────────────────────────────────────────────
ec2_public_key = "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIIenaTTeHlBMjkCPVR2zOuthvq/hsWff/UgKugTIttVo flashforge-deploy"

# ── GitHub Container Registry ─────────────────────────────────────────────────
ghcr_owner = "gulmaan87"
