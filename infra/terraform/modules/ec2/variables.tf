variable "name_prefix"      { type = string }
variable "vpc_id"           { type = string }
variable "public_subnet_id" { type = string }
variable "aws_region"       { type = string }
variable "ghcr_owner"       { type = string }

variable "ec2_public_key" {
  description = "SSH public key content (e.g. contents of ~/.ssh/flashforge.pub)"
  type        = string
  sensitive   = true
}
