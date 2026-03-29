variable "mongo_base_url" {
  type      = string
  sensitive = true
}
variable "mongo_options" {
  type = string
}
variable "redis_url" {
  type      = string
  sensitive = true
}
variable "rabbitmq_url" {
  type      = string
  sensitive = true
}

