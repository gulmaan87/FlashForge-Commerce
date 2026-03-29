# SSM Parameter Store — Standard tier (FREE)
# Stores all FlashForge secrets as SecureString parameters.
# EC2 instance role is granted read access to /flashforge/* path.

locals {
  # Build one DATABASE_URL per service using the shared Atlas cluster
  service_db_map = {
    PRODUCT   = "flashforge_products"
    INVENTORY = "flashforge_inventory"
    CHECKOUT  = "flashforge_checkout"
    PAYMENT   = "flashforge_payments"
    ORDER     = "flashforge_orders"
  }
}

resource "aws_ssm_parameter" "db_urls" {
  for_each = local.service_db_map

  name  = "/flashforge/DATABASE_URL_${each.key}"
  type  = "SecureString"
  value = "${var.mongo_base_url}/${each.value}?${var.mongo_options}"

  tags = { Service = lower(each.key) }
}

resource "aws_ssm_parameter" "redis_url" {
  name  = "/flashforge/REDIS_URL"
  type  = "SecureString"
  value = var.redis_url
}

resource "aws_ssm_parameter" "rabbitmq_url" {
  name  = "/flashforge/RABBITMQ_URL"
  type  = "SecureString"
  value = var.rabbitmq_url
}
