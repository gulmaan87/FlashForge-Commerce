# ─────────────────────────────────────────────────────────────────────────────
# FlashForge Commerce — Terraform variable values
# THIS FILE IS GITIGNORED — contains secrets. Never commit.
# ─────────────────────────────────────────────────────────────────────────────

# AWS
aws_region = "us-east-1"

# Naming
project_name = "flashforge"
environment  = "prod"

# Network
vpc_cidr           = "10.0.0.0/16"
az_count           = 2
enable_nat_gateway = false   # set true if containers need outbound internet access from private subnets

# ── Service credentials (stored in AWS Secrets Manager via Terraform) ─────────
# MongoDB Atlas — each service gets its own DB name appended at apply time
mongo_base_url = "mongodb+srv://gulmanm8787:GvHj63dOUgzpPl6T@flash87.fwbephb.mongodb.net"
mongo_options  = "retryWrites=true&w=majority&appName=flash87"

# Upstash Redis (TLS)
redis_url = "rediss://default:ASNjAAImcDIxMjU1NTg4MmM2YjI0NTgwYmY3NjQxYzJmNDQ2NTQwM3AyOTA1OQ@quality-hamster-9059.upstash.io:6379"

# CloudAMQP RabbitMQ (TLS)
rabbitmq_url = "amqps://ikmgzgea:E9MAkuQbLKZH-BDCF0JIQPRdFWyV-g99@lionfish.rmq.cloudamqp.com/ikmgzgea"
