output "vpc_id" {
  description = "ID of the VPC."
  value       = module.vpc.vpc_id
}

output "public_subnet_ids" {
  description = "Public subnet IDs (ALB, NAT, bastion)."
  value       = module.vpc.public_subnet_ids
}

output "private_subnet_ids" {
  description = "Private subnet IDs (ECS tasks)."
  value       = module.vpc.private_subnet_ids
}

output "nat_gateway_public_ip" {
  description = "Elastic IP of the NAT gateway when enabled."
  value       = module.vpc.nat_gateway_public_ip
}

output "ecr_repository_urls" {
  description = "Map of service name to ECR repository URL."
  value       = module.ecr.repository_urls
}

output "alb_dns_name" {
  description = "Public DNS name of the Application Load Balancer — use this to reach your site."
  value       = module.ecs.alb_dns_name
}

output "ecs_cluster_name" {
  description = "Name of the ECS Fargate cluster."
  value       = module.ecs.cluster_name
}
