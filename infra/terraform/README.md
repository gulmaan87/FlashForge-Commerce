# FlashForge Commerce — AWS Terraform (foundation)

Provisions a **multi-AZ VPC** with public and private subnets — the base layer for RDS, ElastiCache, Amazon MQ, ECS/EKS, and ALB (see root `SKILL.md` for the full AWS task list).

## Prerequisites

- [Terraform](https://developer.hashicorp.com/terraform/install) >= 1.5
- AWS credentials (env vars, shared config, or IAM role)
- Permissions to create VPC, subnets, IGW, route tables, and optionally NAT/EIP

## Usage

```bash
cd infra/terraform
terraform init
terraform plan -var="environment=dev"
# Optional NAT (~$32/mo+ in most regions):
# terraform plan -var="enable_nat_gateway=true"
terraform apply
```

## Outputs

After apply: `vpc_id`, `public_subnet_ids`, `private_subnet_ids`, and `nat_gateway_public_ip` (if NAT enabled).

## Remote state

Edit `versions.tf` and configure the `backend "s3"` block once an encrypted bucket and DynamoDB lock table exist.

## Cost note

With `enable_nat_gateway = false` (default), **private subnets have no default route to the internet**. That is appropriate for RDS and for ECS tasks that use VPC endpoints or sit in public subnets for dev only. Enable NAT for private Fargate tasks that need outbound internet without public IPs.
