variable "mongo_base_url" {
  type      = string
  sensitive = true
}

variable "mongo_options" {
  type    = string
  default = "retryWrites=true&w=majority&appName=flash87"
}

variable "redis_url" {
  type      = string
  sensitive = true
}

variable "rabbitmq_url" {
  type      = string
  sensitive = true
}

# Map of service name → MongoDB database name
variable "service_db_names" {
  description = "Database name suffix per service."
  type        = map(string)
  default = {
    "product-service"   = "flashforge_product"
    "inventory-service" = "flashforge_inventory"
    "checkout-service"  = "flashforge_checkout"
    "payment-service"   = "flashforge_payment"
    "order-service"     = "flashforge_orders"
    "worker-service"    = "flashforge_worker"
  }
}
