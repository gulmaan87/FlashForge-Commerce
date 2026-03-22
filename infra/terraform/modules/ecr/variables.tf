variable "name_prefix" {
  description = "Prefix for ECR repository names."
  type        = string
}

variable "services" {
  description = "List of service names to create ECR repositories for."
  type        = list(string)
  default = [
    "product-service",
    "inventory-service",
    "checkout-service",
    "payment-service",
    "order-service",
    "worker-service",
    "frontend",
  ]
}
