#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# bootstrap.sh  —  Create the S3 bucket and DynamoDB table for Terraform remote
#                  state BEFORE running `terraform init` for the first time.
#
# Usage:
#   export AWS_ACCESS_KEY_ID="AKIA..."
#   export AWS_SECRET_ACCESS_KEY="..."
#   export AWS_DEFAULT_REGION="us-east-1"     # must match versions.tf backend region
#   bash infra/terraform/bootstrap.sh
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

BUCKET="flashforge-tf-state"
TABLE="flashforge-tf-locks"
REGION="${AWS_DEFAULT_REGION:-us-east-1}"

echo "▶  Creating S3 bucket  →  s3://$BUCKET  ($REGION)"
if [ "$REGION" = "us-east-1" ]; then
  aws s3api create-bucket \
    --bucket "$BUCKET" \
    --region "$REGION"
else
  aws s3api create-bucket \
    --bucket "$BUCKET" \
    --region "$REGION" \
    --create-bucket-configuration LocationConstraint="$REGION"
fi

echo "▶  Enabling versioning on s3://$BUCKET"
aws s3api put-bucket-versioning \
  --bucket "$BUCKET" \
  --versioning-configuration Status=Enabled

echo "▶  Enabling server-side encryption on s3://$BUCKET"
aws s3api put-bucket-encryption \
  --bucket "$BUCKET" \
  --server-side-encryption-configuration '{
    "Rules": [{
      "ApplyServerSideEncryptionByDefault": {"SSEAlgorithm": "AES256"}
    }]
  }'

echo "▶  Blocking public access on s3://$BUCKET"
aws s3api put-public-access-block \
  --bucket "$BUCKET" \
  --public-access-block-configuration \
    "BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true"

echo "▶  Creating DynamoDB lock table  →  $TABLE"
aws dynamodb create-table \
  --table-name "$TABLE" \
  --attribute-definitions AttributeName=LockID,AttributeType=S \
  --key-schema AttributeName=LockID,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --region "$REGION" \
  --no-cli-pager

echo ""
echo "✅  Bootstrap complete!"
echo "   Next steps:"
echo "   1. export AWS_ACCESS_KEY_ID='...'"
echo "   2. export AWS_SECRET_ACCESS_KEY='...'"
echo "   3. cd infra/terraform"
echo "   4. terraform init"
echo "   5. terraform plan"
echo "   6. terraform apply"
