output "secret_arns" {
  description = "Map of service name to Secrets Manager ARN."
  value       = { for k, v in aws_secretsmanager_secret.service_secrets : k => v.arn }
  sensitive   = true
}
