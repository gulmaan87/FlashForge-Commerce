output "parameter_names" {
  value = merge(
    { for k, v in aws_ssm_parameter.db_urls : "DATABASE_URL_${k}" => v.name },
    { REDIS_URL    = aws_ssm_parameter.redis_url.name },
    { RABBITMQ_URL = aws_ssm_parameter.rabbitmq_url.name }
  )
}
