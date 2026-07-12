provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = var.project_name
      Environment = var.environment
      ManagedBy   = "terraform"
    }
  }
}



module "vpc" {
  source = "./modules/vpc"

  name_prefix        = "${var.project_name}-${var.environment}"
  vpc_cidr           = var.vpc_cidr
  az_count           = 1
  enable_nat_gateway = false
}


module "ssm" {
  source = "./modules/ssm"

  mongo_base_url = var.mongo_base_url
  mongo_options  = var.mongo_options
  redis_url      = var.redis_url
  rabbitmq_url   = var.rabbitmq_url
}


module "ec2" {
  source = "./modules/ec2"

  name_prefix      = "${var.project_name}-${var.environment}"
  vpc_id           = module.vpc.vpc_id
  public_subnet_id = module.vpc.public_subnet_ids[0]
  aws_region       = var.aws_region
  ec2_public_key   = var.ec2_public_key
  ghcr_owner       = var.ghcr_owner
}


module "cloudfront" {
  source = "./modules/cloudfront"

  origin_domain_name = module.ec2.public_dns
}


resource "aws_ssm_parameter" "cloudfront_domain" {
  name  = "/flashforge/CLOUDFRONT_DOMAIN"
  type  = "String"
  value = module.cloudfront.domain_name
}

resource "aws_ssm_parameter" "metrics_token" {
  name  = "/flashforge/METRICS_TOKEN"
  type  = "SecureString"
  value = "super-secret-metrics-token-12345"
}
