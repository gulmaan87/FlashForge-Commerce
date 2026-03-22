variable "name_prefix" {
  type = string
}

variable "vpc_cidr" {
  type = string
}

variable "az_count" {
  type = number
}

variable "enable_nat_gateway" {
  type = bool
}
