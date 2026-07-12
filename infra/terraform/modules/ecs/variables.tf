variable "name_prefix" { type = string }
variable "vpc_id" { type = string }
variable "public_subnet_ids" { type = list(string) }
variable "private_subnet_ids" { type = list(string) }
variable "aws_region" { type = string }

variable "services" {
  description = "Map of service name → config (port, cpu, memory, extra env vars)."
  type = map(object({
    port        = number
    cpu         = number
    memory      = number
    extra_env   = map(string)
    path_prefix = string
  }))
}

variable "secret_arns" {
  description = "Map of service name → Secrets Manager ARN."
  type        = map(string)
  sensitive   = true
}

variable "ecr_urls" {
  description = "Map of service name → ECR repository URL."
  type        = map(string)
}

variable "image_tag" {
  description = "Docker image tag to deploy. Default 'latest' for initial setup."
  type        = string
  default     = "latest"
}
