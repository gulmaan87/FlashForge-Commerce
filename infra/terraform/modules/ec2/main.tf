# ─────────────────────────────────────────────────────────────────────────────
# EC2 t2.micro module — free-tier eligible
# Provisions: security group, key pair, t2.micro instance, elastic IP
# The instance runs all FlashForge services via docker-compose.prod.yml
# ─────────────────────────────────────────────────────────────────────────────

# ── Latest Amazon Linux 2023 AMI (free tier eligible) ─────────────────────────
data "aws_ami" "al2023" {
  most_recent = true
  owners      = ["amazon"]

  filter {
    name   = "name"
    values = ["al2023-ami-2023.*-x86_64"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }
}

# ── Security Group ────────────────────────────────────────────────────────────
resource "aws_security_group" "server" {
  name        = "${var.name_prefix}-server-sg"
  description = "Allow HTTP inbound. All outbound. SSH removed — use SSM Session Manager instead."
  vpc_id      = var.vpc_id

  # ── SSH intentionally removed ─────────────────────────────────────────────
  # The EC2 IAM role grants SSM access. Use:
  #   aws ssm start-session --target <instance-id>
  # This gives a full shell without opening port 22 to the internet.

  ingress {
    description = "HTTP"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = { Name = "${var.name_prefix}-server-sg" }
}

# ── EC2 Key Pair ──────────────────────────────────────────────────────────────
resource "aws_key_pair" "deployer" {
  key_name   = "${var.name_prefix}-deployer"
  public_key = var.ec2_public_key
}

# ── IAM role so EC2 can read SSM parameters ───────────────────────────────────
data "aws_iam_policy_document" "ec2_assume" {
  statement {
    actions = ["sts:AssumeRole"]
    principals {
      type        = "Service"
      identifiers = ["ec2.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "ec2" {
  name               = "${var.name_prefix}-ec2-role"
  assume_role_policy = data.aws_iam_policy_document.ec2_assume.json
}

resource "aws_iam_role_policy" "ec2_ssm_read" {
  name = "${var.name_prefix}-ssm-read"
  role = aws_iam_role.ec2.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect   = "Allow"
        Action   = ["ssm:GetParameter", "ssm:GetParameters", "ssm:GetParametersByPath"]
        Resource = "arn:aws:ssm:${var.aws_region}:*:parameter/flashforge/*"
      },
      {
        Effect   = "Allow"
        Action   = ["kms:Decrypt"]
        Resource = "*"   # Allows decrypting the default SSM-managed KMS key (aws/ssm)
      }
    ]
  })
}

resource "aws_iam_instance_profile" "ec2" {
  name = "${var.name_prefix}-ec2-profile"
  role = aws_iam_role.ec2.name
}

# ── EC2 Instance ──────────────────────────────────────────────────────────────
resource "aws_instance" "server" {
  ami                    = data.aws_ami.al2023.id
  instance_type          = "t3.micro"   # free tier in ap-south-1 (t2.micro is not eligible here)
  key_name               = aws_key_pair.deployer.key_name
  vpc_security_group_ids = [aws_security_group.server.id]
  subnet_id              = var.public_subnet_id
  iam_instance_profile   = aws_iam_instance_profile.ec2.name

  root_block_device {
    volume_size = 20    # GB — 30 GB/month free, we leave headroom
    volume_type = "gp2"
  }

  # Bootstrap script: install Docker, Compose, pull env from SSM, start stack
  user_data = templatefile("${path.module}/userdata.sh.tpl", {
    ghcr_owner  = var.ghcr_owner
    aws_region  = var.aws_region
    name_prefix = var.name_prefix
  })

  tags = { Name = "${var.name_prefix}-server" }
}

# ── Elastic IP (free while attached) ─────────────────────────────────────────
resource "aws_eip" "server" {
  instance = aws_instance.server.id
  domain   = "vpc"
  tags     = { Name = "${var.name_prefix}-eip" }
}
