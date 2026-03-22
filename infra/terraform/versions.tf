terraform {
  required_version = ">= 1.5.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  backend "s3" {
    bucket         = "flashforge-tf-state"
    key            = "commerce/terraform.tfstate"
    region         = "us-east-1"
    dynamodb_table = "flashforge-tf-locks"
    encrypt        = true
  }
}
