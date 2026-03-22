# One secret per service with its own DATABASE_URL, plus shared REDIS and RABBITMQ

resource "aws_secretsmanager_secret" "service_secrets" {
  for_each = var.service_db_names

  name                    = "flashforge/${each.key}"
  recovery_window_in_days = 0 # allow instant delete in dev; set to 7+ in prod

  tags = {
    Service = each.key
  }
}

resource "aws_secretsmanager_secret_version" "service_secrets" {
  for_each  = aws_secretsmanager_secret.service_secrets
  secret_id = each.value.id

  secret_string = jsonencode({
    DATABASE_URL = "${var.mongo_base_url}/${var.service_db_names[each.key]}?${var.mongo_options}"
    REDIS_URL    = var.redis_url
    RABBITMQ_URL = var.rabbitmq_url
  })
}
