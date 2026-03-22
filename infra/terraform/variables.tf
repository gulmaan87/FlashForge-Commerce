variable "aws_region" {
  description = "AWS region for all resources."
  type        = string
  default     = "us-east-1"
}

variable "project_name" {
  description = "Short name prefix for resource Name tags."
  type        = string
  default     = "flashforge"
}

variable "environment" {
  description = "Deployment stage (e.g. dev, staging, prod)."
  type        = string
  default     = "dev"
}

variable "vpc_cidr" {
  description = "IPv4 CIDR for the VPC."
  type        = string
  default     = "10.0.0.0/16"
}

variable "az_count" {
  description = "Number of availability zones (subnets per tier)."
  type        = number
  default     = 2

  validation {
    condition     = var.az_count >= 2 && var.az_count <= 6
    error_message = "Use 2–6 AZs for high availability."
  }
}

variable "enable_nat_gateway" {
  description = "If true, provisions a single NAT gateway in the first public subnet for private subnet egress."
  type        = bool
  default     = false
}

# ── Service credentials ────────────────────────────────────────────────────────

variable "mongo_base_url" {
  description = "MongoDB Atlas cluster base URL (without database name). e.g. mongodb+srv://user:pass@host"
  type        = string
  sensitive   = true
}

variable "mongo_options" {
  description = "MongoDB connection string query options. e.g. retryWrites=true&w=majority&appName=flash87"
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

