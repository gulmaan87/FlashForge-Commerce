terraform {
  required_version = ">= 1.5.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  # Local backend — free tier. State file is stored on your machine.
  # Add terraform.tfstate to .gitignore (it already is via the root .gitignore).
  # If you later want to share state, migrate to an S3 backend.
  backend "local" {
    path = "terraform.tfstate"
  }
}

