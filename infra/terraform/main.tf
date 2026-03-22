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

# ── VPC ───────────────────────────────────────────────────────────────────────

module "vpc" {
  source = "./modules/vpc"

  name_prefix        = "${var.project_name}-${var.environment}"
  vpc_cidr           = var.vpc_cidr
  az_count           = var.az_count
  enable_nat_gateway = var.enable_nat_gateway
}

# ── ECR Repositories (one per service) ───────────────────────────────────────

module "ecr" {
  source      = "./modules/ecr"
  name_prefix = "${var.project_name}-${var.environment}"
}

# ── AWS Secrets Manager ───────────────────────────────────────────────────────

module "secrets" {
  source = "./modules/secrets"

  mongo_base_url = var.mongo_base_url
  mongo_options  = var.mongo_options
  redis_url      = var.redis_url
  rabbitmq_url   = var.rabbitmq_url
}

# ── ECS Fargate Cluster + ALB ─────────────────────────────────────────────────

module "ecs" {
  source = "./modules/ecs"

  name_prefix        = "${var.project_name}-${var.environment}"
  vpc_id             = module.vpc.vpc_id
  public_subnet_ids  = module.vpc.public_subnet_ids
  private_subnet_ids = module.vpc.private_subnet_ids
  aws_region         = var.aws_region
  secret_arns        = module.secrets.secret_arns
  ecr_urls           = module.ecr.repository_urls

  services = {
    "product-service" = {
      port        = 4001
      cpu         = 256
      memory      = 512
      path_prefix = "/api/products"
      extra_env   = {}
    }
    "inventory-service" = {
      port        = 4002
      cpu         = 256
      memory      = 512
      path_prefix = "/api/inventory"
      extra_env   = {}
    }
    "checkout-service" = {
      port        = 4003
      cpu         = 256
      memory      = 512
      path_prefix = "/api/checkout"
      extra_env = {
        INVENTORY_SERVICE_URL = "http://inventory-service.${var.project_name}-${var.environment}.local:4002"
        PAYMENT_SERVICE_URL   = "http://payment-service.${var.project_name}-${var.environment}.local:4004"
      }
    }
    "payment-service" = {
      port        = 4004
      cpu         = 256
      memory      = 512
      path_prefix = "/api/payments"
      extra_env   = {}
    }
    "order-service" = {
      port        = 4005
      cpu         = 256
      memory      = 512
      path_prefix = "/api/orders"
      extra_env   = {}
    }
    "worker-service" = {
      port        = 4006
      cpu         = 256
      memory      = 512
      path_prefix = "/internal/worker"
      extra_env = {
        ORDER_SERVICE_URL     = "http://order-service.${var.project_name}-${var.environment}.local:4005/api/orders"
        INVENTORY_SERVICE_URL = "http://inventory-service.${var.project_name}-${var.environment}.local:4002/api/inventory"
      }
    }
    "frontend" = {
      port        = 3000
      cpu         = 512
      memory      = 1024
      path_prefix = "/"
      extra_env = {
        NEXT_PUBLIC_PRODUCT_SERVICE_URL  = "http://${module.ecs.alb_dns_name}/api/products"
        NEXT_PUBLIC_CHECKOUT_SERVICE_URL = "http://${module.ecs.alb_dns_name}/api/checkout"
        NEXT_PUBLIC_ORDER_SERVICE_URL    = "http://${module.ecs.alb_dns_name}/api/orders"
      }
    }
  }
}

