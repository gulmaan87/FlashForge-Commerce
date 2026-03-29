output "ec2_public_ip" {
  description = "Elastic IP of the EC2 instance — this is your site's address."
  value       = module.ec2.public_ip
}

output "ec2_public_dns" {
  description = "Public DNS of the EC2 Elastic IP."
  value       = module.ec2.public_dns
}

output "vpc_id" {
  description = "ID of the VPC."
  value       = module.vpc.vpc_id
}

output "public_subnet_ids" {
  description = "Public subnet IDs."
  value       = module.vpc.public_subnet_ids
}

output "ssm_parameter_names" {
  description = "Map of secret names stored in SSM Parameter Store."
  value       = module.ssm.parameter_names
}
