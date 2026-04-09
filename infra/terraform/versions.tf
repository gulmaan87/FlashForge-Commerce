terraform {
  required_version = ">= 1.5.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  # ── Backend ─────────────────────────────────────────────────────────────────
  # Current: local state (fine for solo dev, state lives on this machine).
  #
  # To migrate to S3 (recommended if sharing with a team or CI/CD):
  #   1. Run infra/terraform/bootstrap-state.sh to create the S3 bucket + DynamoDB table
  #   2. Comment out the "local" block below
  #   3. Uncomment the "s3" block below
  #   4. Run: terraform init -migrate-state
  #      Terraform will ask to copy state to S3 — confirm yes.
  #
  backend "local" {
    path = "terraform.tfstate"
  }

  # backend "s3" {
  #   bucket         = "flashforge-tfstate"
  #   key            = "prod/terraform.tfstate"
  #   region         = "ap-south-1"
  #   dynamodb_table = "flashforge-tfstate-lock"
  #   encrypt        = true
  # }
}

