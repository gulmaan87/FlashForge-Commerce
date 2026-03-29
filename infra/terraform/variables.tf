variable "aws_region" {
  description = "AWS region for all resources."
  type        = string
  default     = "ap-south-1"
}

variable "project_name" {
  description = "Short name prefix for resource Name tags."
  type        = string
  default     = "flashforge"
}

variable "environment" {
  description = "Deployment stage (e.g. dev, staging, prod)."
  type        = string
  default     = "prod"
}

variable "vpc_cidr" {
  description = "IPv4 CIDR for the VPC."
  type        = string
  default     = "10.0.0.0/16"
}

variable "az_count" {
  description = "Number of availability zones. Use 1 for free tier (1 public subnet)."
  type        = number
  default     = 1
}

variable "enable_nat_gateway" {
  description = "Set false to avoid paying for a NAT Gateway."
  type        = bool
  default     = false
}

# ── Credentials ────────────────────────────────────────────────────────────────

variable "mongo_base_url" {
  description = "MongoDB Atlas cluster base URL (without database name)."
  type        = string
  sensitive   = true
}

variable "mongo_options" {
  description = "MongoDB connection string query options."
  type        = string
  default     = "retryWrites=true&w=majority&appName=flash87"
}

variable "redis_url" {
  description = "Upstash Redis TLS connection URL."
  type        = string
  sensitive   = true
}

variable "rabbitmq_url" {
  description = "CloudAMQP RabbitMQ TLS AMQPS connection URL."
  type        = string
  sensitive   = true
}

# ── EC2 ────────────────────────────────────────────────────────────────────────

variable "ec2_public_key" {
  description = "Contents of your SSH public key (e.g. cat ~/.ssh/flashforge.pub). Used to create AWS Key Pair."
  type        = string
  sensitive   = true
}

variable "ghcr_owner" {
  description = "GitHub username or org name owning the GHCR packages (lowercase). e.g. gulmaan87"
  type        = string
}
